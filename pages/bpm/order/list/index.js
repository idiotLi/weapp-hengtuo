Page({

    data: {
        // source: 'auth.admin/index'
        // source: 'bpm/stage01'
        source: 'bpm.orders/index'
        
    },
    onLoad: function (options) {
        
    },
    // 刷新组件数据
    refreshData() {
        const table = this.selectComponent('#table')
        table.refreshData()
    }
})