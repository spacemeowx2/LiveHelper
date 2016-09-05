'use strict';
!function (global) {
  var options = [
    {
      key: 'misc.notice',
      name: '=有新的主播开始直播时提醒我', //有新的主播开始直播时提醒我
      defValue: true,
      type: 'checkbox'
    },
    {
      key: 'misc.preview',
      name: '=显示缩略图', //显示缩略图
      defValue: true,
      type: 'checkbox'
    },
    {
      key: 'misc.inject',
      name: '=使用无礼物显示的播放器',
      defValue: false,
      type: 'checkbox'
    },
    {
      key: 'misc.hidenoticewhenrun',
      name: '=启动时不提醒',
      defValue: true,
      type: 'checkbox'
    },
    {
      key: 'misc.queryinterval',
      name: '=后台查询间隔', //后台查询间隔
      defValue: 5,
      type: 'text'
    }
  ];
  var optionsIndex = {};
  options.forEach(function (item) {item.value = null;});
  function flatten(obj, r, prefix) {
    if (!obj instanceof Object) return obj;
    r = r || {};
    prefix = prefix || '';
    Object.keys(obj).forEach(function (key) {
      if (obj[key] instanceof Object) {
        flatten(obj[key], r, prefix + key + '.');
      } else {
        r[prefix + key] = obj[key];
      }
    });
    return r;
  }
  function setItem(k, v) {
    localStorage.setItem(k, v);
    /*var se = document.createEvent("StorageEvent");
    se.initStorageEvent('storage', false, false);
    window.dispatchEvent(se);*/
  }

  window.addEventListener("storage", function(e){
    config.loadFromStorage();
  });

  var config = new Vue({
    data: {
      misc: {},
      enabled: {},
      options: options,
      optionsIndex: optionsIndex
    },
    methods: {
      onChange: function () {
        var savedConfig = flatten(this.$data);
        setItem('config', JSON.stringify(savedConfig));
        this.loadFromStorage();
      },
      loadFromStorage: function () {
        var i, item, value;
        var savedConfig = JSON.parse(localStorage.config);

        for(i=0; i<options.length; i++) {
          item = options[i];
          value = item.defValue;
          if (savedConfig.hasOwnProperty(item.key)) {
            value = savedConfig[item.key];
          }
          this.$set(item.key, value);
          optionsIndex[item.key].value = value;
        }
      },
      getDefs: function (prefix) {
        var i,item;
        var r = [];
        return options.filter(function (item) {
          return item.key.substring(0,prefix.length)==prefix
        });
      }
    },
    created: function () {
      var i, item;
      for(i=0; i<fetchers.length; i++) {
        item = fetchers[i];
        options.push({
          key: 'enabled.' + item.id,
          name: item.name,
          defValue: false,
          type: 'checkbox',
          value: null
        });
      }
      options.forEach(function (i){
        optionsIndex[i.key] = i;
      });
      this.loadFromStorage();
    },
    watch: {
      'misc': {
        handler: 'onChange',
        deep: true
      },
      'enabled': {
        handler: 'onChange',
        deep: true
      },
      'options': {
        handler: function () {
          //同步到$data中
          var i,item;
          for(i=0; i<options.length; i++) {
            item = options[i];
            this.$set(item.key, item.value);
          }
        },
        deep: true
      },
      'misc.queryinterval': function (val, oldVal) {
        var self=this;
        var tmpValue = parseInt(val);
        var nextVal;
        if (tmpValue > 0) {
          nextVal = tmpValue;
        } else {
          nextVal = oldVal;
        }
        Vue.nextTick(function () {
          self.misc.queryinterval = nextVal;
        })
      }
    }
  })

  global.config = config
}(window)