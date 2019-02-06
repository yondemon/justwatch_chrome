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

    if(location.hostname.match('imdb')) {
      //console.log('imdb');
      this.reviewBar = document.getElementsByClassName('plot_summary_wrapper')[0];
      //titleFull = document.querySelectorAll('meta[property="og:title"]')[0].getAttribute('content');
      this.titleFull = document.querySelectorAll('meta[name="title"]')[0].getAttribute('content');

      var tmpYear = document.querySelectorAll('.titleBar *[itemprop="datePublished"]');
      if( tmpYear.length > 0 ){
        this.release_date = tmpYear[0].content;
        this.year = this.extractYear();  
      }

    } else if(location.hostname.match('rottentomatoes')) {
      //console.log('rottentomatoes');  
      // HAS LDJSON
      this.reviewBar = document.getElementById('watch-it-now');
      this.titleFull = document.getElementsByTagName('h1')[0].innerText;

      if(this.year == null){
        this.year = document.querySelectorAll('span.year')[0].innerText;
      }

    } else if(location.hostname.match('tv.com')) {
      //console.log('tv.com');
      // HAS LDJSON
      this.reviewBar = document.getElementsByClassName('show_stats _clearfix')[0];
      this.titleFull = document.getElementsByTagName('h1')[0].innerText;

      this.year = this.extractYear(document.getElementsByClassName('tagline')[0].innerText);

    } else if(location.hostname.match('sensacine.com')) {
      //console.log('sensacine.com');
      if(location.pathname.match('series')) {
        this.type = "show";
        this.reviewBar = document.getElementsByClassName('module-actionbar')[0];
        this.titleFull = document.querySelectorAll('meta[property="og:title"]')[0].getAttribute('content');

      } else {
        this.type = "movie";
        this.reviewBar = document.getElementsByClassName('card-movie-overview')[0];
        this.titleFull = document.getElementsByClassName('titlebar-title')[0].innerText;

        this.year = this.extractYear(document.getElementsByClassName('date')[0].innerText);
        this.yearAlt = this.extractYear(document.getElementsByTagName('title')[0].innerText);
      }

    } else if(location.hostname.match('filmaffinity.com')) {
      // console.log('filmaffinity.com');
      this.reviewBar = document.getElementsByClassName('movie-info')[0];
      this.titleFull = document.querySelectorAll('meta[property="og:title"]')[0].getAttribute('content');  

      if( /TV\)/.test( this.titleFull ) ) {
        this.type = "show";
      } else {
        this.type = "movie";
      }

    } else if(location.hostname.match('fotogramas.es')) {
      //console.log('fotogramas.es');
      this.reviewBar = document.getElementsByClassName('ficha')[0];
      this.titleFull = document.querySelectorAll('h1[itemprop="name"]')[0].innerText;  
      this.year = document.querySelectorAll('time[itemprop="dateCreated"]')[0].getAttribute('datetime');

    } else if(location.hostname.match('cinefilica.es')) {
      //console.log('cinefilica.es');
      this.reviewBar = document.getElementById('ko-bind');
      this.titleFull = document.querySelectorAll('meta[property="og:title"]')[0].getAttribute('content');
      
    } else if(location.hostname.match('ecartelera.com')) {
      //console.log('ecartelera.com');
      this.reviewBar = document.getElementById('scorebox');
      this.titleFull = document.querySelectorAll('meta[property="og:title"]')[0].getAttribute('content');
      //titleFull = document.querySelectorAll('span[itemprop="name"]')[0].innerText;
      this.year = this.extractYear(document.querySelectorAll('head title')[0].innerText);
    } else if(location.hostname.match('metacritic.com')) {
      // HAS LDJSON
      this.titleFull = document.querySelectorAll('meta[property="og:title"]')[0].getAttribute('content');
      switch(this.type){
        case 'movie':
          this.reviewBar = document.getElementById('nav_to_awards');
          break;
        case 'show':
          this.reviewBar = document.getElementsByClassName('product_data_summary')[0];
          break;
      }
    } else if(location.hostname.match('themoviedb.org')) {

      this.reviewBar = document.getElementsByClassName('header')[0];
      this.titleFull = document.querySelectorAll('meta[property="og:title"]')[0].getAttribute('content');  
      this.year = this.extractYear(document.getElementsByClassName('release_date')[0].innerText);

    } else if(location.hostname.match('letterboxd.com')) {

      //this.reviewBar = document.getElementsByClassName('col-main')[0];
      this.reviewBar = document.getElementById('featured-film-header');
      this.titleFull = document.querySelectorAll('meta[property="og:title"]')[0].getAttribute('content');  
      //this.year = this.extractYear(document.getElementsByClassName('release_date')[0].innerText);
      this.year = this.extractYear(document.querySelectorAll('*[itemprop="datePublished"]')[0].innerText);
      // 
    } else if(location.hostname.match('abc.es')) {

      this.type = "movie";
      this.reviewBar = document.getElementsByClassName('horario-emision')[0];
      this.titleFull = document.querySelectorAll('meta[property="og:title"]')[0].getAttribute('content');  
      this.year = this.extractYear(this.titleFull);

    } else {
      console.log('error');
    }

    if (typeof this.reviewBar !== 'undefined') {
      var div = document.createElement("div");
      div.classList.add('justwatch');

      var titleRegexp = /(.*)\s\(.*?([\d]{4}).*?\)/;
      var matches;
      matches = titleRegexp.exec(this.titleFull);
      
      if( typeof this.year != 'undefined' ) {
        this.title = this.titleFull;
        if(matches !== null) {
          this.title = matches[1];
          this.yearAlt = parseInt(matches[2]);
        } 
      } else if(matches !== null) {
        this.title = matches[1];
        this.year = parseInt(matches[2]);
      } else if(this.startDate != null) {
        this.title = this.titleFull;
        this.year = this.startDate.getFullYear();
      } else {
        this.title = this.titleFull;
        this.year = null;
      }

      if (debug) console.log( 'T: "' + this.titleFull + '"" t: "' +  this.title + '" Y:' + this.year + ' Y:' + this.yearAlt );
      
      if (this.title !== null) {
        var xhr = new XMLHttpRequest();
        
        var localization = l18n;
        //var url = 'https://api.justwatch.com/titles/'+localization+'/popular';
        var url = 'https://'+API_DOMAIN+'/titles/'+localization+'/popular';
        //if (debug) console.log(url);

        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
        xhr.setRequestHeader('User-Agent', 'JustWatch unofficial chrome extension (github.com/yondemon/justwatch_chrome/)');

        var $this = this;
        xhr.onreadystatechange = function() {
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
              console.log(this.movieJustWatchData);
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
    title_id = encodeURIComponent(title_id);
    content_type = encodeURIComponent(content_type);
    //var locale = encodeURIComponent(this._options.locale);
    var locale = l18n;
    return await this.request('GET', '/titles/'+content_type+'/'+title_id+'/locale/'+locale);
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



  request(method, endpoint, params)
  {
    return new Promise((resolve, reject) => {
      params = Object.assign({}, params);
      // build request data
      var reqData = {
        protocol: 'https:',
        hostname: API_DOMAIN,
        path: endpoint,
        method: method,
        headers: {}
      };
      var body = null;
      // add query string if necessary
      if(method==='GET')
      {
        if(Object.keys(params) > 0)
        {
          reqData.path = reqData.path+'?'+QueryString.stringify(params);
        }
      }
      else
      {
        body = JSON.stringify(params);
        reqData.headers['Content-Type'] = 'application/json';
      }

      // send request
      const req = https.request(reqData, (res) => {
        // build response
        let buffers = [];
        res.on('data', (chunk) => {
          buffers.push(chunk);
        });

        res.on('end', () => {
          // check if response 
          var output = null;
          try
          {
            output = Buffer.concat(buffers);
            output = output.toString();
            output = JSON.parse(output);
          }
          catch(error)
          {
            if(res.statusCode !== 200)
            {
              reject(new Error("request failed with status "+res.statusCode+": "+res.statusMessage));
            }
            else
            {
              reject(error);
            }
            return;
          }
          
          if(output.error)
          {
            reject(new Error(output.error));
          }
          else
          {
            resolve(output);
          }
        });
      });

      // handle error
      req.on('error', (error) => {
        reject(error);
      });

      // send
      if(method !== 'GET' && body)
      {
        req.write(body);
      }
      req.end();
    });
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
  27: 'hbo-now', // USA
  31: 'hbo-go', // USA
  34: 'epix',
  35: 'rakuten-tv', //wuaki
  //37: 'showtime', // USA
  47: 'looke', // BR
  52: 'cravetv', // CA
  62: 'atres-player',
  63: 'filmin',
  64: 'filmin-plus',
  67: 'blim', // MX
  68: 'microsoft-store',
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
}

var price = {
  'EUR': '€',
  'USD': '$',
  'CAD': '$',
  'JPY': '¥',
  'MXN': '$',
  'BRL': 'R$',
}

var plugin;

document.body.onload = function(){

  plugin = new JustWatchChrome();

  browser.storage.sync.get('justwatch-l18n', 
    function(value){
      if (typeof value['justwatch-l18n'] != 'undefined'){
        l18n = value['justwatch-l18n'];
      }

      plugin.execute();

    });
};