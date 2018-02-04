
var reviewBar;
var titleFull = "";
var ldJSON;
var startDate = null;

if(location.hostname.match('imdb')) {
  console.log('imdb');
  reviewBar = document.getElementsByClassName('plot_summary_wrapper')[0];
  titleFull = document.getElementsByTagName('h1')[0].innerText;
} else if(location.hostname.match('rottentomatoes')) {
  console.log('rottentomatoes');
  //reviewBar = document.getElementById('topSection');
  reviewBar = document.getElementById('watch-it-now');
  titleFull = document.getElementsByTagName('h1')[0].innerText;
} else if(location.hostname.match('tv.com')) {
  console.log('tv.com');
  //reviewBar = document.getElementById('topSection');
  reviewBar = document.getElementsByClassName('show_stats _clearfix')[0];
  titleFull = document.getElementsByTagName('h1')[0].innerText;
  //.querySelector('[itemprop="name"]').innerText;

  ldJSON = document.querySelectorAll('script[type="application/ld+json"]')[0].innerText;
  ldJSON = ldJSON.replace(/(\r\n|\n|\r)/gm,"");
  var showdata = JSON.parse(ldJSON.trim());
  console.log(showdata);
  startDate = new Date(showdata.startDate);
} else if(location.hostname.match('sensacine.com')) {
  console.log('sensacine.com');
  //reviewBar = document.getElementById('topSection');
  reviewBar = document.getElementsByClassName('card-movie-overview')[0];
  titleFull = document.getElementsByClassName('titlebar-title')[0].innerText;
  
} else {
  console.log('error');
}

if (typeof reviewBar !== 'undefined') {

  var div = document.createElement("div");
  div.classList.add('justwatch');

  var titleRegexp = /(.*)\s\((.*)\)/;
  var matches;
  matches = titleRegexp.exec(titleFull);
  
  var title, year; 
  if(matches !== null) {
    title = matches[1];
    year = parseInt(matches[2]);
  } else if(startDate != null) {
    title = titleFull;
    year = startDate.getFullYear();
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
          console.log(resp.total_results + ' results');

          justWatchPrintPanel(resp, div);      
        }
      }
    };

    var query = {"query":title};
    xhr.send( JSON.stringify( query ) );

    //reviewBar[0].appendChild(div);
    reviewBar.parentNode.insertBefore(div, reviewBar.nextSibling);
  }

}


var noMatchesP = document.createElement("p");
noMatchesP.setAttribute('id','justwatch-nomatches');
noMatchesP.classList.add('message');
noMatchesP.innerHTML = 'NO MATCHES';


function justWatchPrintPanel(response, div){  
  var offersDiv,
    nomatches = true;

  div.appendChild( document.createRange().createContextualFragment( justWatchPanelTitleHTML() ) );

  div.appendChild( noMatchesP );

  if(response.total_results > 0){
    
    if(response.total_results === 1){
      item = response.items[0];
      justWatchSetPanelTitleURL(item);
      console.log(item);    
      
      nomatches = false;
      justWatchRemoveNoMatches();

      div.appendChild( justWatchOffersHTML(item.offers) );

    }  else {
      console.log(response.items);
      var done = false;

      for(item of response.items){
        
        if(!done 
          && year != null 
          && (item.original_release_year == year ||  item.original_release_year == year + 1) ){

          justWatchSetPanelTitleURL(item);
          console.log(item);    
    
          nomatches = false;
          justWatchRemoveNoMatches();

          div.appendChild( justWatchOffersHTML(item.offers) );
          done = true;
        }
      }
    }

    if(nomatches){
      noMatchesP.innerHTML = 'NO PERFECT MATCHES [but '+ response.total_results +' results]';

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
    return '<span id="justwatch-title" class="title">JustWatch: '+titleFull+'</span>';
}
function justWatchSetPanelTitleURL(item){
    var originalSpan = document.getElementById('justwatch-title');
    var replacementA = document.createElement("a");
    replacementA.innerHTML = originalSpan.innerHTML;
    replacementA.setAttribute('href','http://www.justwatch.com' + item.full_path);
    replacementA.setAttribute('id','justwatch-title');
    replacementA.classList.add('title');
    originalSpan.parentNode.replaceChild(replacementA,originalSpan);
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
      console.log(offer);
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
  15: 'hulu',
  18: 'playstation',
  34: 'epix',
  35: 'rakuten-tv', //wuaki
  62: 'atres-player',
  63: 'filmin',
  64: 'filmin-plus',
  68: 'microsoft-store',
  105: 'fandangonow',
  118: 'hbo', //hboespana
  119: 'amazon-prime-video',
  149: 'movistar-plus'
}

var price = {
  'EUR': '€',
  'USD': '$'
}