import { registerWebSite, Living, PollError, PollErrorType } from '../types'
import { mapFilter } from '~/src/utils'

interface Room {
  roomUrl: string
  nickname: string
  title: string
  spic: string
  online: string
  status: string
}
interface Response {
  code: number
  data: {
    list: Room[]
  }
}

function getInfoFromItem({
  title,
  nickname,
  online,
  spic,
  roomUrl,
}: Room): Living | undefined {
  return {
    title,
    startAt: null,
    author: nickname,
    online: parseInt(online),
    preview: spic,
    url: `https://www.zhanqi.tv${roomUrl}`
  }
}

registerWebSite({
  async getLiving() {
    const r = await fetch(`https://www.zhanqi.tv/api/user/follow.listsbypage?page=1&nums=100`)
    const res: Response = await r.json()

    // not login
    if (res.code === 100) {
      throw new PollError(PollErrorType.NotLogin)
    }

    return mapFilter(res.data.list.filter(i => i.status === '4'), getInfoFromItem)
  },
  id: 'zhanqi',
  homepage: 'https://www.zhanqi.tv/'
})
