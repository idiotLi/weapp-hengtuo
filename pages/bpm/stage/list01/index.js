// pages/bpm/stage01/list01/index.js
Page({
    data: {
        source: 'bpm.stage01/index'
    },
    onLoad: function (options) {
    },
    // 刷新组件数据
    refreshData() {
        const table = this.selectComponent('#table')
        table.refreshData()
    }
})