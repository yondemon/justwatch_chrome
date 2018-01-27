console.log('imdb');

var reviewBar = document.getElementsByClassName('plot_summary_wrapper');
var div = document.createElement("div");
div.classList.add('justwatch');

var titleFull = document.getElementsByTagName('h1')[0].innerText;
console.log(titleFull);
var titleRegexp = /(.*)\s\((.*)\)/;
var matches;
matches = titleRegexp.exec(titleFull);
var title = matches[1];
var year = parseInt(matches[2]);

var xhr = new XMLHttpRequest();
// TODO: Localization
var url = 'https://api.justwatch.com/titles/es_ES/popular';
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
reviewBar[0].parentNode.insertBefore(div, reviewBar[0].nextSibling);




function justWatchPrintPanel(response, div){  
  var offersDiv;

  if(response.total_results === 1){
    item = response.items[0];
    
    div.appendChild( document.createRange().createContextualFragment( justWatchPanelTitleHTML(item) ) );
    div.appendChild( justWatchOffersHTML(item.offers) );

  }  else {
    for(item of response.items){
      if( item.original_release_year == year ){
        div.appendChild( document.createRange().createContextualFragment( justWatchPanelTitleHTML(item) ) );
        div.appendChild( justWatchOffersHTML(item.offers) );
      }
    }
  } 
}

function justWatchPanelTitleHTML(item){
    return '<a class="title" href="http://www.justwatch.com' + item.full_path + '">JustWatch: '+titleFull+'</a>';
}

function justWatchOffersHTML(offers){
  var offersDiv = document.createElement("div");
  offersDiv.classList.add('justwatch-offers');

  var offersData = "",
    offersFlat = "",
    offersRent = "",
    offersBuy = "",
    offersOther = "";
  if (offers.length > 0){
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
  offersData = "<p>NO OFFERS</p>";
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
  8: 'netflix',
  18: 'playstation',
  35: 'rakuten-tv', //wuaki
  62: 'atres-player',
  63: 'filmin',
  64: 'filmin-plus',
  68: 'microsoft-store',
  118: 'hbo', //hboespana
  119: 'amazon-prime-video',
  149: 'movistar-plus'
}

var price = {
  'EUR': '€'
}