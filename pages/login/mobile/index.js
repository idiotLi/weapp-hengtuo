const app = getApp()
Page({
    data: {
        userInfo: '',
        mobile: '',
        captcha: '',
        captchaSending: false,
        countdown: false,
        time: 60 * 1000,
        captchaSended: false,
        sendCaptchaDisabled: true,
        submitDisabled: true,
        loginMobileText: ''
    },
    onLoad: function (options) {
        this.setData({
            loginMobileText: wx.getStorageSync('config')['loginMobileText'] ? app.utils.towxml(wx.getStorageSync('config')['loginMobileText']) : ''
        })
        this.initValidate()
    },
    onSendCaptchaClick() {
        this.setData({captchaSending: true})
        wx.request({
            url: app.baseURL + 'login/sendCaptchaSms',
            method: 'POST',
            timeout: 5000,
            header: {
                'Cookie': app.globalData.sessionId,
            },
            data: {
                mobile: this.data.mobile
            },
            success: (res) => {
                if (res.data.code) {
                    wx.vantNotify({
                        type: 'warning',
                        message: res.data.msg
                    })
                } else {
                    wx.vantNotify({
                        type: 'success',
                        message: res.data.msg
                    })
                    // 服务端有返回新的cookies时
                    if (res.cookies && res.cookies.length != 0) {
                        app.globalData.sessionId = res.cookies[0]
                    }
                    this.setData({
                        countdown: true,
                        captchaSended: true
                    })
                    const countDown = this.selectComponent('#countdown')
                    countDown.start()
                }
            },
            complete: (res) => {
                this.setData({
                    captchaSending: false
                })
            }
        })
    },
    onTimerFinish() {
        this.setData({countdown: false})
        const countDown = this.selectComponent('#countdown')
        countDown.reset()
    },
    onMobileChange(event) {
        this.setData({
            sendCaptchaDisabled: event.detail.length === 11 ? false : true
        })
        this.computedSubmitDisabled()
    },
    onCaptchaChange(event) {
        this.computedSubmitDisabled()
    },
    computedSubmitDisabled() {
        if (this.data.mobile.length === 11 && this.data.captcha.length === 6 && this.data.captchaSended)  {
            this.setData({
                submitDisabled: false
            })
        }else{
            this.setData({
                submitDisabled: true
            })
        }
    },
    onSubmit(e) {
        // 表单验证错误逻辑
        if (!this.wxValidate.checkForm(e.detail.value)) {
            const error = this.wxValidate.errorList[0]
            wx.vantNotify({
                type: 'warning',
                message: error.msg
            })
            return false
        }
        // 表单验证成功逻辑
        wx.vantToast.loading({
            duration: 0,
            message: '验证中...'
        })
        wx.request({
            url: app.baseURL + 'login/mobileLogin',
            method: 'POST',
            timeout: 5000,
            header: {
                'Cookie': app.globalData.sessionId,
            },
            data: {
                mobile: this.data.mobile,
                captcha: this.data.captcha
            },
            success: (res) => {
                if (res.data.code) {
                    wx.vantNotify({
                        type: 'warning',
                        message: res.data.msg
                    })
                    wx.vantToast.clear()
                } else {
                    this.setData({
                        submitDisabled: true
                    })
                    wx.setStorageSync('token', res.data.data.token)
                    wx.setStorageSync('config', res.data.data.config)
                    wx.setStorageSync('userId', res.data.data.userId)
                    wx.setStorageSync('ruleList', res.data.data.ruleList)
                    wx.vantToast({
                        type: 'success',
                        message: res.data.msg,
                        onClose: () => {
                            wx.switchTab({
                                url: '/pages/dashboard/index'
                            })
                        }
                    })
                }
            },
            complete: (res) => {
                setTimeout(() => {
                    wx.vantToast.clear()
                }, 1000);
            }
        })
    },
    // 表单提交时的验证
    initValidate() {
        // 验证规则
        const rules = {
            mobile: {
                required: true,
                mobile: true
            },
            captcha: {
                required: true,
                minlength: 6
            },
        }
        // 验证提示信息
        const messages = {
            mobile: {
                required: '请输入手机号码',
                mobile: '手机号码格式不正确'
            },
            captcha: {
                required: '请输入验证码',
                minlength: '验证码不正确',
            },
        }
        this.wxValidate = new wx.wxValidate(rules, messages)
    }
})