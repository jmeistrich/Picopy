(function(f, $, undefined)
{
	var v = f.v = f.v || {
		onLoadComplete: {},
		albums: []
	}

	f.load = function(onComplete)
	{
		onLoadComplete = onComplete;
		addScript("http://connect.facebook.net/en_US/all.js", loadFacebook);
	}

	f.logout = function()
	{
		console.log("logging out of facebook");;
		FB.logout(function(response)
		{
			$(".fb_button_text").text('Facebook Login');
			transitionDiv('divFacebookLoggedIn', 'divFacebookLogIn', function()
			{
				$("#facebookProfileImage").attr('src', null);
			});
		});
	}

	f.onLogin = function()
	{
		FB.getLoginStatus(function(response)
		{
			if (response.status === 'connected')
			{
				console.log("facebook is logged in");
				$(".fb_button_text").text('Facebook Logout');
				$("#loadingRight").fadeIn();
				getFacebookMe();
				getFacebookAlbums(0);

				transitionDiv('divFacebookLogIn', 'divFacebookLoggedIn', function()
				{});
			}
			else
			{
				transitionDiv('divFacebookLoggedIn', 'divFacebookLogIn', function()
				{
					$("#facebookProfileImage").attr('src', null);
				});
			}
		});
	}

	f.createAlbum = function(albumName, link, onComplete)
	{
		FB.api('/me/albums/', 'post', {
			name: albumName,
			description: 'Original: ' + link
		}, function(response)
		{
			if (!response || response.error)
			{
				alert('Error occured');
			}
			else
			{
				onComplete(response.id);
			}
		});
	}

	f.uploadImage = function(albumId, img, onComplete)
	{
		FB.api('/' + albumId + '/photos', 'post', {
			message: img.description + '\n\nOriginal: ' + img.link,
			url: img.large
		}, function(response)
		{
			if (!response || response.error)
			{
				alert('Error occured');
				console.log('Error occured');
				console.log(response.error);
			}
			else
			{
				console.log(img.large + ' Post ID: ' + response.id);
				onComplete();
			}
		});
	}

	function getFacebookMe()
	{
		FB.api('/me?fields=picture', function(response)
		{
			$("#facebookProfileImage").attr('src', response.picture.url);
		});
	}

	function getFacebookAlbums(offset)
	{
		var address = '/me/albums?limit=25&offset=' + offset;
		FB.api(address, function(response)
		{
			if (response.data.length == 0)
			{
				onLoadComplete(v.albums);
				// isFBReady = true;
				// doCompare();	
			}
			else
			{
				for (var i = 0; i < response.data.length; i++)
				{
					v.albums.push(response.data[i]);
				}
				getFacebookAlbums(offset + 25);
			}
		});
	}

	f.getImages = function(albumId, onComplete)
	{
		var images = [];
		_getImages(images, albumId, 0, onComplete);
	}

	function _getImages(images, albumId, offset, onComplete)
	{
		var address = '/' + albumId + '/photos?limit=25&offset=' + offset;
		FB.api(address, function(response)
		{
			console.log(address);
			if (response.data.length == 0)
			{
				onComplete(images);
			}
			else
			{
				for (var i = 0; i < response.data.length; i++)
				{
					images.push(response.data[i]);
				}
				_getImages(images, albumId, offset + 25, onComplete);
			}
		});
	}

	function loadFacebook()
	{
		FB.init(
		{
			appId: '122592874445629',
			status: true,
			// check login status
			cookie: true,
			// enable cookies to allow the server to access the session
			xfbml: true // parse XFBML
		});

		FB.getLoginStatus(function(response)
		{
			if (response.status === 'connected')
			{
				$(".fb_button_text").text('Facebook Logout');
				f.onLogin();
			}
			else
			{
				$(".fb_button_text").text('Facebook Login');
				transitionDiv('divFacebookLoggedIn', 'divFacebookLogIn', function()
				{});
			}
		});
	}

}(window.facebookSync = window.facebookSync || {}, jQuery));