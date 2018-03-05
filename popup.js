const browser = window.browser || window.chrome;

document.addEventListener('DOMContentLoaded', () => {
    console.log('popup loaded');

    var dropdownL18n = document.getElementById('select-l18n');
    console.log(dropdownL18n);

    

    dropdownL18n.addEventListener('change', () => {
        console.log(dropdownL18n);
        console.log(dropdownL18n.value);
        var l18n = dropdownL18n.value;
     
        // SAVE
        chrome.storage.sync.set({'justwatch-l18n': l18n});

        window.close();

        //console.log('execute!');
        //execute();

    });

    browser.storage.sync.get('justwatch-l18n', 
        function(value){
          if (typeof value['justwatch-l18n'] != 'undefined'){
            l18n = value['justwatch-l18n'];
          }

        console.log(l18n);

        //dropdownL18n.getElementsByTagName('option')[l18n].selected = 'selected';
        dropdownL18n.querySelectorAll('option[value="'+l18n+'"]')[0].selected = 'selected';
        console.log( dropdownL18n.querySelectorAll('option[value="'+l18n+'"]')[0] );


      });

});

