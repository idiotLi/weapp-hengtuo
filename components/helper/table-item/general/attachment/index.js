import { VantComponent } from '../../../../vant/common/component';
const app = getApp()

VantComponent({
    options: {
        styleIsolation: 'shared'
    },
    props: {
        item: Object,
        config: Object,
        rows: Array,
    },
    data: {

    },
    created() {
        
    },
    methods: {
        // 点击数据行
        onClickCell(e) {
            this.$emit('clickTableCell',{
                row: e.currentTarget.dataset.data,
                index: e.currentTarget.dataset.index
            })
        },
        // 预览文件
        onPreview(e) {
            const rows = this.data.rows
            // 预览图片清单
            const previewUrls = []
            for (let i in rows) {
                if (app.utils.isImage(rows[i].url)) {
                    previewUrls.push(rows[i].fullurl)
                }
            }
            if (app.utils.isImage(e.currentTarget.dataset.url)) {
                // 当前文件为图片
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
        noop() {}
    }
});