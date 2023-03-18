import { registerWebSite, Living, PollError, PollErrorType } from '../types'
import { mapFilter, getCookie } from 'utils'

const ClientId = 'kimne78kx3ncx6brgo4mv6wki5h1ko'
const GqlRequest = `[{"operationName":"FollowedIndex_CurrentUser","variables":{"limit":30},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"181e1c51a951f4cc0dc54e13d3c4dbde6d9bf4ecbd4724d753ddb1794ab055d6"}}}]`

interface Room {
  displayName: string
  login: string
  stream: {
    title: string
    viewersCount: number
    previewImageURL: string
  }
}
interface Response {
  data: {
    currentUser: {
      followedLiveUsers: {
        nodes: Room[]
      }
      id: string
    } | null
    list: Room[]
  }
}

function getInfoFromItem({
  displayName,
  login,
  stream: {
    title,
    viewersCount,
    previewImageURL
  }
}: Room): Living | undefined {
  return {
    title,
    startAt: null,
    author: displayName,
    online: viewersCount,
    preview: previewImageURL,
    url: `https://www.twitch.tv/${login}`
  }
}

registerWebSite({
  async getLiving() {
    const authToken = await getCookie({ url: 'https://www.twitch.tv', name: 'auth-token' })
    if (authToken === null) {
      throw new PollError(PollErrorType.NotLogin)
    }
    const r = await fetch(`https://gql.twitch.tv/gql`, {
      method: 'POST',
      headers: {
        'Client-ID': ClientId,
        'Authorization': `OAuth ${authToken.value}`
      },
      body: GqlRequest,
    })
    const [res]: Response[] = await r.json()
    if (res.data.currentUser === null) {
      throw new PollError(PollErrorType.NotLogin)
    }

    return mapFilter(res.data.currentUser.followedLiveUsers.nodes, getInfoFromItem)
  },
  id: 'twitch',
  homepage: 'https://www.twitch.tv/'
})
