const browser = window.browser || window.chrome;

document.addEventListener('DOMContentLoaded', () => {
  var dropdownL18n = document.getElementById('select-l18n');
  
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
    var l18n = dropdownL18n.value;     
    chrome.storage.sync.set({'justwatch-l18n': l18n});
    
    window.close();
    browser.tabs.reload();
  });
});

/*
let countriesArray = Array.from(document.querySelectorAll('.country-list-item')).map((e)=> (`${e.getElementsByTagName("img")[0].src.substring(57,59)}: '${e.innerText.trim()}',`)).join('\r\n'); console.log(countriesArray);
*/
var countries = {
  ar_DZ: 'Algeria',
  es_AR: 'Argentina',
  en_AU: 'Australia',
  de_AT: 'Austria',
  en_BS: 'Bahamas',
  ar_BH: 'Bahrain',
  en_BB: 'Barbados',
  fr_BE: 'Belgium',
  en_BM: 'Bermuda',
  es_BO: 'Bolivia',
  pt_BR: 'Brasil',
  bg_BG: 'Bulgaria',
  en_CA: 'Canada',
  es_CL: 'Chile',
  es_CO: 'Colombia',
  es_CR: 'Costa Rica',
  hr_HR: 'Croatia',
  cs_CZ: 'Czech Republic',
  en_DK: 'Denmark',
  de_DE: 'Deutschland',
  es_DO: 'Dominican Republic',
  es_EC: 'Ecuador',
  ar_EG: 'Egypt',
  es_SV: 'El Salvador',
  es_ES: 'España',
  et_EE: 'Estonia',
  fi_FI: 'Finland',
  fr_FR: 'France',
  fr_GF: 'French Guiana',
  en_GI: 'Gibraltar',
  el_GR: 'Greece',
  es_GT: 'Guatemala',
  es_HN: 'Honduras',
  zh_HK: 'Hong Kong',
  hu_HU: 'Hungary',
  is_IS: 'Iceland',
  en_IN: 'India',
  en_ID: 'Indonesia',
  en_IE: 'Ireland',
  it_IT: 'Italia',
  en_JM: 'Jamaica',
  jp_JP: 'Japan',
  ar_JO: 'Jordan',
  ar_KW: 'Kuwait',
  lv_LV: 'Latvia',
  ar_LY: 'Libya',
  de_LI: 'Liechtenstein',
  lt_LT: 'Lithuania',
  en_MY: 'Malaysia',
  es_MX: 'Mexico',
  ro_MD: 'Moldova',
  fr_MC: 'Monaco',
  ar_MA: 'Morocco',
  en_NL: 'Netherlands',
  en_NZ: 'New Zealand',
  en_NO: 'Norway',
  ar_OM: 'Oman',
  es_PA: 'Panama',
  es_PY: 'Paraguay',
  es_PE: 'Peru',
  en_PH: 'Philippines',
  pl_PL: 'Poland',
  pt_PT: 'Portugal',
  ar_QA: 'Qatar',
  ro_RO: 'Romania',
  ru_RU: 'Russia',
  it_SM: 'San Marino',
  ar_SA: 'Saudi Arabia',
  en_SG: 'Singapore',
  sk_SK: 'Slovakia',
  en_ZA: 'South Africa',
  ko_KR: 'South Korea',
  sv_SE: 'Sweden',
  de_CH: 'Switzerland',
  zh_TW: 'Taiwan',
  en_TH: 'Thailand',
  ar_TN: 'Tunisia',
  tr_TR: 'Turkey',
  ar_AE: 'United Arab Emirates',
  en_UK: 'United Kingdom',
  en_US: 'USA',
  es_UY: 'Uruguay',
  es_VE: 'Venezuela',
  ar_YE: 'Yemen',
}