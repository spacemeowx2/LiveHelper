'use strict';
var lastStatus={};
var cachedItems=[];
var isLastOnline = function (id) {
  return lastStatus.hasOwnProperty(id) && lastStatus[id];
}
chrome.notifications.onClicked.addListener(function (id) {
  for (var item of cachedItems) {
    if (item.id == id) {
      window.open(item.url);
    }
  }
});
function goOnline(item) {
  chrome.notifications.create(item.id, {
      type: 'basic',
      iconUrl: item.img,
      title: item.title,
      message: custom.trans('=正在直播'),
      contextMessage: item.nick
    }, function () { return false }
  );
}
function goOffline(item) {
  chrome.notifications.clear(item.id);
}
let isFirst = true;
function startMonitor() {
  if (!config.misc.notice) {
    setTimeout(startMonitor, 60 * 1000);
    return;
  }
  console.log((new Date)+' check');
  let allPromise;
  let errorList = [];
  allPromise = enabledFetchers().map(function (v) {
    return v.getFollowList()
      .then(function (l) {
        return l.map(function (i) {
          return (i.id = v.id + '.' + i.id, i)
        })
      })
      .catch(function (e) {
        console.log(e)
        errorList.push(v.id + '.');
        return [];
      })
  });
  Promise.all(allPromise)
  .then(function (lists) {
    let items = [];
    for (let list of lists) {
      for (let item of list) {
        items.push(item);
      }
    }
    return items;
  })
  .then(function (items) {
    let lastStatusBackup = lastStatus;
    let onlineItems = [];
    cachedItems = items;
    for (let item of items) {
      if (!isLastOnline(item.id)) { //刚在线
        //goOnline(item);
        onlineItems.push(item);
      }
    }
    for (let id of Object.keys(lastStatus)) {
      lastStatus[id]
    }
    lastStatus = {};
    for (let item of items) {
      lastStatus[item.id] = true;
    }
    
    let lastKeys = Object.keys(lastStatusBackup);
    for (let errId of errorList) {
      let resumeKeys = lastKeys.filter(function (key) {
        return key.substr(0, errId.length) == errId
      });
      for (let resumeKey of resumeKeys) {
        lastStatus[resumeKey] = lastStatusBackup[resumeKey];
      }
    }
    console.log('errors: ', errorList);
    return onlineItems;
  })
  .then( function (onlineItems) {
    if (isFirst) {
      isFirst = false;
      if (config.misc.hidenoticewhenrun) {
        return;
      }
    }
    for (let item of onlineItems) {
      goOnline(item);
    }
  })
  .then(function () {
    setTimeout(startMonitor, parseInt(config.misc.queryinterval) * 60 * 1000)
  })
  .catch(function () {
    setTimeout(startMonitor, parseInt(config.misc.queryinterval) * 60 * 1000)
  });
}
startMonitor();