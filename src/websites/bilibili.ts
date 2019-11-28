import { registerWebSite, Living } from '../types'
import { mapFilter } from '~/utils'

interface Room {
  title: string
  liveTime: number
  nickname: string
  online: number
  keyframe: string
  link: string
}
interface Response {
  data: {
    rooms: Room[]
  }
}

function getInfoFromItem ({
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
  async getLiving () {
    const r = await fetch(`https://api.live.bilibili.com/feed/v1/feed/getList?page=1&page_size=100`)
    const res: Response = await r.json()

    return mapFilter(res.data.rooms, getInfoFromItem)
  },
  get id () {
    return 'bilibili'
  }
})
