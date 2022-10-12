import {
    VantComponent
} from '../../vant/common/component';
const app = getApp()
VantComponent({
    options: {
        styleIsolation: 'shared'
    },
    props: {
        show: Boolean,
        title: String,
        description: {
            type: String,
            value: '筛选条件'
        },
        round: {
            type: Boolean,
            value: true
        },
        zIndex: {
            type: Number,
            value: 100
        },
        // scroll-view高度
        scrollHeight: {
            type: String,
            value: '80vh'
        },
        // 默认展开的折叠面板
        activeNames: {
            type: Object,
            value: []
        },
        // 已筛选项
        value: {
            type: Object,
            value: {}
        },
        // 字段配置
        field: Object,
        // 字段选项配置
        fieldContent: Object,
        // tab选项卡字段
        tabField: String,
        overlay: {
            type: Boolean,
            value: true
        },
        closeOnClickOverlay: {
            type: Boolean,
            value: true
        },
        closeOnClickAction: {
            type: Boolean,
            value: true
        },
        safeAreaInsetBottom: {
            type: Boolean,
            value: true
        }
    },
    data: {
        _datetimeText: {}, // 字符串格式的datetime字段合集
        _datetimeValue: {}, // 时间戳格式的datetime字段合集
        _numberRangeValue: {}, // 范围型number
        _columns: {} // picker
    },
    methods: {
        noop() {},
        // popup进入前
        onBeforeEnter() {
            this._getColumns()
            this.setData({
                activeNames: Object.keys(this.data.field) //展开全部collapse项
            })
        },
        _onCollapseChange(e) {
            this.setData({
                activeNames: e.detail
            })
        },
        onReset() {
            this.setData({
                value: {},
                _datetimeText: {},
                _datetimeValue: {},
                _numberRangeValue: {}
            })
            this.$emit('reset');
        },
        onCancel() {
            this.$emit('cancel');
        },
        onConfirm(e) {
            const data = {}
            data.filter = {}
            data.op = {}
            for (let key in e.detail.value) {
                if (e.detail.value[key] !== '') {
                    data.filter[key] = e.detail.value[key]
                    data.op[key] = this.data.field[key].op
                }
            }
            this.$emit('confirm', data)
        },
        onClose() {
            this.$emit('close');
        },
        onClickOverlay() {
            this.$emit('click-overlay');
            this.onClose();
        },
        setValue(value) {
            this.setData({
                value: value
            })
        },
        onCloseActionSheet(e) {
            const index = e.currentTarget.dataset.index
            this.setData({
                showActionSheet: {
                    [index]: false
                },
            })
        },
        // datetime date
        onTapDateField(e) {
            const index = e.currentTarget.dataset.index
            const range = e.currentTarget.dataset.range
            // 范围型时间处理
            if (range) {
                const picker = this.selectComponent(`.picker-${index}-${range}`)
                // 如果有数据 让picker选中当前值
                if (this.data._datetimeValue[index] && this.data._datetimeValue[index][range]) {
                    picker.updateColumnValue(this.data._datetimeValue[index][range])
                } else {
                    picker.updateColumnValue((new Date()).getTime())
                }
                this.setData({
                    showActionSheet: {
                        [index + '_' + range]: true
                    }
                })
            } else {
                const picker = this.selectComponent(`.picker-${index}`)
                // 精确型时间处理
                if (this.data._datetimeValue[index]) {
                    picker.updateColumnValue(app.utils.formatTimestamp(this.data._datetimeValue[index]))
                } else {
                    picker.updateColumnValue((new Date()).getTime())
                }
                this.setData({
                    showActionSheet: {
                        [index]: true
                    },
                })
            }
        },
        onDatetimeConfirm(e) {
            const index = e.currentTarget.dataset.index
            const range = e.currentTarget.dataset.range
            const type  = e.currentTarget.dataset.type
            let valueText = ''
            switch (type) {
                case 'datetime':
                    valueText = app.utils.formatDate(e.detail, 'yyyy-MM-dd HH:mm:ss')
                    break
                case 'date':
                    valueText = app.utils.formatDate(e.detail, 'yyyy-MM-dd')
                    break
                case 'year-month':
                    valueText = app.utils.formatDate(e.detail, 'yyyy-MM')
                    break
                default:
                    break
            }
            let originValue = this.data.value
            let originDatetimeText = this.data._datetimeText
            let originDatetimeValue = this.data._datetimeValue
            // 范围型时间处理
            if (range) {
                originDatetimeValue[index] = {
                    ...originDatetimeValue[index],
                    [range]: e.detail ? e.detail : ''
                }
                originDatetimeText[index] = {
                    ...originDatetimeText[index],
                    [range]: valueText
                }
                // 拼接范围时间所需的字符串
                const originRange = originDatetimeValue[index]
                if (originRange.start) {
                    var start = app.utils.formatTimestamp(originRange.start, 10)
                }
                if (originRange.end) {
                    var end = app.utils.formatTimestamp(originRange.end, 10)
                }
                originValue[index] = `${start ? start : ''},${end ? end : ''}`
            } else {
                // 精确型时间处理
                originValue[index] = app.utils.formatTimestamp(e.detail, 10)
                originDatetimeText[index] = valueText
                originDatetimeValue[index] = e.detail
            }
            this.setData({
                value: originValue,
                _datetimeText: originDatetimeText,
                _datetimeValue: originDatetimeValue,
                showActionSheet: {
                    [index]: false
                },
            })
        },
        // time
        onTapTimeField(e) {
            const index = e.currentTarget.dataset.index
            const range = e.currentTarget.dataset.range
            if (range) {
                const picker = this.selectComponent(`.picker-${index}-${range}`)
                const value = this.data.value[index] ? this.data.value[index].split(',') : []
                if (value.length === 2) {
                    if (range === 'start') {
                        if (value[0]) {
                            picker.updateColumnValue(value[0])
                        } else {
                            picker.updateColumnValue(app.utils.formatDate((new Date()).getTime(),'HH:mm'))
                        }
                    }
                    if (range === 'end') {
                        if (value[1]) {
                            picker.updateColumnValue(value[1])
                        } else {
                            picker.updateColumnValue(app.utils.formatDate((new Date()).getTime(),'HH:mm'))
                        }
                    }
                } else {
                    picker.updateColumnValue(app.utils.formatDate((new Date()).getTime(),'HH:mm'))
                }
                this.setData({
                    showActionSheet: {
                        [index + '_' + range]: true
                    }
                })
            } else {
                const picker = this.selectComponent(`.picker-${index}`)
                if (this.data.value[index]) {
                    picker.updateColumnValue(this.data.value[index])
                } else {
                    picker.updateColumnValue(app.utils.formatDate((new Date()).getTime(),'HH:mm'))
                }
                this.setData({
                    showActionSheet: {
                        [index]: true
                    },
                })
            }
        },
        onTimeConfirm(e) {
            const index = e.currentTarget.dataset.index
            const range = e.currentTarget.dataset.range
            if (range) {
                const value = []
                const originValue = this.data.value[index] ? this.data.value[index].split(',') : []
                if (range === 'start') {
                    value[0] = e.detail
                    value[1] = originValue.length === 2 ? originValue[1] : ''
                }
                if (range === 'end') {
                    value[0] = originValue.length === 2 ? originValue[0] : ''
                    value[1] = e.detail
                }
                this.setData({
                    [`value.${index}`]: value.join(','),
                    showActionSheet: {
                        [index]: false
                    },
                })
            } else {
                this.setData({
                    [`value.${index}`]: e.detail,
                    showActionSheet: {
                        [index]: false
                    },
                })
            }
        },
        // year
        onTapYearField(e) {
            const index = e.currentTarget.dataset.index
            const range = e.currentTarget.dataset.range
            // 生成年份数组
            const years = []
            const minYear = new Date().getFullYear() - 100
            const maxYear = new Date().getFullYear() + 100
            for (let i = minYear; i < maxYear; i++) {
                years.push(i)
            }
            this.setData({
                years: years,
            }, function () {
                if (range) {
                    const picker = this.selectComponent(`.picker-${index}-${range}`)
                    const value = this.data.value[index] ? this.data.value[index].split(',') : []
                    if (value.length === 2) {
                        if (range === 'start') {
                            if (value[0]) {
                                picker.setColumnValue(0, parseInt(value[0]))
                            } else {
                                picker.setColumnValue(0, parseInt(new Date().getFullYear()))
                            }
                        }
                        if (range === 'end') {
                            if (value[1]) {
                                picker.setColumnValue(0, parseInt(value[1]))
                            } else {
                                picker.setColumnValue(0, parseInt(new Date().getFullYear()))
                            }
                        }
                    } else {
                        picker.setColumnValue(0, parseInt(new Date().getFullYear()))
                    }
                    this.setData({
                        showActionSheet: {
                            [index + '_' + range]: true
                        }
                    })
                } else {
                    const picker = this.selectComponent(`.picker-${index}`)
                    if (this.data.value[index]) {
                        picker.setColumnValue(0, parseInt(this.data.value[index]))
                    } else {
                        picker.setColumnValue(0, parseInt(new Date().getFullYear()))
                    }
                    this.setData({
                        showActionSheet: {
                            [index]: true
                        },
                    })
                }
            })
        },
        onYearConfirm(e) {
            const index = e.currentTarget.dataset.index
            const range = e.currentTarget.dataset.range
            if (range) {
                const value = []
                const originValue = this.data.value[index] ? this.data.value[index].split(',') : []
                if (range === 'start') {
                    value[0] = e.detail.value
                    value[1] = originValue.length === 2 ? originValue[1] : ''
                }
                if (range === 'end') {
                    value[0] = originValue.length === 2 ? originValue[0] : ''
                    value[1] = e.detail.value
                }
                this.setData({
                    [`value.${index}`]: value.join(','),
                    showActionSheet: {
                        [index]: false
                    },
                })
            } else {
                this.setData({
                    [`value.${index}`]: e.detail.value,
                    showActionSheet: {
                        [index]: false
                    },
                })
            }
        },
        // select
        onTapSelectField(e) {
            const index = e.currentTarget.dataset.index
            const picker = this.selectComponent(`.picker-${index}`)
            if (this.data.value[index]) {
                picker.setColumnValue(0, this.data.fieldContent[index][this.data.value[index]])
            }
            this.setData({
                showActionSheet: {
                    [index]: true
                },
            })
        },
        onSelectConfirm(e) {
            const index = e.currentTarget.dataset.index
            this.setData({
                [`value.${index}`]: e.detail.value.value,
                showActionSheet: {
                    [index]: false
                },
            })
        },
        // selects
        onTapSelectsField (e) {
            const index = e.currentTarget.dataset.index
            const picker = this.selectComponent(`.picker-${index}`)
            // 让picker默认选中当前值 
            picker.setValue(this.data.value[index] ? this.data.value[index].split(',') : [])
            this.setData({
                showActionSheet: {
                    [index]: true
                },
            })
        },
        onSelectsConfirm(e) {
            const index = e.currentTarget.dataset.index
            this.setData({
                [`value.${index}`]: e.detail && e.detail.length ? e.detail.join(',') : '',
                showActionSheet: {
                    [index]: false
                },
            })
        },
        onNumberRangeChange(e) {
            // 范围型number处理
            const index = e.currentTarget.dataset.index
            const range = e.currentTarget.dataset.range
            let originValue = this.data.value
            let originNumberRangeValue = this.data._numberRangeValue
            originNumberRangeValue[index] = {
                ...originNumberRangeValue[index],
                [range]: e.detail ? e.detail : ''
            }
            // 拼接范围number所需的字符串
            const originRange = originNumberRangeValue[index]
            originValue[index] = `${originRange.start ? originRange.start : ''},${originRange.end ? originRange.end : ''}`
            this.setData({
                value: originValue,
                _numberRangeValue: originNumberRangeValue
            })
        },
        onFieldChange(e) {
            const index = e.currentTarget.dataset.index
            let originValue = this.data.value
            originValue[index] = e.detail
            this.setData({
                value: originValue
            })
        },
        // 根据fieldContent生成picker的columns
        _getColumns() {
            const fieldContent = this.data.fieldContent
            const columns = {}
            for (let field in fieldContent) {
                columns[field] = []
                for (let i in fieldContent[field]) {
                    let text = ''
                    let value = null
                    if (fieldContent[field][i].constructor === Object) {
                        text = Object.values(fieldContent[field][i])[0]
                        value = isNaN(parseInt(Object.keys(fieldContent[field][i])[0])) ? Object.keys(fieldContent[field][i])[0] : parseInt(Object.keys(fieldContent[field][i])[0])
                    } else {
                        text = fieldContent[field][i]
                        value = i
                    }
                    columns[field].push({
                        'text': text,
                        'value': value
                    })
                }
            }
            this.setData({
                _columns: columns
            })
        }
    }
});