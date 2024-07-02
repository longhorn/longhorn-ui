/* eslint no-unused-vars: "off" */
import { execAction } from '../services/volume'
import { delay } from 'dva/saga'

let loopTree = (node, treeArry, treeLevelNodes) => {
  if (!node.children) {
    return
  }
  for (let i = 0; i < node.children.length; i += 1) {
    let item = node.children[i]
    node.childrenNode || (node.childrenNode = [])
    if (item === 'volume-head') {
      node.isVolumeLine = true
      node.childrenNode.push('volume-head')
      continue
    }
    let selected = treeArry.find(ele => ele.name === item)
    let child = {
      ...selected,
    }
    node.childrenNode.push(child)
    loopTree(child, treeArry, treeLevelNodes)
  }
  if (node.childrenNode) {
    node.childrenNode.sort((a, b) => {
      if (a === 'volume-head') {
        node.isVolumeLine = true
        return 1
      }
      if (b === 'volume-head') {
        node.isVolumeLine = true
        return -1
      }
      if (a.isVolumeLine || b.isVolumeLine) {
        node.isVolumeLine = true
      }
      return (new Date(a.created)).getTime() - (new Date(b.created)).getTime()
    })
    treeLevelNodes.push(node.childrenNode.map(el => {
      if (!el.name) {
        return el
      }
      return el.name
    }))
  }
}
let filterRemoved = (data) => {
  let filteredData = []
  for (let i = 0; i < data.length; i += 1) {
    let item = data[i]
    if (item.removed || (!item.usercreated && item.name !== 'volume-head')) {
      let parent = item.parent
      if (parent !== '') {
        let parentEntity = data.find(el => el.name === parent)

        let pChildArray = parentEntity.children
        let itemPos = pChildArray.findIndex(ele => ele === item.name)
        pChildArray = pChildArray.slice(0, itemPos)
          .concat(pChildArray.slice(itemPos + 1, pChildArray.length))
          .concat(item.children)
        parentEntity.children = pChildArray
      }
      // change children parent
      for (let j = 0; j < item.children.length; j += 1) {
        let itemC = item.children[j]
        // if (itemC === 'volume-head') {
        //   continue
        // }
        let itemCEntity = data.find(el => el.name === itemC)

        if (itemCEntity) {
          itemCEntity.parent = parent
        }
      }

      continue
    }
    filteredData.push(item)
  }
  return filteredData
}

const genSnapshotsTreeData = (snapshots, filter = (d) => [...d]) => {
  snapshots.forEach(el => {
    const children = el.children
    if (children) {
      el.children = Object.keys(children)
    }
  })

  let actualData = filter(snapshots)
  let rootNodes = []
  for (let i = 0; i < actualData.length; i++) {
    let item = actualData[i]
    if (item.parent === '') {
      rootNodes.push({
        ...item,
      })
    }
  }
  let rootNode = {
    children: rootNodes.map(el => el.name),
  }
  let treeLevelNodes = []
  if (rootNodes.length) {
    loopTree(rootNode, actualData, treeLevelNodes)
  }
  return {
    rootNode,
    treeLevelNodes,
  }
}

const isJson = (str) => {
  try {
    let obj = JSON.parse(str)

    if (typeof obj === 'object' && obj) {
      return true
    } else {
      return false
    }
  } catch (e) {
    return false
  }
}

export default (namespace) => {
  return {
    namespace,
    state: {
      volume: {},
      snapshotTreeWithRemoved: [],
      snapshotTree: [],
      // record nodes name of every Level
      treeLevelNodes: [],
      treeLevelNodesWithReomoved: [],
      loading: false,
      state: false,
      enablePolling: false,
      showRemoved: false,
      // raw snapshots data
      data: [],
    },
    subscriptions: {

    },
    effects: {
      *snapshotAction({
        payload,
      }, { call, put }) {
        yield put({ type: 'setLoading', payload: true })
        yield call(execAction, payload.url, payload.params)
        if (payload.actions && payload.actions.length) {
          for (let i = 0; i < payload.actions.length; i += 1) {
            let item = payload.actions[i]
            yield call(execAction, item.url, item.params)
          }
        }
        yield put({ type: 'querySnapShot', payload: { url: payload.querySnapShotUrl } })
        yield put({ type: 'setLoading', payload: false })
      },
      *queryVolume({
        payload,
      }, { put }) {
        const data = payload.volume
        if (data && data.actions) {
          yield put({ type: 'setVolume', payload: data })
          yield put({ type: 'querySnapShot', payload: { url: data.actions.snapshotList } })
        }
      },
      *querySnapShot({
        payload,
      }, { call, put }) {
        if (!payload.url) {
          yield put({ type: 'setSnapshotData', payload: [] })
          yield put({ type: 'setSnapshot', payload: [] })
          yield put({ type: 'setSnapshotWithRemoved', payload: [] })
          yield put({ type: 'setSnapshotState', payload: true })
          return
        }
        yield put({ type: 'setLoading', payload: true })
        const snapshots = yield call(execAction, payload.url)
        let treeData = []
        if (snapshots && snapshots.data && isJson(JSON.stringify(snapshots.data))) {
          treeData = snapshots.data
          yield put({ type: 'setSnapshotState', payload: true })
        } else {
          yield put({ type: 'setSnapshotState', payload: false })
        }
        yield put({ type: 'setSnapshotData', payload: treeData })
        const { rootNode, treeLevelNodes } = genSnapshotsTreeData(JSON.parse(JSON.stringify(treeData)), filterRemoved)
        const { rootNode: rootNodeWithRemoved, treeLevelNodes: treeLevelNodesWithRemoved } = genSnapshotsTreeData(JSON.parse(JSON.stringify(treeData)))
        yield put({ type: 'setLoading', payload: false })
        yield put({ type: 'setTreeLevelNodes', payload: treeLevelNodes })
        yield put({ type: 'setSnapshot', payload: rootNode.childrenNode || [] })
        yield put({ type: 'setTreeLevelNodesWithRemoved', payload: treeLevelNodesWithRemoved })
        yield put({ type: 'setSnapshotWithRemoved', payload: rootNodeWithRemoved.childrenNode || [] })
      },
      *backup({
        payload,
      }, { call, put }) {
        yield put({ type: 'setLoading', payload: true })
        const snapshot = yield call(execAction, payload.snapshotCreateUrl, {})
        if (Object.getOwnPropertyNames(payload.labels).length === 0) {
          yield call(execAction, payload.snapshotBackupUrl, { name: snapshot.name, backupMode: payload.backupMode })
        } else {
          yield call(execAction, payload.snapshotBackupUrl, { name: snapshot.name, labels: payload.labels, backupMode: payload.backupMode })
        }
        yield put({ type: 'querySnapShot', payload: { url: payload.querySnapShotUrl } })
        yield put({ type: 'setLoading', payload: false })
      },
      *createBackupBySnapshot({
        payload,
      }, { call, put }) {
        yield put({ type: 'setLoading', payload: true })
        if (Object.getOwnPropertyNames(payload.labels).length === 0) {
          yield call(execAction, payload.snapshotBackupUrl, { name: payload.snapshotName })
        } else {
          yield call(execAction, payload.snapshotBackupUrl, { name: payload.snapshotName, labels: payload.labels })
        }
        yield put({ type: 'querySnapShot', payload: { url: payload.querySnapShotUrl } })
        yield put({ type: 'setLoading', payload: false })
      },
      *polling({
        payload,
      }, { call, put, select }) {
        const running = true
        while (running) {
          yield delay(20000)
          const enablePolling = yield select(state => state.snapshotModal.enablePolling)
          if (!enablePolling) {
            break
          }
          const volume = yield select(state => state.snapshotModal.volume)
          if (volume.actions && !volume.actions.snapshotList) {
            continue
          }
          const loading = yield select(state => state.snapshotModal.loading)
          if (loading) {
            continue
          }
          let snapshots
          for (let i = 0; i < 3; i++) {
            if (volume.actions) {
              snapshots = yield call(execAction, volume.actions.snapshotList, {}, i !== 2)
            }
            if (snapshots === undefined) {
              continue
            } else {
              break
            }
          }
          if (snapshots === undefined) {
            continue
          }
          let treeData = []
          if (snapshots && snapshots.data && isJson(JSON.stringify(snapshots.data))) {
            treeData = snapshots.data
          }
          yield put({ type: 'setSnapshotData', payload: treeData })
          const { rootNode, treeLevelNodes } = genSnapshotsTreeData(JSON.parse(JSON.stringify(treeData)), filterRemoved)
          const { rootNode: rootNodeWithRemoved, treeLevelNodes: treeLevelNodesWithRemoved } = genSnapshotsTreeData(JSON.parse(JSON.stringify(treeData)))
          yield put({ type: 'setTreeLevelNodes', payload: treeLevelNodes })
          yield put({ type: 'setSnapshot', payload: rootNode.childrenNode || [] })
          yield put({ type: 'setTreeLevelNodesWithRemoved', payload: treeLevelNodesWithRemoved })
          yield put({ type: 'setSnapshotWithRemoved', payload: rootNodeWithRemoved.childrenNode || [] })
          yield put({ type: 'setLoading', payload: false })
        }
      },
      *startPolling({
        payload,
      }, { put }) {
        yield put({ type: 'setEnablePolling', payload: true })
        yield put({ type: 'polling', payload: { url: payload.querySnapShotUrl } })
      },
    },
    reducers: {
      setSnapshot(state, action) {
        return {
          ...state,
          snapshotTree: action.payload,
        }
      },
      setSnapshotWithRemoved(state, action) {
        return {
          ...state,
          snapshotTreeWithRemoved: action.payload,
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
      setTreeLevelNodes(state, { payload }) {
        return {
          ...state,
          treeLevelNodes: payload,
        }
      },
      setTreeLevelNodesWithRemoved(state, { payload }) {
        return {
          ...state,
          treeLevelNodesWithRemoved: payload,
        }
      },
      setSnapshotState(state, action) {
        return {
          ...state,
          state: action.payload,
        }
      },
      setEnablePolling(state, action) {
        return {
          ...state,
          enablePolling: action.payload,
        }
      },
      stopPolling(state) {
        return {
          ...state,
          enablePolling: false,
        }
      },
      setShowRemoved(state, action) {
        return {
          ...state,
          showRemoved: action.payload,
        }
      },
      setSnapshotData(state, action) {
        return {
          ...state,
          data: action.payload,
        }
      },
    },
  }
}
