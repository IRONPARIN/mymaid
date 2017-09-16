var express = require('express');
var router = express.Router();
var pg = require("pg");
var config = require("../config.json");
var fs = require('fs');
var path = require('path');
var uid = require('uid2');
var mime = require('mime');
var multer = require('multer');

router.get('/', function(req, res) {
  res.render('uploadimage', {title: 'Express' , name: ""});
});

var upload = multer({dest:'./uploads/'});
var type = upload.single('file');

router.post('/upload',type ,function(req, res) {
    if (!!req.file && req.file != null) {
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
                    console.log('session role',req.session.role);
                    console.log('session perid',req.session.perid);
                    if (req.session.role == 'Maid') {
                        client.query(
                            "insert into image_maid (pathfile, name, filetype, type, maid_personalID)"
                            +"values ($2,$3,$4,'Profile',$1)" 
                            , [req.session.perid,targetPath , targetName , extension]
                            , function(err, result){
                                if(!!err){
                                    console.log("err : ", err);
                                    throw err;  
                                }
                                else{
                                    console.log("result : ", result);                                                          
                                }
                            }
                        ); 
                    }else{
                        client.query(
                            "insert into image_employer (pathfile, name, filetype, type, emp_personalID)"
                            +"values ($2,$3,$4,'Profile',$1)" 
                            , [req.session.perid,targetPath , targetName , extension]
                            , function(err, result){
                                if(!!err){
                                    console.log("err : ", err);
                                    throw err;  
                                }
                                else{
                                    console.log("result : ", result);                   
                                }
                            }
                        );
                    }                    
                    !!done && done();
                }
                res.redirect('/');
            });
            !!done && done();
        });
    });
}               
});

router.get('/uploadmore', function(req, res) {
  res.render('uploadmoreimage', {title: 'Express' , name: ""});
});

router.post('/uploadmoreimg',type ,function(req, res) {
    if (!!req.file && req.file != null) {
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
                    console.log('session role',req.session.role);
                    console.log('session perid',req.session.perid);
                    if (req.session.role == 'maid') {
                        client.query(
                            "insert into image_maid (pathfile, name, filetype, type, maid_personalID)"
                            +"values ($2,$3,$4,'Image',$1)" 
                            , [req.session.uid,targetPath,targetName,extension]
                            , function(err, result){
                                if(!!err){
                                    console.log("err : ", err);
                                    throw err;  
                                }
                                else{
                                    console.log("result : ", result);                                                          
                                }
                            }
                        ); 
                    }else{
                        console.log('session role',req.session.role);
                        console.log('session perid',req.session.perid);
                        client.query(
                            "insert into image_employer (pathfile, name, filetype, type, emp_personalID)"
                            +"values ($2,$3,$4,'Image',$1)" 
                            , [req.session.uid,targetPath,targetName,extension]
                            , function(err, result){
                                if(!!err){
                                    console.log("err : ", err);
                                    throw err;  
                                }
                                else{
                                    console.log("result : ", result);                   
                                }
                            }
                        );
                    }                    
                    !!done && done();
                }
                res.redirect('../profile');
            });
            !!done && done();
        });
    });
}               
});

module.exports = router;