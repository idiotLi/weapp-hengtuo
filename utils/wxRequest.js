/*!
 * 
 * 			author : 7548764@qq.com
 * 			github : https://github.com/hatedMe/wechat-request
 * 			version : 2.2.0
 * 		
 */
! function (e, t) {
    if ("object" == typeof exports && "object" == typeof module) module.exports = t();
    else if ("function" == typeof define && define.amd) define([], t);
    else {
        var r = t();
        for (var n in r)("object" == typeof exports ? exports : e)[n] = r[n]
    }
}(window, function () {
    return function (e) {
        var t = {};

        function r(n) {
            if (t[n]) return t[n].exports;
            var o = t[n] = {
                i: n,
                l: !1,
                exports: {}
            };
            return e[n].call(o.exports, o, o.exports, r), o.l = !0, o.exports
        }
        return r.m = e, r.c = t, r.d = function (e, t, n) {
            r.o(e, t) || Object.defineProperty(e, t, {
                enumerable: !0,
                get: n
            })
        }, r.r = function (e) {
            "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(e, Symbol.toStringTag, {
                value: "Module"
            }), Object.defineProperty(e, "__esModule", {
                value: !0
            })
        }, r.t = function (e, t) {
            if (1 & t && (e = r(e)), 8 & t) return e;
            if (4 & t && "object" == typeof e && e && e.__esModule) return e;
            var n = Object.create(null);
            if (r.r(n), Object.defineProperty(n, "default", {
                    enumerable: !0,
                    value: e
                }), 2 & t && "string" != typeof e)
                for (var o in e) r.d(n, o, function (t) {
                    return e[t]
                }.bind(null, o));
            return n
        }, r.n = function (e) {
            var t = e && e.__esModule ? function () {
                return e.default
            } : function () {
                return e
            };
            return r.d(t, "a", t), t
        }, r.o = function (e, t) {
            return Object.prototype.hasOwnProperty.call(e, t)
        }, r.p = "", r(r.s = 1)
    }([function (e, t, r) {
        "use strict";
        Object.defineProperty(t, "__esModule", {
            value: !0
        });
        var n = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (e) {
                return typeof e
            } : function (e) {
                return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e
            },
            o = t.bind = function (e, t) {
                return function () {
                    return e.apply(t, Array.from(arguments))
                }
            },
            u = (t.extend = function (e, t, r) {
                return Object.getOwnPropertyNames(t).forEach(function (n) {
                    r && "function" == typeof t[n] ? e[n] = o(t[n], r) : e[n] = t[n]
                }), e
            }, t.copyobj = function (e, t) {
                return Object.assign({}, e, t)
            }, t.merge = function e() {
                var t = {};
                return Array.from(arguments).forEach(function (r) {
                    for (var o in r) "object" !== n(r[o]) || u(r[o]) || e(t[o], r[o]), t[o] = r[o]
                }), t
            }, t.deepMerge = function e() {
                var t = {};
                return Array.from(arguments).forEach(function (r) {
                    r && "object" === (void 0 === r ? "undefined" : n(r)) && !u(r) && Object.keys(r).forEach(function (o) {
                        if ("object" === n(r[o])) return t[o] = e(t[o], r[o]);
                        t[o] = r[o]
                    })
                }), t
            }, t.isEmptyObject = function (e) {
                return 0 === Object.getOwnPropertyNames(e).length
            });

        function a(e) {
            return encodeURIComponent(e).replace(/%40/gi, "@").replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+").replace(/%5B/gi, "[").replace(/%5D/gi, "]")
        }
        t.combineURLs = function (e, t) {
            return t ? e.replace(/\/+$/, "") + t.replace(/^\/+/, "") : e
        }, t.buildURL = function (e, t) {
            if (!t || u(t)) return e;
            var r = [];
            return Object.keys(t).forEach(function (e) {
                r.push(a(e) + "=" + a(t[e]))
            }), e + (-1 === e.indexOf("?") ? "?" : "&") + r.join("&")
        }, t.isAbsoluteURL = function (e) {
            return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(e)
        }
    }, function (e, t, r) {
        "use strict";
        Object.defineProperty(t, "__esModule", {
            value: !0
        });
        var n = function (e) {
            return e && e.__esModule ? e : {
                default: e
            }
        }(r(2));
        t.default = n.default
    }, function (e, t, r) {
        "use strict";
        Object.defineProperty(t, "__esModule", {
            value: !0
        });
        var n = a(r(3)),
            o = function (e) {
                if (e && e.__esModule) return e;
                var t = {};
                if (null != e)
                    for (var r in e) Object.prototype.hasOwnProperty.call(e, r) && (t[r] = e[r]);
                return t.default = e, t
            }(r(0)),
            u = a(r(6));

        function a(e) {
            return e && e.__esModule ? e : {
                default: e
            }
        }

        function i(e) {
            var t = new n.default(e),
                r = o.bind(n.default.prototype.request, t);
            return o.extend(r, n.default.prototype, t), o.extend(r, t), r
        }
        var f = i(u.default);
        f.create = function (e) {
            return i(o.merge(u.default, e))
        }, f.spread = function (e) {
            return function () {
                for (var t = arguments.length, r = Array(t), n = 0; n < t; n++) r[n] = arguments[n];
                return e.apply(null, [].concat(r))
            }
        }, t.default = f
    }, function (e, t, r) {
        "use strict";
        Object.defineProperty(t, "__esModule", {
            value: !0
        });
        var n = function () {
                function e(e, t) {
                    for (var r = 0; r < t.length; r++) {
                        var n = t[r];
                        n.enumerable = n.enumerable || !1, n.configurable = !0, "value" in n && (n.writable = !0), Object.defineProperty(e, n.key, n)
                    }
                }
                return function (t, r, n) {
                    return r && e(t.prototype, r), n && e(t, n), t
                }
            }(),
            o = function (e) {
                if (e && e.__esModule) return e;
                var t = {};
                if (null != e)
                    for (var r in e) Object.prototype.hasOwnProperty.call(e, r) && (t[r] = e[r]);
                return t.default = e, t
            }(r(0)),
            u = function (e) {
                return e && e.__esModule ? e : {
                    default: e
                }
            }(r(4)),
            a = r(5),
            i = function () {
                function e(t) {
                    ! function (e, t) {
                        if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
                    }(this, e), this.defaults = t, this.interceptors = {
                        request: new u.default,
                        response: new u.default
                    }
                }
                return n(e, [{
                    key: "request",
                    value: function (e) {
                        "string" == typeof e && (e = o.merge({
                            url: arguments[0]
                        }, arguments[1])), (e = o.deepMerge(this.defaults, e)).method = e.method ? e.method.toLowerCase() : "get";
                        var t = [a.dispatchRequest, void 0],
                            r = Promise.resolve(e);
                        for (this.interceptors.request.forEach(function (e) {
                                t.unshift(e.fulfilled, e.rejected)
                            }), this.interceptors.response.forEach(function (e) {
                                t.push(e.fulfilled, e.rejected)
                            }); t.length;) r = r.then(t.shift(), t.shift());
                        return r
                    }
                }, {
                    key: "all",
                    value: function (e) {
                        return Promise.all(e)
                    }
                }]), e
            }();
        ["delete", "get", "head", "options", "trace"].forEach(function (e) {
            i.prototype[e] = function (t, r) {
                return this.request(o.merge(r || {}, {
                    method: e,
                    url: t
                }))
            }
        }), ["post", "put", "patch"].forEach(function (e) {
            i.prototype[e] = function (t, r, n) {
                return this.request(o.merge(n || {}, {
                    method: e,
                    url: t,
                    data: r
                }))
            }
        }), t.default = i
    }, function (e, t, r) {
        "use strict";
        Object.defineProperty(t, "__esModule", {
            value: !0
        });
        var n = function () {
                function e(e, t) {
                    for (var r = 0; r < t.length; r++) {
                        var n = t[r];
                        n.enumerable = n.enumerable || !1, n.configurable = !0, "value" in n && (n.writable = !0), Object.defineProperty(e, n.key, n)
                    }
                }
                return function (t, r, n) {
                    return r && e(t.prototype, r), n && e(t, n), t
                }
            }(),
            o = function () {
                function e() {
                    ! function (e, t) {
                        if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
                    }(this, e), this.handlers = []
                }
                return n(e, [{
                    key: "use",
                    value: function (e, t) {
                        return this.handlers.push({
                            fulfilled: e,
                            rejected: t
                        }), this.handlers.length - 1
                    }
                }, {
                    key: "eject",
                    value: function (e) {
                        this.handlers[e] && (this.handlers[e] = null)
                    }
                }, {
                    key: "forEach",
                    value: function (e) {
                        this.handlers.forEach(function (t) {
                            null !== t && e(t)
                        })
                    }
                }]), e
            }();
        t.default = o
    }, function (e, t, r) {
        "use strict";
        Object.defineProperty(t, "__esModule", {
            value: !0
        }), t.dispatchRequest = void 0;
        var n = function (e) {
            if (e && e.__esModule) return e;
            var t = {};
            if (null != e)
                for (var r in e) Object.prototype.hasOwnProperty.call(e, r) && (t[r] = e[r]);
            return t.default = e, t
        }(r(0));
        t.dispatchRequest = function (e) {
            e.baseURL && !n.isAbsoluteURL(e.url) && (e.url = n.combineURLs(e.baseURL, e.url)), e.url = n.buildURL(e.url, e.params), e.data = n.merge(e.data, e.transformRequest(e.data)), e.headers = n.merge(e.headers.common || {}, e.headers[e.method] || {}, e.headers || {}), ["delete", "get", "head", "post", "put", "patch", "common"].forEach(function (t) {
                delete e.headers[t]
            });
            var t = Promise.resolve(e);
            return t.then(function (e) {
                return new Promise(function (t, r) {
                    var n = wx.request({
                        url: e.url,
                        data: e.data || {},
                        header: e.headers,
                        method: e.method,
                        dataType: e.dataType,
                        success: function (e) {
                            t({
                                data: e.data,
                                headers: e.header,
                                status: e.statusCode,
                                cookies: e.cookies,
                                profile	: e.profile,
                                statusText: "ok"
                            })
                        },
                        fail: function (e) {
                            r(e)
                        },
                        complete: function () {
                            e.complete && e.complete()
                        }
                    });
                    e.timeout && "number" == typeof e.timeout && e.timeout > 1e3 && setTimeout(function () {
                        n.abort(), t({
                            status: "canceled"
                        })
                    }, e.timeout)
                })
            })
        }
    }, function (e, t, r) {
        "use strict";
        Object.defineProperty(t, "__esModule", {
            value: !0
        });
        var n = function (e) {
                if (e && e.__esModule) return e;
                var t = {};
                if (null != e)
                    for (var r in e) Object.prototype.hasOwnProperty.call(e, r) && (t[r] = e[r]);
                return t.default = e, t
            }(r(0)),
            o = {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            u = {
                method: "get",
                dataType: "json",
                responseType: "text",
                headers: {},
                transformRequest: function (e) {
                    return e
                }
            };
        u.headers = {
            common: {
                Accept: "application/json, text/plain, */*"
            }
        }, ["delete", "get", "head", "post", "put", "patch"].map(function (e) {
            u.headers[e] = n.merge(u.headers, o)
        }), t.default = u
    }])
});