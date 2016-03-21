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
        node.data('id', site.id);
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
    function initTemplate() {
        let clickListener = e=>window.open($(e.currentTarget).data('url'));
        $('.stream-item').click(clickListener);
        $('.site-header .site-name').click(clickListener);
        //drag
        var movingNode;
        var floatingNode, offsetX, offsetY;
        var ani = false;
        $('#templates > .site-template .site-header').mousedown(function (e) {
            offsetX = e.offsetX;
            offsetY = e.offsetY;
            var self = $(this);
            ani = false;
            movingNode = self.parent();
            self.data('move', true);
            self.data('x', self.offset().left);
            self.data('y', self.offset().top);
        });
        
        $(document).mousemove(function (e) {
            var mt = e.clientY - offsetY;
            if ((!movingNode) || (mt < 0)) {
                return;
            }
            if (!ani) {
                $('.site-template .site-items').slideToggle();
                movingNode.fadeTo('fast', 0);
                floatingNode = movingNode.clone(false);
                floatingNode.css('position', 'absolute');
                floatingNode.appendTo(document.body);
                floatingNode.find('.site-items').remove();
                floatingNode.width(movingNode.width());
                floatingNode.css('left', 0).css('top', e.clientY-offsetY);
                
                ani = true;
            }
            floatingNode.css('top', e.clientY-offsetY)
            var self = movingNode;
            var curIndex = -1;
            var list = $('#list').children();
            $.each(list, function (i, node) {
                node = $(node);
                var t = node.offset().top, h = node.height();
                if ((t-h < mt) && (mt <= t)) {
                    curIndex = i;
                    return false;
                }
            });
            if (curIndex == -1) {
                movingNode.appendTo($('#list'));
            } else {
                movingNode.insertBefore($(list[curIndex]));
            }
            return false;
        })
        .mouseup(function () {
            if (ani) {
                $('.site-template .site-items').slideToggle();
                movingNode.fadeTo('fast', 1);
                floatingNode.fadeTo('fast', 0, function (){$(this).remove()});
                
                var idList = $.map($('#list').children(), node => $(node).data('id') );
                console.log(idList);
                localStorage.idList = JSON.stringify(idList);
            
                ani = false;
            }
            movingNode = false;
            //$('#list .stream-item-template').show();
        });;
    }
    function initList() {
        if (!config('misc.preview')) {
            $(document.body).width(400-120);
        }
        $('#list').empty();
        
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
                        appendStreamItem(siteNode.find('.site-items'), i);
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
    }
    $(document).ready(function () {
        translate(config())
        .then((transText)=>{
            window._ = transText;
        })
        .then(initTemplate)
        .then(initList);
    });
//})();
