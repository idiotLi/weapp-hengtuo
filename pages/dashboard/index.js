import * as echarts from '../../components/ec-canvas/echarts'
const app = getApp()

Page({
    ec: {},
    orderData: null,
    onLoad: function () {},
    onShow: function () {},
    onReady: function () {
        this.loadData()
    },
    onPullDownRefresh() {
        this.loadData()
    },
    data: {
        _ready: false,
        _ruleList:[],
        activeTab: null,
        ecOrder: {
            lazyLoad: true
        },
        ecUser: {
            lazyLoad: true
        },
        ecArticle: {
            lazyLoad: true
        },
        ecComment: {
            lazyLoad: true
        },
    },
    loadData: function () {
        let that = this
        wx.wxRequest.post(
            'dashboard/index'
        ).then(function (res) {
            if (res) {
                that.setData({
                    ...res.data,
                    _ready: true,
                    _ruleList: wx.getStorageSync('ruleList')
                })
                
                that.initChart('#ec-order', 'ecOrder')
                setTimeout(() => {
                    if (!that.data.activeTab) {
                        that.initChart('#ec-user-bar', 'ecUser')
                    } else {
                        that.refreshChart(that.data.activeTab)
                    }
                }, 300)
            }
        })
        wx.stopPullDownRefresh()
    },
    // 切换选项卡
    onTabChange(e) {
        this.setData({
            activeTab: e.detail.index
        })
        this.refreshChart(e.detail.index)
    },
    // 初始化图表
    initChart: function (selector, key) {
        this.ecComponent = this.selectComponent(selector)
        this.ecComponent.init((canvas, width, height, dpr) => {
            // 获取组件的 canvas、width、height 后的回调函数
            // 在这里初始化图表
            const chart = echarts.init(canvas, null, {
                width: width,
                height: height,
                devicePixelRatio: dpr // new
            })
            this.setOption(chart, key)
            // 将图表实例绑定到 this 上
            this.ec[key] = chart
            return chart
        })
    },
    // 图表配置
    setOption: function (chart, key) {
        const option = {}
        option.ecOrder = {
            color: ['#18bc9c', 'lightgray'],
            grid: {
                left: 16,
                top: 40,
                right: 16,
                bottom: 30
            },
            legend: {
                top: 2,
                right: 0,
                data: ['成交数', '订单数']
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: Object.keys(this.data.paylist),
                axisLabel: {
                    fontSize: 9,
                },
                axisLine: {
                    lineStyle: {
                        color: '#333'
                    }
                }
            },
            yAxis: {
                type: 'value',
                axisLine: {
                    show: false
                },
                axisLabel: {
                    show: false
                },
                axisTick: {
                    show: false
                },
                splitLine: {
                    show: false
                }
            },
            series: [{
                    name: '成交数',
                    type: 'line',
                    smooth: true,
                    areaStyle: {
                        normal: {}
                    },
                    lineStyle: {
                        normal: {
                            width: 1.5
                        }
                    },
                    data: Object.values(this.data.paylist),
                    label: {
                        show: true,
                        fontSize: 9
                    },
                },
                {
                    name: '订单数',
                    type: 'line',
                    smooth: true,
                    areaStyle: {
                        normal: {}
                    },
                    lineStyle: {
                        normal: {
                            width: 1.5
                        }
                    },
                    data: Object.values(this.data.createlist),
                    label: {
                        show: true,
                        fontSize: 9
                    },
                }
            ],
            tooltip: {
                show: true,
                trigger: 'axis'
            }
        }
        option.ecUser = {
            color: ['#18bc9c', 'lightgray'],
            grid: {
                top: 16,
                left: 32,
                right: 16,
                bottom: 30
            },
            xAxis: {
                type: 'category',
                data: this.data.userAreaList,
                axisLabel: {
                    fontSize: 9,
                },
                axisTick: {
                    show: false
                },
                axisLine: {
                    lineStyle: {
                        color: '#333'
                    }
                }
            },
            yAxis: {
                type: 'value',
                axisTick: {
                    show: false
                },
                axisLine: {
                    show: false
                },
                axisLabel: {
                    fontSize: 9
                },
                splitLine: {
                    lineStyle: {
                        opacity: 0.2
                    }
                }
            },
            series: [{
                data: this.data.userAreaValue,
                type: 'bar',
                name: '新增',
                barMaxWidth: 16,
            }],
            tooltip: {
                show: true,
                trigger: 'axis'
            }
        }
        option.ecArticle = {
            color: ['#18bc9c', '#2c3e50', '#3498db', '#f39c12', '#e74c3c', '#605ca8', 'lightgray'],
            tooltip: {
                trigger: 'item',
                formatter: '{b}:\n{c}篇 ({d}%)'
            },
            series: [{
                type: 'pie',
                radius: '55%',
                center: ['50%', '50%'],
                data: this.data.articleList.sort(function (a, b) {
                    return a.value - b.value;
                }),
                roseType: 'radius',
                label: {
                    fontSize: 9,
                    color: '#333'
                },
                labelLine: {
                    lineStyle: {
                        type: 'dotted',
                        opacity: 0.2,
                        color: '#333'
                    },
                    smooth: 0.2,
                    length: 10,
                    length2: 20
                },
                animationType: 'scale',
                animationEasing: 'elasticOut',
                animationDelay: function (idx) {
                    return Math.random() * 200;
                }
            }]
        }
        option.ecComment = {
            color: ['#2c3e50'],
            grid: {
                left: 16,
                top: 24,
                right: 16,
                bottom: 30
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: Object.keys(this.data.commentList),
                axisLine: {
                    lineStyle: {
                        color: '#333'
                    }
                },
                axisLabel: {
                    fontSize: 9,
                },
            },
            yAxis: {
                type: 'value',
                axisLine: {
                    show: false
                },
                axisLabel: {
                    show: false
                },
                axisTick: {
                    show: false
                },
                splitLine: {
                    show: false
                }
            },
            series: [{
                data: Object.values(this.data.commentList),
                type: 'line',
                name: '评论数',
                smooth: true,
                label: {
                    show: true,
                    fontSize: 9
                },
                areaStyle: {}
            }],
            tooltip: {
                show: true,
                trigger: 'axis'
            }
        }
        chart.setOption(option[key])
    },
    // 刷新图表
    refreshChart(key) {
        switch (key) {
            case 0:
                this.initChart('#ec-user-bar', 'ecUser')
                break
            case 1:
                this.initChart('#ec-article-pie', 'ecArticle')
                break
            case 2:
                this.initChart('#ec-comment-line', 'ecComment')
                break
            default:
                break
        }
    },
    showDiyToast() {
        wx.vantToast.success('跳转你的页面')
    },
    showorderlist() {
        wx.navigateTo({
          url: '/pages/bpm/order/list/index',
        })
    },
    showyinranlist() {
        wx.navigateTo({
          url: '/pages/bpm/stage/list01/index',
        })
    },
    showfengzhilist() {
        wx.navigateTo({
          url: '/pages/bpm/stage02/list/index',
        })
    },

    showchukulist() {
        wx.navigateTo({
          url: '/pages/bpm/stage04/list/index',
        })
    },

    showproductlist() {
        wx.navigateTo({
          url: '/pages/bpm/product/list/index',
        })
    },
    showmanagetodolist() {
        wx.navigateTo({
          url: '/pages/manage/todolist/index',
        })
    }
    
})