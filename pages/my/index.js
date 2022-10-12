const app = getApp()
Page({
    data: {
        _ready: false,
        _hasUpdateAuth: false,
        userInfo: null,
        cdnurl: null,
    },
    onShow: function () {
        this.loadData()
    },
    onPullDownRefresh() {
        this.loadData()
    },
    loadData() {
        let that = this
        wx.wxRequest.get(
            'general.profile/index'
        ).then(function (res) {
            if (res) {
                that.setData({
                    _hasUpdateAuth: app.utils.authCheck('general.profile/update', wx.getStorageSync('ruleList')),
                    userInfo: res.data,
                    cdnurl: wx.getStorageSync('config')['upload']['cdnurl'],
                    _ready: true
                })
            }
            wx.stopPullDownRefresh()
        })
    },
    // 修改头像
    updateAvatar() {
        let that = this
        wx.chooseImage({
            success: (res) => {
                const tempFilePaths = res.tempFilePaths
                wx.vantToast.loading({
                    duration: 0,
                    message: '上传中...'
                })
                wx.uploadFile({
                    url: wx.getStorageSync('config')['upload']['uploadurl'],
                    header: {
                        'Token': wx.getStorageSync('token'),
                    },
                    filePath: tempFilePaths[0],
                    name: 'file',
                    success(res) {
                        if (res.statusCode === 200) {
                            const result = JSON.parse(res.data)
                            if (result.code) {
                                wx.vantNotify({
                                    type: 'warning',
                                    message: result.msg
                                })
                                return
                            }
                            const url = result.data.url
                            wx.wxRequest.post(
                                'general.profile/update', {
                                    avatar: url
                                }
                            ).then(function (res) {
                                if (res) {
                                    that.setData({
                                        'userInfo.avatar': url
                                    })
                                    wx.vantToast.success('修改头像成功')
                                }
                            })
                        }
                    },
                    error(res) {
                        wx.vantNotify({
                            type: 'warning',
                            message: '上传失败'
                        })
                        console.log('upload error:', res)
                    },
                    complete() {
                        wx.vantToast.clear()
                    }
                })
            },
        })
    },
    // 修改资料
    updateProfile() {
        wx.navigateTo({
            url: `edit/index?data=${app.utils.encodeParam(this.data.userInfo)}`,
        })
    },
    // 修改手机绑定
    updateMobile() {
        wx.navigateTo({
            url: `mobile/index?data=${this.data.userInfo.mobile ? this.data.userInfo.mobile : ''}`,
        })
    },
    // 微信绑定
    updateWechat(e) {
        wx.navigateTo({
            url: `wechat/index?data=${app.utils.encodeParam(this.data.userInfo)}`,
        })
    },
    // 注销登录
    logout() {
        wx.vantDialog.confirm({
            message: '确定要注销登录吗？',
            className: 'helper-dialog'
        }).then(() => {
            wx.clearStorage({
                complete: () => {
                    wx.redirectTo({
                        url: '/pages/login/index'
                    })
                },
            })
        }).catch(() => {
            // on cancel
        })
    }
})