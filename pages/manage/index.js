const app = getApp()
Page({
    data: {
        _ready: false,
        scrollHeight: 0, // scoll-view自适应高度
        tabList: [],  // tab数据
        menuList: {}, // 角色组菜单数据
        configMenuList: [], // 插件配置可见菜单列表
        activeTab: null, // 打开时显示的tab 必须手动赋值 否则scoll-view的refresher不触发
        triggered: false, // 下拉刷新状态
        showActionSheet: false,
        subMenuList: []
    },
    onShow: function() {
        wx.showTabBar() //避免tabbar隐藏后再次显示失败
        this.initData()
    },
    onLoad: function () {
        this.setData({
            scrollHeight: wx.getSystemInfoSync().windowHeight - 44
        })
    },
    initData() {
        let that = this
        wx.wxRequest.get(
            'index/index', {}
        ).then(function (res) {
            if (res) {
                that.setData({
                    tabList: res.data.tabList,
                    menuList: res.data.menuList,
                    configMenuList: res.data.configMenuList,
                    _ready: true
                })
                if (res.data.tabList && !that.data.activeTab) {
                    // tab标签为动态获取，延迟设置选中项
                    setTimeout(() => {
                        that.setData({
                            // 默认显示第一个tab
                            activeTab: res.data.tabList ? res.data.tabList[0].id : 'commonMenuList',
                        })
                    }, 300)
                }
                wx.setStorage({
                    key: 'menuList',
                    data: res.data.menuList
                })
                wx.setStorage({
                    key: 'configMenuList',
                    data: res.data.configMenuList
                })
                wx.setStorage({
                    key: 'ruleList',
                    data: res.data.ruleList
                })
            }
            that.setData({
                triggered: false
            })
        })
    },
    // tab切换
    onTabClick(e) {
        this.setData({
            activeTab: e.detail.name
        })
    },
    // 下拉刷新事件
    onRefresh() {
        this.initData()
    },
    // 一级菜单点击事件
    onGridClick(e) {
        // 有子菜单时打开上拉菜单
        if (e.currentTarget.dataset.child && e.currentTarget.dataset.child.length) {
            wx.hideTabBar()
            this.setData({
                subMenuList: e.currentTarget.dataset.child,
                showActionSheet: true
            })
            return
        }
        // 直接执行操作的菜单 例如:清除缓存
        if (e.currentTarget.dataset.type === 'action') {
            let that = this
            wx.wxRequest.post(
                e.currentTarget.dataset.url, e.currentTarget.dataset.actiondata
            ).then(function (res) {
                if(res) {
                    wx.vantToast({
                        type: 'success',
                        message: res.msg,
                        forbidClick: true,
                        onClose: () => {
                            that.onCloseActionSheet()
                        }
                    })
                }
            })
            return
        }
        if (!e.currentTarget.dataset.url || e.currentTarget.dataset.url === '') {
            return
        }
        // 常规/个人资料 直接跳转个人中心
        if (e.currentTarget.dataset.url === 'general/profile') {
            wx.switchTab({
                url: '/pages/my/index',
            })
            this.onCloseActionSheet()
            return
        }
        // 无子菜单时直接打开
        // 插件页面在addons分包中
        const path = e.currentTarget.dataset.id > 84 ? 'addons/pages' : 'pages'
        const url = `/${path}/${e.currentTarget.dataset.url}/index?title=${e.currentTarget.dataset.title}`
        wx.navigateTo({
            url: url,
            success: () => {
                this.setData({
                    showActionSheet: false
                })
            },
            fail: () => {
                if (e.currentTarget.dataset.url == 'helper/generator') {
                    wx.vantToast({
                        type: 'warning',
                        message: '一键生成工具\n须在PC端操作',
                        forbidClick: true
                    })
                    return
                }
                wx.navigateTo({
                    url: `/pages/_common/list/index?url=${e.currentTarget.dataset.url}&title=${e.currentTarget.dataset.title}`,
                    success: () => {
                        this.setData({
                            showActionSheet: false
                        })
                    }
                })
            }
        })
    },
    onCloseActionSheet() {
        this.setData({
            showActionSheet: false
        })
        setTimeout(() => {
            wx.showTabBar()
        }, 300)
    },
    wxNavigateTo(url) {
        let promise = new Promise((resolve, reject) => {
            wx.navigateTo({
                url: url,
                success: function (res) {
                    resolve(res)
                },
                fail(res) {
                    reject(res)
                }
            })
        })
        return promise
    }
})