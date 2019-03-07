This browser extension is an unofficial wrapper of JustWatch service to show availability of a Movie or TV show on the streamings plattforms. It works on Chrome and Firefox.

It works on the next Movie / TV shows related web pages:
* [imdb.com](https://imdb.com)
* [rottentomatoes.com](https://www.rottentomatoes.com)
* [tv.com](http://www.tv.com/)
* [sensacine.com](http://www.sensacine.com/)
* [filmaffinity.com](https://www.filmaffinity.com/)
* [cinefilica.es](https://cinefilica.es/)
* [ecartelera.com](https://www.ecartelera.com/)
* [themoviedb.org](https://www.themoviedb.org/)
* [abc.es/play/](https://www.abc.es/play/)
* [metacritic.com](https://www.metacritic.com/)
* [letterboxd.com](https://letterboxd.com/)
* [trakt.tv](https://trakt.tv/)
* [tvtime.com](https://www.tvtime.com/)
* [allmovie.com](https://www.allmovie.com/)
* [trailers.apple.com](https://trailers.apple.com)
* [thetvdb.com/series/](https://www.thetvdb.com/series/)
* [simkl.com](https://simkl.com)
* [criticker.com](https://www.criticker.com/)

If you want another web to be added, please, open an issue (or if you are a developer, I am open to pull requests. Instructions below).

Right now it gets info for this countries:
* USA
* Canada
* España
* Deutschland
* Japan
* Mexico
* Brazil

[JustWatch](https://www.justwatch.com/) has info from more than 30 countries... you can ask me for the next to wrap.

## How to install ##
Beacuse this extension is not in the "markets" you have to install by yourself in your browser.

Clone / download to your local machine.

In Chrome, go to Extensions, switch "developer mode" on and click on "Load unpacked", browse to the folder and add.

## Questions ##
### Developers: How to add another web page to be parsed ###
I am open to new additions via pull request. ;)

Search is based on 3 params: Title, Type (Movie o Show) and Release Year.

1. Create a new entry on supportedWeb array on main.js with this index:
 - **'block'**: function with selector where to append the information block
 - **'title'**: function with selector where to get the title
 - **'year'**: function with selector on where to get the year
 - **'type'**: (optional) string "show", "movie"
 
   ***Note:*** Some web pages have ld-json information, so we can get title and year directly. In those cases add an empty function for title and year. Block in mandatory in any case.

2. Add the URL to activate to the manifest.json, on matches.

Reload the extension and navigate to the page... and JustWatch!

### How can I add another streaming platform? ###
This is an unofficial extension that shows the info JustWatch has. Ask JustWatch team for that.

### How can I add the availability of a show / movie? ###
This is an unofficial extension. Ask JustWatch team for that.