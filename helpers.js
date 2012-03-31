function addScript(filename, callback)
{
    var rnd = Math.floor(Math.random() * 80000);
    var e = document.createElement('script');
    e.type = 'text/javascript';
    e.src = filename;// + "?r=" + rnd;
    if (callback)
    {
        e.onloadDone = false; //for Opera
        e.onload = function()
        {
            e.onloadDone = true;
            if(callback)
            {
                callback();
            }
        };
        e.onReadystatechange = function()
        {
            if (e.readyState === 'loaded' && !e.onloadDone)
            {
                e.onloadDone = true;
                if(callback)
                {
                    callback();
                }
            }
        }
    }
    if (typeof(e) !== 'undefined')
    {
        document.getElementsByTagName('head')[0].appendChild(e);
    }
};

function getParameterByName(name)
{
  name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
  var regexS = "[\\?&]" + name + "=([^&#]*)";
  var regex = new RegExp(regexS);
  var results = regex.exec(window.location.href);
  if(results == null)
  {
    console.log("no result");
    console.log(window.location.href);
    return "";
}
  else
    return decodeURIComponent(results[1].replace(/\+/g, " "));
};

function getHashByName(name)
{
    var params = {}, queryString = location.hash.substring(1),
    regex = /([^&=]+)=([^&]*)/g, m;
    while (m = regex.exec(queryString)) {
        if(decodeURIComponent(m[1]) == name)
        return decodeURIComponent(m[2]);
    }
}

function poptastic(url)
{
    var newWindow = window.open(url, 'name', 'height=600,width=700');
    if (window.focus)
    {
        newWindow.focus();
    }
}

jQuery.fn.reverse = function()
{
    return this.pushStack(this.get().reverse(), arguments);
};

function transitionDiv(fromdiv, todiv, opt_callback)
{
    $('#' + fromdiv).fadeOut('fast', function()
    {
        $('#' + todiv).fadeIn('fast', function()
        {
            if (opt_callback)
            {
                opt_callback();
            }
        });
    });
};

$.extend({
            threadedEach: function (arr, fn, settings) {
                settings = $.extend({
                    wait: 100,
                    after: null
                }, settings);

                var i = 0,
                    wait = function () {
                        setTimeout(function () {
                            if ($.isFunction(fn) && i < ((arr.size && arr.size()) || arr.length)) {
                                if (arr instanceof $) {
                                    fn.apply($(arr).eq(i), [i]);
                                } else {
                                    fn.apply(arr[i], [i]);
                                }
                                i++;
                                wait();
                            } else if ($.isFunction(settings.after)) {
                                settings.after.apply(window);
                            }
                        }, settings.wait);
                    };

                if ($.isArray(arr) || arr instanceof $) {
                    wait();
                }

                return arr;
            }
        });

        $.fn.extend({
            threadedEach: function (fn, settings) {
                return $.threadedEach(this, fn, settings);
            }
        });