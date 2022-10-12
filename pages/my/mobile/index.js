const app = getApp()
Page({
    data: {
        _captcha: '',
        _captchaSending: false,
        _countdown: false,
        _time: 60 * 1000,
        _captchaSended: false,
        _sendCaptchaDisabled: true,
        _submiting: false,
        _submitDisabled: true,
        mobile: null,
        value: null,
    },
    onLoad: function (options) {
        this.setData({
            mobile: options.data,
            value:  options.data,
        })
        this.initValidate()
    },
    onSubmit(e) {
        if (!this.wxValidate.checkForm(e.detail.value)) {
            const error = this.wxValidate.errorList[0]
            wx.vantNotify({
                type: 'warning',
                message: error.msg
            })
            return false
        }
        let that = this
        that.setData({
            _submiting: true
        })
        wx.wxRequest.post(
            'general.profile/update', e.detail.value
        ).then(function (res) {
            if (res) {
                that.setData({
                    _submitDisabled: true
                })
                wx.vantToast({
                    type: 'success',
                    forbidClick: true,
                    message: res.msg,
                    onClose: () => {
                        wx.navigateBack()
                    }
                })
            }
            that.setData({
                _submiting: false
            })
        })
    },
    onReset() {
        this.setData({
            value: this.data.mobile,
            _captcha: '',
            _submitDisabled: true
        })
    },
    onFieldChange(e) {
        this.setData({
            _sendCaptchaDisabled: e.detail.length === 11 ? false : true
        })
        this.isSubmitDisabled()
    },
    onCaptchaChange() {
        this.isSubmitDisabled()
    },
    onSendCaptchaClick() {
        this.setData({_captchaSending: true})
        let that = this
        wx.wxRequest.get(
            `general.profile/update?action=sendCaptchaSms&mobile=${that.data.value}`
        ).then(function (res) {
            if (res) {
                wx.vantToast({
                    type: 'success',
                    message: res.msg
                })
                that.setData({
                    _countdown: true,
                    _captchaSended: true
                })
                const countDown = that.selectComponent('#countdown')
                countDown.start()
            }
            that.isSubmitDisabled()
            that.setData({
                _captchaSending: false,
                _submiting: false
            })
        })
    },
    onTimerFinish() {
        this.setData({ _countdown: false })
        const countDown = this.selectComponent('#countdown')
        countDown.reset()
    },
    isSubmitDisabled() {
        this.setData({
            _submitDisabled: this.data.value === this.data.mobile || this.data.value.length !== 11 || this.data._captcha.length !== 6 || !this.data._captchaSended
        })
    },
    initValidate() {
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
        this.wxValidate = new wx.wxValidate(rules,messages)
    }
})