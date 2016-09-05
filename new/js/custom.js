!function () {
  var ui = {
    "en": {
      "直播关注助手选项": "Options",
      "选项": "Options",
      "模块": "Module",
      "在你想观看的网站前面打勾": "Check if you want to receive the information about the website.",
      "显示缩略图": "Show preview image",
      "杂项": "Misc",
      "后台查询间隔(单位: 分钟)": "Background query interval (min)",
      "有新的主播开始直播时提醒我": "Notify me when channel begin",
      "关注列表": "Followed List",
      "数据加载中...": "Loading...",
      "你关注的主播还没有开播": "No Channels Live",
      "已开播": "Now playing",
      "正在直播": "Now playing",
      "刚刚开播": "Just now",
      "开播_分钟单位": "{{=min}}mins",
      "开播_小时单位": "{{=hour}}hours",
      "观看人数": "{{? < # = online 10000 = online & / [ / = online 1000 1 k}}",
      "使用无礼物显示的播放器(仅支持熊猫tv)": "Use no-gift player, only available on '熊猫' and '斗鱼' now",
      "还没有启用的网站, 请到选项页启用": "There is no enabled module, please enable modules in option page",
      "": ""
    },
    "zh_CN": {
      "开播_分钟单位": "已播{{=min}}分钟",
      "开播_小时单位": "已播{{=hour}}小时",
      "观看人数": "{{? < # = online 10000 = online & / [ / = online 1000 10 万}}",
      "使用无礼物显示的播放器": "使用无礼物显示的播放器(仅支持斗鱼tv)",
      "": ""
    },
    "zh_TW": {
      "直播关注助手选项": "直播訂閱助手設定",
      "选项": "設定",
      "模块": "模組",
      "在你想观看的网站前面打勾": "在你想觀看的網站前面打勾",
      "显示缩略图": "顯示縮圖",
      "杂项": "雜項",
      "后台查询间隔(单位: 分钟)": "後臺查詢間隔(單位: 分鐘)",
      "有新的主播开始直播时提醒我": "有新的直播開始時提醒我",
      "关注列表": "訂閱列表",
      "数据加载中...": "數據載入中...",
      "你关注的主播还没有开播": "你訂閱的主播還沒有開播",
      "已开播": "已開播",
      "正在直播": "正在直播",
      "刚刚开播": "剛剛開播",
      "开播_分钟单位": "已播{{=min}}分鐘",
      "开播_小时单位": "已播{{=min}}小時",
      "观看人数": "{{? < # = online 10000 = online & / [ / = online 10000 10 萬}}",
      "": ""
    }
  };
  var lang = chrome.i18n.getUILanguage().replace('-', '_');
  var tryQue = [];
  tryQue.push(lang);
  if (lang.indexOf('_') != -1) {
    tryQue.push(lang.replace(/^(.*?)_(.*?)$/,'$1'));
  }
  tryQue.push('zh_CN');

  tryQue.every(function (lang) {
    if (ui.hasOwnProperty(lang)) {
      ui = ui[lang];
      return false;
    }
  });

  function prefixExp(exp, context) {
    if (typeof exp == 'string') {
        return prefixExp(exp.trim().split(' '), context);
    }
    var ops = {
        '=': [1, function (p1) { return  context.hasOwnProperty(p1)? context[p1]: p1} ],
        '+': [2, function (p1, p2) { return  parseFloat(p1)+parseFloat(p2)} ],
        '-': [2, function (p1, p2) { return  p1-p2} ],
        '*': [2, function (p1, p2) { return  p1*p2} ],
        '/': [2, function (p1, p2) { return  p1/p2} ],
        '&': [2, function (p1, p2) { return  p1+p2} ],
        '<': [2, function (p1, p2) { return  p1<p2} ],
        '>': [2, function (p1, p2) { return  p1>p2} ],
        '.': [2, function (p1, p2) { return  p1==p2} ],
        '[': [1, function (p1) { return  Math.floor(p1)} ],
        ']': [1, function (p1) { return  Math.ceil(p1)} ],
        '|': [1, function (p1) { return  Math.round(p1)} ],
        '#': [1, function (p1) { return  parseFloat(p1)} ],
        '!': [1, function (p1) { return  !p1} ],
        '?': [3, function (p1,p2,p3) { return  p1? p2: p3} ],
    };
    var p0 = exp.shift();
    var ret = p0;
    
    
    if (ops.hasOwnProperty(p0)) {
        var ps = [];
        var op = ops[p0];
        for (var i = 0; i<op[0]; i++) {
            ps[i] = prefixExp(exp, context);
        }
        
        ret = op[1].apply(null, ps);
    }
    return ret;
  }

  function trans(text, context) {
    context = context || {};
    for (var i in ui) {
      context[i] = ui[i];
    }
    var r = /{{(.*?)}}/g;
    var op = text[0];
    var tmpText;
    if (op == '=') {
      text = text.substring(1);
      if (context.hasOwnProperty(text)) {
        tmpText = context[text];
      } else {
        return text;
      }
    } else  {
      tmpText = prefixExp(text, context);
    }
    if (r.test(tmpText)) {
      tmpText = tmpText.replace(r, function (t, textName) {
        return trans(textName, context);
      });
    }
    return tmpText;
  }
  Vue.filter('trans', trans);
  Vue.directive('trans', {
    bind: function () {
      this.attr = this.el.nodeType === 3
        ? 'data'
        : 'textContent'
    },
    update: function (value) {
      this.el[this.attr] = trans(value, this.vm)
    }
  });
  window.custom = {
    trans: trans,

  };
}()