import { registerWebSite, Living, PollError, PollErrorType } from '../types'
import { mapFilter } from 'utils'

interface Room {
  title: string
  cover: string
  nickname: string
  hot_score: number
  ccid: number
  is_live: number
}
interface Response {
  follow_list: Room[]
}

function getInfoFromItem({
  title,
  cover,
  nickname,
  hot_score,
  ccid,
}: Room): Living | undefined {
  return {
    title,
    startAt: null,
    author: nickname,
    online: hot_score,
    preview: cover,
    url: `https://cc.163.com/${ccid}/`
  }
}

registerWebSite({
  async getLiving() {
    const url = "https://cc.163.com/user/follow/?format=json&page=1&size=100"
    const r = await fetch(url)
    if (r.url !== url) {
      throw new PollError(PollErrorType.NotLogin)
    }
    const res: Response = await r.json()

    return mapFilter(res.follow_list.filter(i => i.is_live === 1), getInfoFromItem)
  },
  id: 'necc',
  homepage: 'https://cc.163.com/'
})
