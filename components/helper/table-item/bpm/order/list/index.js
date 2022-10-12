import { VantComponent } from '../../../../../vant/common/component';
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
        onClickProducts(e) {
            const id = e.currentTarget.dataset.data.id
            wx.navigateTo({
                url: `/pages/bpm/order/detail/index?ids=${e.currentTarget.dataset.index}`,
            })
        },
        // 预览图片
        onPreview(e) {
            const rows = this.data.rows
            // 预览图片清单
            const previewUrls = []
            for (let i in rows) {
                previewUrls.push(app.utils.isCdnurl(rows[i].avatar) ? rows[i].avatar : this.data.cdnurl + rows[i].avatar)
            }
            wx.previewImage({
                current: e.currentTarget.dataset.url,
                urls: previewUrls
            })
        },
        noop() {}
    }
});