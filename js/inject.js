'use strict';
function prepareRE(list) {
  for (let item of list) {
    item.re = new RegExp(item.re);
  }
}
$.get('https://imspace.applinzi.com/player/table.php').then(json => {
  let table = json.table;
  let filter = json.filter;
      let cs = json.cs;
      prepareRE(table);
      prepareRE(cs);
  for (let item of table) {
    if (item.url.substr(0,19) == 'chrome-extension://') {
      let repRE = /^chrome\-extension:\/\/(.*?)$/;
      item.url = chrome.extension.getURL(repRE.exec(item.url)[1]);
    }
  }
  chrome.webRequest.onBeforeRequest.addListener(
    function(request) { if (config.misc.inject) {
      let ret = {};
      for (let item of table) {
        //console.log(item.re.test(request.url), item.url)
        if (item.re.test(request.url)) {
          ret = {redirectUrl: item.url};
          break;
        }
      }
      return ret;
    }},
    {
      urls: filter
    },
    ["blocking"]
  );
  chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
      if (request.act == 'loadcs') { if (config.misc.inject) {
          //sender.tab.url
          for (let item of cs) {
              if (item.re.test(sender.tab.url)) {
                  sendResponse({url: item.url});
                  break;
              }
          }
          
      }}
  });
}, () => {
  console.log('获取table失败.');
});