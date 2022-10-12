const app = getApp()
Page({
    data: {
        hideEdit: false,
        cdnurl: '',
        tree: {},
        ruleList: [],
        config: {},
        data: {},
        editorData: {}
    },
    onLoad: function (options) {
        const data = app.utils.decodeParam(options.data)
        const config = app.utils.decodeParam(options.config)
        wx.setNavigationBarTitle({
            title: `${config.model ? config.model : ''}详情`
        })
        // 富文本(editor)数据转换
        const editorData = {}
        const dataFields = Object.keys(data);
        for (let i = 0; i < dataFields.length; i++) {
            if (config.field[dataFields[i]] && config.field[dataFields[i]].type === 'editor') {
                editorData[dataFields[i]] = app.utils.towxml(data[dataFields[i]])
            }
        }
        this.setData({
            hideEdit: config.model === '角色组' && data.pid === 0,
            cdnurl: wx.getStorageSync('config')['upload']['cdnurl'],
            ruleList: wx.getStorageSync('ruleList'),
            config: config,
            data: data,
            editorData: editorData
        })
    },
    edit() {
        wx.navigateTo({
            url: `/pages/_common/edit/index?id=${this.data.data.id}&config=${app.utils.encodeParam(this.data.config)}`,
        })
    },
    // 预览图片或文件
    onPreview(e) {
        // 当前文件为图片
        if (app.utils.isImage(e.currentTarget.dataset.url)) {
            const urls = e.currentTarget.dataset.urls ? e.currentTarget.dataset.urls.split(',') : [e.currentTarget.dataset.url]
            const previewUrls = []
            if (urls.length) {
                for (let i in urls) {
                    if (app.utils.isImage(urls[i])) {
                        previewUrls.push(app.utils.isCdnurl(urls[i]) ? urls[i] : this.data.cdnurl + urls[i])
                    }
                }
            }
            wx.previewImage({
                current: e.currentTarget.dataset.url,
                urls: previewUrls
            })
        } else if (app.utils.isDocument(e.currentTarget.dataset.url)) {
            // 当前文件为微信openDocument所支持的预览格式
            wx.vantToast.loading({
                duration: 0,
                message: '下载中...',
            })
            wx.downloadFile({
                url: e.currentTarget.dataset.url,
                success: function (res) {
                    const filePath = res.tempFilePath
                    wx.openDocument({
                        filePath: filePath,
                        showMenu: true,
                        success: function (res) {
                            // 打开文档成功
                        },
                        fail: function (res) {
                            wx.vantNotify({
                                type: 'warning',
                                message: '打开文件失败'
                            })
                        }
                    })
                },
                fail: function (res) {
                    wx.vantNotify({
                        type: 'warning',
                        message: '下载文件失败，文件是否超过50Mb？'
                    })
                },
                complete: function () {
                    wx.vantToast.clear()
                }
            })
        } else if (app.utils.isVideo(e.currentTarget.dataset.url) || app.utils.isAudio(e.currentTarget.dataset.url)) {
            // 当前文件为视频或音频 
            wx.navigateTo({
                url: `/pages/_common/video/index?src=${app.utils.encodeParam(e.currentTarget.dataset.url)}`,
            })
        } else {
            wx.vantToast('无法预览该类型文件')
        }
    },
    // 显示树型上拉
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
                `${that.data.config.ruletreeUrl}?id=${row.id}&pid=${row.pid}`
            ).then(function (res) {
                if (res) {
                    const data = res.data
                    // 已有权限集合,数组元素须为number
                    let myRules = Array.isArray(row[index]) ? row[index] : row[index].split(',').map(i => Number(i))
                    // 筛除掉角色不具有的上级权限
                    const tree = that._hideParentRules(myRules,data)
                    that.setData({
                        [`data.${index}`]: myRules,
                        [`tree.${index}`]: tree,
                    })
                }
            })
        }
        return
    },
    onCloseActionSheet(e) {
        const index = e.currentTarget.dataset.index
        this.setData({
            showActionSheet: {
                [index]: false
            }
        })
    },
    // 查看页不宜展示角色不具有的上级权限，递归筛除
    _hideParentRules(myRules,parentRules) {
        const rules = []
        for (let i = 0; i < parentRules.length; i++) {
            if (myRules.includes(parentRules[i].id)) {
                const child = this._hideParentRules(myRules,parentRules[i].childlist)
                parentRules[i].childlist = child
                rules.push(parentRules[i])
            }
        }
        return rules
    },
    noop() { }
})