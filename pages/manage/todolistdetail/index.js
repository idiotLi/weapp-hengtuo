Page({

    data: {
        source: 'manage.todolistdetails/index',
        ids: ''
    },
    onLoad: function (options) {
        this.setData({
            ids :options.ids,
        })
    },
    // 刷新组件数据
    refreshData() {
        const table = this.selectComponent('#table')
        table.refreshData()
    }
})