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
        // 预览图片
        onPreview(e) {
            const rows = this.data.rows
            const field = e.currentTarget.dataset.field
            // 预览图片清单
            const previewUrls = []
            for (let i in rows) {
                previewUrls.push(app.utils.isCdnurl(rows[i][field]) ? rows[i][field] : this.data.cdnurl + rows[i][field])
            }
            wx.previewImage({
                current: e.currentTarget.dataset.url,
                urls: previewUrls
            })
        },
        noop() {}
    }
});