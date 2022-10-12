const app = getApp()
Page({
    data: {
        canWechatLogin: false,
        canMobileLogin: false,
        canUsernameLogin: false,
        loginIndexText: {},
        showLoading: true,
        accountInfo: wx.getStorageSync('accountInfo')
    },
    onLoad: function () {
        // 登录页初始数据
        wx.request({
            url: app.baseURL + 'login/init',
            method: 'POST',
            timeout: 5000,
            header: {
                'Token': wx.getStorageSync('token'),
            },
            success: (res) => {
                if (res.data.code === 0 || res.data.code === -1) {
                    let data = res.data.data
                    // 收到新token直接登录
                    if (data.token) {
                        wx.setStorageSync('token', data.token)
                        wx.setStorageSync('userId', data.userId)
                        wx.switchTab({
                            url: '/pages/dashboard/index'
                        })
                        return
                    }
                    wx.setStorageSync('config', data.config)
                    this.setData({
                        canWechatLogin: data.config.loginType.indexOf('wechat') > -1 ? true : false,
                        canMobileLogin: data.config.loginType.indexOf('mobile') > -1 ? true : false,
                        canUsernameLogin: data.config.loginType.indexOf('username') > -1 ? true : false,
                        loginIndexText: data.config.loginIndexText ? app.utils.towxml(data.config.loginIndexText) : '',
                    })
                }
            },
            complete: (res) => {
                this.setData({
                    showLoading: false
                })
            }
        })
    },
    // 微信一键登录
    onGetUserInfo(e) {
        wx.getUserProfile({
            desc: '用于完善你的账户信息',
            success: (profile) => {
                this.wxLogin().then((res) => {
                    wx.vantToast.loading({
                        duration: 0,
                        message: '登录中...'
                    })
                    wx.wxRequest.post(
                        'login/wechatLogin', {
                        code: res.code,
                        userInfo: profile.userInfo
                    }
                    ).then(function (rr) {
                        if (!rr.code) {
                            // 响应未携带token时 跳转绑定
                            if (!rr.data.token) {
                                wx.navigateTo({
                                    url: 'bind_username/index?data=' + app.utils.encodeParam(rr.data)
                                })
                            } else {
                                // 响应有携带token时 进入控制台
                                wx.setStorageSync('token', rr.data.token)
                                wx.setStorageSync('config', rr.data.config)
                                wx.setStorageSync('userId', rr.data.userId)
                                wx.setStorageSync('ruleList', rr.data.ruleList)
                                wx.switchTab({
                                    url: '/pages/dashboard/index',
                                })
                            }
                        }
                        wx.vantToast.clear()
                    })
                }, (error) => {
                    console.error(error)
                })
            }
        })
    },
    wxLogin() {
        let promise = new Promise((resolve, reject) => {
            wx.login({
                complete: function (res) {
                    resolve(res)
                },
                fail(error) {
                    reject(error)
                }
            })
        })
        return promise
    }
})