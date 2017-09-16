var express = require('express');
var router = express.Router();
var pg = require("pg");
var config = require("../config.json");
var auth = require("../lib/auth");

/* GET home page. */
router.get('/', auth.authorized, function(req, res, next) {
  res.render('showmaid', { title: 'Express', firstname : req.session.firstname, image : req.session.imagename});
  console.log('name : ',req.session.firstname);
  console.log('image : ',req.session.imagename);
  console.log('Showmaid Page');
});

router.get('/list.json', auth.authorized, function(req, res, next){
	pg.connect(config.CONNECTION_STRING, function(err, client, done) {
		if(!!err){
			console.log(err);
			res.send(err, 500);
		}
		else{
			client.query(
				"select m.*"
				+" ,(select im.name from image_maid im where im.maid_personalid = m.maid_personalid and im.type = 'Profile') as imagename"
				+" from maid m order by m.rating desc"
				, function(err, result){
				console.log('/list.json', err, (result||{}).rowCount);
				res.json(result.rows);
			});
		}
		!!done && done();
	});	
});

module.exports = router;