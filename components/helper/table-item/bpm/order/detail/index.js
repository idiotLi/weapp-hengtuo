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
        onClickCell(e) {
            const id = e.currentTarget.dataset.data.id
            // if (id === wx.getStorageSync('userId')) {
            //     wx.vantToast('只能查看和编辑你的下级管理员')
            //     return
            // }
            // this.$emit('clickTableCell',{
            //     row: e.currentTarget.dataset.data,
            //     index: e.currentTarget.dataset.index
            // })
            wx.navigateTo({
                // url: `/pages/_common/detail/index?data=${app.utils.encodeParam(e.detail.row)}&config=${app.utils.encodeParam(that.data._config)}`,
                url: `/pages/bpm/stage/detail01/index?data=${app.utils.encodeParam(e.detail.row)}`,
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