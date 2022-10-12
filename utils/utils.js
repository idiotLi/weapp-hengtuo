/**
 * 格式化时间字符串
 * @param {number|string} timestamp 时间戳或时间字符串
 * @param {string} format 目标格式 'yyyy-MM-dd HH:mm:ss'
 */
const formatDate = (timestamp, format) => {
    if (!format) format = 'yyyy-MM-dd HH:mm:ss'
    if (timestamp.constructor === String) {
        timestamp = formatTimestamp(timestamp)
    }
    const date = new Date(parseInt(timestamp))
    const dict = {
        'yyyy': date.getFullYear(),
        'M': date.getMonth() + 1,
        'd': date.getDate(),
        'H': date.getHours(),
        'm': date.getMinutes(),
        's': date.getSeconds(),
        'S': ('' + (date.getMilliseconds() + 1000)).substr(1),
        'MM': ('' + (date.getMonth() + 101)).substr(1),
        'dd': ('' + (date.getDate() + 100)).substr(1),
        'HH': ('' + (date.getHours() + 100)).substr(1),
        'mm': ('' + (date.getMinutes() + 100)).substr(1),
        'ss': ('' + (date.getSeconds() + 100)).substr(1)
    }
    return format.replace(/(y+|M+|d+|H+|s+|m+|S)/g,
        function (a) {
            return dict[a];
        });
}
/**
 * 格式化时间戳
 * @param {string|number} str 时间字符串或者时间戳
 * @param {number} length 返回的时间戳长度 10 | 13
 */
const formatTimestamp = (str, length) => {
    length = length ? length : 13
    if (str.constructor === Number) {
        if (length === 13) {
            return str.toString().length === 13 ? str : str * 1000
        }
        if (length === 10) {
            return str.toString().length === 10 ? str : parseInt(str / 1000)
        }
    }
    if (str.constructor === String) {
        str = str.substring(0, 19)
        str = str.replace(/-/g, '/')
        var timestamp = new Date(str).getTime()
        return timestamp
    }
}
/**
 * 检查是否有该规则权限
 * @param {string} url 要检查的规则
 */
const authCheck = (url) => {
    const rules = wx.getStorageSync('ruleList')
    return rules.indexOf(url.replace(/\./g, '/')) !== -1 ? true : false
}
/**
 * 对象参数编码为字符串
 * @param {object} obj 待编码对象
 */
const encodeParam = (obj) => {
    return encodeURIComponent(JSON.stringify(obj))
}
/**
 * 字符串参数编码为对象
 * @param {string} str 待解码字符串
 */
const decodeParam = (str) => {
    if (str && str !== '') {
        return JSON.parse(decodeURIComponent(str))
    }
    return str
}
/**
 * 比较两个对象内容是否相等
 * @param {object} origin 源对象
 * @param {object} target 目标对象
 */
const compareObj = (origin, target) => {
    return JSON.stringify(origin) === JSON.stringify(target)
}
// url文件类型判断
const isImage = (url) => {
    return (url.match(/\.(jpg|jpeg|jpe|gif|png|bmp|tif|tiff|ico|webp|svg)$/i) !== null)
}
const isDocument = (url) => {
    return (url.match(/\.(doc|docx|xls|xlsx|ppt|pptx|pdf)$/i) !== null)
}
const isVideo = (url) => {
    return (url.match(/\.(mp4|mov|m4v|3gp|avi|m3u8|webm|wmv|mkv)$/i) !== null)
}
const isAudio = (url) => {
    return (url.match(/\.(m4a|wav|mp3|aac)$/i) !== null)
}
const isCdnurl = (url) => {
    return (url.match(/http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/i) !== null)
}
const setClicpboardData = (title, str) => {
    if (!str.length) return false
    wx.setClipboardData({
        data: str,
        success: (res) => {
            wx.showToast({
                title: `${title ? title : ''}已复制`,
                duration: 1500
            })
            // wx.vantToast.success(`${title ? title : ''}已复制`);
        },
    })
}
const towxml = (html) => {
    if (!html || html == '') return
    const wxml = getApp().towxml(html, 'html', {
        base: wx.getStorageSync('config')['upload']['cdnurl'],
        theme: 'light',
        events:{
            tap:(e)=>{
                return false
            }
        }
    })
    return wxml
}
module.exports = {
    formatDate: formatDate,
    formatTimestamp: formatTimestamp,
    authCheck: authCheck,
    encodeParam: encodeParam,
    decodeParam: decodeParam,
    compareObj: compareObj,
    isImage: isImage,
    isDocument: isDocument,
    isVideo: isVideo,
    isAudio: isAudio,
    isCdnurl: isCdnurl,
    setClicpboardData: setClicpboardData,
    towxml: towxml
}