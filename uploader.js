var isLocal = false;

(function(f, $, undefined) {

var v = f.v = f.v || {
	leftSide: {},
	rightSide: {},
	isLeftReady: false,
	isRightReady: false,

	leftData: {},
	rightData: {},

	useFakeData: false,
	doUpload: true,
	albumOrder: [],
	partialId: {},

	testVar: {}
};

function test()
{
	v.testVar = "basdfasfasd";
}

f.testSync = function()
{
	f.clearTable();
	onLoad();
	// f.toggle($("#tableRow0"));

	// f.sync();

	// test();
}

f.testFacebookImages = function()
{
	// console.log(v.testVar);
}

f.clearTable = function()
{
	$.each($("#tableNotOnFacebook div"), function(index, row)
	{
		$(row).remove();
	});

	$.each($("#tableOnFacebook div"), function(index, row)
	{
		$(row).remove();
	});
}

f.toggle = function(item)
{
	var it = $(item);

	if(it.attr('checked') == 'checked')
	{
		it.attr('checked', null);
		it.find('.labelbg').css('background-color','rgba(0,0,0,0.6)');
	}
	else
	{
		it.attr('checked', 'checked');
		it.find('.labelbg').css('background-color','red');
	}
}

f.doCompare = function()
{
	if (v.isLeftReady && v.isRightReady)
	{
		f.clearTable();

		$("#loadingLeft").fadeOut();
		$("#loadingRight").fadeOut();
		$("#divGoogle").fadeOut();
		$("#divFacebook").fadeOut();

		$.each(v.leftData, function(index, album)
		{
			var found = false;
			var albumName = album.title;

			$.each(v.rightData, function(i, fbAlbum)
			{
				if(album.title == fbAlbum.name)
				{
					if(album.count != fbAlbum.count)
					{
						album.isPartial = true;
						album.fbId = fbAlbum.id;
						console.log(fbAlbum);
					}
					else
					{
						found = true;
					}
				}
			});

			var row =  '<div id="tableRow' + index + '" class="tableRow" style="position: relative; float: left; margin: 10px; text-align: left; overflow: hidden; width: 160px; height: 160px;" onclick="photoSync.toggle(this);">'
					 + '<img id="img' + index + '" style="zIndex: 0; width: 160px; height:160px; position: absolute; left: 0px; top: 0px;" src="' + album.thumb + '"</img>'
					 + '<div class="labelbg" style="zIndex: 1000; width: 160px; height: 40px; background: rgba(0,0,0,0.6); position: absolute; left: 0px; top: 120px;">'
					 + '<label style="zIndex: 1000; color:#fff; font-size:10pt; position: relative; left: 5px; top: 2px;" id="title' + index + '">' + album.title + '</label>'
					 + '</div></div>';

			if (!found)
			{
				$('#tableNotOnFacebook').append(row);
			}
			else
			{
				$('#tableOnFacebook').append(row);
			}
			row = $('#tableRow' +index);
		});
	}
}

f.uploader = function(id, albumId, images, index)
{
	if (!images || index >= images.length)
	{
		$('#tableRow' + id).slideUp("slow", function() { 
			$(this).remove();
		} );

		setTimeout(function(){
			var im = $('#img_' + id + '_0');
			im.css("zIndex", 800);
			im.animate({'width': '160px', 'height': '160px'},1000);
			var target = $('#rowOn'+ id);
			var label = target.find('.labelbg');
			label.css('zIndex',1000);

			for(var i = 1; i < images.length; i ++)
			{
				var img = $('#img_' + id + '_' + i);
				$('#img_' + id + '_' + i).animate({
					'left' : '+=160px',
					'top' : '+=160px'
				}, 1000, function()
				{
					img.remove();
				});
			}
		}, 1000);

		if(id == v.albumOrder[v.albumOrder.length-1])
		{
			v.albumOrder.pop();
		}
		return;
	}
	if(index == images.length - 1)
	{
		if(id != v.albumOrder[v.albumOrder.length-1])
		{
			setTimeout(function() {
				f.uploader(id, albumId, images, index);
			}, 4000);
			return;
		}
	}
	var img = images[index];
	if(img.isSynced)
	{
		f.uploader(id, albumId, images, index + 1);
	}
	else
	{
		v.rightSide.uploadImage(albumId, img, function() {
			f.animateImage(id, index, 1000);
			f.uploader(id, albumId, images, index + 1);
		});
	}
}

f.animateImage = function(id, index, speed)
{
	var im = $('#img_'+id+'_'+index);
	var target = $('#rowOn'+ id);
	var targetPos = target.offset();
	var offset = im.offset();
	var oldPos = im.position();

	var oldRow = $('#tableRow' + id);
	var oldOffset = oldRow.offset();
	im.appendTo('body');
	im.css(
	{
		'zIndex': (500+index),
		'left': offset.left,
		'top': offset.top
	});
	im.animate({
		'left': '+=' + (targetPos.left - oldOffset.left) + 'px',
		'top': '+=' + (targetPos.top - oldOffset.top) + 'px'
	}, speed, function()
	{
		target.prepend(im);
		im.css(
		{
			'left': oldPos.left,
			'top': oldPos.top
		});
	});
}

f.animateImages = function($old, images, id)
{
	var num = images.length;
	var numWide = Math.floor(Math.sqrt(num) * 4 / 3);
	var size = Math.floor(Math.sqrt(160*120/num));
	
	$.each(images, function(i, image)
	{
		if(i == 0)
		{
			var img = $old.find('img');
			img.attr('id','img_' + id + '_' + i);
			img.animate({'width': size+'px', 'height': size+'px'}, "normal");
		}
		else
		{
			var newImg = $(document.createElement('img'));
			newImg.attr('id','img_' + id + '_' + i);
			newImg.attr('src', images[i].minThumb);
			//TODO: add some random to loading
			newImg.css({
				'position': 'absolute',
				'left': ((Math.floor(i % numWide) * size)) + 'px',
				'top': ((Math.floor(i / numWide) * size)) + 'px',
				'width': size +'px',
				'height': size + 'px',
				'opacity': '0'});
			$old.prepend(newImg);

			newImg.animate({'opacity': '1'}, "slow");
		}
		if(images[i].isSynced)
		{
			f.animateImage(id, i, 0);
		}
	});
}

f.sync = function()
{
	$.each($("#tableNotOnFacebook").children('div'), function(index, child)
	{
        var $old = $(child);
		if($old.attr('checked') != 'checked') return;

        f.toggle($old);

		var id = child.id.replace('tableRow', '');

        $old.css('background-color','rgba(0,0,0,0.6)');
		
		var pos = $old.position();

		var oldOffset = $old.offset();

		var $new = $old.clone().prependTo('#tableOnFacebook');
		$new.attr('id','rowOn' + id);

		var width = $new.width();

		$new.css({'width': '0'});

		$new.animate({'opacity': 1, 'width': width+'px'}, "normal");

		$new.find('img').remove();

		v.albumOrder.push(id);
		v.leftSide.getImages(id, function(ims) {
		    // The actual upload code
	    
			var albumName = $("#title" + id).html();

			if(v.leftData[id].isPartial)
			{
				console.log("Partial: ", v.leftData[id].fbId);
				v.partialId = v.leftData[id].fbId;
				v.rightSide.getImages(v.partialId, function(imsRight) {
					for(var i = 0; i < imsRight.length; i ++)
					{
						for(var u = 0; u < ims.length; u ++)
						{
							if(imsRight[i].name.indexOf(ims[u].link) != -1)
							{
								ims[u].isSynced = true;
								console.log("already synced: " + u);
							}
						}
						
					}
					if(v.doUpload)
				    {
						f.animateImages($old, ims, id);
						f.uploader(id, v.leftData[id].fbId, ims, 0);
					}
				});
			}
			else
			{
				if(v.doUpload)
			    {
					v.rightSide.createAlbum(albumName, v.leftData[id].link, function(responseId) {
						f.animateImages($old, ims, id);
						f.uploader(id, responseId, ims, 0);
					});
				}
			}
			if(!v.doUpload)
			{
				f.animateImages($old, ims, id);
			}
		});
	});
}

function onLoad()
{
	if(isLocal)
	{
		addScript("live.js");
	}
	if(!v.useFakeData)
	{
		v.leftSide = googleSync;
		v.rightSide = facebookSync;
	}
	else
	{
		v.leftSide = fakeLeft;
		v.rightSide = fakeRight;
	}
	v.leftSide.load(function(albums) {
		v.leftData = albums;
		v.isLeftReady = true;
		f.doCompare();
	});
	v.rightSide.load(function(data) {
		v.rightData = data;
		v.isRightReady = true;
		f.doCompare();
	});
}

$(window).bind("load", function() {
	console.log("Bound");
	$('#buttonSync').click(function()
	{
		f.sync();
	});

	$('#googleLogout').click(function()
	{
		$.cookie("googleLogin",null);
	    f.clearTable();
	    transitionDiv('divGoogleLoggedIn', 'divGoogleLogin', function() {
	    	$("#googleProfileImage").attr('src', null);
        });
	});
	onLoad();
});

$(function()
{
	
	console.log("loading");
});
}(window.photoSync = window.photoSync || {}, jQuery));
