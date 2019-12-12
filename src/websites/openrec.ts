import { registerWebSite, Living, PollError, PollErrorType } from '../types'
import { parseHTML, HTMLElement, mapFilter } from '~/utils'

function getInfoFromItem (item: HTMLElement): Living | undefined {
  const countElement = item.querySelector('.c-content__list__popularchannel__link__desc__count')
  const count = parseInt(countElement?.text)
  if (isNaN(count)) {
    return
  }

  const previewStyle = item.querySelector('.c-content__list__popularchannel__link__box p')?.attributes['style'];
  const previewRE = /background-image:url\((.*?)\)/.exec(previewStyle)
  if (!previewRE) {
    return
  }
  const preview = previewRE[1]

  return {
      title: item.querySelector('.c-content__list__popularchannel__link__desc__name')?.text?.trim(),
      startAt: null,
      author: item.querySelector('.c-content__list__popularchannel__link__desc__mail')?.text?.trim(),
      online: count,
      preview,
      url: item.attributes.href
  }
}

function fetchEn(url: string) {
  return fetch(url, {
    mode: 'cors',
    headers: {
      'accept-language': 'en;q=0.8,en-US;q=0.6'
    }
  })
}

async function getFollowUrl() {
  const r = await fetchEn('https://www.openrec.tv/profile')
  if (r.url === 'https://www.openrec.tv/') {
    throw new PollError(PollErrorType.NotLogin)
  }
  const dom = parseHTML(await r.text())
  const homepage = dom.querySelector('.js-menu__mypage a').attributes.href
  if (!homepage) {
    throw new PollError(PollErrorType.NotLogin)
  }

  return `${homepage}/follow`
}

registerWebSite({
  async getLiving () {
    const r = await fetchEn(await getFollowUrl())
    const dom = parseHTML(await r.text())
    const list = dom.querySelectorAll('.js-scroll__userFollowList a') as HTMLElement[]

    return mapFilter(list, getInfoFromItem)
  },
  id: 'openrec',
  homepage: 'https://www.openrec.tv/'
})
