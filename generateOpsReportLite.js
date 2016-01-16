function importScript (sSrc, fOnload) {
  var oScript = document.createElement("script");
  oScript.type = "text\/javascript";
  oScript.onerror = loadError;
  if (fOnload) { oScript.onload = fOnload; }
  document.currentScript.parentNode.insertBefore(oScript, document.currentScript);
  oScript.src = sSrc;
};
function onScriptLoad(){
  LOAD_COUNTER++;
  if(LOAD_COUNTER == 2) init();
}
var LOAD_COUNT = 2;
var LOAD_COUNTER = 0;
importScript('https://code.jquery.com/jquery-1.12.0.min.js', onScriptLoad);
importScript('https://code.jquery.com/jquery-1.12.0.min.js', onScriptLoad);