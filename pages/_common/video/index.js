const app = getApp()
Page({
    data: {
        src: ''
    },
    onLoad: function(options) {
        this.setData({
            src: app.utils.decodeParam(options.src)
        })
    },
    onReady() {
        this.videoContext = wx.createVideoContext('myVideo')
    }
})