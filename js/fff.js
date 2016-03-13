/*
for firefox compatibility layer
*/
if (!window.hasOwnProperty('chrome')) {
    window.chrome = {
        i18n: {
            getUILanguage: function () {
                //TODO: using real value
                return "zh_CN";
            }
        }
    };
    var callbacks = [];
    var overrided = false;
    function overrideJquery() {
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
            if (!(lastWidth==$body.width() && lastHeight==$body.height())) {
                portSend('resize', {width: $body.width(), height: $body.height(), sw: scrollWidth});
            }
            lastWidth=$body.width(), lastHeight=$body.height()
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
        }
    }, false);
}