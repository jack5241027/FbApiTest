$(document).ready(function() {
    $('#logInFB').click(function() {
    	FBHUB.logIn();
    })

    $('#getMe').click(function() {
        FB.getLoginStatus(function(response) {
            FBHUB.getme(response);
        });
    });


});
