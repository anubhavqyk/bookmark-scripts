var BASE_API_URL = 'http://www.qykapp.com/ops/api/enquiry';
function loadError(e){
	console.log(e);
}
function importScript (sSrc, fOnload) {
  var oScript = document.createElement("script");
  oScript.type = "text\/javascript";
  oScript.onerror = loadError;
  if (fOnload) { oScript.onload = fOnload; }
  document.body.appendChild(oScript);
  oScript.src = sSrc;
};
function onScriptLoad(){
  LOAD_COUNTER++;
  if(LOAD_COUNTER == 2) init();
}
function cleanParams(s){
	var params = s.split('&');
	var neoParams = "";
	for(var i=0; i<params.length; i++){
		if(params[i].indexOf('limit') != 0 && params[i].indexOf('page') != 0){
			neoParams += params[i];
			neoParams += '&';
		}
	}
	return neoParams;
}
function init(){
	var splits=window.location.hash.split('?');
	$.get(BASE_API_URL+'?'+cleanParams(splits[1])+'limit=1&page=1').done(function(data){
		if(data && data['totalCount'] && data['totalCount'] <= 1000){
			var url = BASE_API_URL + '?' + cleanParams(splits[1]) + 'page=1&limit=' + data['totalCount'];
			$.get(url).done(function(data){
				if(data && data.items){
					//Process
					ORL.process(data.items);
				}
			})
		} else {
			alert('Too many enquiries! Please chose an appropriate filter');
		}
	})
}
var LOAD_COUNT = 0;
var LOAD_COUNTER = 0;
if(!$.csv){
	importScript('https://code.jquery.com/jquery-1.12.0.min.js', onScriptLoad);
	LOAD_COUNT++;
}
if(!ORL) {
	importScript('https://raw.githubusercontent.com/anubhavqyk/bookmark-scripts/master/js/opsReportLiteLib.js', onScriptLoad);
	LOAD_COUNT++;
}

if(LOAD_COUNT == 0) init();