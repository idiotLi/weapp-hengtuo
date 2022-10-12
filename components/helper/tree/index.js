import {
    VantComponent
} from '../../vant/common/component';
const app = getApp()

VantComponent({
    options: {
        styleIsolation: 'shared'
    },
    props: {
        data: Array,
        parent: {
            type: Number,
            value: 0
        },
        value: Array
    },
    data: {
        activeNames: []
    },
    mounted() {

    },
    methods: {
        onChange(e) {
            this.setData({
                activeNames: e.detail,
            });
        },
        onCheckBoxChange(e) {
            const index = e.currentTarget.dataset.index
            let value = this.data.value
            const childsIds = this.getChilds('parent', index, this.data.data)
            // 选中与取消
            if (value.includes(index)) {
                value.splice(value.findIndex(v => v === index), 1) // 取消自己
                // 取消所有下级
                let valueSet = new Set(value)
                let childsSet = new Set(childsIds)
                value = [...new Set([...valueSet].filter(x => !childsSet.has(x)))] // 差集
            } else {
                value.push(index) // 选中自己
                // 选中所有下级
                value = [...new Set([...value, ...childsIds])] // 并集
            }
            this.setData({
                value: value
            })
        },
        /**
         * 递归查找所有下级id
         * @param {String} parentKey 父级属性名'parent|pid等'
         * @param {String} parentValue  要查找的父级属性值
         * @param {Array} data 从这个数组中查找
         */
        getChilds(parentKey, parentValue, data) {
            const childsKeys = []
            for (let i = 0; i < data.length; i++) {
                if (data[i][parentKey] === parentValue) {
                    childsKeys.push(data[i].id)
                    this.getChilds(parentKey, data[i].id, data)
                }
            }
            return childsKeys
        },
        noop() {}
    }
});