var fs = require('fs');
var program = require('commander');
 
program
  .version('0.0.1')
  .option('-s, --script [filename]', 'Specify the filename [filename]', 'filename')
  .parse(process.argv);

fs.readFile(program.script, function(err, data){
	if(err) return console.log(err);
	data = data.toString().replace(/(?:\r\n|\r|\n)/g, '');
	var bookmark = "javascript:(function(){";
	bookmark += data
	bookmark += "})();void(0);";
	
	console.log(bookmark);
})