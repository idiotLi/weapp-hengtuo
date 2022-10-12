const app = getApp()
Page({
    data: {
        source: 'general.attachment/index',
    },
    onLoad() {
    },
    // 刷新组件数据
    refreshData() {
        const table = this.selectComponent('#table')
        table.refreshData()
    },
    noop() {}
})