'use strict';
new Vue({
  el: 'body',
  data: {
    config: config,
    fetchers: fetchers
  },
  ready: function () {
    document.title = custom.trans('=直播关注助手选项');
  }
});