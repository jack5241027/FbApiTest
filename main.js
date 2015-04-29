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

     $('#getFriends').click(function() {
        FB.getLoginStatus(function(response) {
            fbHub.getFriends(response);
        });
    });

});
