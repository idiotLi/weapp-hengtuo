const app = getApp()
Page({
    data: {
        _showMoreAction: false,
        _submitDisabled: true,
        _fieldFocus: false,
        cdnurl: null,
        tree: {},
        id: null,
        ruleList: [],
        config: {},
        data: null,     // 原始数据
        value: {},      // 修改后的数据
        more: []
    },
    onLoad: function (options) {
        const id = options.id
        const config = app.utils.decodeParam(options.config)
        wx.setNavigationBarTitle({
            title: `编辑${config.model ? config.model : ''}`
        })
        // 过滤无权限的「更多」操作规则
        let more = []
        if (config.auth.more) {
            more = Object.values(config.auth.more).filter(function (i) {
                return app.utils.authCheck(i['url'])
            })
        }
        // 根据fieldContent生成picker的columns
        let columns = {}
        for(let field in config.fieldContent) {
            columns[field] = []
            for (let i in config.fieldContent[field]) {
                let text = ''
                let value = null
                if (config.fieldContent[field][i].constructor === Object) {
                    text = Object.values(config.fieldContent[field][i])[0]
                    value = isNaN(parseInt(Object.keys(config.fieldContent[field][i])[0])) ? Object.keys(config.fieldContent[field][i])[0] : parseInt(Object.keys(config.fieldContent[field][i])[0])
                } else {
                    text = config.fieldContent[field][i]
                    value = i
                }
                columns[field].push({
                    'text': text,
                    'value': value
                })
            }
        }
        config.columns = columns
        // 表单验证require的场景判断
        for (const field in config.rules) {
            if (config.rules[field].hasOwnProperty('required')) {
                config.rules[field].required = config.rules[field].required === 'edit' || config.rules[field].required === true ? true : false
            }
        }
        this.setData({
            cdnurl: wx.getStorageSync('config')['upload']['cdnurl'],
            ruleList: wx.getStorageSync('ruleList'),
            more: more,
            config: config,
            id: id,
        })
        this.loadData()
        this.initValidate()
    },
    loadData() {
        let that = this
        wx.wxRequest.get(
            `${that.data.config.auth.edit.url}?ids=${that.data.id}`
        ).then(function (res) {
            if (res) {
                that.setData({
                    data: res.data,
                    value: { ...res.data } //深复制到value
                })
            }
        })
    },
    onSubmit(e) {
        // 表单验证逻辑
        if (!this.wxValidate.checkForm(e.detail.value)) {
            const error = this.wxValidate.errorList[0]
            wx.vantNotify({
                type: 'warning',
                message: this.data.config.rulesMessage && this.data.config.rulesMessage[error.param] && this.data.config.rulesMessage[error.param][error.rule] ? error.msg : `[${this.data.config.field[error.param].label}]${error.msg}`
            })
            // 验证错误的输入框标红
            this.setData({
                validatorError: {
                    [error.param]: true
                }
            })
            return false
        } else {
            // 验证成功清空错误标示
            this.setData({
                validatorError: {}
            })
        }
        // 提交数据
        let that = this
        wx.vantToast.loading({
            duration: 0,
            forbidClick: true,
            message: '提交中...'
        })
        wx.wxRequest.post(
            `${that.data.config.auth.edit.url}?ids=${that.data.data.id}`, e.detail.value
        ).then(function (res) {
            if (res) {
                // 刷新列表页数据
                var pages = getCurrentPages()
                var listPage = pages[pages.length - 3]
                listPage.refreshData()
                wx.vantToast({
                    type: 'success',
                    message: res.msg,
                    forbidClick: true,
                    zIndex: 110,
                    onClose: () => {
                        wx.navigateBack({
                            delta: 2
                        })
                    }
                })
            }
            that.setData({
                _submitDisabled: res ? true : false,
            })
        })
    },
    onReset() {
        this.setData({
            value: { ...this.data.data },
            _submitDisabled: true
        })
    },
    // switch
    onSwitchChange(e) {
        const index = e.currentTarget.dataset.index
        this.setData({
            [`value.${index}`]: e.detail
        });
        this.isSubmitDisabled()
    },
    // select
    onTapSelectField (e) {
        if (this.data._fieldFocus) return
        const index = e.currentTarget.dataset.index
        const picker = this.selectComponent(`.picker-${index}`)
        if (this.data.value[index]) {
            picker.setColumnValue(0,this.data.config.fieldContent[index][this.data.value[index]])
        }
        this.setData({
            showActionSheet: {
                [index]: true
            },
        })
    },
    onSelectConfirm(e) {
        const index = e.currentTarget.dataset.index
        this.setData({
            [`value.${index}`]: e.detail.value.value
        })
        this.isSubmitDisabled()
        this.onCloseActionSheet(e)
    },
    // selects
    onTapSelectsField (e) {
        if (this.data._fieldFocus) return
        const index = e.currentTarget.dataset.index
        const picker = this.selectComponent(`.picker-${index}`)
        // 让picker默认选中当前值 
        picker.setValue(this.data.value[index] ? this.data.value[index].split(',') : [])
        this.setData({
            showActionSheet: {
                [index]: true
            },
        })
    },
    onSelectsConfirm(e) {
        const index = e.currentTarget.dataset.index
        this.setData({
            [`value.${index}`]: e.detail && e.detail.length ? e.detail.join(',') : ''
        })
        this.isSubmitDisabled()
        this.onCloseActionSheet(e)
    },
    // radio
    onRaidoChange(e) {
        const index = e.currentTarget.dataset.index
        this.setData({
            [`value.${index}`]: e.detail
        })
        this.isSubmitDisabled()
    },
    // image,images
    onDeleteUploader(e) {
        const index = e.currentTarget.dataset.index
        let urls = this.data.value[index].split(',')
        urls.splice(e.detail.index,1)
        urls = urls.join(',')
        this.setData({
            [`value.${index}`]: urls
        })
        this.isSubmitDisabled()
    },
    afterRead(e) {
        let that = this
        const index = e.currentTarget.dataset.index
        const {
            file
        } = e.detail
        wx.vantToast.loading({
            duration: 0,
            message: '上传中...'
        })
        wx.uploadFile({
            url: wx.getStorageSync('config')['upload']['uploadurl'],
            header: {
                'Token': wx.getStorageSync('token'),
            },
            filePath: file.path,
            name: 'file',
            formData: {},
            success(res) {
                if (res.statusCode === 200) {
                    const result = JSON.parse(res.data)
                    if (result.code) {
                        wx.vantNotify({
                            type: 'warning',
                            message: result.msg
                        })
                        return
                    }
                    const url = result.data.url
                    let urls = that.data.value[index] ? that.data.value[index].split(',') : []
                    urls.push(url)
                    urls = urls.join(',')
                    that.setData({
                        [`value.${index}`]: urls
                    })
                    wx.vantNotify({ type: 'success', message: '上传成功' })
                    that.isSubmitDisabled()
                }
            },
            error(res) {
                wx.vantNotify({
                    type: 'warning',
                    message: '上传失败'
                })
                console.error('upload error:', res)
            },
            complete(res) {
                wx.vantToast.clear()
            }
        })
    },
    // ruletree
    showPopupTree(e) {
        const index = e.currentTarget.dataset.index
        const row = e.currentTarget.dataset.row
        const type = e.currentTarget.dataset.type
        this.setData({
            [`tree.${index}`]: [],
            showActionSheet: {
                [index]: true
            }
        })
        if (type === 'ruletree') {
            let that = this
            wx.wxRequest.get(
                `${that.data.config.ruletreeUrl}?id=${row.id}&pid=${that.data.value.pid}`
            ).then(function (res) {
                if (res) {
                    const data = res.data
                    // 已有权限集合,数组元素须为number
                    let myRules = []
                    if (Array.isArray(that.data.value[index])) {
                        myRules = that.data.value[index]
                    }else{
                        myRules = that.data.value[index] === '' ? [] : that.data.value[index].split(',').map(i => Number(i))
                    }
                    that.setData({
                        [`value.${index}`]: myRules,
                        [`tree.${index}`]: data,
                    })
                }else{
                    that.onCloseActionSheet(e)
                }
            })
        }
        return
    },
    onRuleTreeConfirm(e) {
        const index = e.currentTarget.dataset.index
        this.setData({
            [`value.${index}`]: e.detail.join(','),
        })
        this.isSubmitDisabled()
        this.onCloseActionSheet(e)
    },
    // datetime,date
    onTapDatetimeField(e) {
        if (this.data._fieldFocus) return
        const index = e.currentTarget.dataset.index
        if (this.data.value[index]) {
            const picker = this.selectComponent(`.picker-${index}`)
            picker.updateColumnValue(app.utils.formatTimestamp(this.data.value[index]))
        }
        this.setData({
            showActionSheet: {
                [index]: true
            },
        })
    },
    onDatetimeConfirm(e) {
        const index = e.currentTarget.dataset.index
        this.setData({
            [`value.${index}`]: app.utils.formatDate(e.detail)
        })
        this.isSubmitDisabled()
        this.onCloseActionSheet(e)
    },
    // time
    onTapTimeField(e) {
        if (this.data._fieldFocus) return
        const index = e.currentTarget.dataset.index
        if (this.data.value[index]) {
            const picker = this.selectComponent(`.picker-${index}`)
            picker.updateColumnValue(this.data.value[index])
        }
        this.setData({
            showActionSheet: {
                [index]: true
            },
        })
    },
    onTimeConfirm(e) {
        const index = e.currentTarget.dataset.index
        this.setData({
            [`value.${index}`]: e.detail
        })
        this.isSubmitDisabled()
        this.onCloseActionSheet(e)
    },
    // year 
    onTapYearField(e) {
        if (this.data._fieldFocus) return
        const index = e.currentTarget.dataset.index
        // 生成年份数组
        const years = []
        const minYear = new Date().getFullYear() - 100
        const maxYear = new Date().getFullYear() + 100
        for (let i = minYear; i < maxYear; i++) {
            years.push(i)
        }
        this.setData({
            years: years,
        },function(){
            const picker = this.selectComponent(`.picker-${index}`)
            if (this.data.value[index]) {
                picker.setColumnValue(0,parseInt(this.data.value[index]))
            } else {
                picker.setColumnValue(0,parseInt(new Date().getFullYear()))
            }
            this.setData({
                showActionSheet: {
                    [index]: true
                },
            })
        })
    },
    onYearConfirm (e) {
        const index = e.currentTarget.dataset.index
        this.setData({
            [`value.${index}`]: e.detail.value
        })
        this.isSubmitDisabled()
        this.onCloseActionSheet(e)
    },
    onDatetimeClear(e) {
        const index = e.currentTarget.dataset.index
        this.setData({
            [`value.${index}`]: null
        })
        this.isSubmitDisabled()
    },
    onCloseActionSheet(e) {
        const index = e.currentTarget.dataset.index
        this.setData({
            showActionSheet: {
                [index]: false
            },
        })
    },
    // editor
    openEditor(e) {
        wx.navigateTo({
            url: `/pages/_common/editor/index?content=${app.utils.encodeParam(e.currentTarget.dataset.content)}&title=${e.currentTarget.dataset.title}&index=${e.currentTarget.dataset.index}`,
        })
    },
    // 更多操作
    onTapMore() {
        this.setData({
            _showMoreAction: true,
        })
    },
    onCloseMoreAction() {
        this.setData({
            _showMoreAction: false
        })
    },
    onSelectMoreAction(e) {
        wx.vantDialog.confirm({
            overlayStyle: 'background-color:rgba(0,0,0,0)',
            zIndex: 110,
            message: `确定进行「${e.detail.name}」操作？`,
            className: 'helper-dialog'
        }).then(() => {
            wx.vantToast.loading({
                duration: 0,
                zIndex: 120,
                forbidClick: true,
                message: `${e.detail.name}中...`
            })
            let that = this
            wx.wxRequest.post(
                e.detail.url, {
                ids: that.data.id,
                params: e.detail.params
            }
            ).then(function (res) {
                if (res) {
                    // 刷新列表页数据
                    var pages = getCurrentPages()
                    var listPage = pages[pages.length - 3]
                    listPage.refreshData()
                    wx.vantToast({
                        type: 'success',
                        message: res.msg,
                        forbidClick: true,
                        zIndex: 130,
                        onClose: () => {
                            that.onCloseMoreAction()
                            wx.navigateBack({
                                delta: 2
                            })
                        }
                    })
                }
            })
        }).catch(() => {
            // on cancel
        })
    },
    // input
    onFieldChange(e) {
        const index = e.currentTarget.dataset.index
        this.setData({
            [`value.${index}`]: e.detail
        })
        this.isSubmitDisabled()
    },
    // 有输入框聚焦时，_fieldFocus:true 使点击其它输入框不弹出上拉菜单
    onFieldFocus() {
        this.setData({
            _fieldFocus: true
        })
    },
    onFieldBlur() {
        this.setData({
            _fieldFocus: false
        })
    },
    isSubmitDisabled() {
        this.setData({
            _submitDisabled: app.utils.compareObj(this.data.value, this.data.data)
        })
    },
    // 表单验证
    initValidate() {
        const rules = this.data.config.rules
        const rulesMessage = this.data.config.rulesMessage
        this.wxValidate = new wx.wxValidate(rules, rulesMessage)
    },
    noop() { }
})