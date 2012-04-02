(function (f, $, undefined) {
	f.createAlbum = function(albumName, link, onComplete)
	{
		onComplete("1");
	}

	f.uploadImage = function(albumId, img, onComplete)
	{
		setTimeout(onComplete, 100);
	}

	f.load = function(onComplete)
	{
		generateFakeAlbums(onComplete);
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
		for (var i = 0; i < 8; i++)
		{
			var album = {
				id: i+8,
				numphotos: 34,
				name: "Chiang Mai2",
				thumb: "/fakedata/images/1.JPG"
			}
			albums.push(album);
		}
		onComplete(albums);
	}
}( window.fakeRight = window.fakeRight || {}, jQuery ));
