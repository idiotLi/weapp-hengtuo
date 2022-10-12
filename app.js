import utils from './utils/utils'
import wxRequest from './utils/config'
import wxValidate from './utils/wxValidate'
import throttle from './utils/lodash/throttle.js'
import debounce from './utils/lodash/debounce.js'
import Notify from './components/vant/notify/notify'
import Toast from './components/vant/toast/toast'
import Dialog from './components/vant/dialog/dialog'

wx.wxRequest = wxRequest
wx.wxValidate = wxValidate
wx.thorttle = throttle
wx.debounce = debounce
wx.vantToast = Toast
wx.vantNotify = Notify
wx.vantDialog = Dialog

App({
    onLaunch: function () {
        wx.setStorage({
            key: 'accountInfo',
            data: wx.getAccountInfoSync(),
        })
        this.checkUpdate()
    },
    globalData: {
        systemInfo: wx.getSystemInfoSync(),
        userInfo: null,
        sessionId: '',
        config: null
    },
    checkUpdate() {
        const updateManager = wx.getUpdateManager()
        updateManager.onCheckForUpdate(function (res) {
            // 请求完新版本信息的回调
            console.log('是否有新版本:',res.hasUpdate)
        })
        updateManager.onUpdateReady(function () {
            wx.showModal({
                title: '更新提示',
                content: '新版本已经准备好，是否重启应用？',
                success(res) {
                    if (res.confirm) {
                        // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                        updateManager.applyUpdate()
                    }
                }
            })
        })
    },
    utils: utils,
    towxml: require('/towxml/index'),
    baseURL: wx.wxRequest.defaults.baseURL
})