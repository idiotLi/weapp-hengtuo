import { VantComponent } from '../../../vant/common/component';
const app = getApp()

VantComponent({
    options: {
        styleIsolation: 'shared'
    },
    props: {
        // 默认展开的折叠面板
        active: {
            type: Array,
            value: []
        },
        // 单个折叠面板数据
        item: {
            type: Object,
            value: {}
        },
        // 已选中节点
        checks: {
            type: Array,
            value: []
        },
        // 是否选中
        value: {
            type: Boolean,
            value: false
        },
        // 是否只读
        readOnly: {
            type: Boolean,
            value: false
        }
    },
    data: {
    },
    created() {
        this.setData({
            value: this.data.checks.includes(this.data.item.id),
        })
    },
    methods: {
        // checkbox事件
        onTreeChange(e) {
            if (this.data.readOnly) return
            this.$emit('change', {
                index: e.detail.index,
                value: e.detail.value
            });
        },
        onCheckBoxChange(e) {
            if (this.data.readOnly) return
            this.setData({
                value: e.detail
            })
            this.$emit('change', {
                index: e.currentTarget.dataset.index,
                value: e.detail
            });
        },
        // collapse事件
        onTreeCollapseChange(e) {
            this.$emit('treeCollapseChange', {
                index: e.detail.index,
                value: e.detail.value,
                checks: this.data.checks
            });
        },
        onCollapseChange(e) {
            this.$emit('treeCollapseChange', {
                index: e.currentTarget.dataset.index,
                value: e.detail,
                checks: this.data.checks
            });
        },
        noop() {}
    }
});