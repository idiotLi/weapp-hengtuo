Page({

    data: {
        source: 'bpm.products/index',
        ids : '',
        stage : ''
        
    },
    onLoad: function (options) {
        this.setData ({
            ids: options.ids,
            stage : options.stage
        })
        
    },
    // 刷新组件数据
    refreshData() {
        const table = this.selectComponent('#table')
        table.refreshData()
    }
})