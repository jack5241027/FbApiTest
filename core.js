

(function(){

    var appId = '1497988213797987';
    var url = 'http://localhost/FaceBookApiTest/index.html';

    FB.init({
	appId:appId,
	xfbml:true,
	version:'v2.3'
    });


    FB.getLoginStatus(function(response){
	if(response.status === 'connected'){
	    var uid = response.authResponse.userID;
	    getMeFriends();
	    getMe();
	    getMeFeed();
	}else{
	    window.top.location.href = "http://www.facebook.com/connect/uiserver.php?app_id="
	+ encodeURIComponent(appId)
	+ "&next="
	+ encodeURIComponent(url)
	+
	"&display=popup&perms=email,user_friends,user_birthday,user_likes&fbconnect=1&method=permissions.request";
	}
    });

    function getMeFriends(){
	//taggable_friends
	FB.api('/me/taggable_friends', function(response) {
	    var htmlData ="";
	    var jsonData ="";
	    var limit = 40;
	    var count =0;
	    for (var key in response.data){
		if (count <= limit){
		    var friend = response.data[key];
		    var friend_name = friend.name;
		    var friend_image = friend.picture.data.url;

		    htmlData += "<li class='friend-item'>";
		    htmlData += "<img src='" + friend_image +"'>";
		    htmlData += "<a>" + friend_name + "</a>";
		    htmlData += "</li>";
		    count ++;
		}

	    }
	    $('.friends-list').html(htmlData);	
	   // $(".friends-list").html(jsonData.stringify());

	});

    }
    function getMe(){
	FB.api('/me', function(response) {
	    var htmlData ="";
	    for (var key in response){
		htmlData += "<pre>";
		htmlData +=  key + " : " + response[key];
		htmlData += "</pre>";
	    }
	    $('#tab2').html(htmlData);
	     
	});
    }

    function getMeFeed(){
	FB.api('/me/Feed',function(response){
	    var htmlData= "";	
	    for (var key in response.data){
               var feed = response.data[key];
	       var picture = feed.picture;
	       var story = feed.story;
	       var createTime = feed.created_time;
	       var comments = feed.comments.data;

	    }	    
	});

    }



})(); 





