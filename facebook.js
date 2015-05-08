var fbHub = {
    tagListAry:[],
    tagFriendListAry:{},
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
                    alert('éï¼ŒåŸ·è¡Œæ‰å½éƒ½è¦ç™»¥å!!')
                } else if (getIn) {
                    FB.login(function(response) {}, {
                        scope: 'user_posts',
                        return_scopes: true
                    });
                } else {
                    var res = confirm('ä½ éæ²’ç™»¥å!è¦å¹«ä½ å‘å?');
                    if (res) {
                        router = true;
                        FB.login(fbHub.logIn, {
                            scope: 'user_posts',
                            return_scopes: true
                        });
                    } else {
                        confirm('éï¼ŒåŸ·è¡Œæ‰å½éƒ½è¦ç™»¥å!!')
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
        FB.api('/me/taggable_friends?limit=5000', function(response) {
            var htmlData = "";
            var jsonData = "";
            var limit = 1800;
            var count = 0;
            console.log(response.data);
            for (var key in response.data) {
                if (count <= limit) {
                    var friend = response.data[key];
                    var friend_id = friend.id;
                    var friend_name = friend.name;
                    var friend_image = friend.picture.data.url;

                    htmlData += "<li class='friend-item'>";
                    htmlData += "<img src='" + friend_image + "'>";
                    htmlData += "<a>" + friend_name + "</a>";
                    // htmlData += "<a href=https://www.facebook.com/"+ friend_id +">" + friend_name + "</a>";
                    htmlData += "<input type='checkbox' class='tagId' autofocus>";
                    htmlData += "</li>";
                    fbHub.tagFriendListAry[friend_name]=friend_id;
                    count++;
                }
            }
            $('.friends-list').html(htmlData);

        });
    },
    getMyFeeds: function(response) {
        FB.api('/me/Feed', function(response) {
            var htmlData = "";
            for (var key in response.data) {
                htmlData += "<pre>";
                htmlData += key + " : " + response.data[key].message;
                htmlData += "</pre>";
            }
            $('.feed-list').html(htmlData);
        });

    },
    postFeeds: function() {
        var attachment = {
            "message": "sadfsdafsdfsadf",
            "link": "https://msdn.microsoft.com/zh-tw/library/system.object.gettype%28v=vs.110%29.aspx",
            "picture": "http://image.uisdc.com/wp-content/uploads/2015/04/20150427180532134-630x360.jpg",//圖不能太小
            "name":"GG",//複寫 預覽link 標題
            "caption":"GGG",//複寫 預覽link 最後一層描述
            "description":"GGGGGGG",//複寫 預覽link 第二層描述
            "actions": [{
                "name": "photos",
                "link": "https://msdn.microsoft.com/zh-tw/library/system.reflection.fieldinfo.getvalue%28v=vs.110%29.aspx"
            }],//加了不能tag朋友!!!
            "place":"647158178704039",//與tag共存
            "tags":fbHub.tagListAry[0]
        }
        FB.api(
            "/me/feed",
            "POST",attachment,
            function(response) {
                if (response && !response.error) {
                    /* handle the result */
                    console.log(response.id);
                }
            }
        );
    }
}
