var fs = require("fs");

var walk = function (dir, action) {
	let  list= fs.readdirSync(dir)
	list.forEach(function (file) {
		let path = dir + "/" + file;

		let stat=fs.statSync(path);
		if (stat && stat.isDirectory()) walk(path, action);
		else action(null, path);
	});
};

var strings=[];
function get_strings(file) {
	let ctx = fs.readFileSync(file, {encoding:"utf-8"});
	var re = /_\(["'](.+?)["']\)/g;
	for (let m of ctx.matchAll(re)) {
		strings.push(m[1]);
	}
}

walk("./src", function(err, file) { 
	if (err) {
		console.log(err);
		return;
	}
	get_strings(file);
});

let alread_trans = require("../src/translate.js");
let trans={};

for(let i=0; i<strings.length; i++) {
	let str = strings[i];
	if ( str in trans) continue;
	if ( str in alread_trans) {
    	trans[str]=alread_trans[str]
    }else{
        trans[str]={zh:str, en:" "}
    }
}

str="const strings =";
str+=JSON.stringify(trans, null, 2);
str+="\n\nmodule.exports = strings\n";

fs.renameSync("./src/translate.js", "./src/translate.js.bak");

fs.writeFileSync("./src/translate.js", str);
