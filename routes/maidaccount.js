var express = require('express');
var router = express.Router();
var pg = require("pg");
var config = require("../config.json");
var auth = require("../lib/auth");

/* GET home page. */
router.get('/', auth.authorized, function(req, res, next) {
  res.render('maidaccount', {title: 'Express', firstname : req.session.firstname, image : req.session.imagename});
  console.log('Maid Account Page');
});

router.get('/list.json', auth.authorized, function(req, res, next){
	pg.connect(config.CONNECTION_STRING, function(err, client, done) {
		if(!!err){
			console.log(err);
			res.send(err, 500);
		}
		else{						
			client.query(
				"select e.* from employment e where e.maid_personalid = $1 and e.status = 'Service Complete'"
				, [req.session.uid]
				, function(err, result){
				console.log('/list.json', err, (result||{}).rowCount);
				res.json(result.rows);
			});			
		}
		!!done && done();
	});	
});

router.post('/accbymonth', auth.authorized, function(req, res, next){
	pg.connect(config.CONNECTION_STRING, function(err, client, done) {
		if(!!err){
			console.log(err);
			res.send(err, 500);
		}
		else{						
			client.query(
				"select e.* from employment e"
				+" where e.maid_personalid = $1 and e.status = 'Service Complete'"
				+" and date_part('month',e.employ_date) = $2 and date_part('year',e.employ_date) = $3"
				, [req.session.uid,req.body.month,req.body.year]
				, function(err, result){
					if (!!err) {
						throw err;
					}else{
						res.json(result.rows);		
					}
			});			
		}
		!!done && done();
	});	
});

module.exports = router;