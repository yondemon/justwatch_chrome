console.log("JustWatch!");
const browser = window.browser || window.chrome;

var debug = true;
var l18n = 'es_ES';
const API_DOMAIN = 'api.justwatch.com';
const DOMAIN = 'justwatch.com';

class JustWatchChrome {

  constructor(){
    this.ldJSON = null;
    this.startDate = null;
    this.reviewBar;
    
    this.titleFull = "";
    this.title = null;
    this.year = null; 
    this.yearAlt = null;
    this.type = null;
    this.release_date = null;


    this.noMatchesP = document.createElement("p");
    this.noMatchesP.setAttribute('id','justwatch-nomatches');
    this.noMatchesP.classList.add('message');
    this.noMatchesP.innerHTML = 'NO MATCHES';
  }

  execute() {

    if(document.querySelectorAll('*[itemtype="http://schema.org/TVSeries"]').length > 0){
      this.type = "show";
    } else if(document.querySelectorAll('*[itemtype="http://schema.org/Movie"]').length > 0) {
      this.type = "movie";
    }

    this.ldJSON = document.querySelectorAll('script[type="application/ld+json"]');
    if(this.ldJSON.length > 0) {
      this.ldJSON = this.ldJSON[0].innerText;
      if (debug) console.log(this.ldJSON);

      this.ldJSON = this.ldJSON.replace(/(\r\n|\n|\r)/gm,"");
      var showdata = JSON.parse(this.ldJSON.trim());
      this.startDate = new Date(showdata.startDate);

      if(showdata['@type'] == "TVSeries"){
        this.type = "show";
      } else if(showdata['@type'] == "Movie") {
        this.type = "movie";
      }

      this.title = showdata['name'];
      this.year = this.extractYear( showdata['datePublished'] );

      if(debug) console.log(showdata);
    }

    this.ready = false;
    for (let hostname in supportedWeb) {
      
      // if(location.hostname.match(hostname)){
      if(location.href.match(hostname)){          
        console.log(hostname);

        this.reviewBar = supportedWeb[hostname].block();
        this.titleFull = (this.title == null)? supportedWeb[hostname].title() : this.title;
        
        var year = this.extractYear( supportedWeb[hostname].year() );
        if (this.year == null){
          this.year = year;
        } else {
          this.yearAlt = year;
        }
        
        if (this.type == null){
          this.type = supportedWeb[hostname].type;
        }

        this.ready = true;
        break;
      }
    }

    if (!this.ready) {
      console.log('error');
    } else {
      console.log(this);
    }
    
    if (typeof this.reviewBar !== 'undefined') {
      var div = document.createElement("div");
      div.classList.add('justwatch');

      // var titleRegexp = /(.*)\s\(.*?([\d]{4}).*?\)/;
      var titleRegexp = /^([^(]*)(\s\(.*\T\V\))?\s\(([\d]{4})\)/;
      var matches;
      matches = titleRegexp.exec(this.titleFull);
      if (debug) console.log(matches);
      
      if( typeof this.year != 'undefined' ) {
        this.title = this.titleFull;
        if(matches !== null) {
          this.title = matches[1];
          this.yearAlt = parseInt(matches[3]);
        } 
      } else if(matches !== null) {
        this.title = matches[1];
        this.year = parseInt(matches[3]);
      } else if(this.startDate != null) {
        this.title = this.titleFull;
        this.year = this.startDate.getFullYear();
      } else {
        this.title = this.titleFull;
        this.year = null;
      }

      if ( this.yearAlt == null && this.year){
        this.yearAlt = this.year - 1;
      }

      /*
      if ( matches && matches[2] !== null ){
        this.type = 'show';
      } else {
        this.type = 'movie';
      }
      */
      
      if (debug) console.log( 'T: "' + this.titleFull + '"" t: "' +  this.title + '" Y:' + this.year + ' Y:' + this.yearAlt + ' t:' + this.type);
      
      if (this.title !== null) {
        var xhr = new XMLHttpRequest();
        
        var localization = l18n;
        //var url = 'https://api.justwatch.com/titles/'+localization+'/popular';
        var url = 'https://'+API_DOMAIN+'/titles/'+localization+'/popular';
        //if (debug) console.log(url);

        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
        // xhr.setRequestHeader('User-Agent', 'JustWatch unofficial chrome extension (github.com/yondemon/justwatch_chrome/)');

        var $this = this;
        xhr.onreadystatechange = (e) => {
          if (xhr.readyState == 4) {
            var resp = JSON.parse(xhr.responseText);

            if (resp.total_results > 0) {
              if(debug) console.log(resp.total_results + ' results');
              if(debug) console.log(resp);
              $this.printPanel(resp, div);      
            }
          }
        };

        var query = {"query":this.title};
        if(typeof this.type != 'undefined'){
          query.content_types = [this.type];
        }
        if(debug) console.log(query);
        xhr.send( JSON.stringify( query ) );

        //reviewBar[0].appendChild(div);
        this.reviewBar.parentNode.insertBefore(div, this.reviewBar.nextSibling);
      }

    }

  }


  extractYear(string){
    var matches = /(\d){4}/.exec(string);
    if( matches != null){
      return matches[0];
    }
    return null;
  }

  showListResults(response){
    
    for(let [index,item] of response.items.entries() ){
      var liElement = document.createElement('li');
      var resultlink = document.createElement('a');
      resultlink.innerHTML = item.original_title + "&nbsp;("+ item.original_release_year+")";
      resultlink.setAttribute('href','http://'+ DOMAIN + item.full_path);
      liElement.appendChild( resultlink );
      this.noMatchesP.appendChild( liElement );
    }
  }

  printPanel(response, div){  
    var offersDiv,
      nomatches = true,
      responseMatches = [];

    div.appendChild( document.createRange().createContextualFragment( this.getPanelTitleHTML() ) );

    div.appendChild( this.noMatchesP );

    if(response.total_results > 0){

      //justWatchSetTotalResults( response.total_results );

      if(response.total_results === 1){
        item = response.items[0];
        this.setPanelTitleURL(item);
        
        nomatches = false;

        div.appendChild( this.getOffersHTML(item.offers) );

      }  else {

        var done = false;
        var totalItems = response.items.length;
        for(var i = 0 ; i < totalItems /*&& !done*/; i++) {
          var item = response.items[i];
          if( 
            (this.year != null  && (item.original_release_year == this.year) )
            || (this.yearAlt != null && item.original_release_year == this.yearAlt)
            ){

            if(!done){
              nomatches = false;
              this.setPanelTitleURL(item);
              div.appendChild( this.getOffersHTML(item.offers) );

              this.movieJustWatchData = this.getTitle(this.type, item.id);

              console.log({data:this.movieJustWatchData});
            }
            done = true;

            responseMatches.push(item);
          }
        }
      }

      if(nomatches){
        this.noMatchesP.innerHTML = 'NO PERFECT MATCHES [but '+ response.total_results +' results]';

        if (debug) this.noMatchesP.innerHTML += '<p>T:'+this.titleFull +' Y:'+this.year + ' Y:'+this.yearAlt +'</p>';   

        this.listResults(response);

        div.appendChild( this.getOffersHTML(response.items[0].offers) );

      } else {     
        this.removeNoMatches();

        if(debug) this.setTotalResults( responseMatches.length +'/'+response.total_results );

        console.log(responseMatches);
        //this.showListResults(responseMatches);
      }
    }
  }

  async getTitle(content_type, title_id)
  {
    console.log('getTitle',{content_type, title_id})
    title_id = encodeURIComponent(title_id);
    content_type = encodeURIComponent(content_type);
    //var locale = encodeURIComponent(this._options.locale);

    const xhr = new XMLHttpRequest();
    const locale = l18n;
    // return await this.request('GET', '/titles/'+content_type+'/'+title_id+'/locale/'+locale);

    const url = 'https://'+API_DOMAIN + '/titles/'+content_type+'/'+title_id+'/locale/'+locale;
    xhr.open("GET",url);
    xhr.send();
    xhr.onreadystatechange = (e) => {
      if(xhr.readyState == 4){
        return xhr.responseText;
      }
    }
  }

  getPanelTitleHTML(){
      return '<span id="justwatch-title" class="title">JustWatch:'+ ( (debug)?'['+l18n +']':'') +' <span id="justwatch-title-full">'+this.titleFull+'</span></span>';
  }

  setTotalResults(number){
    var titleBlock = document.getElementById('justwatch-title');
    titleBlock.insertAdjacentHTML('beforeend','<span id="justwatch-totalresults">['+number+']</span>');
  }

  setPanelTitleURL(item){
      var originalSpan = document.getElementById('justwatch-title');
      var replacementA = document.createElement("a");
      replacementA.innerHTML = originalSpan.innerHTML;
      replacementA.setAttribute('href','http://'+ DOMAIN + item.full_path);
      replacementA.setAttribute('id','justwatch-title');
      replacementA.classList.add('title');
      originalSpan.parentNode.replaceChild(replacementA,originalSpan);

      document.getElementById('justwatch-title-full').innerHTML = item.original_title + ' (' + item.original_release_year + ')';    
  }

  removeNoMatches(){
    this.noMatchesP.parentNode.removeChild(this.noMatchesP);
  }

  setPresentationTypesMenu(presentationTypes){
    console.log(presentationTypes);

    var titlepanel = document.getElementById('justwatch-title');
    //presentationTypes.each();
  }

  setCheapestOffer(offer,offersDiv,offersData){

    if (typeof offersData[offer.monetization_type][offer.provider_id] == 'undefined') {
      offersData[offer.monetization_type][offer.provider_id] = {};
    };
    
    if(typeof offer.retail_price != 'undefined') {
      offersData[offer.monetization_type][offer.provider_id]['cheapest_price'] = offer.retail_price;
    } else {
      offersData[offer.monetization_type][offer.provider_id] = true;
    }
    
    var old = offersDiv.querySelectorAll('.monetization-'+offer.monetization_type+'.provider-'+offer.provider_id+'.cheapest');
    if(old.length > 0){
      old[0].classList.remove("cheapest");
    }

  }

  getOffersHTML(offers){
    var offersDiv = document.createElement("div");
    offersDiv.classList.add('justwatch-offers');

    var lists = {
      'flatrate': 'Flat',
      'rent': 'Rent',
      'buy': 'Buy',
      'free': 'Free',
      'cinema': 'Cinema',
      'other': '-',
      },
      presentationTypes = {
        //'cheapest': false,
        'sd': false,
        'hd': false,
        '4k': false,
      },
      offersData = {}
      ;

    var ulBlocks = {};

    for (var dataList in lists) {
      if (lists.hasOwnProperty(dataList)) {
        offersData[dataList] = {};

        ulBlocks[dataList] = document.createElement("ul");
        ulBlocks[dataList].setAttribute('data-monetization_type',dataList);
        ulBlocks[dataList].setAttribute('data-title',lists[dataList]);
        offersDiv.appendChild( ulBlocks[dataList] );
      }
    }
      
    if (typeof offers !== 'undefined' && offers.length > 0){
      
      for (const [index, offer] of offers.entries()) {      
        //if(debug) console.log(offer);

        var domainString = '';
        var url = '#';

        if(typeof offer.urls !== 'undefined' /*offer.urls.length > 0*/ && typeof offer.urls.standard_web !== 'undefined'){
          domainString = offer.urls.standard_web.replace('http://','').replace('https://','').replace('www.','').split(/[/?#]/)[0];
          url = offer.urls.standard_web;
        }

        var logo = '';
        var logoURL = this.providerLogoURL(offer.provider_id);

        if(logoURL != false){
          logo = '<img src="'+ logoURL +'" alt="'+ offer.monetization_type + ' ' + domainString +'"/>';
        } else {
          logo = domainString;
        }

        presentationTypes[offer.presentation_type] = true;
        var cheapest = false;

        switch(offer.monetization_type){
          case 'flatrate':
            
            if(typeof offersData[offer.monetization_type][offer.provider_id] == 'undefined'){
              this.setCheapestOffer(offer,offersDiv,offersData);
              cheapest = true;
            }

            ulBlocks[offer.monetization_type].insertAdjacentHTML('beforeend',
              '<li id="offer-'+index+'" '
                + 'class="monetization-'+offer.monetization_type+' presentation-'+offer.presentation_type+' '
                +    ' provider-'+offer.provider_id+' '+(cheapest?'cheapest':'')+'"><a href="' + url
                + '"><span class="provider provider-'+offer.provider_id+'">' + logo + '</span> <span class="presentation">' 
                + offer.presentation_type + '</span></a></li>\n');
              break;

          case 'rent':

            if(typeof offersData[offer.monetization_type][offer.provider_id] == 'undefined' 
              || offer.retail_price < offersData[offer.monetization_type][offer.provider_id]['cheapest_price'] ){
              this.setCheapestOffer(offer,offersDiv,offersData);
              cheapest = true;
            }

            ulBlocks[offer.monetization_type].insertAdjacentHTML('beforeend',
              '<li id="offer-'+index+'" '
                + 'class="monetization-'+offer.monetization_type+' presentation-'+offer.presentation_type+' '
                +    ' provider-'+offer.provider_id+' '+(cheapest?'cheapest':'')+'"><a href="' + url
                + '"><span class="provider provider-'+offer.provider_id+'">'+logo+'</span>  <span class="presentation">' 
                + offer.presentation_type + '</span>  <span class="price">' 
                + offer.retail_price + ' ' + price[offer.currency] + '</span></a></li>\n');
              break;

          case 'buy':

            if(typeof offersData[offer.monetization_type][offer.provider_id] == 'undefined' 
              || offer.retail_price < offersData[offer.monetization_type][offer.provider_id]['cheapest_price'] ){
              this.setCheapestOffer(offer,offersDiv,offersData);
              cheapest = true;
            }

            ulBlocks[offer.monetization_type].insertAdjacentHTML('beforeend',
              '<li id="offer-'+index+'" '
                + 'class="monetization-'+offer.monetization_type+' presentation-'+offer.presentation_type+' '
                +    ' provider-'+offer.provider_id+' '+(cheapest?'cheapest':'')+'"><a href="' + url
                + '"><span class="provider provider-'+offer.provider_id+'">'+logo+'</span>  <span class="presentation">' 
                + offer.presentation_type + '</span>  <span class="price">' 
                + offer.retail_price + ' ' + price[offer.currency] + '</span></a></li>\n');
              break;

          case 'free':

            ulBlocks[offer.monetization_type].insertAdjacentHTML('beforeend',
              '<li id="offer-'+index+'" '
                + 'class="monetization-'+offer.monetization_type+' presentation-'+offer.presentation_type+' '
                +    ' provider-'+offer.provider_id+' cheapest"><a href="' + url
                + '"><span class="provider provider-'+offer.provider_id+'">' + logo + '</span> <span class="presentation">' 
                + offer.presentation_type + '</span></a></li>\n');
              break;
          case 'cinema':
            ulBlocks[offer.monetization_type].insertAdjacentHTML('beforeend',
              '<li id="offer-'+index+'" '
                + 'class="monetization-'+offer.monetization_type+' presentation-'+offer.presentation_type+' '
                +    ' provider-'+offer.provider_id+' cheapest"><a href="' + url
                + '"><span class="provider provider-'+offer.provider_id+'">' + logo + '</span> <span class="presentation">' 
                + offer.presentation_type + '</span></a></li>\n');
              break;

          default:
            ulBlocks['other'].insertAdjacentHTML('beforeend',
              '<li id="offer-'+index+'" '
                + 'class="monetization-'+offer.monetization_type+' presentation-'+offer.presentation_type+' '
                +    ' provider-'+offer.provider_id+' cheapest"><a href="' + url
                + '"><span class="provider provider-'+offer.provider_id+'">'+logo+'</span>  <span class="presentation">' 
                + offer.monetization_type + ' ' + offer.presentation_type+'</span>  <span class="price">' 
                + ((typeof offer.retail_price !== 'undefined')? offer.retail_price :'0')+''
                + ( (typeof offer.currency !== 'undefined')?
                    ((typeof price[offer.currency] !== 'undefined')? price[offer.currency] : offer.currency ) 
                    : '-' ) 
                +'</span></a></li>\n');
        }

      }

      for (var block in ulBlocks) {
        if (ulBlocks.hasOwnProperty(block)) {
          var offerBlock = ulBlocks[block];
          if (typeof offerBlock.childNodes == 'undefined' ||
            offerBlock.childNodes.length === 0) {

            offersDiv.removeChild(ulBlocks[block]);
          }
        }
      }
   
      this.setPresentationTypesMenu(presentationTypes);

    } else {
      offersDiv.innerHTML = '<p class="message">NO OFFERS</p>';
    }

    return offersDiv;
  }

  providerLogoURL(provider_id){
    if(typeof providers[provider_id] != "undefined"){
      return chrome.runtime.getURL('providers/'+providers[provider_id]+'.jpeg');
    }
    return false;
  }

  getWaitForSelector(){
    for (let hostname in supportedWeb) {
      if(location.hostname.match(hostname)){
        console.log(hostname);
      
        if (typeof supportedWeb[hostname].waitForSelector != 'undefined'){
          return supportedWeb[hostname].waitForSelector;
        } else {
          return '';
        }
        
      }

    }
    return '';
  }

}

var providers = {
  2: 'apple-itunes',
  3: 'google-play-movies',
  6: 'maxdome', // DE
  7: 'vudu',
  8: 'netflix',
  9: 'amazon',
  10: 'amazon-instant-video',
  11: 'mubi',
  12: 'crackle', // MX
  15: 'hulu',
  18: 'playstation',
  19: 'netmovies', // BR
  25: 'fandor',
  27: 'hbo-now', // USA
  31: 'hbo-go', // USA
  34: 'epix',
  35: 'rakuten-tv', //wuaki
  //37: 'showtime', // USA
  47: 'looke', // BR
  52: 'cravetv', // CA
  60: 'fandangonow',
  62: 'atres-player',
  63: 'filmin',
  64: 'filmin-plus',
  67: 'blim', // MX
  68: 'microsoft-store',
  73: 'tubi-tv',
  //81: 'CINEMA',
  84: 'u-next', // JP
  85: 'dtv', // JP
  86: 'gyao', // JP
  100: 'guidedoc',
  105: 'fandangonow',
  118: 'hbo', //hboespana
  119: 'amazon-prime-video',
  140: 'cineplex', // CA
  146: 'icitoutv', // CA
  149: 'movistar-plus',
  167: 'claro-video',
  169: 'the-movie-network-go', // CA
  182: 'hollywood-suite', // CA
  188: 'youtube-red',
  191: 'kanopy', // USA
  192: 'youtube',
  212: 'hoopla', // USA
  215: 'syfy', // USA
}

var price = {
  'EUR': '€',
  'USD': '$',
  'CAD': '$',
  'JPY': '¥',
  'MXN': '$',
  'BRL': 'R$',
}

var supportedWeb = {
  'imdb' : {
    block: function(){ return document.getElementsByClassName('plot_summary_wrapper')[0]; },
    title: function(){ return document.querySelectorAll('meta[name="title"]')[0].getAttribute('content'); },
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
    block: function(){ return document.getElementById('watch-it-now'); },
    title: function(){ return document.getElementsByTagName('h1')[0].innerText; },
    year: function(){ return document.querySelectorAll('span.year')[0].innerText; },
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
    year: function(){ return document.getElementsByClassName('date')[0].innerText; },
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
  'themoviedb.org': {
    block: function(){ return document.getElementsByClassName('header')[0]; },
    title: function(){ return document.querySelectorAll('meta[property="og:title"]')[0].getAttribute('content');  },
    year: function(){ return document.getElementsByClassName('release_date')[0].innerText; },
  },
  'thetvdb.com': {
    block: function(){ return document.getElementById('series_basic_info'); },
    title: function(){ return document.getElementById('series_title').innerText;  },
    year: function(){ return document.querySelectorAll('#series_basic_info li span')[2].innerText; }, //TODO
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
    year:  function(){ return document.querySelectorAll('*[itemprop="datePublished"]')[0].innerText; },
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
  }
}

var plugin;

document.body.onload = function(){

  plugin = new JustWatchChrome();

  browser.storage.sync.get('justwatch-l18n', 
    function(value){
      if (typeof value['justwatch-l18n'] != 'undefined'){
        l18n = value['justwatch-l18n'];
      }

      var waitForSelector = plugin.getWaitForSelector();

      if (waitForSelector.length == 0){
        console.log('NO wait');
          plugin.execute();
      } else {
        console.log("waitng for [" + waitForSelector + "]");

        var checkExist = setInterval(function() {
          if (document.querySelectorAll(waitForSelector).length) {
            console.log("Exists! [" + waitForSelector + "]");
            plugin.execute();

            clearInterval(checkExist);
          }
        }, 100);
      }

    });
};