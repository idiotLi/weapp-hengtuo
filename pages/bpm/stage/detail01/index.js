// pages/bpm/stage01/list01/index.js
Page({

    data: {
        // source: 'auth.admin/index'
        // source: 'bpm/stage01'
        source: 'bpm.stage01details/index',
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
