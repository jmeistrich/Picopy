(function (f, $, undefined) {
	f.load = function(onComplete)
	{
		if($.cookie("googleLogin") != null)
		{
			generateFakeAlbums(onComplete);
		}
	}

	f.createAlbum = function(albumName, link, onComplete)
	{
		onComplete("1");
	}

	f.uploadImage = function(albumId, img, onComplete)
	{
		setTimeout(onComplete, 100);
	}

	f.getImages = function(id, onComplete)
	{
		generateFakeImages(id, onComplete);
	}

	function generateFakeImages(id, onComplete)
	{
		var images = [];
		for (var i = 0; i < 34; i++)
		{
			var image = {
				large: "/fakedata/images/" + (i + 1) + ".JPG",
				name: i + ".jpg",
				description: "",
				thumbs: ["/fakedata/images/" + (i + 1) + ".JPG"],
				minThumb: "/fakedata/images/" + (i + 1) + ".JPG"
			}
			images.push(image);
		}
		onComplete(images);
	}

	function generateFakeAlbums(onComplete)
	{
		var albums = [];
		for (var i = 0; i < 4; i++)
		{
			var album = {
				id: i,
				numphotos: 34,
				name: "Chiang Mai",
				thumb: "/fakedata/images/1.JPG"
			}
			albums.push(album);
		}
		onComplete(albums, "/fakedata/images/3.JPG");
	}
}(window.fakeLeft = window.fakeLeft || {}, jQuery));
