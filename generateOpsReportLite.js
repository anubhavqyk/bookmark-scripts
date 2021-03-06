var BASE_API_URL = 'http://www.papertostone.com/ops/api/enquiry';
var HEADERS = {
  'Authorization': 'Bearer ' + JSON.parse(window.localStorage['ngStorage-currentUser'])['access_token']
};

function loadError(e) {
  console.log(e);
};

function importScript(sSrc, fOnload) {
  var oScript = document.createElement("script");
  oScript.type = "text\/javascript";
  oScript.onerror = loadError;
  if (fOnload) {
    oScript.onload = fOnload;
  };
  document.body.appendChild(oScript);
  oScript.src = sSrc;
};

function onScriptLoad() {
  LOAD_COUNTER++;
  if (LOAD_COUNTER == 2) init();
};

function cleanParams(s) {
  var params = s.split('&');
  var neoParams = "";
  for (var i = 0; i < params.length; i++) {
    if (params[i].indexOf('limit') != 0 && params[i].indexOf('page') != 0) {
      neoParams += params[i];
      neoParams += '&';
    }
  }
  return neoParams;
};

function init() {
  var splits = window.location.hash.split('?');
  $.ajax({
    url: BASE_API_URL + '?' + cleanParams(splits[1]) + 'limit=1&page=1',
    headers: HEADERS
  }).done(function(data) {
    if (data && data['totalCount'] && data['totalCount'] <= 1000) {
      var url = BASE_API_URL + '?' + cleanParams(splits[1]) + 'page=1&limit=' + data['totalCount'];
      $.ajax({
        url: url,
        headers: HEADERS
      }).done(function(data) {
        if (data && data.items) {
          ORL.process(data.items);
        }
      })
    } else {
      alert('Too many enquiries! Please chose an appropriate filter');
    }
  })
};
var LOAD_COUNT = 0;
var LOAD_COUNTER = 0;
if (!$.csv) {
  importScript('http://54.169.177.130/lib/jquery.csv.js', onScriptLoad);
  LOAD_COUNT++;
};
if (typeof ORL == 'undefined') {
  importScript('http://54.169.177.130/lib/opsReportLiteLib.js', onScriptLoad);
  LOAD_COUNT++;
};
if (LOAD_COUNT == 0) init();