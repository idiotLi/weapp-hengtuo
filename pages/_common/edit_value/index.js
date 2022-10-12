const app = getApp()
Page({
    data: {
        auth: {
            edit: false,
            editUrl: '',
            del: false,
            delUrl: '',
        },
        showActionSheet: false,
        submitDisabled: true,
        submiting: false,
        isIOS: false,
        editorFormats: {},
        editorHeight: 300,
        editorReadOnly: false,
        keyboardHeight: 0,
        textareaAutosize: {
            maxHeight: 400,
            minHeight: 100
        },
        columns: [],
        cdnurl: '',
        fileList: [],
        mimetype: '',
        id: null,
        value: '',
        timestamp: null,
        field: '',
        row: null,
        deletable: false
    },
    onLoad: function (options) {
        // 初始数据
        const row = app.utils.decodeParam(options.row)
        const name = options.name ? options.name : ''
        wx.setNavigationBarTitle({
            title: row.title ? row.title : ''
        })
        const auth = {
            edit: options.editurl ? app.utils.authCheck(options.editurl) : false,
            editUrl: options.editurl,
            del: options.delurl ? app.utils.authCheck(options.delurl) : false,
            delUrl: options.delurl,
        }
        const cdnurl = wx.getStorageSync('config')['upload']['cdnurl']

        let value = row.value
        let timestamp = null
        let showActionSheet = false
        let fileList = []
        let mimetype = ''
        let maxsize = ''
        // 不同字段类型判断
        if (['date', 'datetime'].indexOf(row.type) !== -1) {
            timestamp = value.replace(/-/g, '/')
            timestamp = new Date(timestamp).getTime()
            showActionSheet = auth.edit ? true : false
        }
        if (['time'].indexOf(row.type) !== -1) {
            showActionSheet = auth.edit ? true : false
        }
        if (['select'].indexOf(row.type) !== -1) {
            let columns = []
            for (let i in row.content) {
                columns.push({
                    'text': row.content[i],
                    'value': i
                })
            }
            this.setData({
                columns: columns,
            })
            showActionSheet = auth.edit ? true : false
        }
        if (['bool'].indexOf(row.type) !== -1) {
            row.content = {
                1: '打开',
                0: '关闭'
            }
            const columns = [
                {
                    text: '打开',
                    value: '1'
                },
                {
                    text: '关闭',
                    value: '0'
                }
            ]
            this.setData({
                columns: columns,
            })
            showActionSheet = auth.edit ? true : false
        }
        if (['array'].indexOf(row.type) !== -1) {
            value = value.constructor === Object ? JSON.stringify(value) : value
        }
        if (row.type === 'editor') {
            const isIOS = app.globalData.systemInfo.platform === 'ios'
            this.setData({
                isIOS
            })
            // 编辑器高度调整
            const that = this
            this.updatePosition(0)
            let keyboardHeight = 0
            wx.onKeyboardHeightChange(res => {
                if (res.height === keyboardHeight) return
                const duration = res.height > 0 ? res.duration * 1000 : 0
                keyboardHeight = res.height
                setTimeout(() => {
                    wx.pageScrollTo({
                        scrollTop: 0,
                        success() {
                            that.updatePosition(keyboardHeight)
                            that.editorCtx.scrollIntoView()
                        }
                    })
                }, duration)
            })
        }
        if (['files', 'file', 'image', 'images'].indexOf(row.type) !== -1) {
            mimetype = wx.getStorageSync('config')['upload']['mimetype']
            maxsize = wx.getStorageSync('config')['upload']['maxsize']
            // 补全图片链接
            if (row.value) {
                value.split(',').map((v, i) => {
                    fileList[i] = {
                        'url': cdnurl + v,
                        'name': ''
                    }
                })
            }
        }
        this.setData({
            auth: auth,
            showActionSheet: showActionSheet,
            cdnurl: cdnurl,
            mimetype: mimetype,
            maxsize: maxsize,
            fileList: fileList,
            id: row.id ? row.id : name,
            value: value,
            timestamp: timestamp,
            field: options.field,
            deletable: Number(options.deletable),
            row: row
        })
        // picker选中当前值
        if (['select','bool'].indexOf(row.type) !== -1) {
            const picker = this.selectComponent('.picker')
            setTimeout(() => {
                picker.setValues([row.content[value]])
            }, 300);
        }
        this.initValidate(row.rule)
    },
    /* field */
    onFieldChange(e) {
        this.setData({
            value: e.detail,
            submitDisabled: this.data.row.value === e.detail ? true : false
        })
    },
    /* checkbox */
    onCheckBoxChange(e) {
        this.setData({
            value: e.detail,
            submitDisabled: this.data.row.value && this.data.row.value.sort().toString() === e.detail.sort().toString() ? true : false
        })
    },
    toggleCheckbox(e) {
        const {
            index
        } = e.currentTarget.dataset
        const checkbox = this.selectComponent(`.checkboxes-${index}`)
        checkbox.toggle()
    },
    /* radio */
    onRadioChange(e) {
        this.setData({
            value: e.detail.toString()
        })
        this.isValueChanged(e.detail)
    },
    onRadioClick(e) {
        const {
            name
        } = e.currentTarget.dataset;
        this.setData({
            value: name.toString()
        });
        this.isValueChanged(name)
    },
    /* switch */
    onSwitchChange(e) {
        this.setData({
            value: e.detail
        });
        this.isValueChanged(e.detail)
    },
    /* date time*/
    onTapDateField() {
        if (!this.data.auth.edit) return
        if (this.data.value) {
            // 让picker默认选中当前值 datetimepicker内部的updateColumnValue方法
            const picker = this.selectComponent('.picker')
            picker.updateColumnValue(this.data.value)
        }
        this.setData({
            showActionSheet: true
        })
    },
    onDateConfirm(e) {
        // datetimepicker返回的时间可能为时间戳或字符串 判断后统一返回字符串
        const value = isNaN(e.detail) ? e.detail : app.utils.formatDate(e.detail, 'yyyy-MM-dd')
        this.setData({
            value: value,
            showActionSheet: false
        })
        this.isValueChanged(value)
    },
    onDatetimeConfirm(e) {
        const value = isNaN(e.detail) ? e.detail : app.utils.formatDate(e.detail, 'yyyy-MM-dd HH:mm:ss')
        this.setData({
            value: value,
            showActionSheet: false
        })
        this.isValueChanged(value)
    },
    onTimeConfirm(e) {
        this.setData({
            value: e.detail,
            showActionSheet: false
        })
        this.isValueChanged(e.detail)
    },
    /* select */
    onTapSelectField() {
        if (!this.data.auth.edit) return
        const picker = this.selectComponent('.picker')
        // 让picker默认选中当前值 
        picker.setValues([this.data.row.content[this.data.value]])
        this.setData({
            showActionSheet: true
        })
    },
    onSelectConfirm(e) {
        this.setData({
            value: e.detail.value.value,
            showActionSheet: false
        })
        this.isValueChanged(e.detail.value.value)
    },
    /* editor */
    onEditorReady() {
        const that = this
        wx.createSelectorQuery().select('#editor').context(function (res) {
            that.editorCtx = res.context
            that.editorCtx.setContents({
                html: that.data.row.value,
                success: (res) => {},
                fail: (res) => {}
            })
        }).exec()
    },
    onEditorFormat(e) {
        let {
            name,
            value
        } = e.currentTarget.dataset
        if (!name) return
        this.editorCtx.format(name, value)
    },
    onEditorStatusChange(e) {
        const editorFormats = e.detail
        this.setData({
            editorFormats
        })
    },
    blur() {
        this.editorCtx.blur()
    },
    undo() {
        this.editorCtx.undo()
    },
    redo() {
        this.editorCtx.redo()
    },
    insertDivider() {
        this.editorCtx.insertDivider({
            success: function () {
            }
        })
    },
    clear() {
        this.editorCtx.clear({
            success: function (res) {}
        })
    },
    removeFormat() {
        this.editorCtx.removeFormat()
    },
    insertDate() {
        const date = new Date()
        const formatDate = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
        this.editorCtx.insertText({
            text: formatDate
        })
    },
    insertImage() {
        let that = this
        wx.chooseImage({
            count: 1,
            success: (res) => {
                wx.vantToast.loading({
                    duration: 0,
                    message: '上传中...'
                })
                wx.uploadFile({
                    url: wx.getStorageSync('config')['upload']['uploadurl'],
                    header: {
                        'Token': wx.getStorageSync('token'),
                    },
                    filePath: res.tempFilePaths[0],
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

                            that.editorCtx.insertImage({
                                src: that.data.cdnurl + url,
                                alt: '图片'
                            })
                        }
                    },
                    error(res) {
                        wx.vantNotify({
                            type: 'warning',
                            message: '上传失败'
                        })
                        console.log('upload error:', res)
                    },
                    complete(res) {
                        wx.vantToast.clear()
                    }
                })
            }
        })
    },
    onEditorInput() {
        this.editorCtx.getContents({
            success: (res) => {
                this.setData({
                    value: res.html,
                    submitDisabled: this.data.row.value === res.html ? true : false
                })
            }
        })
    },
    /* file and files*/
    afterRead(e) {
        let that = this
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
                    const {
                        fileList = []
                    } = that.data
                    const result = JSON.parse(res.data)
                    if (result.code) {
                        wx.vantNotify({
                            type: 'warning',
                            message: result.msg
                        })
                        return
                    }
                    const url = result.data.url
                    fileList.push({
                        ...file,
                        url: that.data.cdnurl + url
                    })
                    let value = that.data.value
                    if (['files', 'images'].indexOf(that.data.row.type) !== -1 && value !== '') {
                        value = value.split(',')
                        value.push(url)
                    } else {
                        value = url
                    }
                    that.setData({
                        fileList,
                        value: value.toString(),
                        submitDisabled: false
                    })
                }
            },
            error(res) {
                wx.vantNotify({
                    type: 'warning',
                    message: '上传失败'
                })
                console.log('upload error:', res)
            },
            complete(res) {
                wx.vantToast.clear()
            }
        })
    },
    //空方法 阻止冒泡用
    noop() {},
    // 删除文件
    onFileDelete(e) {
        let fileList = this.data.fileList
        let value = this.data.value.split(',')
        fileList.splice(e.detail.index, 1)
        value.splice(e.detail.index, 1)
        this.setData({
            fileList,
            value: value.toString()
        })
        this.isValueChanged(this.data.value)
    },
    onCloseActionSheet() {
        this.setData({
            showActionSheet: false
        })
    },
    onSubmit(e) {
        //表单验证 (editor不验证)
        if (this.data.row.type !== 'editor' && !this.wxValidate.checkForm(e.detail.value)) {
            const error = this.wxValidate.errorList[0]
            wx.vantNotify({
                type: 'warning',
                message: error.msg
            })
            return false
        }
        let that = this
        that.setData({
            submiting: true
        })
        wx.vantToast.loading({
            duration: 0,
            forbidClick: true,
            message: '提交中...'
        })
        wx.wxRequest.post(
            that.data.auth.editUrl, {
                id: that.data.id,
                value: that.data.row.type === 'editor' ? that.data.value.replace(/\swx:nodeid="\d+"/g,'') : that.data.value, //去掉编辑器生成的'wx:nodeid=xx'代码,
                field: that.data.field
            }
        ).then(function (res) {
            if (res) {
                that.setData({
                    submitDisabled: true
                })
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
                submiting: false
            })
        })
    },
    onReset(e) {
        if (this.data.row.type === 'editor') {
            this.editorCtx.setContents({
                html: this.data.row.value
            })
        }
        if (['file', 'files', 'image', 'images'].indexOf(this.data.row.type) !== -1) {
            let fileList = []
            if (this.data.row.value) {
                this.data.row.value.split(',').map((v, i) => {
                    fileList[i] = {
                        'url': this.data.cdnurl + v,
                        'name': ''
                    }
                })
            }
            this.setData({
                fileList
            })
        }
        this.setData({
            value: this.data.row.value,
            submitDisabled: true
        })
    },
    onDelete(e) {
        wx.vantDialog.confirm({
                message: '确定删除吗？',
                asyncClose: true,
                className: 'helper-dialog'
            })
            .then(() => {
                let that = this
                wx.wxRequest.post(
                    that.data.auth.delUrl, {
                        id: that.data.id
                    }
                ).then(function (res) {
                    if (res) {
                        wx.vantDialog.close()
                        wx.vantToast({
                            type: 'success',
                            message: res.msg,
                            onClose: () => {
                                wx.navigateBack()
                            }
                        })
                    }
                })
                wx.vantDialog.close()
            })
            .catch(() => {
                wx.vantDialog.close();
            })
    },
    // 计算表单值是否有改变 用于无交互改变表单值的情况
    isValueChanged(value) {
        this.setData({
            submitDisabled: this.data.row.value === value ? true : false
        })
    },
    // 更新编辑框高度
    updatePosition(keyboardHeight) {
        const toolbarHeight = 50
        const {
            windowHeight
        } = wx.getSystemInfoSync()
        let editorHeight = keyboardHeight > 0 ? (windowHeight - keyboardHeight - toolbarHeight) : windowHeight * 2 / 3
        this.setData({
            editorHeight,
            keyboardHeight
        })
    },
    // 表单提交时的验证
    initValidate(rule) {
        let rulesArr = rule.split(';')
        let ruleObj = {}
        for (var i = 0; i < rulesArr.length; i++) {
            ruleObj[rulesArr[i]] = true
        }
        const rules = {
            [this.data.row.name]: ruleObj
        }
        this.wxValidate = new wx.wxValidate(rules)
    }
})