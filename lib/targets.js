var supportedWeb = {
  'imdb' : {
    block: function(){
      let block = document.getElementsByClassName('plot_summary_wrapper')
      if (block.length == 0) {
        block = document.querySelectorAll('[class^=Hero__MediaContentContainer__Video]')
      }
     return block[0]; 
   },
    title: function(){ 
      let title
      title = document.querySelectorAll('meta[name="title"]')
      if (title.length > 0) {
        console.log(title);
        title = title[0].getAttribute('content')
      } else {
        title = document.querySelectorAll('title')[0].innerText
      }
      return title; 
    },
          // document.querySelectorAll('meta[property="og:title"]')[0].getAttribute('content');
    year: function(){ 
      var tmpYear = document.querySelectorAll('.titleBar *[itemprop="datePublished"]');
      //         this.release_date = tmpYear[0].content;
      return ( tmpYear.length > 0 )? tmpYear[0].content : null;
     },
    // no type
  },
  'rottentomatoes': {
    // HAS LDJSON
    block: function(){ return document.getElementById('topSection'); },
    title: function(){ return document.getElementsByTagName('h1')[0].innerText; },
    year:  function(){ return /\(.*?([\d]{4}).*?\)/.exec( document.querySelectorAll('title')[0].innerText )[0] },
    // type from LDJSON
  },
  'tv.com': {
    // HAS LDJSON
    block: function(){ return document.getElementsByClassName('show_stats _clearfix')[0]; },
    title: function(){ return document.getElementsByTagName('h1')[0].innerText; },
    year: function(){ return document.getElementsByClassName('tagline')[0].innerText; }, // TODO: Not working on ended series
  },
  'sensacine.com/peliculas': {
    type: "movie",
    block: function(){ return document.getElementsByClassName('movie-card-overview')[0]; },
    title: function(){ return document.getElementsByClassName('titlebar-title')[0].innerText; },
    year:  function(){ 
      if (typeof GptConfig != 'undefined')
        return GptConfig.targeting.production_year;
      else if(document.getElementsByClassName('date').length > 0) 
        return document.getElementsByClassName('date')[0].innerText; 
      else
        return null;
    },
    // year: function(){ return document.getElementsByClassName('date')[0].innerText; },
    // yearAlt: function(){ return document.getElementsByTagName('title')[0].innerText; },
  },
  'sensacine.com/series': {
    type: "show",
    block: function(){ return document.getElementsByClassName('entity-card-overview')[0]; },
    title: function(){ return document.querySelectorAll('meta[property="og:title"]')[0].getAttribute('content'); },
    year: function(){ return document.querySelectorAll('title')[0].innerText }, // TODO: Improve (there is a js object to look inside)
  },
  'filmaffinity.com': {
    block: function(){ return document.getElementsByClassName('movie-info')[0]; },
    title: function(){ return document.querySelectorAll('meta[property="og:title"]')[0].getAttribute('content'); },
    year: function(){ return null; },
  },
/*
  'fotogramas.es': {
    block: function(){ return document.getElementsByClassName('ficha')[0]; },
    title: function(){ return document.querySelectorAll('h1[itemprop="name"]')[0].innerText; },
    year: function(){ return document.querySelectorAll('time[itemprop="dateCreated"]')[0].getAttribute('datetime'); },
  },
*/
  'trakt.tv/movies': {
    block: function(){ return document.getElementById('huckster-desktop-wrapper'); },
    title: function(){ return document.querySelectorAll('meta[property="og:title"]')[0].getAttribute('content'); },
    year: function(){ return document.querySelectorAll('h1 .year')[0].innerText; },
    type: "movie",
  },
  'trakt.tv/shows': {
    block: function(){ return document.getElementById('huckster-desktop-wrapper'); },
    title: function(){ return document.querySelectorAll('meta[property="og:title"]')[0].getAttribute('content'); },
    year: function(){ return document.querySelectorAll('h1 .year')[0].innerText; },
    type: "show",
  },
  'metacritic.com/movie': {
    // HAS LDJSON
    block: function(){ return document.getElementsByClassName('esite_list')[0]; },
    title: function(){ return document.querySelectorAll('meta[property="og:title"]')[0].getAttribute('content'); },
    year: function(){ return null; },
    type: "movie",
  },
  'metacritic.com/tv': {
    block: function(){ return document.getElementsByClassName('esite_list')[0]; },
    title: function(){ return document.querySelectorAll('meta[property="og:title"]')[0].getAttribute('content'); },
    year: function(){ return document.querySelectorAll('.release_data .data')[0].innerText; },
    type: "show",
  },
  'cinefilica.es': {
    block: function(){ return document.querySelectorAll('title-primary-details-panel')[0]; },
    title: function(){ return document.querySelectorAll('title')[0].innerText; },
    year: function(){ return document.querySelectorAll('h1.title .year')[0].innerText; },
  },
  'ecartelera.com': {
    block: function(){ return document.getElementById('scorebox'); },
    title: function(){ return document.querySelectorAll('meta[property="og:title"]')[0].getAttribute('content'); },
        //titleFull = document.querySelectorAll('span[itemprop="name"]')[0].innerText;
    year: function(){ return document.querySelectorAll('head title')[0].innerText; },
  },
  'themoviedb.org/movie': {
    block: function(){ return document.getElementsByClassName('header')[0]; },
    title: function(){ return document.querySelectorAll('meta[property="og:title"]')[0].getAttribute('content');  },
    year: function(){ return document.getElementsByClassName('release_date')[0].innerText; },
    type: "movie",
  },
  'themoviedb.org/tv': {
    block: function(){ return document.getElementsByClassName('header')[0]; },
    title: function(){ return document.querySelectorAll('meta[property="og:title"]')[0].getAttribute('content');  },
    year: function(){ return document.getElementsByClassName('release_date')[0].innerText; },    
    type: "show", 
  },
  'thetvdb.com': {
    block: function(){ return document.getElementById('series_basic_info'); },
    title: function(){ return document.getElementById('series_title').innerText;  },
    year: function(){ return document.querySelectorAll('#series_basic_info li span')[2].innerText; }, //TODO
    type: "show",
  },
  'simkl.com/movies': {
    block: function(){ return document.getElementsByClassName('SimklTVAboutBlockTitle')[0]; },
    title: function(){ return document.querySelectorAll('h1[itemprop="name"]')[0].innerText; },
    year:  function(){ return document.getElementsByClassName('detailYearInfo')[0].innerText; },    
    type: "movie",
  },
  'simkl.com/tv': {
    block: function(){ return document.getElementsByClassName('SimklTVAboutBlockTitle')[0]; },
    title: function(){ return document.querySelectorAll('h1[itemprop="name"]')[0].innerText; },
    year:  function(){ return document.getElementsByClassName('detailYearInfo')[0].innerText; },    
    type: "show",
  },
  'criticker.com/film': {
    block: function(){ return document.getElementById('fi_moreinfo'); },
    title: function(){ return document.querySelectorAll('h1 [itemprop="name"]')[0].innerText; },
    year:  function(){ return document.querySelectorAll('h1 [itemprop="datePublished"]')[0].innerText; },
    type: "movie",
  },
  'criticker.com/tv': {
    block: function(){ return document.getElementById('fi_moreinfo'); },
    title: function(){ return document.querySelectorAll('h1 [itemprop="name"]')[0].innerText; },
    year:  function(){ return document.querySelectorAll('h1 [itemprop="startDate"]')[0].innerText; },
    type: "show",
  },
  'abc.es': {
    block: function(){ return document.getElementsByClassName('datos-ficha')[0]; },
    title: function(){ return document.querySelectorAll('meta[property="og:title"]')[0].getAttribute('content'); },
    year:  function(){ return null; },
    type: "movie",
  },
  'letterboxd.com': {
    block: function(){ return document.getElementById('featured-film-header'); },
    title: function(){ return document.querySelectorAll('meta[property="og:title"]')[0].getAttribute('content'); },
    year:  function(){ var dataElement = document.querySelectorAll('.film-poster')[0]; return (dataElement)?dataElement.dataset.filmReleaseYear:null; },
    type: "movie",
  },
  'tvtime.com': {
    block: function(){ return document.getElementsByClassName('show-nav')[0]; },
    title: function(){ return document.querySelectorAll('meta[property="og:title"]')[0].getAttribute('content'); },
    year:  function(){ return document.querySelectorAll('meta[itemprop="startDate"]')[0].getAttribute('content'); },
    type: "show",
  },
  'allmovie.com': {
    block: function(){ return document.getElementsByClassName('affiliate-links')[0]; },
    title: function(){ return document.querySelectorAll('meta[property="og:title"]')[0].getAttribute('content'); },
    year:  function(){ return document.getElementsByClassName('release-year')[0].getAttribute('content'); },
    type: "movie",
  },
  'trailers.apple.com': {
    waitForSelector: 'h1.replaced',
    block: function(){ return document.querySelectorAll('header#main-header')[0]; },
    title: function(){ return document.querySelectorAll('h1.replaced')[0].innerText; },
    year: function(){ return document.getElementsByClassName('release')[0].innerText },
    type: "movie",
  },

  'netflix.com': {
    waitForSelector: '.jawBoneContainer',
    block: function(){ return document.querySelectorAll('.jawBoneContainer')[0]; },
    title: function(){ return document.querySelectorAll('h1 .title-small img')[0].getAttribute('alt'); },
    year: function(){ return document.getElementsByClassName('year')[0].innerText },
  },
  'primevideo.com': {
    //block: function(){ return document.querySelectorAll('.av-meta-info-wrapper')[0]; },
    block: function(){ return document.querySelectorAll('#dv-action-box-wrapper')[0]; },
    title: function(){ return document.querySelectorAll('h1')[0].innerText; },
    // year: function(){ return document.querySelectorAll('.av-badge-text[data-automation-id="release-year-badge"]')[0].innerText }, 
    year: function(){ 
      var nodes = document.querySelectorAll('.av-detail-section [data-automation-id="release-year-badge"]');
      return (nodes.length > 0)? nodes[0].innerText : "";
     }, 
  },
  'hboespana.com': {
    waitForSelector: 'h1[data-automation="title"]',
    block: function(){ return document.querySelectorAll('.page > div')[0]; },
    title: function(){ return document.querySelectorAll('h1')[0].innerText; },
    year: function(){ return document.querySelectorAll('div[data-automation="meta_year"]')[0].innerText },     
  },
  'tvmaze.com': {
    block: function(){ return document.querySelectorAll('#general-info-panel')[0]; },
    title: function(){ return document.querySelectorAll('h1')[0].innerText; },
    year: function(){ return document.querySelectorAll('#year')[0].innerText.substring(1, 5)},     
	  type: "show",
  },
  'rakuten.tv': {
    //waitForSelector: 'h1[data-automation="title"]',
    block: function(){ return document.querySelectorAll('.detail__hero')[0]; },
    title: function(){ return document.querySelectorAll('h1.detail__data__meta__title')[0].innerText; },
    year: function(){ return null; },     
  }
}
