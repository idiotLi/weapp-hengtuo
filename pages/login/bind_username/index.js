const app = getApp()
Page({
    data: {
        userInfo: '',
        username: '',
        password: '',
        captchaUrl: '',
        captcha: '',
        submitDisabled: true
    },
    onLoad: function (options) {
        if (options.data) {
            this.setData({
                userInfo: app.utils.decodeParam(options.data)
            })
        }
        this.downloadCaptcha()
        this.initValidate()
    },
    // 通过wx.downloadFile接口下载和展示图片，并获得sessionId
    downloadCaptcha() {
        wx.downloadFile({
            header: {
                'Cookie': app.globalData.sessionId,
                'Content-Type': 'image/png; charset=utf-8'
            },
            url: app.baseURL + 'login/getCaptcha/' + new Date().getTime(),
            success: (res) => {
                // 服务端有返回新的cookies时
                if (res.cookies && res.cookies.length != 0) {
                    app.globalData.sessionId = res.cookies[0]
                }
                this.setData({
                    captchaUrl: res.tempFilePath
                })
            }
        })
    },
    refreshCaptcha() {
        this.downloadCaptcha()
    },
    onUsernameChange(event) {
        this.computedSubmitDisabled()
    },
    onPasswordChange(event) {
        this.computedSubmitDisabled()
    },
    onCaptchaChange(event) {
        this.computedSubmitDisabled()
    },
    computedSubmitDisabled() {
        if (this.data.username.length && this.data.password.length && this.data.captcha.length === 4) {
            this.setData({
                submitDisabled: false
            })
        } else {
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
            url: app.baseURL + 'login/bind/',
            method: 'POST',
            timeout: 5000,
            header: {
                'Cookie': app.globalData.sessionId,
            },
            data: {
                username: e.detail.value.username,
                password: e.detail.value.password,
                captcha: e.detail.value.captcha,
                userInfo: this.data.userInfo,
            },
            success: (res) => {
                if (res.data.code) {
                    wx.vantNotify({
                        type: 'warning',
                        message: res.data.msg
                    })
                    wx.vantToast.clear()
                    this.refreshCaptcha()
                    this.setData({
                        captcha: ''
                    })
                    this.computedSubmitDisabled()
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
    onBindMobileTap() {
        wx.navigateTo({
            url: '/pages/login/bind_mobile/index?data=' + app.utils.encodeParam(this.data.userInfo),
        })
    },
    // 表单提交时的验证
    initValidate() {
        // 验证规则
        const rules = {
            username: {
                required: true,
            },
            password: {
                required: true,
            },
            captcha: {
                required: true,
                minlength: 4
            },
        }
        // 验证提示信息
        const messages = {
            username: {
                required: '请输入用户名',
            },
            password: {
                required: '请输入密码',
            },
            captcha: {
                required: '请输入验证码',
                minlength: '验证码不正确',
            },
        }
        this.wxValidate = new wx.wxValidate(rules, messages)
    }
})