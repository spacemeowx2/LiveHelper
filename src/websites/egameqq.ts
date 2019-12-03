import { registerWebSite, Living, PollError, PollErrorType } from '../types'
import { mapFilter, parseHTML, HTMLElement, parseViews } from '~/utils'

function getInfoFromItem (item: HTMLElement): Living | undefined {
  const a = item.querySelector('a')
  const img = item.querySelector('.content img')
  const name = item.querySelector('.info-anchor .name')
  const popular = item.querySelector('.info-anchor .popular')
  if (!a || !img || !name || !popular) {
    return
  }

  return {
    title: a.attributes.title,
    startAt: null,
    author: name.text,
    online: parseViews(popular.text),
    preview: `https:${img.attributes.src}`,
    url: `https://egame.qq.com/${a.attributes.href}`
  }
}

registerWebSite({
  async getLiving () {
    const r = await fetch(`https://egame.qq.com/followlist`)
    const dom = parseHTML(await r.text())
    if (!dom.querySelector('.gui-list-normal')) {
      throw new PollError(PollErrorType.NotLogin)
    }

    const list = dom.querySelectorAll('.livelist-mod .gui-list-normal')

    return mapFilter(list, getInfoFromItem)
  },
  id: 'egameqq',
  homepage: 'https://egame.qq.com/'
})
