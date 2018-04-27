console.log("JustWatch!");
const browser = window.browser || window.chrome;

var reviewBar;

var debug = true;

var titleFull = "",
  title, year, yearAlt,
  type; 

var ldJSON,
  startDate = null;

var noMatchesP = document.createElement("p");
  noMatchesP.setAttribute('id','justwatch-nomatches');
  noMatchesP.classList.add('message');
  noMatchesP.innerHTML = 'NO MATCHES';

var l18n = 'es_ES';

//document.body.onload = execute();
document.body.onload = function(){

  browser.storage.sync.get('justwatch-l18n', 
    function(value){
      if (typeof value['justwatch-l18n'] != 'undefined'){
        l18n = value['justwatch-l18n'];
      }
      execute();
    });
};

function execute() {

  if(document.querySelectorAll('*[itemtype="http://schema.org/TVSeries"]').length > 0){
    type = "show";
  } else if(document.querySelectorAll('*[itemtype="http://schema.org/Movie"]').length > 0) {
    type = "movie";
  }

  ldJSON = document.querySelectorAll('script[type="application/ld+json"]');
  if(ldJSON.length > 0) {
    ldJSON = ldJSON[0].innerText;
    if (debug) console.log(ldJSON);

    ldJSON = ldJSON.replace(/(\r\n|\n|\r)/gm,"");
    var showdata = JSON.parse(ldJSON.trim());
    startDate = new Date(showdata.startDate);

    if(showdata['@type'] == "TVSeries"){
      type = "show";
    } else if(showdata['@type'] == "Movie") {
      type = "movie";
    }

    title = showdata['name'];
    year = extractYear( showdata['datePublished'] );

    if(debug) console.log(showdata);
  }

  if(location.hostname.match('imdb')) {
    //console.log('imdb');
    reviewBar = document.getElementsByClassName('plot_summary_wrapper')[0];
    //titleFull = document.querySelectorAll('meta[property="og:title"]')[0].getAttribute('content');
    titleFull = document.querySelectorAll('meta[name="title"]')[0].getAttribute('content');

    tmpYear = document.querySelectorAll('.titleBar *[itemprop="datePublished"]');
    if( tmpYear.length > 0 ){
      year = extractYear(tmpYear[0].content);  
    }

  } else if(location.hostname.match('rottentomatoes')) {
    //console.log('rottentomatoes');  
    // HAS LDJSON
    reviewBar = document.getElementById('watch-it-now');
    titleFull = document.getElementsByTagName('h1')[0].innerText;

    if(year == null){
      year = document.querySelectorAll('span.year')[0].innerText;
    }

  } else if(location.hostname.match('tv.com')) {
    //console.log('tv.com');
    // HAS LDJSON
    reviewBar = document.getElementsByClassName('show_stats _clearfix')[0];
    titleFull = document.getElementsByTagName('h1')[0].innerText;

    year = extractYear(document.getElementsByClassName('tagline')[0].innerText);

  } else if(location.hostname.match('sensacine.com')) {
    //console.log('sensacine.com');
    if(location.pathname.match('series')) {
      type = "show";
      reviewBar = document.getElementsByClassName('module-actionbar')[0];
      titleFull = document.querySelectorAll('meta[property="og:title"]')[0].getAttribute('content');

    } else {
      type = "movie";
      reviewBar = document.getElementsByClassName('card-movie-overview')[0];
      titleFull = document.getElementsByClassName('titlebar-title')[0].innerText;

      year = extractYear(document.getElementsByClassName('date')[0].innerText);
      yearAlt = extractYear(document.getElementsByTagName('title')[0].innerText);
    }

  } else if(location.hostname.match('filmaffinity.com')) {
    //console.log('filmaffinity.com');
    reviewBar = document.getElementsByClassName('movie-info')[0];
    titleFull = document.querySelectorAll('meta[property="og:title"]')[0].getAttribute('content');  

  } else if(location.hostname.match('fotogramas.es')) {
    //console.log('fotogramas.es');
    reviewBar = document.getElementsByClassName('ficha')[0];
    titleFull = document.querySelectorAll('h1[itemprop="name"]')[0].innerText;  
    year = document.querySelectorAll('time[itemprop="dateCreated"]')[0].getAttribute('datetime');

  } else if(location.hostname.match('cinefilica.es')) {
    //console.log('cinefilica.es');
    reviewBar = document.getElementById('ko-bind');
    titleFull = document.querySelectorAll('meta[property="og:title"]')[0].getAttribute('content');
    
  } else if(location.hostname.match('ecartelera.com')) {
    //console.log('ecartelera.com');
    reviewBar = document.getElementById('scorebox');
    titleFull = document.querySelectorAll('meta[property="og:title"]')[0].getAttribute('content');
    //titleFull = document.querySelectorAll('span[itemprop="name"]')[0].innerText;
    //year = document.querySelectorAll('#movie-header h4')[0].innerText;
  } else if(location.hostname.match('metacritic.com')) {
    // HAS LDJSON
    titleFull = document.querySelectorAll('meta[property="og:title"]')[0].getAttribute('content');
    if (type == 'movie') {
      reviewBar = document.getElementById('nav_to_awards');
    } else if ( type == 'show' ) {
      reviewBar = document.getElementsByClassName('product_data_summary')[0];
    }

  } else {
    console.log('error');
  }

  if (typeof reviewBar !== 'undefined') {
    var div = document.createElement("div");
    div.classList.add('justwatch');

    var titleRegexp = /(.*)\s\(.*?([\d]{4}).*?\)/;
    var matches;
    matches = titleRegexp.exec(titleFull);
    
    if( typeof year != 'undefined' ) {
      title = titleFull;
      if(matches !== null) {
        title = matches[1];
        yearAlt = parseInt(matches[2]);
      } 
    } else if(matches !== null) {
      title = matches[1];
      year = parseInt(matches[2]);
    } else if(startDate != null) {
      title = titleFull;
      year = startDate.getFullYear();
    } else {
      title = titleFull;
      year = null;
    }

    if (debug) console.log( 'T: "' + titleFull + '"" t: "' +  title + '" Y:' + year + ' Y:' + yearAlt );
    
    if (title !== null) {
      var xhr = new XMLHttpRequest();
      
      var localization = l18n; // 'es_ES';
      //var localization = l18nSetup('es_ES');
      //var localization = l18nSetup('en_US');
      var url = 'https://api.justwatch.com/titles/'+localization+'/popular';
      //if (debug) console.log(url);

      xhr.open("POST", url, true);
      xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
      xhr.setRequestHeader('User-Agent', 'JustWatch unofficial chrome extension (github.com/yondemon/justwatch_chrome/)');

      xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
          var resp = JSON.parse(xhr.responseText);

          if (resp.total_results > 0) {
            if(debug) console.log(resp.total_results + ' results');
            if(debug) console.log(resp);
            justWatchPrintPanel(resp, div);      
          }
        }
      };

      var query = {"query":title};
      if(typeof type != 'undefined'){
        query.content_types = [type];
      }
      if(debug) console.log(query);
      xhr.send( JSON.stringify( query ) );

      //reviewBar[0].appendChild(div);
      reviewBar.parentNode.insertBefore(div, reviewBar.nextSibling);
    }

  }

}


function extractYear(string){
  var matches = /(\d){4}/.exec(string);
  if( matches != null){
    return matches[0];
  }
  return null;
}

function justWatchPrintPanel(response, div){  
  var offersDiv,
    nomatches = true;

  div.appendChild( document.createRange().createContextualFragment( justWatchPanelTitleHTML() ) );

  div.appendChild( noMatchesP );

  if(response.total_results > 0){
    
    if(response.total_results === 1){
      item = response.items[0];
      justWatchSetPanelTitleURL(item);
      
      nomatches = false;
      justWatchRemoveNoMatches();

      div.appendChild( justWatchOffersHTML(item.offers) );

    }  else {

      var done = false;
      var totalItems = response.items.length;
      for(var i = 0 ; i < totalItems && !done ; i++) {
        item = response.items[i];
        if( 
          (year != null  && (item.original_release_year == year) )
          || (yearAlt != null && item.original_release_year == yearAlt)
          ){

          justWatchSetPanelTitleURL(item);
    
          nomatches = false;
          justWatchRemoveNoMatches();

          div.appendChild( justWatchOffersHTML(item.offers) );
          done = true;
        }
      }
    }

    if(nomatches){
      noMatchesP.innerHTML = 'NO PERFECT MATCHES [but '+ response.total_results +' results]';

      if (debug) noMatchesP.innerHTML += '<p>T:'+titleFull +' Y:'+year + ' Y:'+yearAlt +'</p>';

      div.appendChild( justWatchOffersHTML(response.items[0].offers) );

      for(let [index,item] of response.items.entries() ){
        var liElement = document.createElement('li');
        var resultlink = document.createElement('a');
        resultlink.innerHTML = item.original_title + "&nbsp;("+ item.original_release_year+")";
        resultlink.setAttribute('href','http://www.justwatch.com' + item.full_path);
        liElement.appendChild( resultlink );
        noMatchesP.appendChild( liElement );
      }
    }
  }
}

function justWatchPanelTitleHTML(){
    return '<span id="justwatch-title" class="title">JustWatch: ['+ l18n +'] <span id="justwatch-title-full">'+titleFull+'</span></span>';
}
function justWatchSetPanelTitleURL(item){
    var originalSpan = document.getElementById('justwatch-title');
    var replacementA = document.createElement("a");
    replacementA.innerHTML = originalSpan.innerHTML;
    replacementA.setAttribute('href','http://www.justwatch.com' + item.full_path);
    replacementA.setAttribute('id','justwatch-title');
    replacementA.classList.add('title');
    originalSpan.parentNode.replaceChild(replacementA,originalSpan);

    document.getElementById('justwatch-title-full').innerHTML = item.original_title + ' (' + item.original_release_year + ')';    
}

function justWatchRemoveNoMatches(){
  noMatchesP.parentNode.removeChild(noMatchesP);
}

function justWatchSetPresentationTypesMenu(presentationTypes){
  console.log(presentationTypes);

  titlepanel = document.getElementById('justwatch-title');
  //presentationTypes.each();
}

function justWatchOffersHTML(offers){
  var offersDiv = document.createElement("div");
  offersDiv.classList.add('justwatch-offers');

  var offersData = {
      'flatrate': '',
      'rent': '',
      'buy': '',
      'free': '',
      'other': '',
    },
    presentationTypes = {
      //'cheapest': false,
      'sd': false,
      'hd': false,
      '4k': false,
    };

  var ulBlocks = {};

  ulBlocks['flatrate'] = document.createElement("ul");
  ulBlocks['flatrate'].setAttribute('data-monetization_type',"flatrate");
  ulBlocks['flatrate'].setAttribute('data-title',"Flat");
  offersDiv.appendChild( ulBlocks['flatrate'] );

  ulBlocks['rent'] = document.createElement("ul");
  ulBlocks['rent'].setAttribute('data-monetization_type',"rent");
  ulBlocks['rent'].setAttribute('data-title',"Rent");
  offersDiv.appendChild( ulBlocks['rent'] );

  ulBlocks['buy'] = document.createElement("ul");
  ulBlocks['buy'].setAttribute('data-monetization_type',"buy");
  ulBlocks['buy'].setAttribute('data-title',"Buy");
  offersDiv.appendChild( ulBlocks['buy'] );

  ulBlocks['free'] = document.createElement("ul");
  ulBlocks['free'].setAttribute('data-monetization_type',"free");
  ulBlocks['free'].setAttribute('data-title',"Free");
  offersDiv.appendChild( ulBlocks['free'] );

  ulBlocks['other'] = document.createElement("ul");
  ulBlocks['other'].setAttribute('data-monetization_type',"other");
  ulBlocks['other'].setAttribute('data-title',"-");
  offersDiv.appendChild( ulBlocks['other'] );
    
  if (typeof offers !== 'undefined' && offers.length > 0){
    //for(offer of offers) {
    for (const [index, offer] of offers.entries()) {      
      //if(debug) console.log(offer);

      var domainString = '';
      var url = '#';

      if(typeof offer.urls !== 'undefined' /*offer.urls.length > 0*/ && typeof offer.urls.standard_web !== 'undefined'){
        domainString = offer.urls.standard_web.replace('http://','').replace('https://','').replace('www.','').split(/[/?#]/)[0];
        url = offer.urls.standard_web;
      }

      var logo = '';
      var logoURL = providerLogoURL(offer.provider_id);

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
            offersData[offer.monetization_type][offer.provider_id] = true;
            cheapest = true;
            var old = offersDiv.querySelectorAll('.monetization-'+offer.monetization_type+'.provider-'+offer.provider_id+'.cheapest');
            console.log(
              '+ offer-'+index+' +',
              '.monetization-'+offer.monetization_type+'.provider-'+offer.provider_id+'.cheapest',
              old);
            if(old.length > 0){
              console.log(old);
              old[0].classList.remove("cheapest");
            }
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
          
            offersData[offer.monetization_type][offer.provider_id] = {};
            //offersData[offer.monetization_type][offer.provider_id]['cheapest_price'] = offer.retail_price;
            cheapest = true;

            var old = offersDiv.querySelectorAll('.monetization-'+offer.monetization_type+'.provider-'+offer.provider_id+'.cheapest');
            console.log(
              '+ offer-'+index+' +',
              '.monetization-'+offer.monetization_type+'.provider-'+offer.provider_id+'.cheapest',
              old);
            if(old.length > 0){
              console.log(old);
              old[0].classList.remove("cheapest");
            }
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
          
            offersData[offer.monetization_type][offer.provider_id] = {};
            //offersData[offer.monetization_type][offer.provider_id]['cheapest_price'] = offer.retail_price;
            cheapest = true;

            var old = offersDiv.querySelectorAll('.monetization-'+offer.monetization_type+'.provider-'+offer.provider_id+'.cheapest');
            console.log(
              '+ offer-'+index+' +',
              '.monetization-'+offer.monetization_type+'.provider-'+offer.provider_id+'.cheapest',
              old);
            if(old.length > 0){
              console.log(old);
              old[0].classList.remove("cheapest");
            }
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
              + 'class="monetization-'+offer.monetization_type+' presentation-'+offer.presentation_type+' provider-"><a href="' + url
              + '"><span class="provider provider-'+offer.provider_id+'">' + logo + '</span> <span class="presentation">' 
              + offer.presentation_type + '</span></a></li>\n');
            break;
        default:
          ulBlocks['other'].insertAdjacentHTML('beforeend',
            '<li id="offer-'+index+'" '
              + 'class="monetization-'+offer.monetization_type+' presentation-'+offer.presentation_type+' provider-"><a href="' + url
              + '"><span class="provider provider-'+offer.provider_id+'">'+logo+'</span>  <span class="presentation">' 
              + offer.monetization_type + ' ' + offer.presentation_type+'</span>  <span class="price">' 
              + ((typeof offer.retail_price !== 'undefined')? offer.retail_price :'0')+''+ ( (typeof offer.currency !== 'undefined')?price[offer.currency]:'-' ) +'</span></a></li>\n');
      }

    }
    // TODO: Clean empty ULBLocks

    justWatchSetPresentationTypesMenu(presentationTypes);

  } else {
    offersDiv.innerHTML = '<p class="message">NO OFFERS</p>';
  }

  return offersDiv;
}

function providerLogoURL(provider_id){
  if(typeof providers[provider_id] != "undefined"){
    return chrome.runtime.getURL('providers/'+providers[provider_id]+'.jpeg');
  }
  return false;
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
  15: 'hulu',
  18: 'playstation',
  27: 'hbo-now', // USA
  31: 'hbo-go', // USA
  34: 'epix',
  35: 'rakuten-tv', //wuaki
  //37: 'showtime', // USA
  52: 'cravetv', // CA
  62: 'atres-player',
  63: 'filmin',
  64: 'filmin-plus',
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
  169: 'the-movie-network-go', // CA
  182: 'hollywood-suite', // CA
}

var price = {
  'EUR': '€',
  'USD': '$',
  'CAD': '$',
  'JPY': '¥'
}
