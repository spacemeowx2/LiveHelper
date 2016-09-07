'use strict';
var lastStatus={};
var cachedItems=[];
var isLastOnline = function (id) {
  return lastStatus.hasOwnProperty(id) && lastStatus[id];
}
chrome.notifications.onClicked.addListener(function (id) {
  console.log('click', id)
  for (var item of cachedItems) {
    if (item.id == id) {
      console.log('open', item.url)
      window.open(item.url);
    }
  }
});
function goOnline(item) {
  console.log('online', item)
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
var isFirst = true;
function startMonitor() {
  if (!config.misc.notice) {
    setTimeout(startMonitor, 60 * 1000);
    return;
  }
  console.log((new Date)+' check');
  var allPromise;
  var errorList = [];
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
    var items = [];
    for (var list of lists) {
      for (var item of list) {
        items.push(item);
      }
    }
    return items;
  })
  .then(function (items) {
    var lastStatusBackup = lastStatus;
    var onlineItems = [];
    cachedItems = items;
    for (var item of items) {
      if (!isLastOnline(item.id)) { //刚在线
        //goOnline(item);
        onlineItems.push(item);
      }
    }
    for (var id of Object.keys(lastStatus)) {
      lastStatus[id]
    }
    lastStatus = {};
    for (var item of items) {
      lastStatus[item.id] = true;
    }
    
    var lastKeys = Object.keys(lastStatusBackup);
    for (var errId of errorList) {
      var resumeKeys = lastKeys.filter(function (key) {
        return key.substr(0, errId.length) == errId
      });
      for (var resumeKey of resumeKeys) {
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
    for (var item of onlineItems) {
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