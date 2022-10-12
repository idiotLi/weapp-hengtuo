import { VantComponent } from '../../../../../../components/vant/common/component';
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
        const cdnurl = wx.getStorageSync('config')['upload']['cdnurl']
        this.setData({
            cdnurl: cdnurl
        })
    },
    methods: {
        // 点击数据行
        onClickCell(e) {
            this.$emit('clickTableCell',{
                row: e.currentTarget.dataset.data,
                index: e.currentTarget.dataset.index
            })
        },
        noop() {}
    }
});