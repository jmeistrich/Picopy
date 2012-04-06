var isLocal = true;

(function(f, $, undefined) {

var v = f.v = f.v || {
	leftSide: {},
	rightSide: {},
	isLeftReady: false,
	isRightReady: false,

	leftData: {},
	rightData: {},

	useFakeData: true,
	doUpload: true,
	albumOrderLeft: [],
	albumOrderRight: [],

	testVar: {}
};

f.testSync = function()
{
	f.clearTable();
	onLoad();
	f.toggle($("#tableRowRight0"));

	f.sync();
}

f.clearTable = function()
{
	$.each($("#tableLeft div"), function(index, row)
	{
		$(row).remove();
	});

	$.each($("#tableRight div"), function(index, row)
	{
		$(row).remove();
	});

	$.each($("#divSync div"), function(index, row)
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

		function compareAlbums(data1, data2, table, rowPrefix)
		{
			$.each(data1, function(index, leftAlbum)
			{
				var found = false;
				var albumName = leftAlbum.name;

				$.each(data2, function(i, rightAlbum)
				{
					if(leftAlbum.name == rightAlbum.name)
					{
						if(leftAlbum.count != rightAlbum.count)
						{
							leftAlbum.isPartial = true;
							leftAlbum.fbId = rightAlbum.id;
						}
						else
						{
							found = true;
							leftAlbum.found = true;
							rightAlbum.found = true;
						}
					}
				});

				var row =  '<div id="' + rowPrefix + index + '" class="tableRow" style="position: relative; float: left; margin: 10px; text-align: left; overflow: hidden; width: 160px; height: 160px;" onclick="photoSync.toggle(this);">'
						 + '<img id="img' + index + '" style="zIndex: 0; width: 160px; height:160px; position: absolute; left: 0px; top: 0px;" src="' + leftAlbum.thumb + '"</img>'
						 + '<div class="labelbg" style="zIndex: 1000; width: 160px; height: 40px; background: rgba(0,0,0,0.6); position: absolute; left: 0px; top: 120px;">'
						 + '<label style="zIndex: 1000; color:#fff; font-size:10pt; position: relative; left: 5px; top: 2px;" id="title' + index + '">' + leftAlbum.name + '</label>'
						 + '</div></div>';

				if (!found)
				{
					$(table).append(row);
				}
				row = $(rowPrefix +index);
			});
		}

		compareAlbums(v.leftData, v.rightData, '#tableLeft', 'tableRowLeft');
		compareAlbums(v.rightData, v.leftData, '#tableRight', 'tableRowRight');
	}
}

f.uploader = function(id, albumId, images, index, albumOrder, side, rowPrefix)
{
	if (!images || index >= images.length)
	{
		$('#'+rowPrefix + id).slideUp("slow", function() { 
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

		if(id == albumOrder[albumOrder.length-1])
		{
			albumOrder.pop();
		}
		return;
	}
	if(index == images.length - 1)
	{
		if(id != albumOrder[albumOrder.length-1])
		{
			setTimeout(function() {
				f.uploader(id, albumId, images, index, albumOrder, side, rowPrefix);
			}, 4000);
			return;
		}
	}
	var img = images[index];
	if(img.isSynced)
	{
		f.uploader(id, albumId, images, index + 1, albumOrder, side, rowPrefix);
	}
	else
	{
		side.uploadImage(albumId, img, function() {
			f.animateImage(id, index, 1000, rowPrefix);
			f.uploader(id, albumId, images, index + 1, albumOrder, side, rowPrefix);
		});
	}
}

f.animateImage = function(id, index, speed, rowPrefix)
{
	var im = $('#img_'+id+'_'+index);
	var target = $('#rowOn'+ id);
	var targetPos = target.offset();
	var offset = im.offset();
	var oldPos = im.position();

	var oldRow = $('#'+rowPrefix + id);
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

f.animateImages = function($old, images, id, rowPrefix)
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
			f.animateImage(id, i, 0, rowPrefix);
		}
	});
}

f.sync = function()
{
	function sync(table, side, otherSide, data, albumOrder, rowPrefix)
	{
		$.each(table.children('div'), function(index, child)
		{
	        var $old = $(child);
			if($old.attr('checked') != 'checked') return;

	        f.toggle($old);

			var id = child.id.replace(rowPrefix, '');
	        $old.css('background-color','rgba(0,0,0,0.6)');
			var pos = $old.position();
			var oldOffset = $old.offset();
			var $new = $old.clone().prependTo('#divSync');
			$new.attr('id','rowOn' + id);
			var width = $new.width();
			$new.css({'width': '0'});
			$new.animate({'opacity': 1, 'width': width+'px'}, "normal");
			$new.find('img').remove();
			albumOrder.push(id);
			side.getImages(id, function(ims) {
			    // The actual upload code
		    
				var albumName = $("#title" + id).html();

				if(data[id].isPartial)
				{
					console.log("Partial: ", v.leftData[id].fbId);
					otherSide.getImages(data[id].fbId, function(imsRight) {
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
							f.animateImages($old, ims, id, rowPrefix);
							f.uploader(id, data[id].fbId, ims, 0, albumOrder, otherSide, rowPrefix);
						}
					});
				}
				else
				{
					if(v.doUpload)
				    {
						otherSide.createAlbum(albumName, data[id].link, function(responseId) {
							f.animateImages($old, ims, id);
							f.uploader(id, responseId, ims, 0, albumOrder, otherSide, rowPrefix);
						});
					}
				}
				if(!v.doUpload)
				{
					f.animateImages($old, ims, id, rowPrefix);
				}
			});
		});
	}
	$("#syncText").animate({'opacity':'0'}, 200);
	sync($("#tableLeft"), v.leftSide, v.rightSide, v.leftData, v.albumOrderLeft, "tableRowLeft");
	sync($("#tableRight"), v.rightSide, v.leftSide, v.rightData, v.albumOrderRight, "tableRowRight");
}

function onLoad()
{
	if(isLocal)
	{
		addScript("live.js");
		$("#logo").css('background-color','blue');
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
	v.leftSide.load(function(data, pic) {
		v.leftData = data;
		$("#service1Bg").attr('src', pic);
		v.isLeftReady = true;
		f.doCompare();
	});
	v.rightSide.load(function(data, pic) {
		v.rightData = data;
		$("#service2Bg").attr('src', pic);
		v.isRightReady = true;
		f.doCompare();
	});
}

$(window).bind("load", function() {
	$('#divSync').click(function()
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
});
}(window.photoSync = window.photoSync || {}, jQuery));
