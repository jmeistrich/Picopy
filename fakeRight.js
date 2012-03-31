(function (pub, $, undefined) {
	pub.load = function (onComplete)
	{
		onComplete([]);
	}

	pub.createAlbum = function(albumName, link, onComplete)
	{
		onComplete("1");
	}

	pub.uploadImage = function(albumId, img, onComplete)
	{
		setTimeout(onComplete, 100);
	}

}( window.fakeRight = window.fakeRight || {}, jQuery ));
