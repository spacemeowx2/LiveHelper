//(function () {
    'use strict';
    function get_show_online(a) {
        _({online: a});
        return _('=观看人数');
    }
    function get_show_time(t) {
        t = parseInt(t);
        t = ((new Date).getTime() - t) / 1000;
        let context = {
            sec: parseInt(t),
            min: parseInt(t / 60),
            hour: parseInt(t / 3600)
        };
        _(context);
        if (t < 60)
            return _('=刚刚开播');
        t /= 60;
        if (t < 10000)
            return _('=开播_分钟单位');
        t /= 60;
        return _('=开播_小时单位');
    }
    
    function addSite(site) {
        var node = $('#templates .site-template').clone(true);
        node.find('.site-name').text(site.name);
        node.find('.site-name').data('url', site.homepage);
        node.find('.site-items').empty();
        node.find('.site-items').append($('#templates .site-loading').clone());
        node.appendTo($('#list'));
        return node;
    }
    function appendStreamItem(s, item) {
        var node = $('#templates .stream-item-template').clone(true);
        node.find('.stream-item').data('url', item.url);
        
        if (config('misc.preview')) {
            node.find('img').attr('src', item.img);
        }
        
        node.find('.stream-item-title').text(item.title);
        if (item.beginTime!=false) {
            node.find('.stream-item-time').text(get_show_time(item.beginTime));
        } else {
            node.find('.stream-item-time').text(_('=已开播'));
        }
        node.find('.stream-item-nick').text(item.nick);
        if (item.online!=false) {
            node.find('.stream-item-online').text(get_show_online(item.online));
        } else {
            node.find('.stream-item-online').hide();
        }
        node.appendTo(s);
    }
    $(document).ready(function () {
        translate(config())
        .then((transText)=>{
            window._ = transText;
            
            if (!config('misc.preview')) {
                $(document.body).width(400-120);
            }
            
            let clickListener = e=>window.open($(e.currentTarget).data('url'));
            $('.stream-item').click(clickListener);
            $('.site-header .site-name').click(clickListener);
            
            let allSite = [];
            for (let fetcher of enabledFetchers()) {
                let siteNode = addSite(fetcher);
                
                let thisSite = fetcher.getFollowList()
                .then( l => {
                    //sort
                    return l.sort( (a, b) => b.online - a.online );
                })
                .then( l => {
                    siteNode.find('.site-items').empty();
                    if (l.length > 0) {
                        for (let i of l) {
                            appendStreamItem(siteNode, i);
                        }
                    } else {
                        siteNode.find('.site-items').append($('#templates .site-empty').clone());
                        siteNode.appendTo($('#list')); // to bottom
                    }
                })
                .catch( (e) => {
                    console.log(fetcher.name+' error '+e);
                    siteNode.find('.site-items').empty();
                    siteNode.appendTo($('#list'));
                });
                allSite.push(thisSite);
            }
			
            Promise.all(allSite).then(() => {
                //$('#list').sort((a,b) => ($(a).children().length - $(b).children().length) );
                
            });
			
			if (enabledFetchers().length == 0) {
				var node = $('#templates .list-empty').clone(true);
				node.appendTo($('#list'));
			}
        });
    });
//})();