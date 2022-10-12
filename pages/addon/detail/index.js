const app = getApp()
Page({
    data: {
        windowHeight: null,
        cdnurl: '',
        ruleList: [],
        config: {},
        data: {},
    },
    onLoad: function (options) {
        const data = app.utils.decodeParam(options.data)
        const config = app.utils.decodeParam(options.config)
        this.setData({
            windowHeight: wx.getSystemInfoSync().windowHeight - wx.getSystemInfoSync().statusBarHeight,
            cdnurl: wx.getStorageSync('config')['upload']['cdnurl'],
            ruleList: wx.getStorageSync('ruleList'),
            config: config,
            data: data
        })
    },
    // 预览截图
    onPreview(e) {
        const urls = this.data.data.screenshots
        wx.previewImage({
            current: e.currentTarget.dataset.url,
            urls: urls
        })
    },
    // 禁用启用
    onStateChange(e) {
        let that = this
        wx.vantToast.loading({
            duration: 0,
            forbidClick: true,
            message: `${e.detail ? '启用' : '禁用'}中...`
        })
        wx.wxRequest.post(
            'addon/state', {
                name: that.data.data.name,
                action: e.detail ? 'enable' : 'disable'
            }
        ).then(function (res) {
            // 刷新列表页数据
            var pages = getCurrentPages()
            var listPage = pages[pages.length - 2]
            listPage.refreshData()
            wx.vantToast.success(res.msg)
            that.setData({
                'data.local.state': e.detail ? '1' : '0'
            })
        })
    },
    // 打开配置
    openAddonConfig(e) {
        wx.navigateTo({
            url: `../config/index?name=${this.data.data.name}`,
        })
    },
    onHomepageClick(e) {
        const url = e.currentTarget.dataset.url
        app.utils.setClicpboardData('链接',url)
    },
    noop() { }
})