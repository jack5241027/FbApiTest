
(function(d, s, id){
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));


window.fbAsyncInit = function() {
var appId = '1497988213797987';
var url = 'http://localhost/FaceBookApiTest/index.html';

FB.init({
    appId      :appId,
    status:true,	
    xfbml      : true,
    version    : 'v2.3'
});

    FB.getLoginStatus(function(response){
	if(response.status === 'connected'){
	    var uid = response.authResponse.userID;
	    GetMeFriends(uid);
	}else{
	    window.top.location.href = "http://www.facebook.com/connect/uiserver.php?app_id="
	+ encodeURIComponent(appId)
	+ "&next="
	+ encodeURIComponent(url)
	+
	"&display=popup&perms=email,user_friends,user_birthday,user_likes&fbconnect=1&method=permissions.request";
	}
    });

}

function GetMeFriends(uid){
    FB.api('/me/friends', function(response) {
	var test = response;	 
	if (response.error) {
	    console.log(response.error);
	}
    });

}




