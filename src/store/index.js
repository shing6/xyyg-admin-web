// store index.js
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)
// 初始化时用sessionStore.getItem('token'),这样子刷新页面就无需重新登录
const state = {
  user: window.sessionStorage.getItem('user'),
  token: window.sessionStorage.getItem('token'),
  user_image: window.sessionStorage.getItem('user_image'),
  userId: window.sessionStorage.getItem('userId'),
}
const mutations = {
  //将token保存到sessionStorage里，token表示登陆状态
  SET_TOKEN: (state, data) => {
    state.token = data
    window.sessionStorage.setItem('token', data)
  },
  //获取用户id
  GET_USERID: (state, data) => {
    // 把用户id存起来
    state.userId = data
    window.sessionStorage.setItem('userId', data)
  },
  //获取用户名
  GET_USER: (state, data) => {
    // 把用户名存起来
    state.user = data
    window.sessionStorage.setItem('user', data)
  },
  //获取用户头像
  GET_IMAGE: (state, data) => {
    // 把用户名存起来
    state.user_image = data
    window.sessionStorage.setItem('user_image', data)
  },
  //获取用户权限
  ROLE: (state, data) => {
    // 把用户名存起来
    state.role = data
    window.sessionStorage.setItem('role', data)
  },
  //登出
  LOGOUT: (state) => {
    // 登出的时候要清除token
    state.token = null
    state.user = null
    state.user_image= null
    state.userId= null
    state.role= null
    window.sessionStorage.removeItem('token')
    window.sessionStorage.removeItem('user')
    window.sessionStorage.removeItem('user_image')
    window.sessionStorage.removeItem('userId')
    window.sessionStorage.removeItem('role')
  }
}

const actions = {
}
export default new Vuex.Store({
  state,
  mutations,
  actions
})
