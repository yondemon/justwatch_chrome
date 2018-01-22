console.log('imdb');

var reviewBar = document.getElementsByClassName('titleReviewBar');
var div = document.createElement("div");
div.classList.add('justwatch');

var titleFull = document.getElementsByTagName('h1')[0].innerText;
console.log(titleFull);
var titleRegexp = /(.*)\s\((.*)\)/;
var matches;
matches = titleRegexp.exec(titleFull);
var title = matches[1];
var year = matches[2];


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


      var offersDiv = document.createElement("div");
      offersDiv.classList.add('justwatch-offers');

      if(resp.total_results === 1){
        item = resp.items[0];
        console.log(item);
        
        var pageLink = '<a href="http://www.justwatch.com' + item.full_path + '">JustWatch: '+title+'</a>';
        div.appendChild( document.createRange().createContextualFragment(pageLink) );

        var offersData = "";
        for(offer of item.offers) {
          //console.log(offer);
          offersData += '<a href="' + offer.urls.standard_web + '">'+offer.monetization_type+' '+offer.presentation_type+' '+offer.retail_price+''+offer.currency+'</a>\n';
        }
        console.log(offersData);
        offersDiv.innerHTML = offersData.trim();
      }  else {
        //TODO: Distinguir el bueno por... fecha?
        console.log(resp);

        for(item of resp.items){
          if( item.original_release_year === year ){
            console.log(item);


          }
        }
        

      }

      div.appendChild(offersDiv);
    }

    div.appendChild(document.createTextNode('done!'));
  }
};

var query = {"query":title};
xhr.send( JSON.stringify( query ) );
console.log('sent!');

//reviewBar[0].appendChild(div);
reviewBar[0].parentNode.insertBefore(div, reviewBar[0].nextSibling);
console.log('end');