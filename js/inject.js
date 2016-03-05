(function (){
	'use strict';
	$.get('https://imspace.applinzi.com/player/table.php')
	.then(json => {
		let table = json.table;
		let filter = json.filter;
		for (let item of table) {
			item.re = new RegExp(item.re);
		}
		chrome.webRequest.onBeforeRequest.addListener(
			function(request) { if (config('misc.inject')) {
				let ret = {};
				for (let item of table) {
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
		console.log('ªÒ»°table ß∞‹.');
	});
})();