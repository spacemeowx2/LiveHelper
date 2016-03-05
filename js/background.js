//(function (){
    'use strict';
    let lastStatus={};
    let cachedItems=[];
    let isLastOnline = id => lastStatus.hasOwnProperty(id) && lastStatus[id];
    chrome.notifications.onClicked.addListener(function (id) {
        for (let item of cachedItems) {
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
                message: _('=正在直播'),
                contextMessage: item.nick
            }, () => false
        );
    }
    function goOffline() {
        
    }
    function startMonitor() {
        console.log(config('misc.notice'));
        if (!config('misc.notice')) {
            setTimeout(startMonitor, 60 * 1000);
            return;
        }
        console.log((new Date)+' check');
        let allPromise;
        let errorList = [];
        allPromise = enabledFetchers().map(v => 
            v.getFollowList()
            .then(l => l.map(i => (i.id = v.id + '.' + i.id, i) ))
            .catch((e) => {
                console.log(e)
                errorList.push(v.id + '.');
                return [];
            })
        );
        Promise.all(allPromise)
        .then(lists => {
            let items = [];
            for (let list of lists) {
                for (let item of list) {
                    items.push(item);
                }
            }
            return items;
        })
        .then(items => {
            let lastStatusBackup = lastStatus;
            cachedItems = items;
            for (let item of items) {
                if (!isLastOnline(item.id)) { //刚在线
                    goOnline(item);
                }
            }
            lastStatus = {};
            for (let item of items) {
                lastStatus[item.id] = true;
            }
            
            let lastKeys = Object.keys(lastStatusBackup);
            for (let errId of errorList) {
                let resumeKeys = lastKeys.filter(key => key.substr(0, errId.length) == errId);
                for (let resumeKey of resumeKeys) {
                    lastStatus[resumeKey] = lastStatusBackup[resumeKey];
                }
            }
            console.log('errors: ', errorList);
        })
        .then( () => 
            setTimeout(startMonitor, parseInt(config('misc.queryinterval')) * 60 * 1000)
        )
        .catch( () => 
            setTimeout(startMonitor, parseInt(config('misc.queryinterval')) * 60 * 1000)
        );
    }
    $(document).ready(function () {
        translate()
        .then(transText => {
            window._ = transText;
        });
    });
    startMonitor();
	
//})();