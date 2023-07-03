var supportedWeb = {
  'imdb' : {
    // HAS LDJSON
    block: () => {
      let block = document.querySelectorAll('main section section section:nth-child(1)');
      if (block.length == 0) {
        block = document.getElementsByClassName('plot_summary_wrapper')
      }
      return block[0]; 
   },
    title: () => { 
      let title
      title = document.querySelectorAll('meta[name="title"]')
      if (title.length > 0) {
        title = title[0].getAttribute('content')
      } else {
        title = document.querySelectorAll('title')[0].innerText
      }
      return title; 
    },
          // document.querySelectorAll('meta[property="og:title"]')[0].getAttribute('content');
    year: () => { 
      var tmpYear = document.querySelectorAll('.titleBar *[itemprop="datePublished"]');
      //         this.release_date = tmpYear[0].content;
      return ( tmpYear.length > 0 )? tmpYear[0].content : null
     },
    // no type
  },
  'rottentomatoes': {
    // HAS LDJSON
    block: () => document.getElementById('where-to-watch'),
    title: () => document.getElementsByTagName('h1')[0].innerText,
    year:  () => { 
      let text = document.getElementsByClassName('scoreboard__info')[0].innerText
      return /.*?([\d]{4}).*?/.exec(text)[0]
    },
    // type from LDJSON
  },
  'sensacine.com/peliculas': {
    type: "movie",
    block: () => document.getElementsByClassName('bam-container')[0],
    title: () => document.getElementsByClassName('titlebar-title')[0].innerText,
    year:  () => { 
      if (typeof GptConfig != 'undefined')
        return GptConfig.targeting.production_year;
      else if(document.getElementsByClassName('date').length > 0) 
        return document.getElementsByClassName('date')[0].innerText; 
      else
        return null;
    },
    // year: () => document.getElementsByClassName('date')[0].innerText,
    // yearAlt: () => document.getElementsByTagName('title')[0].innerText,
  },
  'sensacine.com/series': {
    type: "show",
    block: () => document.getElementsByClassName('entity-card-overview')[0],
    title: () => document.querySelectorAll('meta[property="og:title"]')[0].getAttribute('content'),
    year: () => document.querySelectorAll('title')[0].innerText, // TODO: Improve (there is a js object to look inside)
  },
  'filmaffinity.com': {
    block: () => document.querySelectorAll('#review-container')[0],
    title: () => document.querySelectorAll('meta[property="og:title"]')[0].getAttribute('content'),
    year: () => null,
  },
  'trakt.tv/movies': {
    block: () => document.getElementsByClassName('streaming-links')[0],
    title: () => document.querySelectorAll('meta[property="og:title"]')[0].getAttribute('content'),
    year: () => document.querySelectorAll('h1 .year')[0].innerText,
    type: "movie",
  },
  'trakt.tv/shows': {
    block: () => document.getElementsByClassName('streaming-links')[0],
    title: () => document.querySelectorAll('meta[property="og:title"]')[0].getAttribute('content'),
    year: () => document.querySelectorAll('h1 .year')[0].innerText,
    type: "show",
  },
  'metacritic.com/movie': {
    // HAS LDJSON
    block: () => document.getElementsByClassName('esite_list')[0],
    title: () => document.querySelectorAll('meta[property="og:title"]')[0].getAttribute('content'),
    year: () => null,
    type: "movie",
  },
  'metacritic.com/tv': {
    block: () => document.getElementsByClassName('esite_list')[0],
    title: () => document.querySelectorAll('meta[property="og:title"]')[0].getAttribute('content'),
    year: () => document.querySelectorAll('.release_data .data')[0].innerText,
    type: "show",
  },
  'ecartelera.com': {
    block: () => document.getElementById('scorebox'),
    title: () => document.querySelectorAll('meta[property="og:title"]')[0].getAttribute('content'),
        //titleFull = document.querySelectorAll('span[itemprop="name"]')[0].innerText;
    year: () => document.querySelectorAll('.datospelicula .year')[0].innerText,
  },
  'themoviedb.org/movie': {
    block: () => document.getElementsByClassName('header')[0],
    title: () => document.querySelectorAll('meta[property="og:title"]')[0].getAttribute('content'),
    year: () => document.getElementsByClassName('release_date')[0].innerText,
    type: "movie",
  },
  'themoviedb.org/tv': {
    block: () => document.getElementsByClassName('header')[0],
    title: () => document.querySelectorAll('meta[property="og:title"]')[0].getAttribute('content'),
    year: () => document.getElementsByClassName('release_date')[0].innerText,
    type: "show", 
  },
  'thetvdb.com': {
    block: () => document.getElementById('series_basic_info'),
    title: () => document.getElementById('series_title').innerText,
    year: () => document.querySelectorAll('#series_basic_info li span')[2].innerText, //TODO
    type: "show",
  },
  'simkl.com/movies': {
    block: () => document.getElementsByClassName('SimklTVAboutBlockTitle')[0],
    title: () => document.querySelectorAll('h1[itemprop="name"]')[0].innerText,
    year:  () => document.getElementsByClassName('detailYearInfo')[0].innerText,    
    type: "movie",
  },
  'simkl.com/tv': {
    block: () => document.getElementsByClassName('SimklTVAboutBlockTitle')[0],
    title: () => document.querySelectorAll('h1[itemprop="name"]')[0].innerText,
    year:  () => document.getElementsByClassName('detailYearInfo')[0].innerText,    
    type: "show",
  },
  'criticker.com/film': {
    block: () => document.getElementById('fi_moreinfo'),
    title: () => document.querySelectorAll('h1 [itemprop="name"]')[0].innerText,
    year:  () => document.querySelectorAll('h1 [itemprop="datePublished"]')[0].innerText,
    type: "movie",
  },
  'criticker.com/tv': {
    block: () => document.getElementById('fi_moreinfo'),
    title: () => document.querySelectorAll('h1 [itemprop="name"]')[0].innerText,
    year:  () => document.querySelectorAll('h1 [itemprop="startDate"]')[0].innerText,
    type: "show",
  },
  'abc.es': {
    block: () => document.getElementsByClassName('datos-ficha')[0],
    title: () => document.querySelectorAll('meta[property="og:title"]')[0].getAttribute('content'),
    year:  () => null,
    type: "movie",
  },
  'letterboxd.com': {
    block: () => document.getElementById('featured-film-header'),
    title: () => document.querySelectorAll('meta[property="og:title"]')[0].getAttribute('content'),
    year:  () => { var dataElement = document.querySelectorAll('.film-poster')[0]; return (dataElement)?dataElement.dataset.filmReleaseYear:null; },
    type: "movie",
  },
  'tvtime.com': {
    block: () => document.getElementsByClassName('show-nav')[0],
    title: () => document.querySelectorAll('meta[property="og:title"]')[0].getAttribute('content'),
    year:  () => document.querySelectorAll('meta[itemprop="startDate"]')[0].getAttribute('content'),
    type: "show",
  },
  'allmovie.com': {
    block: () => document.getElementsByClassName('streams')[0],
    title: () => document.querySelectorAll('meta[property="og:title"]')[0].getAttribute('content'),
    year:  () => document.getElementsByClassName('release-year')[0].getAttribute('content'),
    type: "movie",
  },
  'moviechat.org': {
    block: () => //document.querySelectorAll('div.movie-overview')[0],
      document.querySelectorAll('#wrap .main .row .row')[2],
    title: () => document.querySelectorAll("#title")[0].innerText,
    year: () => null,
  },
  'tvmaze.com': {
    block: () => document.querySelectorAll('#general-info-panel')[0],
    title: () => document.querySelectorAll('h1')[0].innerText,
    year: () => document.querySelectorAll('#year')[0].innerText.substring(1, 5),
	  type: "show",
  },
  'listal.com/movie': {
    block: () => document.querySelectorAll('#rightstuff')[0],
    title: () => document.querySelectorAll('h1')[0].innerText,
    year: () => {},
  },
  'reelgood.com/movie': {
    block: () => // document.querySelectorAll('p[itemprop="description"]')[0],
      document.querySelectorAll('h1')[0],
    title: () => document.querySelectorAll('h1')[0].innerText,
    year: () => document.querySelectorAll('meta[itemprop="dateCreated"]')[0].getAttribute('content').substring(0, 4),
  },
  'trailers.apple.com': {
    waitForSelector: 'h1.replaced',
    block: () => document.querySelectorAll('header#main-header')[0],
    title: () => document.querySelectorAll('h1.replaced')[0].innerText,
    year: () => document.getElementsByClassName('release')[0].innerText,
    type: "movie",
  },

  'netflix.com': {
    waitForSelector: '.jawBoneContainer',
    block: () => document.querySelectorAll('.jawBoneContainer')[0],
    title: () => document.querySelectorAll('h1 .title-small img')[0].getAttribute('alt'),
    year: () => document.getElementsByClassName('year')[0].innerText,
  },
  'primevideo.com': {
    //block: () => document.querySelectorAll('.av-meta-info-wrapper')[0]; },
    block: () => document.querySelectorAll('#dv-action-box-wrapper')[0],
    title: () => document.querySelectorAll('h1')[0].innerText,
    // year: () => document.querySelectorAll('.av-badge-text[data-automation-id="release-year-badge"]')[0].innerText, 
    year: () => { 
      var nodes = document.querySelectorAll('.av-detail-section [data-automation-id="release-year-badge"]');
      return (nodes.length > 0)? nodes[0].innerText : "";
     }, 
  },
  'hboespana.com': {
    waitForSelector: 'h1[data-automation="title"]',
    block: () => document.querySelectorAll('.page > div')[0],
    title: () => document.querySelectorAll('h1')[0].innerText,
    year: () => document.querySelectorAll('div[data-automation="meta_year"]')[0].innerText,     
  },
  'rakuten.tv': {
    //waitForSelector: 'h1[data-automation="title"]',
    block: () => document.querySelectorAll('.detail__hero')[0],
    title: () => document.querySelectorAll('h1.detail__data__meta__title')[0].innerText,
    year: () => null,
  }
}
