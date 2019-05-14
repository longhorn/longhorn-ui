import { getSupportbundles, getSupportbundlesStepTwo } from '../services/app'
import { message } from 'antd'

message.config({
  top: 60,
  duration: 5,
})

export default {
  namespace: 'app',
  state: {
    menuPopoverVisible: false,
    isNavbar: document.body.clientWidth < 768,
    bundlesropsVisible: false,
    blur: false,
    progressPercentage: 0,
    bundlesropsKey: Math.random(),
    okText: 'ok',
    modalButtonDisabled : false,
  },
  subscriptions: {
    setup({ dispatch }) {
      dispatch({ type: 'changeNavbar' })
      window.onresize = () => {
        dispatch({ type: 'changeNavbar' })
      }
    },
  },
  effects: {
    *changeNavbar({
      payload,
    }, { put }) {
      if (document.body.clientWidth < 768) {
        yield put({ type: 'showNavbar' })
      } else {
        yield put({ type: 'hideNavbar' })
      }
    },
    *supportbundles({
      payload,
    }, { call, put }) {
      const data = yield call(getSupportbundles, payload)
      if(data.status === 200){
        let dataStepTwo = {}
        function timeout(ms) {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve()
            }, ms, 'done')
          })
        }
        while(dataStepTwo.state !== 'ReadyForDownload') {
          yield call(timeout, 1000)
          dataStepTwo = yield call(getSupportbundlesStepTwo, data.nodeID, {name:data.name})
          yield put({type: 'startProgressPercentage', payload: dataStepTwo.progressPercentage})
        }
        if(dataStepTwo.state === 'ReadyForDownload'){
          window.location.href=`${dataStepTwo.links.self}/${data.name}/download`
        }else{
          message.error('Download failed support bundle creation is still in progress')
        }
        yield put({ type: 'hideBundlesModel' })
      }
    },
    *switchMenuPopver({
      payload,
    }, { put }) {
      yield put({
        type: 'handleSwitchMenuPopver',
      })
    },
  },
  reducers: {
    changeBlur(state, action) {
      return {
        ...state,
        blur: action.payload,
      }
    },
    showNavbar(state) {
      return {
        ...state,
        isNavbar: true,
      }
    },
    hideNavbar(state) {
      return {
        ...state,
        isNavbar: false,
      }
    },
    showBundlesModel(state) {
      return {
        ...state,
        bundlesropsVisible: true,
      }
    },
    hideBundlesModel(state) {
      return {
        ...state,
        bundlesropsVisible: false,
        bundlesropsKey: Math.random(),
        modalButtonDisabled: false,
        okText: 'ok',
        progressPercentage: 0,
      }
    },
    changeOkText(state) {
      return {
        ...state,
        okText: 'Generating...',
        modalButtonDisabled: true,
      }
    },
    handleSwitchMenuPopver(state) {
      return {
        ...state,
        menuPopoverVisible: !state.menuPopoverVisible,
      }
    },
    startProgressPercentage(state, action) {
      return {
        ...state,
        progressPercentage: action.payload,
      }
    },
  },
}
