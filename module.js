
FDO.common = {
    FBLogin: function(callback) {

        //防止因延遲導致FB登入功能未正常執行
        FBUtil.after(function() {

            FB.getLoginStatus(function(res) {
                //connected 登入並取得授權
                if (res.status == "connected") {
                    callback(res);
                } else {
                    var md = new MobileDetect(window.navigator.userAgent);
                    var mo = "";
                    if (md.tablet() || md.phone()) {
                        //for ga 使用
                        mo = ", 手機";
                    }
                    // /iPad|iPhone/.test(navigator.userAgent) (??)
                    // CriOS -> ios 下的 chrome
                    // /iPad|iPhone/.test 從正規表式裡比對符合規則
                    if (navigator.userAgent.match('CriOS') || (/iPad|iPhone/.test(navigator.userAgent) && !/Safari/.test(navigator.userAgent))) {

                        //解決瀏覽器FBSDK_BUG,使用 oauth 方式
                        // FB 登入有兩種方式,一種是SDK 一種是 oauth , FBSDK 手機有BUG 
                        // crossFB line 25 -> line 44
                        var ABSOLUTE_URI = "http://" + location.hostname + "/ctbcvacation/crossFB?a=login";
                        var redirect_uri = "&redirect_uri=" + ABSOLUTE_URI;
                        var scope = "&scope=public_profile,email";
                        var url = "https://www.facebook.com/dialog/oauth?client_id=783511621702175" + redirect_uri + scope;

                        var _opened = window.open(url);
                        window.fbComplete = function() {
                            //關閉oauth開啟的 crossFB
                            _opened.close();
                            FB.getLoginStatus(function(_fbres) {
                                if (_fbres.status == "connected") {
                                    callback(_fbres);
                                } else {
                                    callback(false);
                                }
                            }, true);
                        };
                    } else {
                        FB.login(function(res) {
                            if (res.status == "connected") {
                                callback(res);
                            } else {
                                callback(false);
                            }
                        });
                    }
                }
            });
        });
    }
};

var FBUtil = {
    queue: [],
    inited: false,
    FB: {},
    after: function (fn) {
        if (this.inited) fn(FB);
        else
            this.queue.push(fn);
    },
    init: function (obj) {
        var thisobj = this;
        if (obj) {
            thisobj = obj;
        }
        if (!this.inited) {
            //if (FB.getAuthResponse()) {
                thisobj.inited = true;
                thisobj.FB = FB;
                for (var i = 0; i < thisobj.queue.length; ++i) {
                    try {
                        thisobj.queue[i](FB);
                    } catch (ex) {
                        setTimeout(function () {
                            throw ex;
                        }, 0);
                    }
                }
                thisobj.queue = null;
            //}
            //else {
            //    setTimeout(function () { FBUtil.init(thisobj); }, 1);
            //}
        }
    }
};

window.fbAsyncInit = function () {
    FB.init({
        appId: currentScript.getAttribute("data-appid"),                        // App ID from the app dashboard
        status: true,                                 // Check Facebook Login status
        xfbml: true,                                  // Look for social plugins on the page
        version: 'v1.0'
    });
    FB.getLoginStatus(function (response) {
        FBUtil.init();
    });
};
(function (d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
    } (document, 'script', 'facebook-jssdk'));