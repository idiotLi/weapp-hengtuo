const app = getApp()
Page({
    data: {
        _submiting: false,
        _submitDisabled: true,
        userInfo: null,
        value: null,
    },
    onLoad: function (options) {
        const data = app.utils.decodeParam(options.data)
        this.setData({
            userInfo: data,
            value: { ...data }
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
            value: { ...this.data.userInfo },
            _submitDisabled: true
        })
    },
    onFieldChange(e) {
        const index = e.currentTarget.dataset.index
        this.setData({
            [`value.${index}`]: e.detail
        })
        this.isSubmitDisabled()
    },
    isSubmitDisabled() {
        this.setData({
            _submitDisabled: app.utils.compareObj(this.data.value, this.data.userInfo)
        })
    },
    initValidate() {
        const rules = {
            nickname: {
                required: true,
            },
            email: {
                required: true,
                email: true,
            },
            password: {
                rangelength: [6, 16],
            },
        }
        const messages = {
            nickname: {
                required: '请填写昵称',
            },
            email: {
                required: '请填写Email',
                email: '请填写正确的Email',
            },
            password: {
                rangelength: '密码请填写6-16位字符，不能包含空格',
            },
        }
        this.wxValidate = new wx.wxValidate(rules,messages)
    }
})