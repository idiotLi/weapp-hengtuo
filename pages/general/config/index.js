const app = getApp()
Page({
    data: {
        auth: {
            add: false
        },
        showAddTab: false,
        editUrl: 'general.config/edit',
        delUrl: 'general.config/del',
        scrollHeight: 0,
        activeTab: null,
        triggered: false,
        groupList: [],
        ruleList: [],
        typeList: [],
        siteList: [],
        showActionSheet: false
    },
    onLoad: function (options) {
        wx.setNavigationBarTitle({
            title: options.title ? options.title : '系统配置'
        })
        this.setData({
            scrollHeight: wx.getSystemInfoSync().windowHeight - 44
        })
    },
    onShow: function () {
        this.initData()
    },
    // 下拉刷新
    onRefresh() {
        this.initData()
    },
    onTabChange(e) {
        this.setData({
            activeTab: e.detail.name
        })
    },
    onClickRow(e) {
        const deletable = e.currentTarget.dataset.row.id > 17 ? 1 : 0
        wx.navigateTo({
            url: `/pages/_common/edit_value/index?row=${app.utils.encodeParam(e.currentTarget.dataset.row)}&editurl=${this.data.editUrl}&delurl=${this.data.delUrl}&field=value&deletable=${deletable}`,
        })
    },
    onAddTap() {
        const data = {
            typeList: this.data.typeList,
            groupList: this.data.groupList,
            ruleList: this.data.ruleList
        }
        wx.navigateTo({
            url: `add/index?data=${app.utils.encodeParam(data)}`,
        })
    },
    initData() {
        let that = this
        wx.wxRequest.get(
            'general.config/index', {}
        ).then(function (res) {
            if(res) {
                that.setData({
                    groupList: res.data.groupList,
                    ruleList: res.data.ruleList,
                    typeList: res.data.typeList,
                    siteList: res.data.siteList
                })
                // 延迟更改activeTab，才能使scroll-view下拉刷新生效
                // 静态tab也需在动态tab加载完成之后显示，否则会错乱
                setTimeout(() => {
                    that.setData({
                        showAddTab: true,
                        // 判断是否有「添加配置」权限
                        auth: {
                            add: app.utils.authCheck('general.config/add'),
                        },
                        activeTab: that.data.activeTab ? that.data.activeTab : 'example', //设置默认显示tab
                    })
                }, 300)
            }
            that.setData({
                triggered: false
            })
        })
    }
})