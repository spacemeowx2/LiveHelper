import { registerWebSite, Living, PollError, PollErrorType } from '../types'
import { mapFilter } from '~/utils'

interface Room {
  isLive: boolean
  profileRoom: number
  // has html entites
  intro: string
  startTime: number
  nick: string
  totalCount: number
  screenshot: string
}
interface Response {
  result: {
    list: Room[]
  }
}
interface UidResponse {
  isLogined: boolean
  uid: string
}

function getInfoFromItem ({
  profileRoom,
  intro,
  startTime,
  nick,
  totalCount,
  screenshot
}: Room): Living | undefined {
  return {
    // TODO: decode
    title: intro,
    startAt: startTime,
    author: nick,
    online: totalCount,
    preview: screenshot,
    url: 'https://www.huya.com/' + profileRoom
  }
}

registerWebSite({
  async getLiving () {
    const { isLogined, uid }: UidResponse = await (await fetch(`https://www.huya.com/udb_web/checkLogin.php`)).json()

    if (!isLogined) {
      throw new PollError(PollErrorType.NotLogin)
    }

    const r = await fetch(`https://fw.huya.com/dispatch?do=subscribeList&uid=${uid}&page=1&pageSize=100&_=${+new Date}`)
    const res: Response = await r.json()

    return mapFilter(res.result.list.filter(i => i.isLive), getInfoFromItem)
  },
  id: 'huya',
  homepage: 'https://www.huya.com/'
})
