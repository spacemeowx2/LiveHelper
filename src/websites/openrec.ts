import { registerWebSite, Living, PollError, PollErrorType } from '../types'
import { mapFilter, getCookie } from '~/utils'

interface Room {
  // title
  meta_data: string
  user_name: string
  live_views: string
  thumbnail_url: string
  identify_id: string
  movie_live: {
    onair_status: '1' | '2'
    onair_start_dt: string
  }
}

interface Response {
  data: {
    items: Room[] | null
  }
  status: number
}

function getInfoFromItem ({
  meta_data, user_name, live_views, thumbnail_url, identify_id,
  movie_live: {
    onair_status,
    onair_start_dt
  }
}: Room): Living | undefined {
  if (onair_status !== '1') return
  return {
    title: meta_data,
    startAt: +new Date(`${onair_start_dt} GMT+0900`) / 1000,
    author: user_name,
    online: parseInt(live_views),
    preview: thumbnail_url,
    url: `https://www.openrec.tv/live/${identify_id}`
  }
}

registerWebSite({
  async getLiving () {
    const Uuid = (await getCookie({url: 'https://www.openrec.tv/', name: 'uuid'}))?.value
    const Random = (await getCookie({url: 'https://www.openrec.tv/', name: 'random'}))?.value
    const Token = (await getCookie({url: 'https://www.openrec.tv/', name: 'token'}))?.value
    if (!Uuid || !Random || !Token) {
      throw new PollError(PollErrorType.NotLogin)
    }
    const url = ['https:', '', 'www.openrec.tv', 'viewapp', 'api', 'v3', 'user', 'myfeed?page_number=1'].join('/')
    const res: Response = await (await fetch(url, {
      headers: {
        'x-openrec-agent': 'APP',
        Uuid,
        Random,
        Token,
        'App-Ver': '6.10.17',
        'Device': 'AndroidPhone',
        'X-lang': 'en'
      }
    })).json()
    if (res.data.items === null) {
      throw new PollError(PollErrorType.NotLogin)
    }

    return mapFilter(res.data.items, getInfoFromItem)
  },
  id: 'openrec',
  homepage: 'https://www.openrec.tv/'
})
