import { registerWebSite, Living } from '../types'
import { parseHTML, HTMLElement, mapFilter, now } from '~/utils'

function getInfoFromItem (item: HTMLElement): Living | undefined {
  if (!item.querySelector('i.icon_live')) {
    return
  }
  let beginTime: number | null
  let beginTimeStr = item.querySelector('span.glyphicon01_playtime')?.text?.trim() || ''
  let timeRE = /(\d+)分钟/.exec(beginTimeStr)
  if (!timeRE) {
    beginTime = null
  } else {
    beginTime = parseInt(timeRE[1])
    beginTime = now() - beginTime * 60
  }

  let roomid = item.querySelector('div div a')?.attributes['href']?.replace('/', '');
  return {
      title: item.querySelector('h1')?.text?.trim(),
      startAt: beginTime,
      author: item.querySelector('span.username')?.text?.trim(),
      online: parseInt(item.querySelector('span.glyphicon01_hot')?.text?.trim() || ''),
      preview: item.querySelector('img')?.attributes['data-original'],
      url: 'https://www.douyu.com/' + roomid
  }
}

registerWebSite({
  async getLiving () {
    const r = await fetch('https://www.douyu.com/room/follow')
    const dom = parseHTML(await r.text())
    const list = dom.querySelectorAll('.attention ul li') as HTMLElement[]

    return mapFilter(list, getInfoFromItem)
  },
  get id () {
    return 'douyu'
  }
})
