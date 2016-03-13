var deepCopy = function(source) {
    var result={};
    for (var key in source) {
        result[key] = (typeof source[key])==='object'? deepCopy(source[key]): source[key];
    } 
    return result; 
}
function sendMessage(msg) {
    var cloned = cloneInto(msg, document.defaultView);
    var event = new CustomEvent("addon-message",  { bubbles: true, detail: cloned });
    document.documentElement.dispatchEvent(event);
}
function toJSONObj(obj) {
    return JSON.parse(JSON.stringify(obj));
}
function myAjax(p, id) {
    var settings = p;
    $.ajax(settings)
    .done(function () {
        console.log('done')
        sendMessage({id: id, act: 'suc', body: toJSONObj(arguments) });
    })
    .fail(function () {
        console.log('failed');
        sendMessage({id: id, act: 'fail', body: toJSONObj(arguments) });
    });
}


function portSend(name, data) {
    self.port.emit(name, data);
}

self.port.on('reload', function () {
    console.log('reload')
    /*var d = unsafeWindow.document;
    var ev = d.createEvent('HTMLEvents');
    ev.initEvent('DOMContentLoaded', false, true);
    unsafeWindow.dispatchEvent(ev);*/
    unsafeWindow.initList()
});

exportFunction(myAjax, unsafeWindow, {defineAs: "myAjax"});
exportFunction(portSend, unsafeWindow, {defineAs: "portSend"});