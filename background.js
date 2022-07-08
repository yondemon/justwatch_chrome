const API_DOMAIN = 'apis.justwatch.com';
var debug = false;

chrome.runtime.onMessage.addListener( (message, sender, callback) => {
  
  if(debug) console.log(message);

  // chrome.runtime.onMessage.removeListener(event); // cleaning, just call once.
  
  if (message.type == "fetchAPI") {
    var data = message.data;
    
    // https://apis.justwatch.com/content/titles/es_ES/popular
    const url = `https://${API_DOMAIN}/content/titles/${data.localization}/popular`;
    if (debug) console.log(url);
    
    var query = {"query":data.title};
    if(typeof data.type != 'undefined'){
      query.content_types = [data.type];
    }
    if(debug) console.log(query);

    fetch( url, {
      method: 'post',
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
        // 'User-Agent': 'JustWatch unofficial chrome extension (github.com/yondemon/justwatch_chrome/)'
      },
      body: JSON.stringify(query)
    })
    .then((response) => {
      response.json().then((data) => {
        if(debug) console.log(data);
          
        if (data.total_results > 0) {
          if(debug) console.log(data.total_results + ' results');
          if(debug) console.log(data);
          
          callback(data);
        }
      });
    })
  }
  
  if (message.type == "fetchProvidersAPI") {
    var data = message.data;
    
    // https://apis.justwatch.com/content/providers/locale/es_ES"
    const url = `https://${API_DOMAIN}/content/providers/locale/${data.localization}`;
    if (debug) console.log(url);
    
    fetch(url, {
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
        // 'User-Agent': 'JustWatch unofficial chrome extension (github.com/yondemon/justwatch_chrome/)'
      }
    }).then((response) => {
      response.json().then((data) => {
        if(debug) console.log(data);
  
        if (data.length > 0) {
          if(debug) console.log(`${data.length} providers`);
          callback(data);
        }  
      });
    });
  }

  return true;
});