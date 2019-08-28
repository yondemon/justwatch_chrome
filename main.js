console.log("JustWatch!");
const browser = window.browser || window.chrome;

var debug = false;
var l18n = 'es_ES';
const API_DOMAIN = 'apis.justwatch.com';
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

      if(showdata['@type'] == "TVSeries" || showdata['@type'] == "Movie"){
        this.startDate = new Date(showdata.startDate);
      
        if(showdata['@type'] == "TVSeries"){
          this.type = "show";
        } else if(showdata['@type'] == "Movie") {
          this.type = "movie";
        }
        this.title = showdata['name'];
        this.year = this.extractYear( showdata['datePublished'] );
        if(debug) console.log(showdata);
      } else {
        this.ldJSON = null;
      }

    }

    this.ready = false;
    for (let hostname in supportedWeb) {
      
      // if(location.hostname.match(hostname)){
      if(location.href.match(hostname)){          
        if(debug) console.log(hostname);

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
      if(debug) console.log('error');
    } else {
      if(debug) console.log(this);
    }
    
    if (typeof this.reviewBar !== 'undefined') {
      var div = document.createElement("div");
      div.classList.add('justwatch');
      this.reviewBar.parentNode.insertBefore(div, this.reviewBar.nextSibling);

      // var titleRegexp = /(.*)\s\(.*?([\d]{4}).*?\)/;
      var titleRegexp = /(.*)(\s\(.*\T\V\))?\s\(.*?([\d]{4}).*?\)/;
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
        var $this = this;

        chrome.runtime.sendMessage(
          {
            type: "fetchAPI", 
            data: {
              title: this.title, 
              type: this.type,
              localization: l18n
            }
          }, 
          function(response) {
            console.log(response);
            $this.printPanel(response, div);
          });
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

        div.appendChild( this.getRatingsHTML(item.scoring) );
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
              div.appendChild( this.getRatingsHTML(item.scoring) );
              div.appendChild( this.getOffersHTML(item.offers) );

              // this.movieJustWatchData = this.getTitle(this.type, item.id);
              // if(debug) console.log({data:this.movieJustWatchData});
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

        if(debug) console.log(responseMatches);
        //this.showListResults(responseMatches);
      }
    }
  }

  async getTitle(content_type, title_id)
  {
    /*
    if(debug) console.log('getTitle',{content_type, title_id})
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
    */
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

  getRatingsHTML(ratings){
    var ratingsDiv = document.createElement("div");
    ratingsDiv.classList.add('justwatch-ratings');

    var ratingsUl = document.createElement("ul");
    ratingsDiv.appendChild( ratingsUl );

    let cleanedRatings = {};
    if(debug) console.log({ratings});

    for (var rating of ratings) {
      let [provider] = rating.provider_type.split(':');
      switch(rating.provider_type){
        case 'imdb:score':
        case 'tmdb:score':
        case 'tomato:meter':
        case 'metacritic:score':
          if(typeof cleanedRatings[provider] == 'undefined')
            cleanedRatings[provider] = {};

          cleanedRatings[provider]['rating'] = rating.value;
          break;
        case 'tomato:id':
        case 'tmdb:id':
          if(typeof cleanedRatings[provider] == 'undefined')
            cleanedRatings[provider] = {};
          
          cleanedRatings[provider]['id'] = rating.value;
          break;
        default:
          break;
      }
    }
    if(debug) console.log({cleanedRatings});

    for (const [provider, content] of Object.entries(cleanedRatings) ){
      let ratingStr = '';
      switch(provider){
        case 'imdb':
        case 'tmdb':
          ratingStr = content.rating + '/10';
          break;
        case 'tomato':
          ratingStr = content.rating + '%';
          break;
        case 'metacritic':
          ratingStr = content.rating;
          break
        default:
          break;
      }
      if (ratingStr != '') {
        ratingsUl.insertAdjacentHTML('beforeend',
            '<li class="jwc-rating-'+provider+'">' +
            (content.id? '<a href="'+ ratingSites[provider]['url']+content.id+'">':'') +
            '<span class="jwc-platform-'+provider+'">' + provider + '</span> ' + ratingStr +
            (content.id? '</a>':'') +
            '</li>');
      }    
    }

    return ratingsDiv;    
  }

  getOffersHTML(offers){
    var offersDiv = document.createElement("div");
    offersDiv.classList.add('justwatch-offers');

    var presentationTypes = {
        //'cheapest': false,
        'sd': false,
        'hd': false,
        '4k': false,
      },
      offersData = {}
      ;

    var ulBlocks = {};

    for (var dataList in providerLists) {
      if (providerLists.hasOwnProperty(dataList)) {
        offersData[dataList] = {};

        ulBlocks[dataList] = document.createElement("ul");
        ulBlocks[dataList].setAttribute('data-monetization_type',dataList);
        ulBlocks[dataList].setAttribute('data-title',providerLists[dataList]);
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
                + offer.retail_price + ' ' + currency[offer.currency] + '</span></a></li>\n');
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
                + offer.retail_price + ' ' + currency[offer.currency] + '</span></a></li>\n');
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
                    ((typeof currency[offer.currency] !== 'undefined')? currency[offer.currency] : offer.currency ) 
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
      
        if (typeof supportedWeb[hostname].waitForSelector != 'undefined'){
          if(debug) console.log(hostname + ": waiting for [" + supportedWeb[hostname].waitForSelector + "]");

          return supportedWeb[hostname].waitForSelector;
        } else {
          if(debug) console.log(hostname + ": GO!");
          return '';
        }
        
      }

    }
    return '';
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
          plugin.execute();
      } else {
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