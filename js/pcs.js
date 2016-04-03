// content script for inject
chrome.extension.sendRequest({act: 'loadcs'}, function (response) {
    if (response.url) {
        var s = document.createElement('script');
        s.src = response.url;
        s.charset = 'UTF-8';
        document.body.appendChild(s);
    }
});