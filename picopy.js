(function(f, $, undefined) {

var v = f.v = f.v || {
	leftSide: null,
	rightSide: null,
	leftName: null,

	leftData: null,
	rightData: null,

	useFakeData: false,
	doUpload: true,
	albumOrderLeft: [],
	albumOrderRight: []
};

f.clearTable = function()
{
	$.each($('#tableLeft div'), function(index, row)
	{
		$(row).remove();
	});

	$.each($('#tableRight div'), function(index, row)
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
	if (v.leftData != null && v.rightData != null)
	{
		$('.loading').hide();
		f.clearTable();

		$('#loadingLeft').fadeOut();
		$('#loadingRight').fadeOut();
		$('#divGoogle').fadeOut();
		$('#divFacebook').fadeOut();

		var data1 = v.leftData;
		var data2 = v.rightData;
		var table = $('#tableLeft');
		var table2 = $('#tableRight');
		var rowPrefix = 'tableRowLeft';

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
			var row =  '<div id="' + rowPrefix + index + '" class="tableRow"';
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
			else
			{
				$('#tableRight').append(row);
			}
		});
	}
}

f.uploader = function(id, albumId, images, index, albumOrder, side, rowPrefix)
{
	if (!images || index >= images.length)
	{
		$('#'+rowPrefix + id).slideUp('slow', function() { 
			$(this).remove();
		} );

		setTimeout(function(){
			var im = $('#img_' + id + '_0');
			im.css('zIndex', 800);
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
	im.animate({
		'left': '+=' + (targetPos.left - oldOffset.left) + 'px',
		'top': '+=' + (targetPos.top - oldOffset.top) + 'px'
	}, speed, function()
	{
		target.prepend(im);
		im.css(
		{
			'zIndex': 1,
			'left': oldPos.left,
			'top': oldPos.top
		});
	});
}

f.animateImage = function(id, index, speed, rowPrefix)
{
	animateToContainer('img_'+id+'_'+index, rowPrefix + id, 'rowOn' + id, (500+index), speed);
}

f.animateImages = function($old, images, id, rowPrefix)
{
	var num = images.length;
	var numWide = Math.ceil(Math.sqrt(num));
	var numHigh = Math.floor(num / numWide);
	var size = 160/Math.max(numWide,numHigh);
	
	$.each(images, function(i, image)
	{
		if(i == 0)
		{
			var img = $old.find('img');
			img.attr('id','img_' + id + '_' + i);
			img.animate({'width': size+'px', 'height': size+'px'}, 'normal');
		}
		else
		{
			var newImg = $(document.createElement('img'));
			newImg.attr('id','img_' + id + '_' + i);
			newImg.attr('src', images[i].minThumb);
			newImg.css({
				'position': 'absolute',
				'left': ((Math.floor(i % numWide) * size)) + 'px',
				'top': ((Math.floor(i / numWide) * size)) + 'px',
				'width': size +'px',
				'height': size + 'px',
				'opacity': '0'});
			$old.prepend(newImg);

			newImg.animate({'opacity': '1'}, 'slow');
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
			$new.animate({'opacity': 1, 'width': width+'px'}, 'normal');
			$new.find('img').remove();
			albumOrder.push(id);
			side.getImages(id, function(ims) 
			{
			    // The actual upload code
		    
				var albumName = $('#title' + id).html();

				if(data[id].isPartial)
				{
					console.log('Partial: ', v.leftData[id].fbId);
					otherSide.getImages(data[id].fbId, function(imsRight) {
						for(var i = 0; i < imsRight.length; i ++)
						{
							for(var u = 0; u < ims.length; u ++)
							{
								if(imsRight[i].name.indexOf(ims[u].link) != -1)
								{
									ims[u].isSynced = true;
									console.log('already synced: ' + u);
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
	sync($('#tableLeft'), v.leftSide, v.rightSide, v.leftData, v.albumOrderLeft, 'tableRowLeft');
}

f.onLoad = function()
{
	$('.loading').show();
	$('#leftServiceName').html(v.leftName);
	v.leftSide.load(function(data) {
		v.leftData = data;
		v.isLeftReady = true;
		f.doCompare();
	});
	v.rightSide.load(function(data) {
		v.rightData = data;
		v.isRightReady = true;
		f.doCompare();
	});
}

function hide(target)
{
	target.css('visibility', 'hidden');
}

function createClone(obj)
{
	var objClone = obj.clone();
	objClone.attr('id',obj.attr('id')+'_clone');
	objClone.insertAfter(obj);
	objClone.css('visibility', 'hidden');
	return objClone;
}

function moveToBody(obj)
{
	var offset = obj.offset();
	var sol = obj.attr('sol');
	if(sol)
		offset.left -= sol;
	var sot = obj.attr('sot');
	if(sot)
		offset.top -= sot;
	obj.css(
	{
		'zIndex': 4,
		'position': 'absolute',
		'margin': 0,
		'left': offset.left,
		'top': offset.top
	});
	obj.appendTo('body');
}

function animateIntoPlace(params)
{
	var obj = params.obj;
	var targetObj = params.targetObj;
	var speed = params.speed;
	var doAfter = params.doAfter;
	var handler = params.handler;
	var scale = params.scale;
	if(doAfter == 'restore')
		targetObj = $('#'+obj.attr('id')+'_clone');
	else
	{
		obj.attr('om', obj.css('margin'));
		createClone(obj);
	}
	moveToBody(obj);
	var targetOffset = targetObj.offset();
	var offset = obj.offset();
	var oldIndex = obj.css('zIndex');
	obj.css('zIndex', '5');

	var scaleOffset = {left: 0, top: 0};
	if(scale && scale < 1)
	{
		scaleOffset.left = obj.width() * (1-scale) * 0.5;
		scaleOffset.top = obj.height() * (1-scale) * 0.5;

		targetOffset.left -= scaleOffset.left;
		targetOffset.top -= scaleOffset.top;
	}
	
	obj.transition({
		'left': targetOffset.left,
		'top': targetOffset.top,
		'scale': scale
	}, speed, function()
	{
		obj.css('zIndex', oldIndex);
		if(doAfter == 'append')
		{
			targetObj.append(obj);
			obj.css(
			{
				// 'zIndex': 1,
				'position': '',
				'left': 0,
				'top': 0,
				'margin-left': -scaleOffset.left,
				'margin-top': -scaleOffset.top
			});
			obj.attr('sol', scaleOffset.left);
			obj.attr('sot', scaleOffset.top);
		}
		else if(doAfter == 'restore')
		{
			obj.insertBefore(targetObj);
			var om = obj.attr('om');
			if(om != null)
			{
				obj.css('margin', om);
			}
			obj.css(
			{
				// 'zIndex': 1,
				'position': '',
				'left': 0,
				'top': 0
			});
			targetObj.remove();
			obj.attr('sol', '');
			obj.attr('sot', '');
		}
		if(handler != null)
		{
			handler();
		}
	});
}

f.openIntro = function()
{
	$('#intro').show();
	$('#intro').animate({'opacity': 1}, 'slow');
	animateIntoPlace({obj: $('#logo2'), speed:'slow', doAfter:'restore'});
	animateIntoPlace({obj:$('#introServicesSelectedBox'), speed:'slow', scale: '1', doAfter:'restore', handler:function(){
		$('#introServicesLogin').show();
	}});
	setTimeout(function(){
		$('#introServicesSelectedBox').css({'height': '+=30px'});
		$('.service').animate({'borderWidth': '3px'}, 0);
	}, 200);
}

f.closeIntro = function()
{
	$('#introServicesLogin').hide();
	$('.service').animate({'borderWidth': '0px'}, 'slow');
	animateIntoPlace({obj:$('#logo2'), targetObj: $('#logo'), speed:'slow', doAfter:'append'});
	animateIntoPlace({obj:$('#introServicesSelectedBox'), targetObj:$('#services'), speed:'slow', scale: '0.6', doAfter:'append'});
	$('#intro').animate({'opacity': 0}, 'slow', function() {
		$('#intro').hide();
	});
	setTimeout(function(){
		$('#introServicesSelectedBox').css({'height': '-=30px'});
	}, 200);
}

function clickServiceIcon(icon, force)
{
	if($('#intro').css('opacity') < 1)
		return;
	var target;
	var restoring = icon.attr('service') != null;
	var serviceName = icon.attr('name');
	var js = window[serviceName+'Sync'];
	var login = $('#div'+serviceName);

	var doAfter = 'append';
	var name;
	if(!restoring)
	{
		if(v.leftSide == null)
		{
			name = 'leftService';
			v.leftSide = js;
			v.leftName = serviceName;
			$.cookie('left', icon.attr('id'));
		}
		else if(v.rightSide == null)
		{
			name = 'rightService';
			v.rightSide = js;
			$.cookie('right', icon.attr('id'));
		}
		else
			return;

		icon.attr('service', name);
		target = $('#'+name);
		$('#'+name+'Text').hide();
	}
	else
	{
		doAfter = 'restore';
		name = icon.attr('service');
		if(name == 'leftService')
		{
			v.leftSide = null;
			$.cookie('left', null);
		}
		else if(name == 'rightService')
		{
			v.rightSide = null;
			$.cookie('right', null);
		}
		icon.attr('service', null);
		login.hide();
	}
	var speed = force ? 0 : 'fast';
	animateIntoPlace({obj: icon, targetObj: target, speed: speed, doAfter: doAfter, handler: function() {
		if(!restoring)
		{
			login.show();
			if(login)
			{
				$('#'+target.attr('id')+'Login').append(login);
			}
			js['login']();
		}
		else
		{
			$('#'+name+'Text').show();
		}
	}});
}

f.highlight = function(elem)
{
	elem.stop();
	elem.css({
		backgroundColor: '#f22'
	}).animate({backgroundColor: 'rgba(0,0,0,0)'},2000);
}

$(window).bind('load', function() {
	$('#intro').css('opacity', '1');

	if(!v.useFakeData)
	{
		$('#serviceFakeLeft').remove();
		$('#serviceFakeRight').remove();
	}
	else
	{
		$('#serviceGoogle').remove();
		$('#serviceFacebook').remove();
	}
	$('#divButtonSync').click(function()
	{
		f.sync();
	});

// Note: Since only Google -> Facebook is supported, add as default
	clickServiceIcon($('#serviceGoogle'), true);
	clickServiceIcon($('#serviceFacebook'), true);
// Note: If we had more services we would enable this
	// $('.serviceIcon').click(function() {
		// clickServiceIcon($(this));
	// })

	$('#goButton').click(function() {
		if(!v.leftSide)
		{
			f.highlight($('#leftService'));
		}
		else if(!v.leftSide.v.loggedIn)
		{
			v.leftSide.highlight();
		}
		if(!v.rightSide)
		{
			f.highlight($('#rightService'));
		}
		else if(!v.rightSide.v.loggedIn)
		{
			v.rightSide.highlight();
		}
		if(v.leftSide && v.rightSide && v.leftSide.v.loggedIn && v.rightSide.v.loggedIn)
		{
			f.closeIntro();
			f.onLoad();	
		}
	});

	$('#services').click(function() {
		f.openIntro();
	});

	// addScript('live.js');
});

$(function()
{
});
}(window.photoSync = window.photoSync || {}, jQuery));
