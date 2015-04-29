$(document).ready(function() {

    $('#logInFB').click(function() {
    	FBHUB.logIn(true);
    })

    $('#getMe').click(function() {
        FB.getLoginStatus(function(response) {
            FBHUB.getme(response);
        });
    });

});
