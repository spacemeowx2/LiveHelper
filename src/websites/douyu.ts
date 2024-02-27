import { registerWebSite, Living, PollError, PollErrorType } from '../types'
import { mapFilter, parseViews } from '~/src/utils'

interface Item {
  room_id: number
  room_src: string
  vertical_src: string
  isVertical: number
  is_special: number
  cate_id: number
  child_id: number
  room_name: string
  nickname: string
  avatar_small: string
  status: number
  show_status: number
  show_time: number
  nrt: number
  url: string
  jumpUrl: string
  game_name: string
  online: string
  hasvid: number
  vurl: string
  close_notice: string
  close_notice_ctime: string
  sub_rt: number
  rpos: number
  icon_outing: number
  videoLoop: number
}

type Response = {
  error: 0
  data: {
    list: Item[]
    total: number
  }
} | {
  error: -1
}

function getInfoFromItem(item: Item): Living | undefined {
  if (item.videoLoop === 1 || item.show_status !== 1) {
    return
  }
  return {
    title: item.room_name,
    startAt: item.show_time,
    author: item.nickname,
    online: parseViews(item.online),
    preview: item.room_src,
    url: `https://www.douyu.com/${item.room_id}`
  }
}

registerWebSite({
  async getLiving() {
    const r: Response = await (await fetch('https://www.douyu.com/wgapi/livenc/liveweb/follow/list?sort=0&cid1=0')).json()
    if (r.error === -1) {
      throw new PollError(PollErrorType.NotLogin)
    }

    return mapFilter(r.data.list, getInfoFromItem)
  },
  id: 'douyu',
  homepage: 'https://www.douyu.com/'
})
