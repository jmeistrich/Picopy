(function (f, $, undefined)
{
	var v = f.v = f.v || {
		onLoadComplete: {},
		albums: [],
		accessToken: {},
		loggedIn: false
	}

	f.login = function()
	{
		addScript("http://connect.facebook.net/en_US/all.js", loadFacebook);
	}

	f.load = function(onComplete)
	{
		v.onLoadComplete = onComplete;
		getFacebookAlbums(0);
	}

	f.logout = function()
	{
		FB.logout(function(response)
		{
			$(".fb_button_text").text('Facebook Login');
			v.loggedIn = false;
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
				$(".fb_button_text").text('Facebook Logout');
				$("#loadingRight").fadeIn();
				v.loggedIn = true;
		        $('.fb_button').removeClass('highlightError');
				transitionDiv('divFacebookLogIn', 'divFacebookLoggedIn', function()
				{});
			}
			else
			{
				v.loggedIn = false;
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
				console.log('Facebook: Error creating album');
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
				console.log('Facebook: Error uploading image, trying again.');
				console.log(response.error);
				f.uploadImage(albumId, img, onComplete);
			}
			else
			{
				onComplete();
			}
		});
	}

	f.getImages = function(albumId, onComplete)
	{
		var images = [];
		_getImages(images, albumId, 0, onComplete);
	}

	f.highlight = function()
    {
        $('.fb_button').addClass('highlightError');
    }

	function getFacebookAlbums(offset)
	{
		var address = '/me/albums?limit=25&offset=' + offset;
		FB.api(address, function(response)
		{
			if (response.data.length == 0)
			{
				v.onLoadComplete(v.albums);
			}
			else
			{
				var album = null;
				for (var i = 0; i < response.data.length; i++)
				{
					var element = response.data[i];
					album = {
						id: element.id,
						count: element.count,
						name: element.name,
						description: element.description,
						thumb: "https://graph.facebook.com/"+element.id+"/picture&type=album&access_token="+v.access_token,
						link: element.link
					}
					v.albums.push(album);
				}
				getFacebookAlbums(offset + 25);
			}
		});
	}

	function _getImages(images, albumId, offset, onComplete)
	{
		var address = '/' + albumId + '/photos?limit=25&offset=' + offset;
		FB.api(address, function(response)
		{
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
			cookie: true,
			xfbml: true
		});

		FB.getLoginStatus(function(response)
		{
			if (response.status === 'connected')
			{
				v.access_token = response.authResponse.accessToken;
				$(".fb_button_text").text('Facebook Logout');
				f.onLogin();
			}
			else
			{
				$(".fb_button_text").text('Facebook Login');
				transitionDiv('divFacebookLoggedIn', 'divFacebookLogIn');
			}
		});
	}
}(window.FacebookSync = window.FacebookSync || {}, jQuery));