import { registerWebSite, Living, PollError, PollErrorType } from '../types'
import { mapFilter } from 'utils'

interface Room {
  title: string
  liveTime: number
  nickname: string
  online: number
  keyframe: string
  link: string
}
interface Response {
  code: number
  data: {
    rooms?: Room[]
  }
  need_login?: number
}

function getInfoFromItem({
  title,
  liveTime,
  nickname,
  online,
  keyframe,
  link
}: Room): Living | undefined {
  return {
    title,
    startAt: liveTime,
    author: nickname,
    online,
    preview: keyframe,
    url: link
  }
}

registerWebSite({
  async getLiving() {
    const r = await fetch("https://api.live.bilibili.com/xlive/web-ucenter/v1/xfetter/GetWebList?page=1&page_size=10")
    const res: Response = await r.json()

    // not login
    if (res.code === -101) {
      throw new PollError(PollErrorType.NotLogin)
    }
    if (res.data.rooms === undefined) {
      throw new PollError(PollErrorType.Other)
    }

    return mapFilter(res.data.rooms, getInfoFromItem)
  },
  id: 'bilibili',
  homepage: 'https://live.bilibili.com/'
})
