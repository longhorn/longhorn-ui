import { execAction, getVolume } from '../services/volume'

let loopTree = function (node, treeArry) {
  for (let i = 0; i < node.children.length; i += 1) {
    let item = node.children[i]
    node.childrenNode || (node.childrenNode = [])
    if (!item || item === 'volume-head') {
      node.childrenNode.push(
              'volume-head'
              )
    } else {
      let selected = treeArry.find(ele => ele.name === item)
      let child = {
        ...selected,
      }
      node.childrenNode.push(
        child
                )
      loopTree(child, treeArry)
    }
  }
  node.childrenNode && node.childrenNode.sort((a, b) => {
    if (a === 'volume-head') {
      return 1
    }
    if (b === 'volume-head') {
      return -1
    }
    return (new Date(a.created)).getTime() - (new Date(b.created)).getTime()
  })
}
export default (namespace) => {
  return {
    namespace,
    state: {
      volume: {},
      snapshotTree: [],
      loading: false,
    },
    subscriptions: {

    },
    effects: {
      *snapshotAction({
        payload,
      }, { call, put }) {
        yield put({ type: 'setLoading', payload: true })
        yield call(execAction, payload.url, payload.params)
        yield put({ type: 'querySnapShot', payload: { url: payload.querySnapShotUrl } })
        yield put({ type: 'setLoading', payload: false })
      },
      *queryVolume({
        payload,
      }, { call, put }) {
        const data = yield call(getVolume, payload)
        yield put({ type: 'setVolume', payload: data })
        yield put({ type: 'querySnapShot', payload: { url: data.actions.snapshotList } })
      },
      *querySnapShot({
        payload,
      }, { call, put }) {
        yield put({ type: 'setLoading', payload: true })
        const treeData = yield call(execAction, payload.url)
        yield put({ type: 'setLoading', payload: false })
        let rootNode = {
          ...treeData.data.find(ele => ele.parent === ''),
        }
        if (rootNode.name) {
          loopTree(rootNode, treeData.data)
          yield put({ type: 'setSnapshot', payload: [rootNode] })
        } else {
          yield put({ type: 'setSnapshot', payload: [] })
        }
      },
    },
    reducers: {
      setSnapshot(state, action) {
        return {
          ...state,
          snapshotTree: action.payload,
        }
      },
      setLoading(state, action) {
        return {
          ...state,
          loading: action.payload,
        }
      },
      setVolume(state, action) {
        return {
          ...state,
          volume: action.payload,
        }
      },
    },
  }
}
