// pages/bpm/stage01/list01/index.js
Page({

    data: {
        // source: 'auth.admin/index'
        // source: 'bpm/stage01'
        source: 'bpm.stage01details/index',
        ids : '',
        index1 : '',
        index2 : '',
        index2 : ''
        
    },
    onLoad: function (options) {
        this.setData ({
            ids: options.ids,
            index1 : options.index1,
            index2 : options.index2,
            index3 : options.index3
        })
        
    },
    // 刷新组件数据
    refreshData() {
        const table = this.selectComponent('#table')
        table.refreshData()
    }
})
