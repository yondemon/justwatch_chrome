const API_DOMAIN = 'apis.justwatch.com';
var debug = false;

chrome.runtime.onMessage.addListener(function(message, sender, callback) {
    
    chrome.runtime.onMessage.removeListener(event); // cleaning, just call once.

    if (message.type == "fetchAPI") {
      var data = message.data;

      var xhr = new XMLHttpRequest();
        
        //var url = 'https://api.justwatch.com/titles/'+localization+'/popular';
        //var url = 'https://'+API_DOMAIN+'/titles/'+localization+'/popular';
        // https://apis.justwatch.com/content/titles/es_ES/popular
        var url = 'https://'+API_DOMAIN+'/content/titles/'+data.localization+'/popular';
        //if (debug) console.log(url);

        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
        // xhr.setRequestHeader('User-Agent', 'JustWatch unofficial chrome extension (github.com/yondemon/justwatch_chrome/)');

        xhr.onreadystatechange = (e) => {
          if (xhr.readyState == 4) {
            if(debug) console.log({response:xhr.responseText});
            var resp = JSON.parse(xhr.responseText);

            if (resp.total_results > 0) {
              if(debug) console.log(resp.total_results + ' results');
              if(debug) console.log(resp);
              
              callback(resp);
            }

          }
        };

        var query = {"query":data.title};
        if(typeof data.type != 'undefined'){
          query.content_types = [data.type];
        }
        if(debug) console.log(query);
        xhr.send( JSON.stringify( query ) );

        return true;
    }
    return true;
});