import {
    VantComponent
} from '../../vant/common/component';
const app = getApp()

VantComponent({
    options: {
        styleIsolation: 'shared'
    },
    props: {
        source: String,
        ids:{
            type:String,
            value:420
        },
        stage:{
            type:String,
            value:1
        },
        search: {
            type: Boolean,
            value: true
        },
        filter: {
            type: Boolean,
            value: true
        },
        multi: {
            type: Boolean,
            value: true
        },
        sort: {
            type: Boolean,
            value: true
        },
        tabClass: String
    },
    data: {
        _ready: false,
        _error: null,
        _tabs: null,
        _tabClass: '',
        _rows: [],
        _activeTab: null,
        _isIOS: false,
        _ruleList: [],
        _multi: false,
        _showSearch: false,
        _showFilterPopup: false,
        _searchFocus: false,
        _triggered: false,
        _finish: false,
        _loading: false,
        _empty: false,
        _scrollHeight: 0,
        _config: {},
        _ids: [],
        _order: 'desc',
        _sort: false,
        _offset: 0,
        _filter: {},
        _filterLength: '',
        _op: {},
        _search: '',
        _total: 0,
        _lastRefreshTime: 0,
    },
    mounted() {
        if (!this.data.source) {
            this.setData({
                _error: '组件未配置数据源{{ source }}'
            })
            return
        }
        this.setData({
            _isIOS: app.globalData.systemInfo.platform === 'ios',
            _ruleList: wx.getStorageSync('ruleList')
        })
        this.refreshData = this.refreshData()
        this.refreshData()
    },
    methods: {
        // 读取数据
        loadData() {
            let that = this
            if (that.data._loading || that.data._finish) return
            that.setData({
                _loading: true
            })
            wx.wxRequest.post(
                that.data.source, {
                    'order': that.data._order ? that.data._order : that.data._config.defaultOrder,
                    'sort': that.data._sort ? that.data._sort : that.data._config.defaultSort,
                    'offset': that.data._offset,
                    'limit': that.data._config.limit ? that.data._config.limit : 0,
                    'filter': JSON.stringify(that.data._filter),
                    'op': JSON.stringify(that.data._op),
                    'search': that.data._search,
                    'ids':that.data.ids,
                    'stage': that.data.stage
                }
            ).then(function (res) {
                if (res) {
                    if (!res.data.config) {
                        that.setData({
                            _error: '未配置控制器「config」参数'
                        })
                        return
                    }
                    that.setData({
                        search: res.data.config.search ? res.data.config.search : false,
                        filter: res.data.config.filter ? res.data.config.filter : false,
                        multi: res.data.config.multi ? res.data.config.multi : false,
                        sort: res.data.config.sort ? res.data.config.sort : false,
                        _tabs: res.data.tabList ? res.data.tabList : [{id: "all", name: "全部"}],
                        _tabClass: res.data.tabList ? 'helper-tabs-primary' : 'helper-notab',
                        _rows: that.data._rows.concat(res.data.dataList.rows),
                        _config: res.data.config,
                        _total: res.data.dataList.total,
                        _offset: that.data._offset + res.data.config.limit,
                        _finish: that.data._rows.length + res.data.dataList.rows.length >= res.data.dataList.total ? true : false,
                        _empty: res.data.dataList.total === 0 ? true : false,
                        _scrollHeight: wx.getSystemInfoSync().windowHeight - (res.data.tabList ? 88 : 44),
                        _ready: true
                    })
                    if (that.data._tabs && !that.data._activeTab) {
                        // tab标签为动态获取，延迟设置选中项
                        setTimeout(() => {
                            that.setData({
                                // 默认显示第一个tab
                                _activeTab: res.data.tabList ? res.data.tabList[0].id : 'all',
                            })
                        }, 300)
                    }
                }
                that.setData({
                    _loading: false,
                    _triggered: false
                })
            })
        },
        // 刷新数据 防抖处理(1秒)
        refreshData() {
            return wx.debounce(function () {
                this.setData({
                    _triggered: true,
                    _offset: 0,
                    _rows: [],
                    _ids: [],
                    _finish: false,
                    _lastRefreshTime: new Date().getTime()
                })
                this.loadData()
            }, 1000, {
                leading: true,
                trailing: false
            })
        },
        // 下拉刷新
        onPullDownRefresh() {
            if (this.data._lastRefreshTime > 0 && new Date().getTime() - this.data._lastRefreshTime < 1000) { //连续刷新间隔小于1000毫秒忽略并提示
                this.setData({
                    _loading: false,
                    _triggered: false
                })
                wx.vantNotify({
                    type: 'warning',
                    message: '你刷新得太快了'
                })
                return false
            }
            this.refreshData()
        },
        // 上拉加载
        onScrollToLower() {
            this.loadData()
        },
        // 预览文件
        onPreview(e) {
            const rows = this.data._rows
            // 预览图片清单
            const previewUrls = []
            for (let i in rows) {
                if (app.utils.isImage(rows[i].url)) {
                    previewUrls.push(rows[i].fullurl)
                }
            }
            if (app.utils.isImage(e.currentTarget.dataset.url)) {
                // 当前文件为图片
                wx.previewImage({
                    current: e.currentTarget.dataset.url,
                    urls: previewUrls
                })
            } else if (app.utils.isDocument(e.currentTarget.dataset.url)) {
                // 当前文件为微信openDocument所支持的预览格式
                wx.vantToast.loading({
                    duration: 0,
                    message: '下载中...',
                })
                wx.downloadFile({
                    url: e.currentTarget.dataset.url,
                    success: function (res) {
                        const filePath = res.tempFilePath
                        wx.openDocument({
                            filePath: filePath,
                            showMenu: true,
                            success: function (res) {
                                // 打开文档成功
                            },
                            fail: function (res) {
                                wx.vantNotify({
                                    type: 'warning',
                                    message: '打开文件失败'
                                })
                            }
                        })
                    },
                    fail: function (res) {
                        wx.vantNotify({
                            type: 'warning',
                            message: '下载文件失败，文件是否超过50Mb？'
                        })
                    },
                    complete: function () {
                        wx.vantToast.clear()
                    }
                })
            } else if (app.utils.isVideo(e.currentTarget.dataset.url) || app.utils.isAudio(e.currentTarget.dataset.url)) {
                // 当前文件为视频或音频 
                wx.navigateTo({
                    url: `/pages/_common/video/index?src=${app.utils.encodeParam(e.currentTarget.dataset.url)}`,
                })
            } else {
                wx.vantToast('无法预览该类型文件')
            }
        },
        // 点击列表项
        onClickTableCell(e) {
            if (this.data._multi) {
                const index = e.detail.index
                const checkbox = this.selectComponent(`.checkbox-${index}`)
                checkbox.toggle()
            } else {
                let that = this
                wx.navigateTo({
                    // 打开自定义detail页
                    url: `detail/index?data=${app.utils.encodeParam(e.detail.row)}&config=${app.utils.encodeParam(that.data._config)}`,
                    fail: function (res) {
                        // 打开通用detail页
                        wx.navigateTo({
                            url: `/pages/_common/detail/index?data=${app.utils.encodeParam(e.detail.row)}&config=${app.utils.encodeParam(that.data._config)}`,
                            // url: `/pages/_common/detail/index?data=${app.utils.encodeParam(e.detail.row)}`,
                        })
                    }
                })
            }
        },
        // tab切换
        onTabClick(e) {
            let filter = this.data._filter
            let op = this.data._op
            if (e.detail.name === 'all') {
                delete filter[this.data._config.tabField]
                delete op[this.data._config.tabField]
            } else {
                filter[this.data._config.tabField] = e.detail.name
                op[this.data._config.tabField] = '='
            }
            this.setData({
                _activeTab: e.detail.name,
                _filter: filter,
                _op: op,
                _offset: 0,
                _total: 0,
                _rows: [],
                _finish: false,
                _empty: false,
                _ids: []
            })
            this.loadData()
        },
        // 点击排序
        onSortClick(e) {
            this.selectComponent('#sort').toggle();
            this.setData({
                _order: e.currentTarget.dataset.order,
                _sort: e.currentTarget.dataset.sort
            })
            this.refreshData()
        },
        // 打开多选条
        onMultiClick() {
            this.setData({
                _multi: !this.data._multi,
                _ids: []
            })
        },
        onMultiEnter() {
            this.setData({
                _scrollHeight: this.data._scrollHeight - 100
            })
        },
        onMultiLeave() {
            this.setData({
                _scrollHeight: this.data._scrollHeight + 100
            })
        },
        // 点击全选/取消全选
        onCheckAllClick() {
            const ids = this.data._rows.map(row => String(row[this.data._config.pk ? this.data._config.pk : 'id']))
            this.setData({
                _ids: this.data._ids.length === ids.length ? [] : ids
            })
        },
        // 多选绑定数据
        onMultiChange(e) {
            this.setData({
                _ids: e.detail
            })
        },
        // 打开搜索条
        onSearchClick() {
            this.setData({
                _showSearch: true,
                _search: this.data._search // 更新输入框搜索值
            })
            setTimeout(() => {
                this.setData({
                    _searchFocus: true
                })
            }, 100);
        },
        // 提交搜索
        onSearchSubmit(e) {
            this.setData({
                _search: e.detail
            })
            this.refreshData()
        },
        // 关闭搜索条
        onSearchCancel() {
            this.setData({
                _showSearch: false
            })
        },
        // 打开筛选菜单
        onFilterClick() {
            this.setData({
                _showFilterPopup: true
            })
        },
        // 关闭筛选菜单
        onCloseFilter() {
            this.setData({
                _showFilterPopup: false
            })
        },
        // 确认筛选
        onConfirmFilter(e) {
            const tabField = this.data._config.tabField
            // 重新构造包含tabField的filter数据 避免切换tab时丢失
            let filter = e.detail.filter
            let op = e.detail.op
            if (tabField && this.data._filter[tabField] && this.data._op[tabField]) {
                filter[tabField] = this.data._filter[tabField]
                op[tabField] = this.data._op[tabField]
            }
            // 计算filter长度(不含tabField)
            const filterLength = filter[tabField] ? Object.keys(filter).length - 1 : Object.keys(filter).length
            this.setData({
                _filter: filter,
                _op: op,
                _filterLength: filterLength ? filterLength : '',
                _showFilterPopup: false
            })
            this.refreshData()
        },
        // 清空筛选
        onResetFilter() {
            const tabField = this.data._config.tabField
            // 重新构造包含tabField的filter数据 避免切换tab时丢失
            let filter = {}
            let op = {}
            if (tabField && this.data._filter[tabField] && this.data._op[tabField]) {
                filter[tabField] = this.data._filter[tabField]
                op[tabField] = this.data._op[tabField]
            }
            this.setData({
                _filter: filter,
                _op: op,
                _filterLength: '',
                _showFilterPopup: false
            })
            this.refreshData()
        },
        // 批量操作
        onMultiBtnClick(e) {
            const index = e.currentTarget.dataset.index
            const params = e.currentTarget.dataset.params
            wx.vantDialog.confirm({
                title: `确定进行「${this.data._config.auth.multi[index].name}」操作？`,
                message: `共 ${this.data._ids.length} 条记录`,
                className: 'helper-dialog'
            }).then(() => {
                let that = this
                wx.wxRequest.post(
                    that.data._config.auth.multi[index].url, {
                        ids: that.data._ids,
                        params: params
                    }
                ).then(function (res) {
                    if (res) {
                        that.refreshData()
                        that.setData({
                            _ids: []
                        })
                        wx.vantToast.success(res.msg)
                    }
                })
            }).catch(() => {
                // on cancel
            })
        },
        // 添加
        onAddClick() {
            let that = this
            wx.navigateTo({
                // 打开自定义add页
                url: `add/index?config=${app.utils.encodeParam(that.data._config)}`,
                fail: function (res) {
                    // 打开通用add页
                    wx.navigateTo({
                        url: `/pages/_common/add/index?config=${app.utils.encodeParam(that.data._config)}`,
                    })
                }
            })
        },
        // 其它operate操作
        onOperateSelectChange(e) {
            const index = e.currentTarget.dataset.index
            const options = e.currentTarget.dataset.options
            options.forEach(item => {
                if(item.value === e.detail){
                    if(item.filter) {
                        this.setData({
                            [`_operate.${index}`]: item.value,
                            [`_filter.${item.filter}`]: item.value,
                            [`_op.${item.filter}`]: item.op
                        })
                    }
                }
            })
            this.refreshData()
        },
        noop() {}
    }
});