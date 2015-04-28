var FDO = FDO || {}; //防止覆蓋店原本其他存在的 Module
FDO.project = FDO.project || {};
FDO.cookie = new function() {
    this.create = function(name, value, days) {
        //紀錄失效日期
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            //產生失效日期
            var expires = "; expires=" + date.toGMTString();
        } else var expires = "";
        //完整cookie 路徑
        document.cookie = name + "=" + value + expires + "; path=/";
    };
    // get cookie -> 得到 key and value 
    this.read = function(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            //空白截斷
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            //找尋是否符合 //substring -> 從哪開始 切多長
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    };
    //用複寫方式 刪除
    this.erase = function(name) {
        createCookie(name, "", -1);
    };
    return this;
};

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

                                    //記錄使用者行為,mo是手機 1是次數
                                    _gaq.push(['_trackEvent', '中國信託NFC',
                                        'FACEBOOK授權',
                                        '中信網站, 確認授權' + mo, 1, true
                                    ]);
                                    callback(_fbres);
                                } else {
                                    alert("請先登入Facebook才能進行遊戲喔。");
                                    _gaq.push(['_trackEvent', '中國信託NFC',
                                        'FACEBOOK授權',
                                        '中信網站, 拒絕授權' + mo, 1, true
                                    ]);
                                    callback(false);
                                }
                            }, true);
                        };
                    } else {
                        FB.login(function(res) {
                            if (res.status == "connected") {
                                callback(res);
                                _gaq.push(['_trackEvent', '中國信託NFC',
                                    'FACEBOOK授權',
                                    '粉多網站, 確認授權' + $('#step1,#step2').filter(':visible').attr('id') + mo, 1, true
                                ]);
                            } else {
                                alert("請先登入Facebook才能進行遊戲喔。");
                                _gaq.push(['_trackEvent', '中國信託NFC',
                                    'FACEBOOK授權',
                                    '粉多網站, 拒絕授權' + $('#step1,#step2').filter(':visible').attr('id') + mo, 1, true
                                ]);
                                callback(false);
                            }
                        });
                    }
                }
            });
        });
    }
};

var pageApp = (function(id) {
    var el = $("#" + id);
    var currentScene;
    var scenes = [];
    //物件內 function內的this 會參照 到 該物件 ,因此先把全域this存住 以防function內this關鍵字被取代
    var _this = this;
    var inited = false;
    var index = 0;
    _this.redirect = false;

    this.addScene = function(sceneDOM, path, redirect) {
        scenes.push({
            dom: sceneDOM,
            path: path,
            redirect: redirect,
            index: index++
        });
    };

    var show = function(sceneObj, data, ease) {
        if (currentScene == sceneObj) {
            return;
        }
        if (!inited) {
            //if(typeof sceneObj.dom.get(0).beforChage == "function" ){
            // var sceneObj.dom.get(0).beforChage = sceneObj.dom.get(0).beforChage;
            // beforeChange->自己寫的function 寫在 plugIn
            // sceneObj.dom.get(0).beforChage(data);
            // }
            //以下為luki精簡寫法
            //括號包起來 等同於 將|| 放置 等號右邊
            (sceneObj.dom.get(0).beforeChange || function() {})(data);
            //以上為luki精簡寫法

            //以下為假特效, 因為0秒 
            sceneObj.dom.fadeIn(0, function() {
                (sceneObj.dom.get(0).change || function() {})(data);
                currentScene = sceneObj;
            });
            inited = true;
        } else if (_this.redirect == true) {
            //JSON ->ecma5 通用變數 JSON.stringify(data) 將data ->轉成JSON
            //<form> -> JQ的creat
            // JSON 一種有規範的字串
            $('<form>')
                .append($('<input>').attr('type', 'hidden').attr('name', 'data').val(JSON.stringify(data)))
                //action -> 給一個路徑 (預設是回到rerurn出來的頁面)
                .attr('action', sceneObj.path)
                // POST and GET (?) // http 協定
                // Rest Flow
                .attr('method', 'POST')
                .appendTo('body')[0].submit();
        } else {
            if (currentScene) {
                $("html,body").scrollTop(0);
                // 基本上沒有特效,所以會跑下面else
                if (ease) {
                    var md = new MobileDetect(window.navigator.userAgent);
                    var fadeTime = 300;
                    if (md.tablet() || md.phone()) {
                        fadeTime = 0
                    }
                    currentScene.dom.fadeOut(fadeTime / 2, function() {
                        (sceneObj.dom.get(0).beforeChange || function() {})(data);
                        sceneObj.dom.fadeIn(fadeTime, function() {
                            (sceneObj.dom.get(0).change || function() {})(data);
                            currentScene = sceneObj;
                        });
                    });
                } else {
                    currentScene.dom.hide();
                    (sceneObj.dom.get(0).beforeChange || function() {})(data);
                    sceneObj.dom.show();
                    (sceneObj.dom.get(0).change || function() {})(data);
                    currentScene = sceneObj;
                }
            } else {
                (sceneObj.dom.get(0).beforeChange || function() {})(data);
                sceneObj.dom.fadeIn(0, function() {
                    (sceneObj.dom.get(0).change || function() {})(data);
                    currentScene = sceneObj;
                });
            }
        }
    };

    this.initScene = function(sceneIndex) {
        var data = {};
        //藏資料的地方 USER 相關資訊 for 轉業
        var dData = $('#js_data');
        if (dData.val()) {
            //標準JSON 格式 JSON.parse('{"jack":"123"}')
            //IE不支援 JSON -> call JSON2.js 支援IE
            data = JSON.parse(dData.val());
        }
        // Number(sceneIndex) 傳路徑字串近來,所以不是NaN(不是數字) 所以是true 
        if (isNaN(Number(sceneIndex))) {
            //查詢scenes陣列 , 比對到正確sceneIndex(路徑) 將該 背景物件 存進 sceneObj()
            sceneObj = $.grep(scenes, function(item, index) {
                return item.path == sceneIndex;
            });
            if (sceneObj.length) {
                sceneObj = sceneObj[0];
            }
        } else {
            sceneObj = scenes[sceneIndex];
        }

        if (!sceneObj || !sceneObj.dom) {
            return;
        }
        show(sceneObj, data);
    };

    this.changeScene = function(sceneIndex, data, ease) {
        var sceneObj = scenes[sceneIndex] || scenes[Number(sceneIndex)];
        //show next scene
        if (!sceneObj || !sceneObj.dom) {
            return;
        }
        show(sceneObj, data, ease);
    };

    return _this;

})("vacationPaper");
//相對路徑於首頁,router有改過 在 ctbcvacationAreaRegistration.cs
pageApp.addScene($("#index"), "/ctbcvacation");
pageApp.addScene($("#step1"), "/ctbcvacation/selectCountry");
pageApp.addScene($("#step2"), "/ctbcvacation/vacationPaper");
pageApp.addScene($("#step3"), "/ctbcvacation/result1");
pageApp.addScene($("#rule"), "/ctbcvacation/rule");
pageApp.addScene($("#rel"), "/ctbcvacation/rel");
pageApp.redirect = false;

(function($) {
    $.fn.backIndex = function(config) {
        $(this).click(function(e) {
            e.preventDefault();
            pageApp.changeScene(0, {}, true);
        });
        return this;
    };

    $('.js_backIndex').backIndex();
})($);

(function($) {
    $.fn.toRule = function(config) {
        $(this).click(function(e) {
            e.preventDefault();
            pageApp.changeScene(4, {}, true);
        });
        return this;
    };

    $('.js_toRule').toRule();
})($);

(function($) {
    $.fn.joinAction = function(config) {

        // 
        if (config == "join") {
            // location.search.indexOf('f=')==true -> location.search.indexOf('f=') >= true
            loginAndGetStatue.call(this, location.search.indexOf('f=') == true);
        }

        //this 參照到 呼叫者
        var dJoinButton = $(this);

        //ie8 show text
        // indexOf 返回 字符串值 在 字符串中首次出现的位置
        if (navigator.userAgent.indexOf('MSIE 8.0') > 0) {
            dJoinButton.css('overflow', 'visible').css('font-size', '2em');
        }

        dJoinButton.click(function(e) {
            e.preventDefault();
            _gaq.push(['_trackEvent', '中國信託NFC',
                '參加任務',
                '粉多網站, 點擊', 1, true
            ]);
            //this 參照 到 dJoinButton
            //如果要丟參數進去呢 在 這個狀況下(??)
            // loginAndGetStatue();->this參照的物件應該也是 dJoinButton
            loginAndGetStatue.call(this);
        });

        var loginAndGetStatue = function(outside) {
            /*if(FDO.cookie.read('pwd') === 'ctbc' || prompt("請輸入密碼文字。") === 'ctbc'){
                FDO.cookie.create('pwd', 'ctbc', 7);
            }
            else{
                pageApp.changeScene(0, {}, false);
                return;
            }*/
            //this 參照到 呼叫者
            var _this = $(this);
            var data = {};
            if (dJoinButton.hasClass('disable')) {
                return;
            }
            // outside 傳 true, false 使否為中信進入點
            //  true -> 整頁換loading頁
            if (outside) {
                $("body").loadingMask({
                    type: 'block'
                });
            }
            // 下行更正 -> dJoinButton.addClass('disable');
            dJoinButton.removeClass('disable');

            //先執行登入,在執行callBack
            FDO.common.FBLogin(function(loginRes) {
                $("body").loadingMask({});

                // 防呆 
                if (!loginRes) {
                    $("body").loadingMask({
                        action: 'hide'
                    });
                    dJoinButton.removeClass('disable');
                    return;
                }

                FB.api("/me", function(dataRes) {
                    if (!dataRes.error) {
                        data.name = dataRes.name;
                        data.photo = "http://graph.facebook.com/" + dataRes.id + "/picture?type=large&width=150&height=150";
                        data.authtoken = FB.getAccessToken();
                        $.ajax({
                            url: "/ctbcvacation/getStatus",
                            data: {
                                authtoken: data.authtoken
                            },
                            dataType: "JSON",
                            success: function(res) {
                                $.extend(data, res);
                                if (res.ErrMsg) {
                                    alert(ErrMsg);
                                } else {
                                    if (outside) {
                                        _gaq.push(['_trackEvent', '中國信託NFC',
                                            '參加任務',
                                            '粉多網站, 轉導, 確認參加', 1, true
                                        ]);
                                        pageApp.changeScene(data.toStep, data, false);
                                    } else {
                                        _gaq.push(['_trackEvent', '中國信託NFC',
                                            '參加任務',
                                            '粉多網站, 確認參加', 1, true
                                        ]);
                                        if (_this.data('ease') === false) {
                                            pageApp.changeScene(data.toStep, data, false);
                                        } else {
                                            $("#ctbcNFC").indexSpecial({
                                                callback: function() {
                                                    pageApp.changeScene(data.toStep, data, false);
                                                }
                                            });
                                        }
                                    }
                                }
                            },
                            complete: function() {
                                $("body").loadingMask({
                                    action: 'hide'
                                });
                                dJoinButton.removeClass('disable');
                            }
                        });
                    }
                });
            });
        };
        //plugIN 必備 Jq 鍵連機制
        return this;
    };

    $('.js_joinButton').joinAction();

})($);

(function($) {
    $.fn.loadingMask = function(opts) {
        // default configuration
        // config = {
        //     action: 'show',
        //     loadObj:{},
        //     type: 'block'
        // }
        var config = $.extend({}, {
            action: 'show',
            loadObj: {}
        }, opts);
        
        // main function
        function init(obj) {
            var dObj = $('body');
            var mainHeight = dObj.height() + 70;
            var html = [
                '    <div id="LoadingMask">',
                '        <div class="mask"></div>',
                '        <div class="sk-spinner sk-spinner-circle loadBox">',
                '            <div class="sk-circle1 sk-circle"></div>',
                '            <div class="sk-circle2 sk-circle"></div>',
                '            <div class="sk-circle3 sk-circle"></div>',
                '            <div class="sk-circle4 sk-circle"></div>',
                '            <div class="sk-circle5 sk-circle"></div>',
                '            <div class="sk-circle6 sk-circle"></div>',
                '            <div class="sk-circle7 sk-circle"></div>',
                '            <div class="sk-circle8 sk-circle"></div>',
                '            <div class="sk-circle9 sk-circle"></div>',
                '            <div class="sk-circle10 sk-circle"></div>',
                '           <div class="sk-circle11 sk-circle"></div>',
                '           <div class="sk-circle12 sk-circle"></div>',
                '        </div>',
                '    </div>'
            ].join('');

            config.loadObj = $(html);

            var maskResize = function() {
                //padding + width
                var w = window.innerWidth;
                var h = window.innerHeight;
                var ratio = window.devicePixelRatio || 1;


                $(config.loadObj).css({
                    width: w,
                    height: h
                });
            }();

            $(window).resize(function() {
                maskResize();
            });

            maskResize();

            switch (config.action) {
                case 'show':
                    $('body,html').css('overflow', 'hidden');
                    $(config.loadObj).appendTo('body');
                    TweenMax.to(config.loadObj, 1, {
                        opacity: '1',
                        onStart: function() {
                            $(config.loadObj).show();
                        }
                    });
                    break;
                case 'hide':
                    var thisLoadObj = dObj.find('#LoadingMask');
                    TweenMax.to(thisLoadObj, 1, {
                        opacity: '0',
                        onComplete: function() {
                            thisLoadObj.hide();
                            $(thisLoadObj).remove();
                            $('body,html').attr('style', '');
                            $(window).resize();
                        }
                    });
                    break;
                default:
                    return;
            }
        };

        function close(obj) {
            TweenMax.to(config.loadObj, 1, {
                opacity: '0'
            });
        };



        // initialize every element
        this.each(function() {
            init($(this));
        });

        return this;
    };
    // start
    $(function() {});

})(jQuery);

var ScreenBreak = 640;
(function($) {
    $.fn.indexSpecial = function(opts) {

        var run = function(obj) {
            var dModule = $(obj);
            var layer0 = dModule.find('.layer0');
            var layer1 = dModule.find('.layer1');
            var layer2 = dModule.find('.layer2');
            var layer3 = dModule.find('.layer3');
            var layer4 = dModule.find('.layer4');
            var slogan = dModule.find('#index .slogan');
            var easeType = "easeInCubic";
            var dJoinBtn = dModule.find('#index .goBtn');
            var joinTransition = new TimelineMax({
                repeat: 0,
                paused: true,
                onComplete: function() {
                    opts.callback();
                    $('.layer0,.layer1,.layer2,.layer3,.layer4').attr('style', '');
                    $('.wrapper').attr('style', '');
                    $('html').css('opacity', '');
                }
            });
            joinTransition
                .to(layer0, 2, {
                    backgroundPosition: '70% bottom',
                    bottom: '-180px',
                    ease: easeType
                }, 0)
                .to(layer1, 2, {
                    backgroundPosition: '-70% bottom',
                    bottom: '-180px',
                    ease: easeType
                }, 0)
                .to(layer2, 2, {
                    backgroundPosition: '100% bottom',
                    bottom: '-200px',
                    ease: easeType
                }, 0)
                .to(layer3, 2, {
                    backgroundPosition: '120% bottom',
                    bottom: '-200px',
                    ease: easeType
                }, 0)
                .to(layer4, 2, {
                    backgroundPosition: '-5% 200px',
                    ease: easeType
                }, 0)
                .to($('html'), 1, {
                    opacity: '0'
                }, 1);

            if (navigator.userAgent.indexOf("MSIE 8.0") > 0) {
                opts.callback();
            } else {
                $('.js_index').click();
                $('.wrapper').css('overflow', 'hidden');
                joinTransition.play();
            }
        }

        this.each(function() {
            run($(this));
        });

        return this;
    };
})(jQuery);

(function($) {
    $.fn.alertPopup = function(opts) {
        // default configuration
        var config = $.extend({}, {}, opts);
        // main function
        function init(obj) {
                var popHtml = ['      <div class="resultAlert" id="resultAlert" style="display:none;">',
                    '           <div class="container">',
                    '               <div class="grid">',
                    '                   <div class="box">',
                    '                           <p class="btnGrid">',
                    '                               <a class="aletBtn js_close" href="javascript:" title="確定">',
                    '                                   查看中獎結果',
                    '                               </a>',
                    '                           </p>',
                    '                   </div>  ',
                    '               </div>',
                    '           </div>',
                    '       </div>'
                ].join('');
                var $pop = $('#resultAlert');
                if (!$pop.length) {
                    $pop = $(popHtml);
                    $('body').append($pop);
                    var md = new MobileDetect(window.navigator.userAgent);
                    if (md.phone()) {
                        $pop.height(screen.height);
                        $pop.width(screen.width);
                    } else {
                        $pop.height($(window).height());
                        $pop.width($(window).width());
                    }
                    $pop.find('.js_close').click(function(e) {
                        e.preventDefault();
                        $('body').css('overflow', '');
                        $pop.fadeOut(100);
                    });
                }
                if (opts == 'close') {
                    $('body').css('overflow', '');
                    $pop.fadeOut(100);
                } else {
                    $('body').css('overflow', 'hidden');
                    $pop.fadeIn(300);
                }
            }
            // initialize every element
        this.each(function() {
            init($(this));
        });
        return this;
    };
})(jQuery);

//module 頁面流程控制 + 該頁邏輯
FDO.project.ctbcvacation = {
    version: function() {
        return "1.0.0.0";
    },
    index: function(module) {
        var dModule = $(module);
        var dJoinButton = dModule.find('.js_joinButton');
        var inited = false;
        this.change = function(_data) {
            $('html,body').scrollTop(0);
        };
        this.beforeChange = function() {
            var body = $('#ctbcNFC');
            body.addClass(body.data('indexclass')).removeClass(body.data('pageclass'));
        };
    },
    step1: function(module) {
        var dModule = $(module);
        var dCountryItems = dModule.find('.js_countryItem');
        var dNext = dModule.find('.js_next');
        var data = {};
        dCountryItems.click(function(e) {
            e.preventDefault();
            dCountryItems.removeClass('active');
            $(this).addClass('active');
            data.Country = $(this).data('country');
            data.Picture = $(this).data('picture');
            data.icon = $(this).data('icon');
            dNext.click();
        });
        dNext.click(function(e) {
            e.preventDefault();
            if (dNext.hasClass('disable')) {
                return;
            }
            //dNext.loadingMask({ type: 'block' });
            dNext.addClass('disable');
            $.ajax({
                url: "/ctbcvacation/getReason",
                dataType: "JSON",
                success: function(res) {
                    if (res.ErrMsg) {
                        alert(ErrMsg);
                    } else {
                        $.extend(true, data, res.Data);
                        $.ajax({
                            url: "/ctbcvacation/genVacationPaper",
                            data: data,
                            dataType: "html",
                            type: 'POST',
                            complete: function() {
                                dNext.loadingMask({
                                    action: 'hide'
                                });
                                dNext.removeClass('disable');
                            },
                            success: function(_res) {
                                if (!res) {
                                    alert("很抱歉，假單產生失敗，請重新整理後再次重試。");
                                } else {
                                    data.Picture = _res;
                                    pageApp.changeScene(2, data, true);
                                }
                            }
                        });
                    }
                }
            });
        });
        dNext.hide();
        this.change = function(_data) {
            data = _data || {};
            if (!data.Name && !data.name) {
                dModule.find('.js_joinButton').joinAction("join");
            }
            dNext.loadingMask({
                action: 'hide'
            });
            dNext.removeClass('disable');
            if (!data.Country) {
                //dCountryItems.eq(Math.floor(Math.random() * 5 - 0.01)).click();
            }
            $('html,body').scrollTop(0);
        };
        this.beforeChange = function() {
            var body = $('#ctbcNFC');
            body.addClass(body.data('pageclass')).removeClass(body.data('indexclass'));
        };
    },
    step2: function(module) {
        var dModule = $(module);
        var data = {};
        var dPrev = dModule.find('.js_prev');
        var dNext = dModule.find('.js_next');
        var dName = dModule.find('.js_name');
        var dResean = dModule.find('.js_resean');
        var dCountry = dModule.find('.js_country');
        var dAction = dModule.find('.js_action');
        var dPhoto = dModule.find('.js_photo');
        var name = "放假，跟著台灣虎航去旅行";
        var link = "https://www.ctbcbank.com/html/NFC/index.html";
        var caption = "中國信託NFC";
        var description = "台灣虎航全航線機票9折優惠免費送，再抽免費來回機票唷！立即產出最KUSO假單，甩開煩人公事即刻起航！這種好康，不搶對嗎？";
        dModule.saveResult = false;

        dPrev.click(function(e) {
            e.preventDefault();
            //dPrev.loadingMask({ type: 'block' });
            pageApp.changeScene(1, data, true);
            dPrev.loadingMask({
                action: 'hide'
            });
            _gaq.push(['_trackEvent', '中國信託NFC',
                '執行任務',
                '粉多網站, 更換理由', 1, true
            ]);
        });
        dNext.click(function(e) {
            if (dNext.hasClass('disable')) {
                return;
            }
            dNext.addClass('disable');
            //save and lottery
            dNext.loadingMask({
                type: 'block'
            });
            var md = new MobileDetect(window.navigator.userAgent);
            var fadeTime = 300;
            $.ajax({
                url: "/ctbcvacation/saveResult",
                data: data,
                dataType: "JSON",
                type: "POST",
                success: function(res) {
                    if (!res) {
                        alert("很抱歉，假單產生失敗，請重新整理後再次重試。");
                    } else {
                        res.Data.joined = true;
                        $.extend(data, res.Data);
                    }
                    dModule.saveResult = true;
                    _gaq.push(['_trackEvent', '中國信託NFC',
                        '完成任務',
                        '粉多網站', 1, true
                    ]);
                    if (md.phone()) {
                        //if (true) {
                        var ABSOLUTE_URI = "http://" + location.hostname + "/ctbcvacation/rel?f=share";
                        var redirect_uri = ABSOLUTE_URI;
                        var url = [
                            'https://www.facebook.com/dialog/feed?app_id=783511621702175',
                            '&display=touch',
                            '&name=', name,
                            '&description=', description,
                            '&caption=', caption,
                            '&picture=', encodeURIComponent(data.Picture),
                            '&link=', link,
                            '&redirect_uri=', redirect_uri
                        ].join('');
                        /*window.fbComplete = function (_loc) {
                            _opened.close();
                            if (_loc && _loc.href.indexOf('post_id=') > 0) {
                                _gaq.push(['_trackEvent', '中國信託NFC',
                        '分享任務',
                        '粉多網站, 完成分享, 手機', 1, true]);
                            }
                            else {
                                _gaq.push(['_trackEvent', '中國信託NFC',
                        '分享任務',
                        '粉多網站, 取消分享, 手機', 1, true]);
                            }
                        };*/
                        location = url;
                        //var _opened = window.open(url);
                        //setTimeout(function () {
                        //    pageApp.changeScene(3, data, true);
                        //}, 2000);
                    }
                },
                complete: function() {
                    dNext.loadingMask({
                        action: 'hide'
                    });
                    dNext.removeClass('disable');
                }
            });
            if (md.phone()) {
                //do nothing( in ajax do)
            } else {
                FB.ui({
                    method: 'feed',
                    link: link,
                    caption: caption,
                    description: description,
                    picture: data.Picture,
                    name: name
                }, function(result) {
                    if (result && result.post_id) {
                        _gaq.push(['_trackEvent', '中國信託NFC',
                            '分享任務',
                            '粉多網站, 完成分享', 1, true
                        ]);
                    } else {
                        _gaq.push(['_trackEvent', '中國信託NFC',
                            '分享任務',
                            '粉多網站, 取消分享', 1, true
                        ]);
                    }
                    if (dModule.saveResult) {
                        pageApp.changeScene(3, data, true);
                    } else {
                        var _s = setInterval(function() {
                            if (dModule.saveResult) {
                                pageApp.changeScene(3, data, true);
                                clearInterval(_s);
                            }
                        }, 100);
                    }
                });
            }
        });

        //for change scene
        this.change = function() {
            $('html,body').scrollTop(0);
        };
        this.beforeChange = function(_data) {
            $('html,body').scrollTop(0);
            data = _data;
            //init data
            dName.html(data.name);
            dResean.html(data.ReasonPart1Text);
            dCountry.html(data.Country);
            dAction.html(data.ReasonPart2Text);
            dPhoto.attr('src', _data.photo);
            //reset button
            dNext.loadingMask({
                action: 'hide'
            });
            dPrev.loadingMask({
                action: 'hide'
            });
            dNext.removeClass('disable');
            dPrev.removeClass('disable');
            var body = $('#ctbcNFC');
            body.addClass(body.data('pageclass')).removeClass(body.data('indexclass'));
            if ($(window).width() < ScreenBreak) {
                $(".pageLayout .wrapper").scrollTipInfo();
            }
        };
    },
    step3: function(module) {
        var dModule = $(module);
        var dResult1 = dModule.find('.js_result1');
        var dResult2 = dModule.find('.js_result2');
        var dToCountry = dModule.find('.js_toCountry');
        var dPhoto = dModule.find('.js_photo');
        var dName = dModule.find('.js_name');
        var dIcon = dModule.find('.js_icon');

        //for change scene
        this.change = function(_data) {
            $('html,body').scrollTop(0);
            if (_data.joined) {
                $('body').alertPopup();
            }
        };
        this.beforeChange = function(_data) {
            var body = $('#ctbcNFC');
            body.addClass(body.data('pageclass')).removeClass(body.data('indexclass'));
            if (_data.LotteryResult) {
                dPhoto.attr('src', _data.photo);
                dName.html(_data.name);
                dToCountry.html($('[data-country="' + _data.Country + '"]').data('encountry'));
                dIcon.attr('src', $('[data-country="' + _data.Country + '"]').data('icon'));
                dResult1.show();
            } else {
                dResult2.show();
            }
            if ($(window).width() < ScreenBreak) {
                $(".pageLayout .wrapper").scrollTipInfo();
            }
        };
    },
    rule: function(module) {
        this.change = function() {
            $('html,body').scrollTop(0);
        };
        this.beforeChange = function() {
            var body = $('#ctbcNFC');
            body.addClass(body.data('pageclass')).removeClass(body.data('indexclass'));
            _gaq.push(['_trackEvent', '中國信託NFC',
                '查看規則',
                '粉多網站', 1, true
            ]);
            if ($(window).width() < ScreenBreak) {
                $(".pageLayout .wrapper").scrollTipInfo();
            }
        };
    },
    rel: function() {
        this.beforeChange = function(module) {
            var body = $('#ctbcNFC');
            body.addClass(body.data('indexclass')).removeClass(body.data('pageclass'));
            FBUtil.after(function() {
                $(module).joinAction("join");
            });

            if (location.href.indexOf('post_id=') >= 0) {
                _gaq.push(['_trackEvent', '中國信託NFC',
                    '分享任務',
                    '粉多網站, 完成分享, 手機', 1, true
                ]);
                $('body').alertPopup();
            } else if (location.hash.indexOf('#_=_') >= 0 && location.href.indexOf('post_id=') < 0) {
                _gaq.push(['_trackEvent', '中國信託NFC',
                    '分享任務',
                    '粉多網站, 取消分享, 手機', 1, true
                ]);
                $('body').alertPopup();
            }
        };
    }
};

(function() {
    var doIfExist = function(id, module) {
        var el = document.getElementById(id);
        module = module || id;
        if (el) {
            FDO.project.ctbcvacation[module].call(el, el);
        }
    };
    doIfExist("index");
    doIfExist("step1");
    doIfExist("step2");
    doIfExist("step3");
    doIfExist("rule");
    doIfExist("rel");
    pageApp.initScene(location.pathname.replace(/\/$/g, ''));
    $(window).unload(function() {
        if ($('#step1,#step2').filter(':visible').length > 0) {
            _gaq.push(['_trackEvent', '中國信託NFC',
                '參加任務',
                '粉多網站, 跳離, ' + $('#step1,#step2').filter(':visible').attr('id'), 1, true
            ]);
        }
    });
    if (navigator.userAgent.indexOf('MSIE 8.0') > 0) {
        alert("您用的瀏覽器過舊，可能無法正常瀏覽頁面，若想要得到完整體驗，請改用新版瀏覽器(IE9以上、Firefox、Chrome)瀏覽。");
    }
})();

if (/iPad|iPhone/.test(navigator.userAgent) && !/Safari/.test(navigator.userAgent) &&
    location.hash.indexOf('#_=_') < 0 && //share back url
    location.href.indexOf('f=') < 0) { //login back url
    alert('建議使用Safari或Chrome等瀏覽器檢視，以獲得完整的體驗。');
}

var scripts = document.getElementsByTagName('script');
var index = scripts.length - 1;
var currentScript = scripts[index];
//myScript.getAttrbite("data-appid")

if(currentScript.getAttribute("data-appid") == null){
    throw("error,missing appid");
}

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