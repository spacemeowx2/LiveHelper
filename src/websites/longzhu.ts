import { registerWebSite, Living, PollError, PollErrorType } from '../types'
import { mapFilter } from 'utils'

interface Room {
  room: {
    name: string
  }
  feed: {
    title: string
    url: string
    time: string
  }
  liveScreenPic: string
  subscribeCount: number
}
interface Response {
  totalItems: number
  items: Room[]
}

function getInfoFromItem({
  room: {
    name
  },
  feed: {
    title,
    url,
    time
  },
  liveScreenPic,
  subscribeCount
}: Room): Living | undefined {
  return {
    title,
    startAt: +new Date(time) / 1000,
    author: name,
    online: subscribeCount,
    preview: liveScreenPic,
    url: `http://star.longzhu.com/${url}`
  }
}

registerWebSite({
  async getLiving() {
    const r = await fetch("https://userapi.longzhu.com/subinfo/mysubscribe?pageIndex=0&pageSize=100&isLive=1")
    const res: Response = await r.json()
    if (res.totalItems === 0) {
      const user: { uid: number } = await (await fetch("https://userapi.longzhu.com/user/getcurrentuserprofile")).json()
      if (user.uid === -1) {
        throw new PollError(PollErrorType.NotLogin)
      }
    }

    return mapFilter(res.items, getInfoFromItem)
  },
  id: 'longzhu',
  homepage: 'https://longzhu.com/'
})
