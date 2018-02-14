console.log("JustWatch");
var reviewBar;

var debug = false;

var titleFull = "",
  title, year,
  type; 

var ldJSON,
  startDate = null;

var noMatchesP = document.createElement("p");
  noMatchesP.setAttribute('id','justwatch-nomatches');
  noMatchesP.classList.add('message');
  noMatchesP.innerHTML = 'NO MATCHES';

if(document.querySelectorAll('*[itemtype="http://schema.org/TVSeries"]').length > 0){
  type = "show";
} else if(document.querySelectorAll('*[itemtype="http://schema.org/Movie"]').length > 0) {
  type = "movie";
}

ldJSON = document.querySelectorAll('script[type="application/ld+json"]');
if(ldJSON.length > 0) {
  ldJSON = ldJSON[0].innerText;
  ldJSON = ldJSON.replace(/(\r\n|\n|\r)/gm,"");
  var showdata = JSON.parse(ldJSON.trim());
  startDate = new Date(showdata.startDate);

  if(showdata['@type'] == "TVSeries"){
    type = "show";
  } else if(showdata['@type'] == "Movie") {
    type = "movie";
  }

  title = showdata['name'];

  if(debug) console.log(showdata);
}



if(location.hostname.match('imdb')) {
  //console.log('imdb');
  reviewBar = document.getElementsByClassName('plot_summary_wrapper')[0];
  titleFull = document.querySelectorAll('meta[property="og:title"]')[0].getAttribute('content');

} else if(location.hostname.match('rottentomatoes')) {
  //console.log('rottentomatoes');  
  // HAS LDJSON
  // 
  reviewBar = document.getElementById('watch-it-now');
  titleFull = document.getElementsByTagName('h1')[0].innerText;

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

} else {
  console.log('error');
}

if (typeof reviewBar !== 'undefined') {

  var div = document.createElement("div");
  div.classList.add('justwatch');

  var titleRegexp = /(.*)\s\(.*?([\d]{4}).*?\)/;
  var matches;
  matches = titleRegexp.exec(titleFull);
  
  if(matches !== null) {
    title = matches[1];
    year = parseInt(matches[2]);
  } else if(startDate != null) {
    title = titleFull;
    year = startDate.getFullYear();
  } else if( typeof year != 'undefined' ) {
    title = titleFull;
  } else {
    title = titleFull;
    year = null;
  }

  if (title !== null) {
    var xhr = new XMLHttpRequest();
    // TODO: Localization
    var localization = 'es_ES';
    //var localization: 'en_US';
    var url = 'https://api.justwatch.com/titles/'+localization+'/popular';

    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
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

      for(item of response.items){
        
        if(!done 
          && year != null 
          && (item.original_release_year == year) ){

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
    return '<span id="justwatch-title" class="title">JustWatch: <span id="justwatch-title-full">'+titleFull+'</span></span>';
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

function justWatchOffersHTML(offers){
  var offersDiv = document.createElement("div");
  offersDiv.classList.add('justwatch-offers');

  var offersData = "",
    offersFlat = "",
    offersRent = "",
    offersBuy = "",
    offersOther = "";
  
  if (typeof offers !== 'undefined' && offers.length > 0){
    for(offer of offers) {
      if(debug) console.log(offer);
      var domainString = offer.urls.standard_web.replace('http://','').replace('https://','').replace('www.','').split(/[/?#]/)[0];
      var logo = '';
      var logoURL = providerLogoURL(offer.provider_id);

      if(logoURL != false){
        logo = '<img src="'+ logoURL +'" alt="'+ offer.monetization_type + ' ' + domainString +'"/>';
      } else {
        logo = domainString;
      }

      if (offer.monetization_type == 'flatrate') {
        offersFlat += '<li><a href="' + offer.urls.standard_web 
          + '"><span class="provider provider-'+offer.provider_id+'">' + logo + '</span> <span class="presentation">' 
          + offer.presentation_type + '</span></a></li>\n';
      } else if (offer.monetization_type == 'rent') {
        offersRent += '<li><a href="' + offer.urls.standard_web 
          + '"><span class="provider provider-'+offer.provider_id+'">'+logo+'</span>  <span class="presentation">' 
          + offer.presentation_type + '</span>  <span class="price">' 
          + offer.retail_price + ' ' + price[offer.currency] + '</span></a></li>\n';
      } else if (offer.monetization_type == 'buy') {
        offersBuy += '<li><a href="' + offer.urls.standard_web  
          + '"><span class="provider provider-'+offer.provider_id+'">'+logo+'</span>  <span class="presentation">' 
          + offer.presentation_type + '</span>  <span class="price">' 
          + offer.retail_price + ' ' + price[offer.currency] + '</span></a></li>\n';
      } else {
        offersOther += '<li><a href="' + offer.urls.standard_web 
          + '"><span class="provider provider-'+offer.provider_id+'">'+logo+'</span>  <span class="presentation">' 
          + offer.monetization_type + ' ' + offer.presentation_type+'</span>  <span class="price">' 
          + offer.retail_price+''+price[offer.currency]+'</span></a></li>\n';
      }
    }
    offersData = 
      ((offersFlat.length > 0)?'<ul data-title="Flat">' + offersFlat + '</ul>':'') +
      ((offersRent.length > 0)?'<ul data-title="Rent">' + offersRent + '</ul>':'') +
      ((offersBuy.length > 0)?'<ul data-title="Buy">' + offersBuy + '</ul>':'') +
      ((offersOther.length > 0)?'<ul data-title="-">' + offersOther + '</ul>':'');
} else {
  offersData = '<p class="message">NO OFFERS</p>';
}
  offersDiv.innerHTML = offersData.trim();

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
  7: 'vudu',
  8: 'netflix',
  9: 'amazon',
  10: 'amazon-instant-video',
  11: 'mubi',
  15: 'hulu',
  18: 'playstation',
  //27: 'hbo', // USA
  34: 'epix',
  35: 'rakuten-tv', //wuaki
  //37: 'showtime', // USA
  62: 'atres-player',
  63: 'filmin',
  64: 'filmin-plus',
  68: 'microsoft-store',
  100: 'guidedoc',
  105: 'fandangonow',
  118: 'hbo', //hboespana
  119: 'amazon-prime-video',
  149: 'movistar-plus'
}

var price = {
  'EUR': '€',
  'USD': '$'
}