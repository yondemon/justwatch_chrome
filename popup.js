const browser = window.browser || window.chrome;

document.addEventListener('DOMContentLoaded', () => {
    console.log('popup loaded');

    var dropdownL18n = document.getElementById('select-l18n');
    //console.log(dropdownL18n);

    countriesLength = countries.length;
    for (let key in countries) {

        var option = document.createElement("option");
            option.setAttribute('value',key);
            option.innerHTML = countries[key];
        dropdownL18n.append(option);
    }
    
    browser.storage.sync.get('justwatch-l18n', 
        function(value){
          if (typeof value['justwatch-l18n'] != 'undefined'){
            l18n = value['justwatch-l18n'];
          }
        dropdownL18n.querySelectorAll('option[value="'+l18n+'"]')[0].selected = 'selected';
      });


    dropdownL18n.addEventListener('change', () => {
        console.log(dropdownL18n);
        console.log(dropdownL18n.value);
        var l18n = dropdownL18n.value;
     
        // SAVE
        chrome.storage.sync.set({'justwatch-l18n': l18n});

        window.close();

        browser.tabs.reload();
        //console.log('execute!');
        //execute();
    });
});

var countries = {
    'es_AR' : 'Argentina',
    'pt_BR' : 'Brazil',
    'en_CA' : 'Canada',
    'de_DE' : 'Deutschland',
    'es_ES' : 'España',
    'ja_JP' : 'Japan',
    'es_MX' : 'Mexico',
    'en_US' : 'USA',
}