const app = getApp()
Page({
    data: {
        name: '',
        config: null,
        info: null,
        tips: '',
        activeTips: '1',
        tipsWxml: null
    },
    onLoad: function (options) {
        this.setData({
            name: options.name
        })
    },
    onShow: function () {
        this.loadData()
    },
    // 加载数据
    loadData() {
        let that = this
        wx.wxRequest.get(
            `addon/config?name=${that.data.name}`
        ).then(function (res) {
            if (res.data.tips && res.data.tips.value) {
                app.utils.towxml(res.data.tips.value)
            }
            that.setData({
                config: res.data.config,
                info: res.data.info,
                tips: res.data.tips,
                tipsWxml : (res.data.tips && res.data.tips.value) ? app.utils.towxml(res.data.tips.value) : null
            })
            wx.stopPullDownRefresh()
        })
    },
    // 下拉刷新
    onPullDownRefresh() {
        this.loadData()
    },
    // 点击列表项
    onClickRow(e) {
        wx.navigateTo({
            url: `/pages/_common/edit_value/index?name=${this.data.name}&row=${app.utils.encodeParam(e.currentTarget.dataset.row)}&editurl=addon/config&field=${e.currentTarget.dataset.row.name}&deletable=false`,
        })
    },
    onCollapseChange(e) {
        this.setData({
            activeTips: e.detail,
        });
    }
})