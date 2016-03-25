/*
for firefox compatibility layer
*/
if (!window.hasOwnProperty('chrome')) {
    var notificationListener;
    var noticeQueue = [];
    setInterval(() => {
        if (noticeQueue.length > 0) {
            portSend('notifications.create', noticeQueue.shift());
        }
    }, 2000);
    window.chrome = {
        i18n: {
            getUILanguage: function () {
                //TODO: using real value
                return "zh_CN";
            }
        },
        webRequest: {
            onBeforeRequest: {
                addListener: function addListener(callback, filter, mode) {
                    portSend('webRequest.onBeforeRequest.addListener', {filter: filter, mode: mode});
                }
            }
        },
        notifications: {
            onClicked: {
                addListener: function addListener(f) {
                    notificationListener = f;
                }
            },
            create: function (id, settings) {
                noticeQueue.push({id: id, settings: settings});
            }
        }
    };
    window.open = function open(url) {
        portSend('window.open', {url: url});
    }
    var callbacks = [];
    var overrided = false;
    function overrideJquery() {
        if (!overrided) {
            setTimeout(() => {
                var btnHTML = $('<a href="options.html" target="_Blank"><span style="position:fixed;left:90%;top:5px;cursor: pointer;z-index:99999;" class="glyphicon glyphicon-cog" aria-hidden="true"></span></a>');
                $(document.body).append(btnHTML);
                //btnHTML.click(function () {console.log('click');window.open('options.html')});
            }, 500); //wait for translate
        }
        overrided = true;
        var $body = $(document.body);
        var lastWidth=$body.width(), lastHeight=$body.height();
        var getScrollBarSize = function() {
            var inner = $('<p></p>').css({
                'width':'100%',
                'height':'100%'
            });
            var outer = $('<div></div>').css({
                'position':'absolute',
                'width':'100px',
                'height':'100px',
                'top':'0',
                'left':'0',
                'visibility':'hidden',
                'overflow':'hidden'
            }).append(inner);

            $(document.body).append(outer);

            var w1 = inner.width(), h1 = inner.height();
            outer.css('overflow','scroll');
            var w2 = inner.width(), h2 = inner.height();
            if (w1 == w2 && outer[0].clientWidth) {
                w2 = outer[0].clientWidth;
            }
            if (h1 == h2 && outer[0].clientHeight) {
                h2 = outer[0].clientHeight;
            }

            outer.detach();

            return [(w1 - w2),(h1 - h2)];
        };
        var scrollWidth = getScrollBarSize()[0];
        setInterval(function resizeWindow() {
            var bodyWidth = 400;
            if (!config('misc.preview')) {
                bodyWidth -= 120;
            }
            if (!(lastWidth==bodyWidth && lastHeight==$body.height())) {
                try {
                    portSend('resize', {width: bodyWidth, height: $body.height(), sw: scrollWidth});
                } catch (e) {}
            }
            lastWidth=bodyWidth, lastHeight=$body.height()
        }, 20);
        $.ajax = function (p) {
            console.log('hook ajax ', p);
            var succ, fail;
            var id = callbacks.push([function () {succ.apply(null, arguments)}, function () {fail.apply(null, arguments)}]) - 1;
            myAjax(p, id);
            return {
                promise: function () {
                    return new Promise(function (resolve, reject) {
                        succ = resolve;
                        fail = reject;
                    });
                }
            }
        };
    }
    window.addEventListener('DOMContentLoaded', overrideJquery, true);
    window.addEventListener('addon-message', function (event) {
        var data = event.detail;
        switch (data.act) {
            case 'suc':
                var ary = $.makeArray(data.body[0]);
                callbacks[data.id][0].apply(null, ary);
                break;
            case 'fail':
                callbacks[data.id][1].apply(null, data.body);
                break;
            case 'notifyClick':
                notificationListener(data.id);
                break;
        }
    }, false);
}
