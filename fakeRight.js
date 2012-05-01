(function (f, $, undefined) {
	f.login = function()
	{}

	f.load = function(onComplete)
	{
		generateFakeAlbums(onComplete);
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

	f.highlight = function()
    {
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
		for (var i = 0; i < 8; i++)
		{
			var album = {
				id: i+8,
				numphotos: 34,
				name: "Chiang Mai2",
				thumb: "/fakedata/images/2.JPG"
			}
			albums.push(album);
		}
		onComplete(albums, "/fakedata/images/2.JPG");
	}
}( window.fakeRight = window.fakeRight || {}, jQuery ));
