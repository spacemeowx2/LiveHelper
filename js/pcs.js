// content script for inject
console.log('loading cs')
chrome.runtime.sendMessage({act: 'loadcs'}, function (response) {
  console.log('cs', response)
  if (response.url) {
    var s = document.createElement('script');
    s.src = response.url;
    s.charset = 'UTF-8';
    document.body.appendChild(s);
  }
});