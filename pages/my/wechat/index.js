const app = getApp()
Page({
    data: {
        userInfo: null
    },
    onLoad: function (options) {
        const data = app.utils.decodeParam(options.data)
        this.setData({
            userInfo: data
        })
    },
    bind(e) {
        wx.getUserProfile({
            desc: '用于完善你的账户信息',
            success: (profile) => {
                this.wxLogin().then((res) => {
                    wx.vantToast.loading({
                        duration: 0,
                        message: '绑定中...'
                    })
                    wx.wxRequest.post(
                        'general.profile/update', {
                        wechat: 'bind',
                        code: res.code,
                        userInfo: profile.userInfo
                    }
                    ).then(function (rr) {
                        if (rr) {
                            wx.vantToast({
                                type: 'success',
                                forbidClick: true,
                                message: rr.msg,
                                onClose: () => {
                                    wx.navigateBack()
                                }
                            })
                        }
                    })
                }, (error) => {
                    console.error(error)
                })
            }
        })
    },
    unbind() {
        wx.vantDialog.confirm({
            message: '确定要解除绑定吗？',
            className: 'helper-dialog'
        }).then(() => {
            wx.vantToast.loading({
                duration: 0,
                zIndex: 120,
                forbidClick: true,
                message: '解绑中...'
            })
            wx.wxRequest.post(
                'general.profile/update', {
                wechat: 'unbind'
            }
            ).then(function (res) {
                if (res) {
                    wx.vantToast({
                        type: 'success',
                        message: res.msg,
                        forbidClick: true,
                        onClose: () => {
                            wx.navigateBack()
                        }
                    })
                }
            })
        }).catch(() => {
            // on cancel
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