const app = getApp()
Page({
    data: {
        source: 'auth.adminlog/index'
    },
    onLoad: function (options) {
        
    },
    // 刷新组件数据
    refreshData() {
        const table = this.selectComponent('#table')
        table.refreshData()
    }
})