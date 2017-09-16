var express = require('express');
var router = express.Router();
var pg = require("pg");
var config = require("../config.json");
var fs = require('fs');
var path = require('path');
var uid = require('uid2');
var mime = require('mime');
var multer = require('multer');

var now = new Date();
var day = now.getDate();
var month = now.getMonth(); 
var monthnow = month+1;
var year = now.getFullYear();
var hh = now.getHours();
var mm = now.getMinutes();

var dateemploy = new Date("2017-01-31 17:25:00");
var dayemploy = dateemploy.getDate();
var monthemploy = dateemploy.getMonth();
var monthem = monthemploy+1;
var yearemploy = dateemploy.getFullYear();
var timeemploy = "15:22:00";

var str = yearemploy+"-0"+monthem+"-"+dayemploy+" "+timeemploy;
console.info("str ",str);
var pypy = new Date(str);
var aaaa = new Date(str);
var hem = pypy.getHours();
var mem = pypy.getMinutes();

console.info("today ", day, monthnow ,year,hh,mm);
console.info("day employ ", dayemploy, monthem, yearemploy,hem,mem);

var arr = [];
Array.prototype.multiIndexOf = function (el) { 
    var idxs = [];
    for (var i = this.length - 1; i >= 0; i--) {
        if (this[i] === el) {
            idxs.unshift(i);
        }
    }
    return idxs;
};

if (day==dayemploy) {
    arr.push(true);
    console.info("day true");
}else{arr.push(false);}
if (monthem==monthem) {
    arr.push(true);
    console.info("month true");
}else{arr.push(false);}
if (year==yearemploy) {
    arr.push(true);
    console.info("year true");
}else{arr.push(false);}
if (hh==hem) {
    arr.push(true);
    console.info("hours true");
}else{arr.push(false);}
if (mm==mem) {
    arr.push(true);
    console.info("minutes true");
}else{arr.push(false);}
console.info("arr ",arr);

if(arr!=0){
var findfalse = arr.multiIndexOf(false);
console.info(findfalse);
if (findfalse != 0) {console.info("not match");}
else{console.info("match !");} 
}

router.get('/a', function(req, res) {
  // res.render('test_image', {name: ""});

    var now = new Date();
    console.info("now ", now);

    var month = now.getUTCMonth()+1;
    var year = now.getUTCFullYear();
    var date = now.getUTCDate();

    var dateStrToSend = year + '-' + month +  '-' + date;

    console.info("dateStrToSend ",dateStrToSend);
});

router.get('/', function(req, res) {
  res.render('test_image', {name: ""});
});

var upload = multer({dest:'./uploads/'});
var type = upload.single('file');

router.post('/upload',type ,function(req, res) {

	pg.connect(config.CONNECTION_STRING, function(err, client, done) {
	console.log("file : ",req.file);

	var TARGET_PATH = path.resolve(__dirname, '../uploads/');
	var IMAGE_TYPES = ['image/jpeg', 'image/png'];

	var is;
    var os;
    var targetPath;
    var targetName;
    var tempPath = req.file.path;
    var type = req.file.mimetype;
    var extension = req.file.mimetype.split("/").pop();

    if (IMAGE_TYPES.indexOf(type) == -1) {
      return res.status(415).send('Supported image formats: jpeg, jpg, jpe, png.');
    }

    targetName = uid(22) + '.' + extension;
    targetPath = path.join(TARGET_PATH, targetName);
    is = fs.createReadStream(tempPath);
    os = fs.createWriteStream(targetPath);
    is.pipe(os);

    is.on('error', function() {
      if (err) {
        return res.status(500).send('Something went wrong');
      }
    });

    console.log("targetName : " , targetName);
    console.log("targetPath : " , targetPath); 
    
        is.on('end', function() {

    		fs.unlink(tempPath, function(err) {
    			if (err) {
    		      return res.status(500).send('Something went wrong'); 
    		    }

    			else{
    				client.query(
    					"insert into image (path, name, type) values($1, $2, $3)"
    					, [targetPath , targetName , extension]
    					, function(err, result){

    					!!done && done();
    				});	
    			
    			}
    		    res.render('image', {
    	          name: targetName
    	        });
    		});
    		!!done && done();
    	});
    });            
});
module.exports = router;