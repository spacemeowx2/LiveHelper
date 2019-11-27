export default `
site-douyu = 斗鱼
time-passed =
  { CMP(STRLEN($min), 3) ->
      [GT] 已播{STR($hour)}小时
      *[other] { $min ->
        [0] 已播{$sec}秒钟
        *[other] 已播{STR($min)}分钟
      }
  }
online =
  { CMP($online, 10000) ->
      [LT] {$online}
      *[other] {NUMBER(DIV($online, 10000), maximumFractionDigits: 1)}万
  }
`
