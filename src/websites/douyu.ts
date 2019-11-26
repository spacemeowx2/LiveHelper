import { registerWebSite } from '../types'
registerWebSite({
  async getLiving () {
    const r = await fetch('https://www.douyu.com/member/cp/get_follow_list')
    console.log(r)
    return []
  }
})
