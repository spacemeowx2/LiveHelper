import { registerWebSite, Living, PollError, PollErrorType } from '../types'
import { mapFilter, parseViews } from '~/utils'

interface Room {
  channel: string
  nickname: string
  views: string
  image: string
  room_number: string
  is_live: number
}
interface Response {
  code: string
  data: {
    usersSubChannels: Room[]
  }
}

function getInfoFromItem ({
  channel,
  nickname,
  views,
  image,
  room_number,
}: Room): Living | undefined {
  return {
    title: channel,
    startAt: null,
    author: nickname,
    online: parseViews(views),
    preview: image,
    url: `https://www.huomao.com/${room_number}`
  }
}

registerWebSite({
  async getLiving () {
    const url = `https://www.huomao.com/subscribe/getUsersSubscribe`
    const r = await fetch(url)
    if (r.url !== url) {
      throw new PollError(PollErrorType.NotLogin)
    }
    const res: Response = await r.json()

    return mapFilter(res.data.usersSubChannels.filter(i => i.is_live === 1), getInfoFromItem)
  },
  id: 'huomao',
  homepage: 'https://www.huomao.com/'
})
