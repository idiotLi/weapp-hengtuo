const app = getApp()
Page({
    data: {
        submitDisabled: false,
        submiting: false,
        showTypePicker: false,
        showGroupPicker: false,
        showContentPicker: false,
        type: '',
        typeTitle: '',
        group: '',
        groupTitle: '',
        name: '',
        title: '',
        value: '',
        content: `value1|title1\nvalue2|title2`,
        tip: '',
        rule: '',
        extend: '',
        typeList: [],
        groupList: [],
        ruleList: [],
    },
    onLoad: function (options) {
        const data = app.utils.decodeParam(options.data)
        let typeList = [],
            groupList = [],
            ruleList = []
        for (let i in data.typeList) {
            typeList.push({
                'text': data.typeList[i],
                'value': i
            })
        }
        for (let i in data.groupList) {
            groupList.push({
                'text': data.groupList[i],
                'value': i
            })
        }
        for (let i in data.ruleList) {
            ruleList.push({
                'text': data.ruleList[i],
                'value': i
            })
        }
        this.setData({
            typeList: typeList,
            groupList: groupList,
            ruleList: ruleList
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
        this.setData({
            submitDisabled: true,
            submiting: true
        })
        let that = this
        wx.wxRequest.post(
            'general.config/add', e.detail.value
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
            that.setData({
                submitDisabled: res ? true : false,
                submiting: false
            })
        })
    },
    onReset(e) {
        this.setData({
            type: '',
            typeTitle: '',
            group: '',
            groupTitle: '',
            name: '',
            title: '',
            value: '',
            content: `value1|title1\nvalue2|title2`,
            tip: '',
            rule: '',
            extend: ''
        })
    },
    /**
     * ????????????
     */
    onOpenTypePicker() {
        const picker = this.selectComponent('.picker-type')
        picker.setValues([this.data.typeTitle])
        this.setData({
            showTypePicker: true
        })
    },
    onConfirmTypePicker(e) {
        this.setData({
            type: e.detail.value.value,
            typeTitle: e.detail.value.text,
            showTypePicker: false
        })
        // ???????????????????????????????????? ??????????????????(????????????)???????????????
        this.initValidate()
    },
    onCloseTypePicker() {
        this.setData({
            showTypePicker: false
        })
    },
    /**
     * ????????????
     */
    onOpenGroupPicker() {
        const picker = this.selectComponent('.picker-group')
        picker.setValues([this.data.groupTitle])
        this.setData({
            showGroupPicker: true
        })
    },
    onConfirmGroupPicker(e) {
        this.setData({
            group: e.detail.value.value,
            groupTitle: e.detail.value.text,
            showGroupPicker: false
        })
    },
    onCloseGroupPicker() {
        this.setData({
            showGroupPicker: false
        })
    },
    /**
     * ????????????
     */
    onOpenContentPicker() {
        let value = []
        if (this.data.rule) {
            value = this.data.rule.split(';')
        }
        const selects = this.selectComponent('.selects-rule')
        selects.setValue(value)
        this.setData({
            showContentPicker: true
        })
    },
    onCloseContentPicker() {
        this.setData({
            showContentPicker: false
        })
    },
    onConfirmContentPicker(e) {
        let rule = ''
        if (e.detail && e.detail.length) {
            rule = e.detail.join(';')
        }
        this.setData({
            rule: rule,
            showContentPicker: false
        })
    },
    // ????????????
    initValidate() {
        const rules = {
            type: {
                required: true
            },
            group: {
                required: true
            },
            name: {
                required: true,
                rangelength: [3, 30]
            },
            title: {
                required: true,
            },
            content: {
                required: ['radio', 'checkbox', 'select', 'selects'].indexOf(this.data.type) !== -1,
            }
        }
        // ??????????????????
        const messages = {
            type: {
                required: '???????????????',
            },
            group: {
                required: '???????????????',
            },
            name: {
                required: '??????????????????',
                rangelength: '??????????????????3???30?????????'
            },
            title: {
                required: '?????????????????????',
            },
            content: {
                required: '?????????????????????'
            },
        }
        this.wxValidate = new wx.wxValidate(rules, messages)
    }
})