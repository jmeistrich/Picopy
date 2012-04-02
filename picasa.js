(function($)
{
  $.picasa = {
    albums: function(user, callback)
    {
      var url = "http://picasaweb.google.com/data/feed/api/user/:user_id?alt=json&kind=album&hl=en_US&access=visible&fields=gphoto:nickname,gphoto:thumbnail,entry(id,link,media:group(media:content,media:description,media:keywords,media:title,media:thumbnail))"
      url = url.replace(/:user_id/, user);
      $.getJSON(url, function(data)
      {
        var user = {
          nickname: data.feed["gphoto$nickname"]["$t"],
          thumbnail: data.feed["gphoto$thumbnail"]["$t"]
        }
        var album = null;
        var albums = [];
        $.each(data.feed.entry, function(i, element)
        {
          album = {
            id: element.id["$t"].split("?")[0].split("albumid/")[1],
            title: element["media$group"]["media$title"]["$t"],
            description: element["media$group"]["media$description"]["$t"],
            thumb: element["media$group"]["media$thumbnail"][0]["url"],
          }
          $.each(element, function(index, links)
          {
            if ($.isArray(links))
            {
              for (link in links)
              {
                if (links[link]["rel"] == "alternate")
                {
                  album.link = links[link].href;
                }
              }
            }
          });
          album.images = function(callback)
          {
            $.picasa.images(user, album.id, callback);
          }
          albums.push(album);
        });
        callback(user, albums);
      });
    },

    images: function(user, album, callback)
    {
      var url = "http://picasaweb.google.com/data/feed/base/user/:user_id/albumid/:album_id?alt=json&kind=photo&hl=en_US&imgmax=800&fields=entry(title,content,link,gphoto:numphotos,media:group(media:content,media:thumbnail,media:description))";
      url = url.replace(/:user_id/, user).replace(/:album_id/, album);
      var image = null;
      var images = [];
      $.getJSON(url, function(data)
      {
        $.each(data.feed.entry, function(i, element)
        {
          // console.log(element);
          image = element["media$group"]["media$content"][0];
          image.large = element["content"].src;
          image.title = element.title["$t"];
          image.description = element["media$group"]["media$description"]["$t"];
          image.thumbs = [];
          // console.log(image.description);
          // console.log(element);
          $.each(element, function(index, links)
          {
            if ($.isArray(links))
            {
              for (link in links)
              {
                if (links[link]["rel"] == "alternate")
                {
                  image.link = links[link].href;
                }
              }
            }
          });
          $.each(element["media$group"]["media$thumbnail"], function(j, j_element)
          {
            image.thumbs.push(j_element);
          });
          images.push(image);
        });
        callback(images);
      });
    }
  };

  $.fn.picasaAlbums = function(user, callback)
  {
    $.picasa.albums(user, function(images)
    {
      if (callback)
      {
        callback(images);
      }
    });
  };

  $.fn.picasaGallery = function(user, album, callback)
  {
    var scope = $(this);
    $.picasa.images(user, album, function(images)
    {
      if (callback)
      {
        callback.apply(scope, images);
      }
      else
      {
        var picasaAlbum = "<ul class='picasa-album'>\n";
        $.each(images, function(i, element)
        {
          picasaAlbum += " <li class='picasa-image'>\n";
          picasaAlbum += " <a class='picasa-image-large' href='" + element.url + "'>\n";
          picasaAlbum += " <img class='picasa-image-thumb' src='" + element.thumbs[1].url + "'/>\n";
          picasaAlbum += " </a>\n";
          picasaAlbum += " </li>\n";
        });
        picasaAlbum += "</ul>";
        scope.append(picasaAlbum);
      }
    });
  }
})(jQuery);