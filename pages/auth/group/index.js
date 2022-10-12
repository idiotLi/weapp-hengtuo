const app = getApp()
Page({
    data: {
        source: 'auth.group/index',
    },
    onLoad: function () {
        
    },
    // 刷新组件数据
    refreshData() {
        const table = this.selectComponent('#table')
        table.refreshData()
    }
})