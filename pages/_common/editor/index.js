const app = getApp()
Page({
    data: {
        isIOS: false,
        editorFormats: {},
        editorHeight: 300,
        editorReadOnly: false,
        keyboardHeight: 0,
        textareaAutosize: {
            maxHeight: 400,
            minHeight: 100
        },
        submitDisabled: true,
        cdnurl: '',
        index: null,
        value: '',
        data: '',
    },
    onLoad: function (options) {
        // 初始数据
        const content = options.content !== 'undefined' ? app.utils.decodeParam(options.content) : ''
        const index = options.index
        const title = options.title ? options.title + '编辑器' : '编辑器'
        wx.setNavigationBarTitle({
            title: title
        })
        const cdnurl = wx.getStorageSync('config')['upload']['cdnurl']
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
        this.setData({
            cdnurl: cdnurl,
            value: content,
            data: content,
            index: index
        })
    },
    onEditorReady() {
        const that = this
        wx.createSelectorQuery().select('#editor').context(function (res) {
            that.editorCtx = res.context
            that.editorCtx.setContents({
                html: that.data.value,
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
                    submitDisabled: this.data.value === res.html ? true : false
                })
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
        // 更新前页数据
        var pages = getCurrentPages()
        var editPage = pages[pages.length - 2]
        editPage.setData({
            [`value.${this.data.index}`]: this.data.value.replace(/\swx:nodeid="\d+"/g,'') //去掉编辑器生成的'wx:nodeid=xx'代码
        }, function() {
            editPage.isSubmitDisabled()
            wx.navigateBack()
        })
    },
    onReset(e) {
        this.editorCtx.setContents({
            html: this.data.data
        })
        this.setData({
            value: this.data.data,
            submitDisabled: true
        })
    },
    // 计算表单值是否有改变 用于无交互改变表单值的情况
    isValueChanged(value) {
        this.setData({
            submitDisabled: this.data.value === value ? true : false
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
    }
})