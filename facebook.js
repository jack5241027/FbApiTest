var FBHUB = {
    init: (function() {
        window.fbAsyncInit = function() {
            FB.init({
                appId: '609847775785632',
                xfbml: true,
                version: 'v2.3'
            });

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
        if (this.inited) fn(FB);
        else
            this.queue.push(fn);
    },
    logIn: function() {
        FB.getLoginStatus(function(response) {
            if (response.status === 'connected') {
                console.log('Logged in.');
            } else {
                FB.login();
            }
        });
    },
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
    getFriend: function(response) {

    },
    getMyFeeds: function(response) {

    }
}
