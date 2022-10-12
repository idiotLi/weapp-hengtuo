const app = getApp()
Page({
    data: {
        activeName: '1',
        config: {},
        mimetype: '',
        maxsize: '',
        fileList: {
            'image': [],
            'file': []
        },
        editorFormats: {},
        editorHeight: 300,
        keyboardHeight: 0,
        // fileListFile:[]
    },
    onLoad: function (options) {
        const config = app.utils.decodeParam(options.config)
        wx.setNavigationBarTitle({
            title: `添加${config.model ? config.model : ''}`
        })
        const isIOS = app.globalData.systemInfo.platform === 'ios'
        this.setData({ isIOS })
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
            config: config,
            cdnurl: wx.getStorageSync('config')['upload']['cdnurl'],
            mimetype: wx.getStorageSync('config')['upload']['mimetype'],
            maxsize: wx.getStorageSync('config')['upload']['maxsize']
        })
    },
    afterRead(e) {
        let that = this
        let index = e.currentTarget.dataset.index
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
                        fileList = {}
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
                    fileList[index].push({
                        ...file,
                        url: that.data.cdnurl + url
                    })
                    that.setData({
                        fileList,
                    })
                    wx.vantNotify({ type: 'success', message: '上传成功' })
                    // 刷新列表页数据
                    var pages = getCurrentPages()
                    var listPage = pages[pages.length - 2]
                    listPage.refreshData()
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
    /* editor */
    onEditorReady() {
        const that = this
        wx.createSelectorQuery().select('#editor').context(function (res) {
            that.editorCtx = res.context
            that.editorCtx.setContents({
                html: '',
                success: (res) => { },
                fail: (res) => { }
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
            success: function (res) {
            }
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
                            wx.vantNotify({ type: 'success', message: '上传成功' })
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
                })
            }
        })
    },
    onCollapseChange(e) {
        this.setData({
            activeName: e.detail
        });
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
    noop() {},
})