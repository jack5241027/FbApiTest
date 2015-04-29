var FBHUB = {
        a: 0,
        init: (function() {
            window.fbAsyncInit = function() {
                FB.init({
                    appId: '609847775785632',
                    xfbml: true,
                    version: 'v2.3'
                });
                FBHUB.logIn();
            };

            (function(d, s, id) {
                var js, fjs = d.getElementsByTagName(s)[0];
                if (d.getElementById(id)) {
                    return;
                }
                js = d.createElement(s);
                js.id = id;
                js.src = "//connect.facebook.net/en_US/sdk.js";
                fjs.parentNode.insertBefore(js, fjs);
            }(document, 'script', 'facebook-jssdk'));

        })(),
        after: function(fn) {
            if (this.inited) fn();
            else
                this.queue.push(fn);
        },
        logIn: (function() {
            var router = false;
            return function(getIn) {
                FB.getLoginStatus(function(response) {
                    if (response.status === 'connected') {
                        console.log('Logged in.');
                    } else if (router) {
                        alert('提醒，執行所有功能都要登入喔!!')
                    } else if (getIn) {
                        FB.login();
                    } else {
                        var res = confirm('你還沒登入喔!要幫你導向嗎?');
                        if (res) {
                            router = true;
                            FB.login(FBHUB.logIn);
                        } else {
                            alert('提醒，執行所有功能都要登入喔!!')
                        }
                    }
                });
            }
        })(),
        getme: function(response) {
            FB.api('/me', function(response) {
                var html = "";
                for (var key in response) {
                    html += "<pre>";
                    html += key + " : " + response[key];
                    html += "</pre>";
                }
                $('#tab2').html(html);
            });
        },
        getFriend: (function(response) {
                var count = 0;

                $.ajax({
                    url: "/",
                    complete: function() {
                            count += 1;
                            var a = count;
                            console.log(count);
                            setTimeout(function(){console.log(a)},1000);
                    }
                });

                $.ajax({
                    url: "/",
                    complete: function() {
                            count += 3;
                            console.log(count);
                    }
                });
                console.log(count);
        })(),
    getMyFeeds: function(response) {

    }
}
