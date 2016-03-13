(function (){
    'use strict'
    let $p = function (jqobj) {
        return new Promise(function (resolve, reject) {
            jqobj.promise().then(resolve, reject);
        });
    }
    let getCookie = function (opt) {
        return new Promise(function (resolve, reject) {
            chrome.cookies.getAll(opt, resolve);
        });
    }
    function siteFactory(id, name, homepage, url, type, data, f) {
        return {
            getFollowList: function () {
                //config.read(prefer full)
                if (this.getFullFollowList) {
                    return this.getFullFollowList();
                } else {
                    return this.getDefaultFollowList();
                }
            },
            id: id,
            name: name,
            homepage: homepage,
            getFullFollowList: false,
            getDefaultFollowList: function () {
                return $p($.ajax({
                    timeout: 5000,
                    url: url,
                    type: type,
                    data: data
                }))
                .then(result=>{
                    try {
                        result = f(result);
                        return result;
                    } catch (e) {
                        console.log('In default get follow list'+e)
                        throw(e);
                    }
                });
            }
        }
    }
    var douyu = siteFactory('douyu', '斗鱼', 'http://www.douyutv.com',
        'http://www.douyutv.com/member/cp/get_follow_list',
        'POST', {}, 
        result => {
            result = JSON.parse(result);
            result = result.room_list;
            result = result.map( (i) => ({
                    id: i.room_id,
                    title: i.room_name,
                    beginTime: i.show_time*1000,
                    nick: i.nickname,
                    online: i.online,
                    img: i.room_src,
                    url: 'http://www.douyutv.com' + i.url
                })
            );
            return result;
        }
    );
    var panda = siteFactory('panda', '熊猫', 'http://www.panda.tv',
        'http://www.panda.tv/ajax_get_follow_rooms',
        'GET', {stamp: Math.random()}, 
        result => {
            result = JSON.parse(result);
            result = result.data.items.filter( i => i.status == 2);
            result = result.map( (i) => ({
                    id: i.id,
                    title: i.name,
                    beginTime: false, //i.start_time*1000  不可靠
                    nick: i.userinfo.nickName,
                    online: i.person_num,
                    img: i.pictures.img,
                    url: 'http://www.panda.tv/room/' + i.id
                })
            );
            return result;
        }
    );
    var zhanqi = siteFactory('zhanqi', '战旗', 'http://www.zhanqi.tv',
        'http://www.zhanqi.tv/api/user/follow.listall',
        'POST', {stamp: Math.random()}, 
        result => {
            result = result.data;
            result = result.filter( i => i.status == 4);
            result = result.map( (i) => ({
                    id: i.roomId,
                    title: i.title,
                    beginTime: false, //http://www.zhanqi.tv/api/static/live.roomid/42082.json 
                    nick: i.nickname,
                    online: i.online,
                    img: i.bpic,
                    url: 'http://www.zhanqi.tv' + i.roomUrl
                })
            );
            return result;
        }
    );
    var huya = siteFactory('huya', '虎牙', 'http://www.huya.com',
        'http://i.huya.com/?do=ajaxLm',
        'GET', {stamp: Math.random()},
        result => {
            result = JSON.parse(result);
            result = result.s;
            result = result.filter( i => i.isLive);
            result = result.map( (i) => ({
                    id: i.privateHost,
                    title: $('<span>'+i.intro+'</span>').text(),
                    beginTime: (new Date).getTime() - i.startTime * 1000 * 60,
                    nick: i.nick,
                    online: i.total_count,
                    img: i.screenshort,
                    url: 'http://www.huya.com/' + i.privateHost
                })
            );
            return result;
        }
    );
    var bili = siteFactory('bilibili', '哔哩哔哩', 'http://live.bilibili.com',
        'http://live.bilibili.com/feed/getList/1',
        'POST', {}, 
        result => {
            result = JSON.parse(result);
            result = result.data.list;
            let getRoomDetail = (roomId, url) => {
                return $p($.get('http://live.bilibili.com/live/getInfo?roomid='+roomId))
                    .then(t => {
                        t = JSON.parse(t);
                        t = t.data;
                        return {
                            id: roomId,
                            title: t.ROOMTITLE,
                            beginTime: t.LIVE_TIMELINE*1000,
                            nick: t.ANCHOR_NICK_NAME,
                            online: false,
                            img: t.COVER,
                            url: url
                        };
                    });
            };
            
            return Promise.all(result.map(i => getRoomDetail(i.roomid, i.link)));
        }
    );
    
    var quanmin = siteFactory('quanmin', '全民', 'http://www.quanmin.tv',
        'http://www.quanmin.tv/api/v1',
        'POST', {m:'user.getfollowlist', p:{page: 0, size: 50}},
        result => {
            result = JSON.parse(result);
            result = result.data.items;
            result = result.filter(i => i.is_playing);
            result = result.map( i => ({
                    id: i.uid,
                    title: i.title,
                    beginTime: new Date(i.play_at).getTime(),
                    nick: i.nick,
                    online: i.view,
                    img: i.thumb,
                    url: 'http://www.quanmin.tv/v/' + i.uid
            }));
            return result;
        }
    );
    
    let parseHTML = (html, promiseFactory) => {
        let $iframe = $('<iframe></iframe>');
        let dom = $.parseHTML(html, $iframe.document);
        return promiseFactory(dom).then( (list) => {
            $iframe.remove();
            return list;
        }, (e) => {
            console.log('parseHTML err:'+e);
            $iframe.remove();
        });
    };
    
    var niconico = siteFactory('niconico', 'ニコニコ', 'http://live.nicovideo.jp',
        'http://live.nicovideo.jp/my',
        'GET', {},
        html => {
            let getInfoFromItem = (item) => {
                item = $(item);
                let url = item.children('a').attr('href');
                let roomid = /watch\/([^?]+).*$/.exec(url)[1];
                let startTime = item.find('p[class="start_time"]').text();
                startTime = startTime.replace(/(開始)|(Starts:)/, '').trim();
                startTime = new Date(startTime);
                startTime.setYear((new Date).getFullYear());
                return {
                    id: roomid,
                    title: item.children('a').attr('title'),
                    beginTime: startTime.getTime(),
                    nick: item.find('p:not([class])').attr('title'),
                    online: false,
                    img: item.find('img').attr('src'),
                    url: url
                };
            };
            return parseHTML(html, (dom) => new Promise(function (resolve, reject) {
                let itemArray = $.makeArray($(dom).find('#Favorite_list .liveItem'));
                itemArray = itemArray.map(getInfoFromItem);
                resolve(itemArray.filter(i => i));
            }))
        }
    );
    
    var twitch = siteFactory('twitch', 'twitch', 'http://www.twitch.tv',
        'http://api.twitch.tv/api/viewer/info.json',
        'GET', {on_site: 1},
        result => {}
    );
    twitch.getDefaultFollowList = function () {
        let getOAuthToken = () => getCookie({url: 'http://www.twitch.tv', name: 'api_token'})
            .then(apiToken => {
                if (apiToken.length == 0) {
                    throw 'twitch api token not found';
                }
                apiToken = apiToken[0].value;
                //console.log('api token '+apiToken);
                let settings = {
                    type: 'GET',
                    url: 'http://api.twitch.tv/api/me',
                    headers: {
                        'Twitch-Api-Token': 'aac161a4063326b304ac12ef4decc249'
                    }
                };
                return settings;
            })
            .then(settings => $p($.ajax(settings)))
            .then(json => {
                if (!json.hasOwnProperty('chat_oauth_token')) {
                    reject('no oauth token.');
                    return;
                }
                //console.log('oauth token: '+json.chat_oauth_token);
                return json.chat_oauth_token;
            });
        
        let getFollowedStreamJSON = oauthToken => $p($.ajax(
            {
                type: 'GET',
                url: 'https://streams.twitch.tv/kraken/streams/followed?limit=24&offset=0&stream_type=live',
                headers: {
                    'Authorization': 'OAuth '+oauthToken
                }
            }
        ));
        return getOAuthToken()
            .then(getFollowedStreamJSON)
            .then(result => {
                result = result.streams;
                //console.log(result)
                return result.map(i => ({
                    id: i.channel._id,
                    title: i.channel.status,
                    beginTime: new Date(i.created_at).getTime(),
                    nick: i.channel.display_name,
                    online: i.viewers,
                    img: i.preview.medium,
                    url: i.channel.url
                }));
            })
    };
	
	var huomao = siteFactory('huomao', '火猫', 'http://www.huomaotv.cn',
        'http://www.huomaotv.cn/member/sub',
        'GET', {},
        result => {
			return parseHTML(result, dom => new Promise(function (resolve, reject) {
				let result = $(dom).find('div.userDy_cont').children();
				result = result.toArray();
				result = result.map(item => $(item));
				result = result.filter(item => item.find('a.up_offline').length == 0);
				result = result.map(item => ({
					id: item.find('dl.VOD_title > dt > a').attr('href'),
					title: item.find('dl.VOD_title > dt > a').text(),
					beginTime: false,
					nick: item.find('dl.VOD_title > dd > a').text(),
					online: parseInt(item.find('dl.VOD_title > dd > span').text()),
					img: item.find('img').attr('data-src'),
					url: 'http://www.huomaotv.cn' + item.find('dl.VOD_title > dt > a').attr('href')
				}));
				resolve(result);
			}));
		}
    );
    
    douyu.getFullFollowList = () => {
        let getInfoFromItem = (item) => {
            item = $(item);
            if (item.find('i.icon_live').length == 0)
                return false;
            let beginTime = item.find('span.glyphicon01_playtime').text().trim();
            let timeRE = /(\d+)分钟/;
            if (!timeRE.test(beginTime)) {
                beginTime = false;
            } else {
                beginTime = parseInt(timeRE.exec(beginTime)[1]);
                beginTime = (new Date).getTime() - beginTime * 1000 * 60;
            }
            
            let roomid = item.find('div>div>a').attr('href').replace('/', '');
            return {
                id: roomid,
                title: item.find('h1').text().trim(),
                beginTime: beginTime,
                nick: item.find('span.username').text().trim(),
                online: parseInt(item.find('span.glyphicon01_hot').text().trim()),
                img: item.find('img').data('original'),
                url: 'http://www.douyutv.com/' + roomid
            };
        };
        return $p($.get('http://www.douyutv.com/room/follow'))
            .then(text => parseHTML(text, dom => new Promise(function (resolve, reject) {
                let followedList = $(dom).find('.attention > ul');
                if (followedList.length == 0) {
                    reject('douyu not login');
                    return;
                }
                let itemArray = $.makeArray(followedList.children());
                itemArray = itemArray.map(getInfoFromItem);
                resolve(itemArray.filter(i => i));
            })));
    };
    bili.getFullFollowList = () => {
        let BLAPISign = (paramObj) => {
            let ps = Object.keys(paramObj).sort().map(k => k+'='+paramObj[k]).join('&');
            return md5(ps+'ea85624dfcf12d7cc7b2b3a94fac1f2c');
        };
        let getRoomDetail = (roomId, url) => {
            let paramObj = {
                room_id: roomId,
                _device: 'android',
                _hwid: '6f17ba11164894fb',
                appkey: 'c1b107428d337928',
                build: '411005',
                buld: '411005',
                platform: 'android'
            };
            paramObj['sign'] = BLAPISign(paramObj);
            //console.log(paramObj);
            
            return $p($.get('http://live.bilibili.com/api/room_info', paramObj))
                .then(t => {
                    t = t.data;
                    return {
                        id: roomId,
                        title: t.title,
                        beginTime: false,
                        nick: t.uname,
                        online: t.online,
                        img: t.cover,
                        url: url
                    };
                });
        };
        return $p($.get('http://live.bilibili.com/feed/getList/1'))
            .then(result => {
                result = JSON.parse(result);
                result = result.data.list;
                return Promise.all(result.map(i => getRoomDetail(i.roomid, i.link)));
            });
    };
    //bili.getFullFollowList = false;
    
    window.fetchers = [douyu, panda, zhanqi, huya, bili, quanmin, niconico, twitch, huomao];
    window.enabledFetchers = () => {
        let cacheConfig = config();
        return fetchers.filter( (i) => cacheConfig['enabled.' + i.id] );
    };
})();