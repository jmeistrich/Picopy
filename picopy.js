var isLocal = true;

(function(f, $, undefined) {

var v = f.v = f.v || {
	leftService: null,
	rightService: null,
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

f.toggleCookie = function()
{
	if($.cookie("googleLogin") == null)
	{
		$.cookie("googleLogin",'asdf');
		console.log("Cookie set")
	}
	else
	{
		$.cookie("googleLogin",null);
		console.log("Cookie deleted");
	}

}

f.testSync = function()
{
	f.clearTable();
	onLoad();
	f.toggle($("#tableRowLeft0"));

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
				var row =  '<div id="' + rowPrefix + index + '" class="tableRow" draggable="true"';
				if(data1 == v.leftData)
				{
					row += ' onclick="photoSync.toggle(this);"';
				}
				row += '><img class="tableRowImg" id="img' + index + '" src="' + leftAlbum.thumb + '"</img>'
				 + '<div class="labelbg">'
				 + '<label class="tableRowLabel" id="title' + index + '">' + leftAlbum.name + '</label>'
				 + '</div></div>';

				if (!found)
				{
					
					table.append(row);
				}
			});
		}

		compareAlbums(v.leftData, v.rightData, $('#tableLeft'), 'tableRowLeft');
		compareAlbums(v.rightData, v.leftData, $('#tableRight'), 'tableRowRight');
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

function animateToContainer(objName, oldContainerName, containerName, zIndex, speed)
{
	var im = $('#'+objName);
	var target = $('#'+containerName);
	var targetPos = target.offset();
	var offset = im.offset();
	var oldPos = im.position();

	var oldRow = $('#'+oldContainerName);
	var oldOffset = oldRow.offset();
	im.appendTo('body');

	im.css(
	{
		'zIndex': zIndex,
		'position': 'absolute',
		'left': offset.left,
		'top': offset.top
	});
	// im.animate({
	// 	'left': '+=' + (targetPos.left - oldOffset.left) + 'px',
	// 	'top': '+=' + (targetPos.top - oldOffset.top) + 'px'
	// }, speed, function()
	// {
	// 	target.prepend(im);
	// 	im.css(
	// 	{
	// 		'zIndex': 1,
	// 		'left': oldPos.left,
	// 		'top': oldPos.top
	// 	});
	// });
}

f.animateImage = function(id, index, speed, rowPrefix)
{
	animateToContainer('img_'+id+'_'+index, rowPrefix + id, 'rowOn' + id, (500+index), speed);
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
			var $new = $old.clone().prependTo('#tableRight');
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
	// $("#syncText").animate({'opacity':'0'}, 200);
	sync($("#tableLeft"), v.leftSide, v.rightSide, v.leftData, v.albumOrderLeft, "tableRowLeft");
	// sync($("#tableRight"), v.rightSide, v.leftSide, v.rightData, v.albumOrderRight, "tableRowRight");
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

function hide(target)
{
	// $('#'+src).attr('targetObj', target);
	// $('#'+target).css('opacity', '0');
	target.css('visibility', 'hidden');

}

function moveToBody(obj, doWithClone)
{
	var offset = obj.offset();
	var objClone = obj.clone();
	objClone.attr('id',obj.attr('id')+'_clone');
	objClone.insertAfter(obj);
	obj.css(
	{
		'zIndex': 4,
		'position': 'absolute',
		'margin': 0,
		'left': offset.left,
		'top': offset.top
	});
	if(doWithClone == 'hide')
	{
		objClone.css('visibility', 'hidden');
	}
	obj.appendTo('body');
	return objClone;
}

function animateIntoPlace(obj, targetObj, speed, doAfter)
{
	// var obj = $('#'+objName);
	// var targetObj = obj.attr('targetObj');
	var targetOffset = targetObj.offset();
	var offset = obj.offset();
	var oldIndex = obj.css('zIndex');
	obj.css('zIndex', '5');
	
	obj.animate({
		'left': targetOffset.left,
		'top': targetOffset.top,
	}, speed, function()
		{
			obj.css('zIndex', oldIndex);
			if(doAfter == 'replace')
			{
				obj.remove();
				targetObj.css('visibility', 'visible');
			}
			// if(doAfter == 'delete')
			// {
			// 	obj.remove();
			// }
			// else if(doAfter == 'reset')
			// {
			// 	obj.css('opacity', '1');
			// }
			// else if(doAfter == 'hide')
			// {
			// 	obj.css('visibility', 'hidden');
			// }
		});
	// return objClone;
}

f.closeIntro = function()
{
	var obj = $('#logo2');
	moveToBody(obj, 'hide');
	animateIntoPlace(obj, $('#logo'), "slow", 'replace');
	$("#intro").animate({'opacity': 0}, "slow", function() {
		$('#intro').hide();
	});
	//animateToContainer('img_'+id+'_'+index, rowPrefix + id, 'rowOn' + id, (500+index), speed);
}

function clickServiceIcon(icon, clone)
{
	var target;

	if(icon.attr('service') == null)
	{
		if(v.leftService == null)
		{
			v.leftService = "left";
			icon.attr('service', 'leftService');
			target = $('#leftService');
		}
		else if(v.rightService == null)
		{
			v.rightService = "right";
			icon.attr('service', 'rightService');
			target = $('#rightService');
		}
		else
			return;
	}
	else
	{
		if(icon.attr('service') == 'leftService')
		{
			v.leftService = null;
			icon.attr('service', null);
			target = clone;
		}
		else if(icon.attr('service') == 'rightService')
		{
			v.rightService = null;
			icon.attr('service', null);
			target = clone;
		}
	}
// console.log(clone);
	animateIntoPlace(icon, target, 'fast');
	// clone.click(function() {
	// 	animateIntoPlace(clone, this.id, 'fast');
	// 	if(targetName == 'leftService')
	// 	{
	// 		v.leftService = null;
	// 		console.log("resetting left");
	// 	}
	// 	else if(targetName == 'rightService')
	// 	{
	// 		v.rightService = null;
	// 		console.log("resetting right");
	// 	}
	// 	clone.click(function() 
	// 		{
	// 			clickServiceIcon(clone);
	// 		});
	// });
}

$(window).bind("load", function() {
	if($.cookie("googleLogin") == null)
	{
		// $("#intro").animate({'opacity': 1}, "normal");
		$('#intro').css('opacity', '1');
		// $($('#logo')
		console.log("fade in");

		hide($('#logo'));
	}
	else
	{
		$('#intro').hide();
	}
	$('#divButtonSync').click(function()
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

	$('.serviceIcon').click(function() {
		var obj = $(this);
		var clone = $('#'+obj.attr('id')+'_clone');
		if(clone.length == 0)
		{
			clone = moveToBody($(this), 'hide');	
		}
		// console.log($(this).clonedObj);
		// clone.click(function() {
		// 	clickServiceIcon(this, clone);
		// });
		clickServiceIcon($(this), clone);
		// $(this).css('opacity', 'hidden');

		// animateToContainer('serviceGoogle','introServices','leftService', 4, 2000);
	})

	onLoad();
});

$(function()
{
});
}(window.photoSync = window.photoSync || {}, jQuery));
