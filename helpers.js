function addScript(filename, callback)
{
    var e = document.createElement('script');
    e.type = 'text/javascript';
    e.async = true;
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

function getHashByName(name)
{
    var params = {}, queryString = location.hash.substring(1),
    regex = /([^&=]+)=([^&]*)/g, m;
    while (m = regex.exec(queryString)) {
        if(decodeURIComponent(m[1]) == name)
        return decodeURIComponent(m[2]);
    }
}

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