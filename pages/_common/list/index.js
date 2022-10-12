const app = getApp()
Page({
    data: {
        source: ''
    },
    onLoad: function (options) {
        wx.setNavigationBarTitle({
            title: options.title
        })
        const url = options.url.replace(/\//g, '.')
        const source = `${url}/index`
        this.setData({
            source: source
        })
    },
    // 刷新组件数据
    refreshData() {
        const table = this.selectComponent('#table')
        table.refreshData()
    }
})