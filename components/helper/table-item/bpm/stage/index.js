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
        // 点击批次管理按钮
        onClickPiCiBtn(e) {
            const id = e.currentTarget.dataset.data.id
            wx.setStorageSync('cust_01', e.currentTarget.dataset.data.orders_id)
            wx.setStorageSync('cust_02', e.currentTarget.dataset.data.id)
            wx.setStorageSync('cust_11', e.currentTarget.dataset.data.piciaddable)

            wx.navigateTo({
                // url: `/pages/_common/detail/index?data=${app.utils.encodeParam(e.detail.row)}&config=${app.utils.encodeParam(that.data._config)}`,
                // url: `/pages/bpm/stage/detail01/index?ids=420&stage=1`,
                url: `/pages/bpm/stage/detail01/index?ids=${e.currentTarget.dataset.index}`,
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