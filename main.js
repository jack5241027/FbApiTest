$(document).ready(function() {
    fbHub.init();
    $('#logInFB').click(function() {
        fbHub.logIn(true);
    })

    $('#getMe').click(function() {
        FB.getLoginStatus(function(response) {
            fbHub.getme(response);
        });
    });

    $('#getMyFriends').click(function() {
        FB.getLoginStatus(function(response) {
            fbHub.getFriends(response);
        });
    });

    $('#getMyFeeds').click(function() {
        FB.getLoginStatus(function(response) {
            fbHub.getMyFeeds(response);
        });
    });
    $('#postFeeds').click(function() {
        FB.getLoginStatus(function(response) {
            fbHub.postFeeds(response);
        });
    });

    $(document).on('click', '.tagId', function(event) {
        if ($(this).prop("checked")) {
            var friendName = $(this).prev().text();
            fbHub.tagListAry.push(fbHub.tagFriendListAry[friendName]);
            console.log(fbHub.tagFriendListAry[friendName]);
        }
    });
});
