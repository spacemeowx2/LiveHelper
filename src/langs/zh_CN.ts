export default `
site-douyu = 斗鱼
time-passed =
  { $hour ->
    [0] -> { $min ->
      [0] 已播{$sec}秒
      *[other] 已播{$min}分
    }
    *[other] 已播{$hour}小时
  }

`
