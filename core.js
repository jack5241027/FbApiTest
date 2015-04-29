(function() {

    // var appId = '1052783271416275';
    // var url = 'http://localhost/FbApiTest/index.html';

    // window.fbAsyncInit = function() {
        FB.init({
            appId: '609847775785632',
            xfbml: true,
            version: 'v2.3'
        });

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

    function getFriends() {
        //taggable_friends
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
            // $(".friends-list").html(jsonData.stringify());

        });

    }

    function getMe() {
        FB.api('/me', function(response) {
            var htmlData = "";
            for (var key in response) {
                htmlData += "<pre>";
                htmlData += key + " : " + response[key];
                htmlData += "</pre>";
            }
            $('#tab2').html(htmlData);
        });
    }

    function getMyFeeds() {
        FB.api('/me/Feed', function(response) {
            var htmlData = "";
            for (var key in response.data) {
                var feed = response.data[key];
                var picture = feed.picture;
                var story = feed.story;
                var createTime = feed.created_time;
                var comments = feed.comments.data;

            }
        });

    }

    function testAPI() {
        console.log('Welcome!  Fetching your information.... ');
        FB.api('/me', function(response) {
            console.log('Successful login for: ' + response.name);
            $('#tab2').text('Thanks for logging in, ' + response.name + '!');
        });
    }

    $('#logInFB').click(function() {
        FB.getLoginStatus(function(response) {
            if (response.status === 'connected') {
                console.log('Logged in.');
            } else {
                FB.login();
            }
        });
    })

    $('#getMe').click(function() {
        FB.getLoginStatus(function(response) {
            // testAPI(response);
            getMe(response);
        });
    });

    $('#getFriends').click(function() {
        FB.getLoginStatus(function(response) {
            getFriends(response);
        });
    });

    $('#getMyFeeds').click(function() {
        FB.getLoginStatus(function(response) {
            getMyFeeds(response);
        });
    });

})();
