import {
    VantComponent
} from '../../vant/common/component';
const app = getApp()
VantComponent({
    props: {
        show: Boolean,
        title: String,
        showToolbar: {
            type: Boolean,
            value: true
        },
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
        readOnly: {
            type: Boolean,
            value: false
        },
        // scroll-view高度
        scrollHeight: {
            type: String,
            value: 'auto'
        },
        // 默认展开的折叠面板
        active: {
            type: Array,
            value: []
        },
        // 所有树节点
        tree: {
            type: Array,
            value: []
        },
        // 已选中节点
        value: {
            type: Array,
            value: []
        },
        // 字段配置
        field: Object,
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
    },
    created() {
        // 已选数组强制转为number
        this.setData({
            active: Array.isArray(this.data.active) ? this.data.active : this.data.active.split(',').map(i => Number(i)),
            value: this.data.value.map(i => Number(i))
        })
    },
    methods: {
        noop() {},
        // 折叠展开发生时
        onTreeCollapseChange(e) {
            const index = e.detail.index
            let active = this.data.active
            if (active.findIndex(v => v === index) > -1 ) {
                active.splice(active.findIndex(v => v === index), 1)
            } else {
                active.push(index)
            }
            this.setData({
                active: active
            })
        },
        // checkbox节点变化时
        onTreeChange(e) {
            if (this.data.readOnly) return
            const index = e.detail.index
            let newValue = this.data.value
            // 所有子节点
            let childs = this.getChilds(index, this.data.tree)
            // 所有父节点
            let parents = this.getParents(this.data.tree, item => item.id === index)
            // 计算选中状态
            if (e.detail.value) {
                newValue = [...new Set([...childs, ...this.data.value])]
            } else {
                let valueSet = new Set(this.data.value)
                let childsSet = new Set(childs)
                // 计算差集
                newValue = [...new Set([...valueSet].filter(x => !childsSet.has(x)))]
            }
            // 计算父节点状态
            // 父节点集合中先去掉父节点自身id
            parents.splice(parents.findIndex(v => v === index), 1)
            for (let i = 0; i < parents.length; i++) {
                let myChilds = this.getChilds(parents[i], this.data.tree)
                // 子节点集合中去掉父节点自身id
                myChilds.splice(myChilds.findIndex(v => v === parents[i]), 1)
                // 子节点一个未选时,取消父节点自身选中
                if (!myChilds.find(item => newValue.includes(item))) {
                    newValue.splice(newValue.findIndex(v => v === parents[i]), 1)
                }else{
                // 选中子节点即选中父节点
                    newValue = [...new Set([...newValue, parents[i]])]
                }
            }
            this.setData({
                value: newValue
            })
        },
        onCollapse() {
            const nodes = this.getAllNode(this.data.tree)
            this.setData({
                active: !this.data.active.length ? nodes : []
            })
        },
        onCheckAll() {
            const nodes = this.getAllNode(this.data.tree)
            this.setData({
                allNodes: nodes,
                value: this.data.value.length === nodes.length ? [] : nodes
            })
        },
        onReset() {
            this.setData({
                value: [],
            })
            this.$emit('reset');
        },
        onCancel() {
            this.$emit('cancel');
        },
        onConfirm() {
            this.$emit('confirm', this.data.value.sort((a,b)=>a - b))
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
        /**
         * 找到某节点的所有子节点id（包括自己）
         * @param {Number} index 节点id
         * @param {Array} data 树形数据
         */
        getChilds(index, data) {
            const childs = []
            // '-1'表示index本身节点已找到，以后循环将直接取childlist的id.
            if (index < 0) {
                for (let i = 0; i < data.length; i++) {
                    childs.push(data[i].id)
                    childs.push(...this.getChilds(-1, data[i].childlist))
                }
                return childs
            } else {
                // 定位index本身节点
                for (let i = 0; i < data.length; i++) {
                    if (data[i].id === index) {
                        childs.push(data[i].id)
                        childs.push(...this.getChilds(-1, data[i].childlist))
                        return childs
                    }
                }
                // 同层childlist中再查找
                for (let i = 0; i < data.length; i++) {
                    if (this.getChilds(index, data[i].childlist)) {
                        return this.getChilds(index, data[i].childlist)
                    }
                }
            }
        },
        /**
         * 找到某节点的所有父节点id（包括自己）
         * @param {Array} data 树形数据
         * @param {Function} func 判断函数
         */
        getParents(data, func, path = []) {
            if (!data) return []
            for (const item of data) {
                path.push(item.id)
                if (func(item)) return path.reverse()
                if (item.childlist) {
                    const findChildren = this.getParents(item.childlist, func, path)
                    if (findChildren.length) return findChildren
                }
                path.pop()
            }
            return []
        },
        /**
         * 计算某节点的所有子节点是否都被选中
         * @param {Array} checkedValues 所有选中值id
         * @param {Array} myChilds 所有子节点id
         */
        isAllChildsChecked(checkedValues, myChilds) {
            return myChilds.every(val => checkedValues.includes(val))
        },
        getAllNode(data) {
            const nodes = []
            for (let i = 0; i < data.length; i++) {
                nodes.push(data[i].id)
                nodes.push(...this.getAllNode(data[i].childlist))
            }
            return nodes
        }
    }
});