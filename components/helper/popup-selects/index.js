import { VantComponent } from '../../vant/common/component';
VantComponent({
    props: {
        show: Boolean,
        title: String,
        description: String,
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
            value: '50vh'
        },
        // 选项列表
        selects: {
            type: Array,
            value: []
        },
        // 已选项
        value: {
            type: Array,
            value: []
        },
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
    methods: {
        noop() { },
        onSelect(event) {
            const { index } = event.currentTarget.dataset;
            const item = this.data.selects[index];
            if (item) {
                this.$emit('select', item);
            }
        },
        onCheckBoxChange(e) {
            this.setData({
                value: e.detail
            })
        },
        _toggleCheckbox(e) {
            const { index } = e.currentTarget.dataset
            const checkbox = this.selectComponent(`.checkboxes-${index}`)
            checkbox.toggle()
        },
        onCancel() {
            this.$emit('cancel');
        },
        onConfirm() {
            // 按照选项顺序排序
            let rule = []
            this.data.selects.map((v,i) => {
                rule[i] = v.value
            })
            const value = this.data.value.sort((prev, next) => {
                return rule.indexOf(prev) - rule.indexOf(next)
            })
            this.$emit('confirm', value);
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
        }
    }
});
