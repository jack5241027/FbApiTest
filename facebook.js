var fbHub = {
    init: function() {
        // window.fbAsyncInit = function() {
        FB.init({
            appId: '609847775785632',
            xfbml: true,
            version: 'v2.3'
        });
        fbHub.logIn();
        // };
        // (function(d, s, id) {
        //     var js, fjs = d.getElementsByTagName(s)[0];
        //     if (d.getElementById(id)) {
        //         return;
        //     }
        //     js = d.createElement(s);
        //     js.id = id;
        //     js.src = "//connect.facebook.net/en_US/sdk.js";
        //     fjs.parentNode.insertBefore(js, fjs);
        // }(document, 'script', 'facebook-jssdk'));

    },
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
                    FB.login(function(response) {}, {
                        scope: 'publish_actions',
                        return_scopes: true
                    });
                } else {
                    var res = confirm('你還沒登入喔!要幫你導向嗎?');
                    if (res) {
                        router = true;
                        FB.login(function(response) {
                            fbHub.logIn;
                        }, {
                            scope: 'publish_actions',
                            return_scopes: true
                        });
                    } else {
                        confirm('提醒，執行所有功能都要登入喔!!')
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
    getFriends: function(response) {
        FB.api('/me/taggable_friends', function(response) {
            var htmlData = "";
            var jsonData = "";
            var limit = 40;
            var count = 0;
            for (var key in response.data) {
                if (count <= limit) {
                    var friend = response.data[key];
                    var friend_name = friend.name;
                    var friend_image = friend.picture.data.url;

                    htmlData += "<li class='friend-item'>";
                    htmlData += "<img src='" + friend_image + "'>";
                    htmlData += "<a>" + friend_name + "</a>";
                    htmlData += "</li>";
                    count++;
                }

            }
            $('.friends-list').html(htmlData);
        });
    },
    getMyFeeds: function(response) {

    }
}
