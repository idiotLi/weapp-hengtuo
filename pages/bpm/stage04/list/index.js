Page({
    data: {
        source: 'bpm.stage04/index',
        nav:'/pages/bpm/stage04/detail/index'
    },
    onLoad: function (options) {
        
    },
    // 刷新组件数据
    refreshData() {
        const table = this.selectComponent('#table')
        table.refreshData()
    }
})