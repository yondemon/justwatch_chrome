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
// console.log(window.__DATA__["state"].language.locales.sort((a,b) => a.country.localeCompare(b.country)).map( (c) => `${c.full_locale}: '${c.country}'` ).join(',\n'))
var countries = {
  sq_AL: 'Albania',
  ar_DZ: 'Algeria',
  ca_AD: 'Andorra',
  en_AG: 'Antigua and Barbuda',
  es_AR: 'Argentina',
  en_AU: 'Australia',
  de_AT: 'Austria',
  en_BS: 'Bahamas',
  ar_BH: 'Bahrain',
  en_BB: 'Barbados',
  fr_BE: 'Belgium',
  en_BM: 'Bermuda',
  es_BO: 'Bolivia',
  bs_BA: 'Bosnia and Herzegovina',
  pt_BR: 'Brazil',
  bg_BG: 'Bulgaria',
  en_CA: 'Canada',
  pt_CV: 'Cape Verde',
  es_CL: 'Chile',
  es_CO: 'Colombia',
  es_CR: 'Costa Rica',
  hr_HR: 'Croatia',
  es_CU: 'Cuba',
  cs_CZ: 'Czech Republic',
  en_DK: 'Denmark',
  es_DO: 'Dominican Republic',
  es_EC: 'Ecuador',
  ar_EG: 'Egypt',
  es_SV: 'El Salvador',
  es_GQ: 'Equatorial Guinea',
  et_EE: 'Estonia',
  en_FJ: 'Fiji',
  fi_FI: 'Finland',
  fr_FR: 'France',
  fr_GF: 'French Guiana',
  fr_PF: 'French Polynesia',
  de_DE: 'Germany',
  en_GH: 'Ghana',
  en_GI: 'Gibraltar',
  el_GR: 'Greece',
  es_GT: 'Guatemala',
  en_GG: 'Guernsey',
  es_HN: 'Honduras',
  zh_HK: 'Hong Kong',
  hu_HU: 'Hungary',
  is_IS: 'Iceland',
  en_IN: 'India',
  en_ID: 'Indonesia',
  ar_IQ: 'Iraq',
  en_IE: 'Ireland',
  he_IL: 'Israel',
  it_IT: 'Italy',
  fr_CI: 'Ivory Coast',
  en_JM: 'Jamaica',
  ja_JP: 'Japan',
  ar_JO: 'Jordan',
  en_KE: 'Kenya',
  sq_XK: 'Kosovo',
  ar_KW: 'Kuwait',
  lv_LV: 'Latvia',
  ar_LB: 'Lebanon',
  ar_LY: 'Libya',
  de_LI: 'Liechtenstein',
  lt_LT: 'Lithuania',
  mk_MK: 'Macedonia',
  en_MY: 'Malaysia',
  mt_MT: 'Malta',
  fr_MU: 'Mauritius',
  es_MX: 'Mexico',
  ro_MD: 'Moldova',
  fr_MC: 'Monaco',
  ar_MA: 'Morocco',
  pt_MZ: 'Mozambique',
  en_NL: 'Netherlands',
  en_NZ: 'New Zealand',
  fr_NE: 'Niger',
  en_NG: 'Nigeria',
  en_NO: 'Norway',
  ar_OM: 'Oman',
  ur_PK: 'Pakistan',
  ar_PS: 'Palestine',
  es_PA: 'Panama',
  es_PY: 'Paraguay',
  es_PE: 'Peru',
  en_PH: 'Philippines',
  pl_PL: 'Poland',
  pt_PT: 'Portugal',
  ar_QA: 'Qatar',
  ro_RO: 'Romania',
  ru_RU: 'Russia',
  en_LC: 'Saint Lucia',
  it_SM: 'San Marino',
  ar_SA: 'Saudi Arabia',
  fr_SN: 'Senegal',
  sr_RS: 'Serbia',
  fr_SC: 'Seychelles',
  en_SG: 'Singapore',
  sk_SK: 'Slovakia',
  sl_SI: 'Slovenia',
  en_ZA: 'South Africa',
  ko_KR: 'South Korea',
  es_ES: 'Spain',
  sv_SE: 'Sweden',
  de_CH: 'Switzerland',
  zh_TW: 'Taiwan',
  sw_TZ: 'Tanzania',
  en_TH: 'Thailand',
  en_TT: 'Trinidad and Tobago',
  ar_TN: 'Tunisia',
  tr_TR: 'Turkey',
  en_TC: 'Turks and Caicos Islands',
  en_UG: 'Uganda',
  ar_AE: 'United Arab Emirates',
  en_GB: 'United Kingdom',
  en_US: 'United States',
  es_UY: 'Uruguay',
  it_VA: 'Vatican City',
  es_VE: 'Venezuela',
  ar_YE: 'Yemen',
  en_ZM: 'Zambia'
}