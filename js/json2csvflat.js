var json2csv = require('json2csv');
var fs = require('fs');
var _ = require('lodash');
var FILENAME = '/tmp/ronnie_latest.json';
var DEST_FILENAME = '/home/loneranger/Documents/qyk/ronnie_jan_19.csv';
var RESTRICTED_FIELDS=['comments', 'reminder'];
fs.readFile(FILENAME, function(err, data){
  if(err) return console.log(err);
  console.log('Loaded File');
  var jsonData = JSON.parse(data);
  console.log('Converted to Json');
  var flatData = jsonData.items?flattenJson(jsonData.items):flattenJson(jsonData);
  var allFields = findAllFields(flatData);
  console.log('Flattened Json');
  json2csv({data:flatData, fields:allFields}, function(err, csv){
    if(err) return console.log(err);
    console.log('Converted to CSV');
    fs.writeFile(DEST_FILENAME, csv, function(err){
      if(err) return console.log(err);
    })
  })
});

function getParam(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search);
  return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}
// adapted from csvkit's recursive JSON flattening mechanism:
// https://github.com/onyxfish/csvkit/blob/61b9c208b7665c20e9a8e95ba6eee811d04705f0/csvkit/convert/js.py#L15-L34
// depends on jquery and jquery-csv (for now)
function parse_object(obj, path) {
  if (path == undefined) path = "";
  var type = typeof obj;
  var scalar = (type == "number" || type == "string" || type == "boolean" || type == "null");
  if (type == "object") {
    var d = {};
    for (var i in obj) {
      if(RESTRICTED_FIELDS.indexOf(i) > -1) continue;
      var newD = parse_object(obj[i], path + i + "/");
      d = _.extend(d, newD);
      // $.extend(d, newD);
    }
    return d;
  } else if (scalar) {
    var d = {};
    var endPath = path.substr(0, path.length - 1);
    d[endPath] = obj;
    return d;
  }
  // ?
  else return {};
}
// otherwise, just find the first one
function arrayFrom(json) {
  var queue = [],
    next = json;
  while (next !== undefined) {
    if (typeof next == 'object' && next.hasOwnProperty('length')) return next;
    if (typeof next == "object") {
      for (var key in next) queue.push(next[key]);
    }
    next = queue.shift();
  }
  // none found, consider the whole object a row
  return [json];
}
// todo: add graceful error handling
function jsonFrom(input) {
  var string = $.trim(input);
  if (!string) return;
  return JSON.parse(string);
}

function flattenJson(json) {
  // 1) find the primary array to iterate over
  // 2) for each item in that array, recursively flatten it into a tabular object
  // 3) turn that tabular object into a CSV row using jquery-csv
  var outArray = [];
  console.log(json.length);
  for (var row in json){
    // console.log('Processing ', row);
    outArray[outArray.length] = parse_object(json[row])
  };
  return outArray;
}

function findAllFields(data){
  var allFields = [];
  for (var row in data){
    allFields = _.union(allFields, Object.keys(data[row]));
  }
  return allFields;
}
