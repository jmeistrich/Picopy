(function (f, $, undefined) {
    var v = f.v = f.v || {
        googleId: "",
        picasaData: {},
        loggedIn: false
    }

    f.login = function()
    {
        var url = "https://accounts.google.com/o/oauth2/auth";
        var client_id = "905742775678.apps.googleusercontent.com";
        var redirect_uri = "http://picopy.co";
        var scope = "https://picasaweb.google.com/data/";

        var str = url + "?scope="+encodeURIComponent(scope)+
                        "&redirect_uri="+encodeURIComponent(redirect_uri)+
                        "&response_type=token"+
                        "&client_id="+client_id;

        $('#googleLogin').click(function()
        {
            window.location = str;
        });
        $('#googleLogout').click(function()
        {
            $.cookie("googleLogin",null);
            v.loggedIn = false;
            transitionDiv('divGoogleLoggedIn', 'divGoogleLogin', function() {
                // $("#googleProfileImage").attr('src', null);
            });
        });

        console.log("Logging in");
        var token = getHashByName("access_token");
        if(token)
        {
            v.googleId = token;
            $.cookie("googleLogin", v.googleId);

            document.location.href='#';
        }
        else
        {
            v.googleId = $.cookie("googleLogin");
        }
        if(v.googleId)
        {
            var url = "https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=" + v.googleId;
            $.ajax({
                url: url, 
                dataType: 'jsonp',
                success: function(data) {
                    console.log(data);
                    if(data.error)
                    {
                        v.googleId = undefined;
                        $.cookie("googleLogin", v.googleId);
                        v.loggedIn = false;
                        transitionDiv('divGoogleLoggedIn', 'divGoogleLogin', function() {
                        });
                    }
                    else
                    {
                        v.loggedIn = true;
                        $('#googleLogin').remove('highlightError');
                        transitionDiv('divGoogleLogin', 'divGoogleLoggedIn', function() {
                        });
                    }
                },
                failure: function(data) {
                    console.log("Failure in google verification:");
                    console.log(data);
                }
            });
        }
        else
        {
            v.loggedIn = false;
            transitionDiv('divGoogleLoggedIn', 'divGoogleLogin', function() {
            });
        }
    }

	f.load = function(onComplete)
	{
        loadPicasa(onComplete);
	}

    f.logout = function()
    {
        console.log("Logout");
    }

    f.onLogin = function()
    {
    }

    f.createAlbum = function(albumName, link, onComplete)
    {
    }

    f.uploadImage = function(albumId, img, onComplete)
    {
    }

	f.getImages = function (albumId, onComplete) {
		getPicasaImages(picasaData[albumId].id, function(ims)
		{
			onComplete(ims);
		});
	}

    f.highlight = function()
    {
        $('#googleLogin').addClass('highlightError');
    }

	function loadPicasa(onComplete)
	{
		$("#loadingLeft").fadeIn();
		getPicasaAlbums(v.googleId, function(user,albums)
		{
			picasaData = albums;
			$("#googleProfileImage").attr('src', user.thumbnail);
			onComplete(picasaData, user.thumbnail);
		});
	}

	function getPicasaImages(album, callback) {
        var url = "https://picasaweb.google.com/data/feed/api/user/default/albumid/:album_id?access_token=:access_id&alt=json&kind=photo&hl=en_US&imgmax=800&fields=entry(title,content,link,gphoto:numphotos,media:group(media:content,media:thumbnail,media:description))";
        url = url.replace(/:album_id/, album).replace(/:access_id/,v.googleId);

        var image = null;
        var images = [];
        $.getJSON(url, function(data) {
            $.each(data.feed.entry, function(i, element) {
                // console.log(element);
                image = element["media$group"]["media$content"][0];
                image.large = element["content"].src;
                image.title = element.title["$t"];
                image.description = element["media$group"]["media$description"]["$t"];
                image.thumbs = [];
                $.each(element, function(index, links) {
                    if ($.isArray(links)) {
                        for (link in links) {
                            if (links[link]["rel"] == "alternate") {
                                image.link = links[link].href;
                            }
                        }
                    }
                });
                var minX = 10000;
                var minImg = "";
                $.each(element["media$group"]["media$thumbnail"], function(j, j_element) {
                    if(j_element.width < minX)
                    {
                        minX = j_element.width;
                        minImg = j_element.url;
                    }
                    image.thumbs.push(j_element);
                });
                image.minThumb = minImg;
                images.push(image);
            });
            callback(images);
        });
    }

	function getPicasaAlbums(user, callback) {
        var url = "https://picasaweb.google.com/data/feed/api/user/default?access_token=:user_id&alt=json&kind=album&hl=en_US&access=visible&fields=gphoto:nickname,gphoto:thumbnail,entry(id,link,gphoto:numphotos,media:group(media:content,media:description,media:keywords,media:title,media:thumbnail))";
        url = url.replace(/:user_id/, user);
        // console.log(url);

        $.getJSON(url, function(data) {
            // console.log(data);
            var user = {
                nickname: data.feed["gphoto$nickname"]["$t"],
                thumbnail: data.feed["gphoto$thumbnail"]["$t"]
            }
            var album = null;
            var albums = [];
            $.each(data.feed.entry, function(i, element) {
                album = {
                    id: element.id["$t"].split("?")[0].split("albumid/")[1],
                    count: element["gphoto$numphotos"]["$t"],
                    name: element["media$group"]["media$title"]["$t"],
                    description: element["media$group"]["media$description"]["$t"],
                    thumb: element["media$group"]["media$thumbnail"][0]["url"]
                }
                $.each(element, function(index, links) {
                    if ($.isArray(links)) {
                        for (link in links) {
                            if (links[link]["rel"] == "alternate") {
                                album.link = links[link].href;
                            }
                        }
                    }
                });
                // album.images = function(callback) {
                //     $.picasa.images(user, album.id, callback);
                // }
                albums.push(album);
            });
            callback(user, albums);
        });
    }

}( window.GoogleSync = window.GoogleSync || {}, jQuery ));