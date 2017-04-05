export default {
  namespace: 'app',
  state: {
    menuPopoverVisible: false,
    isNavbar: document.body.clientWidth < 769,
    blur: false,
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
      if (document.body.clientWidth < 992) {
        yield put({ type: 'showNavbar' })
      } else {
        yield put({ type: 'hideNavbar' })
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
    handleSwitchMenuPopver(state) {
      return {
        ...state,
        menuPopoverVisible: !state.menuPopoverVisible,
      }
    },
  },
}
