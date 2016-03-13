(function (){
	'use strict';
	$.get('https://imspace.applinzi.com/player/table.php')
	.then(json => {
		let table = json.table;
		let filter = json.filter;
		for (let item of table) {
			item.re = new RegExp(item.re);
			if (item.url.substr(0,19) == 'chrome-extension://') {
				let repRE = /^chrome\-extension:\/\/(.*?)$/;
				item.url = chrome.extension.getURL(repRE.exec(item.url)[1]);
			}
		}
		chrome.webRequest.onBeforeRequest.addListener(
			function(request) { if (config('misc.inject')) {
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
		
	}, () => {
		console.log('获取table失败.');
	});
})();