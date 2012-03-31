(function(Debug, $, undefined)
{
	Debug.addHotkey = function(key, fn)
	{
		$(document).keypress(function(e)
		{
			if (String.fromCharCode(e.keyCode) == key)
			{
				setTimeout(fn+"();", 1);
				// this[fn]();
			}
		});
	};
}(window.Debug = window.Debug || {}, jQuery));