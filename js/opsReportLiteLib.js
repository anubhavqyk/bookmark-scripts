var ORL = null;
(function() {
  var DELIMITER = "\r\n";
  // APIs
  function process(data) {
    var processedData = data.map(function(record){
    var transformedObj = {};
    transformedObj['URL'] = "http://www.papertostone.com/opsdash/#/?q="+record['refId'];
    transformedObj['refId'] = record['refId'];
    transformedObj['createdAt'] = record['createdAt'];
    transformedObj['source'] = record['source']['slug'];
    transformedObj['category'] = record['category']['slug'];
    transformedObj['slug'] = record['meta']['slug'];
    transformedObj['city'] = record['city'];
    transformedObj['Start date'] = 0;
    transformedObj['Est. Project value'] = 0;
    transformedObj['status'] = record['status'];
    transformedObj['userName'] = record['user']['displayName'];
    transformedObj['userEmail'] = record['user']['email'];
    transformedObj['userPhone'] = record['user']['mobile'];
    
    transformedObj['opsStatus'] = record['opsStatus'];
    transformedObj['opsTag'] = record['opsTag']['slug'];
    
    transformedObj['Assigner']="";
    transformedObj['Assignee']="";
    record.assignment.forEach(function(assignment){     
        transformedObj['Assigner'] += assignment.assigner.email+DELIMITER;
      transformedObj['Assignee'] += assignment.assignee.email+DELIMITER;
      })
    
    transformedObj['comments'] ="";
    record.comments.forEach(function(comment){      
        transformedObj['comments'] += comment.user.email + " at " + comment.createdAt + " : " + comment.message + DELIMITER;
      })
    
    transformedObj['labels']="";
    record.opsLabels.forEach(function(label){     
        transformedObj['labels'] += label.slug + " | ";
      })
    transformedObj['superCat']="";
    var matchedSuperCat = transformedObj['labels'].match(/super-[a-z]{1,}/);
    if(matchedSuperCat) transformedObj['superCat'] = matchedSuperCat[0];
    transformedObj['answers']="";
    record.answers.forEach(function(answer){
      if(answer.question=='When do you want the work to start?'){
        transformedObj['work-start-date']=answer.answer;
      }
      else{
        transformedObj['answers'] += answer.question + " : " + answer.answer +DELIMITER;
      }
      })
    
    
    transformedObj['PostEnquiryAnswers']="";
    record.postAnswers.forEach(function(postAnswer){
            
        transformedObj['PostEnquiryAnswers'] += postAnswer.questionFrameworkQuestions.question.name + " : " + postAnswer.answer +DELIMITER;
      })
    transformedObj['priority']="";
    if(record['priority'] && record['priority']['slug']) transformedObj['priority']=record['priority']['slug'];
    transformedObj['# of vendors connected'] = 0;
    transformedObj['# Vendors who have met'] = 0;
    transformedObj['# quotations sent'] = 0;    
      record.postAnswers.forEach(function(postAnswer){
      if(postAnswer.questionFrameworkQuestions && postAnswer.questionFrameworkQuestions.question && postAnswer.questionFrameworkQuestions.question.id){
        if(postAnswer.questionFrameworkQuestions.question.id == 'c62d4342-aae3-427b-8c5a-4c6cbe7f073b') transformedObj['Start date'] = postAnswer.answer;
        if(postAnswer.questionFrameworkQuestions.question.id == '0e335f43-971e-4968-bbd8-303a4392268b') transformedObj['# quotations sent'] = postAnswer.answer;
        if(postAnswer.questionFrameworkQuestions.question.id == '4769e419-7996-446a-b98b-6d320e37ce08') transformedObj['Est. Project value'] = postAnswer.answer;
        if(postAnswer.questionFrameworkQuestions.question.id == '7a263759-f81b-4610-bb7a-1d66ae1ecd86') transformedObj['# Vendors who have met'] = postAnswer.answer;
        if(postAnswer.questionFrameworkQuestions.question.id == '6c256096-a4e4-4e0f-ba40-a11fea6e0cb9') transformedObj['# of vendors connected'] = postAnswer.answer;
      }
        
      })
    if(transformedObj['Est. Project value'] == 0) transformedObj['Est. Project value'] = record.value;
      return transformedObj;
    })
    doCSV(processedData);
  }

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
    var type = $.type(obj);
    var scalar = (type == "number" || type == "string" || type == "boolean" || type == "null");
    if (type == "array" || type == "object") {
      var d = {};
      for (var i in obj) {
        var newD = parse_object(obj[i], path + i + "/");
        $.extend(d, newD);
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
      if ($.type(next) == "array") return next;
      if ($.type(next) == "object") {
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

  function doCSV(json) {
    // 1) find the primary array to iterate over
    // 2) for each item in that array, recursively flatten it into a tabular object
    // 3) turn that tabular object into a CSV row using jquery-csv
    var inArray = arrayFrom(json);
    var outArray = [];
    for (var row in inArray) outArray[outArray.length] = parse_object(inArray[row]);
    // $("span.rows.count").text("" + outArray.length);
    var csv = $.csv.fromObjects(outArray);
    // // excerpt and render first 10 rows
    // renderCSV(outArray.slice(0, excerptRows));
    // showCSV(true);
    // // show raw data if people really want it
    // $(".csv textarea").val(csv);
    // download link to entire CSV as data
    // thanks to http://jsfiddle.net/terryyounghk/KPEGU/
    // and http://stackoverflow.com/questions/14964035/how-to-export-javascript-array-info-to-csv-on-client-side
    var uri = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
  window.open(uri, '_blank');
    return uri;
    // $(".csv a.download").attr("href", uri);
  }
  //init
  ORL = {};
  ORL.process = process;
})();
