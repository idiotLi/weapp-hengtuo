import { VantComponent } from '../../../../vant/common/component';
const app = getApp()

VantComponent({
    options: {
        styleIsolation: 'shared'
    },
    props: {
        item: Object,
        config: Object,
        rows: Array,
        cdnurl: String
    },
    data: {

    },
    created() {
        
    },
    methods: {
        // 点击数据行
        onClickCell(e) {
            const id = e.currentTarget.dataset.data.id
            if (id === wx.getStorageSync('userId')) {
                wx.vantToast('只能查看和编辑你的下级管理组')
                return
            }
            this.$emit('clickTableCell',{
                row: e.currentTarget.dataset.data,
                index: e.currentTarget.dataset.index
            })
        },
        noop() {}
    }
});