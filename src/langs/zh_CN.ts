export default `
site-douyu = 斗鱼
site-bilibili = 哔哩哔哩
site-huya = 虎牙
site-zhanqi = 战旗
site-huomao = 火猫
site-longzhu = 龙珠
site-necc = 网易CC
site-egameqq = 企鹅电竞
site-twitch = Twitch
site-openrec = OPENREC

loading = 数据获取中...
no-room = 你关注的主播还没有开播
error-not-login = 登录状态已失效, 请重新登录
goto-option = 请前往<GoOption>选项</GoOption>开启要关注的网站

time-started = 已开播
time-passed =
  { CMP(STRLEN($min), 3) ->
      [GT] 已播{STR($hour)}小时
      *[other] { $min ->
        [0] 已播{$sec}秒钟
        *[other] 已播{STR($min)}分钟
      }
  }
online-placeholder = 观众
online =
  { CMP($online, 10000) ->
      [LT] {STR($online)}
      *[other] {NUMBER(DIV($online, 10000), maximumFractionDigits: 1)}万
  }
options = 选项
options-website-title = 网站
  .subTitle = 在你想观看的网站前面打勾
options-misc-title = 杂项

misc-notification = 有新的主播开始直播时提醒我
misc-preview = 显示缩略图
misc-ignoreFirstNotify = 启动时不提醒
`
