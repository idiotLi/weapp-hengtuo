import wxRequest from 'wxRequest'
import Notify from '../components/vant/notify/notify';

/** 配置你的控制器地址 */
/** 请只修改域名部分  后面的路径'addons/helper/wxapp.'切勿修改 */
/** 小程序上线须使用https */
wxRequest.defaults.baseURL = 'https://www.chison.online/addons/helper/wxapp.'



wxRequest.defaults.timeout = 5000
wxRequest.defaults.headers.post['Content-Type'] = 'application/json'

// 请求拦截器
wxRequest.interceptors.request.use(function (config) {
    config.headers.Cookie = wx.getStorageSync('cookie').toString()
    config.headers.Token = wx.getStorageSync('token')
    return config
})

// 响应拦截器
wxRequest.interceptors.response.use(function (response) {
    if (response.cookies && response.cookies.length) {
        wx.setStorageSync('cookie',response.cookies)
    }
    // 拦截非200状态码的响应
    if (response.status !== 200) {
        wx.vantToast.clear()
        Notify({
            type: 'danger',
            message: '服务器错误:' + response.status,
            duration: 5000
        })
        console.error('Server Error:',response)
        return false
    }
    // 拦截正常响应code为"-1"时跳转重新登录
    if (response.data.code == -1) {
        wx.vantToast.clear()
        wx.redirectTo({
            url: '/pages/login/index',
        })
        return false
    }
    // 拦截正常响应code为错误(1)时 (<-1为解密用户微信数据出错)
    if (response.data.code == 1 || response.data.code < -1) {
        wx.vantToast.clear()
        Notify({
            type: 'warning',
            message: response.data.msg
        })
        console.log('Response Detail:',response)
        return false
    }
    // 返回成功code时的响应数据
    if (response.data.code === 0) {
        return response.data
    }
    wx.vantToast.clear()
    Notify({
        type: 'danger',
        message: '服务端返回数据错误',
        duration: 5000
    })
    console.error('Response Detail:',response)
    return false
    
}, function (error) {
    // 响应错误时
    Notify({
        type: 'danger',
        message: Object.values(error),
        duration: 5000
    })
    console.error('Request Error:',error)
    return Promise.reject(error)
})
export default wxRequest