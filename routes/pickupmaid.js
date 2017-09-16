var express = require('express');
var router = express.Router();
var pg = require("pg");
var config = require("../config.json");
var auth = require("../lib/auth");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('pickupmaid', { title: 'Express'  , firstname : req.session.firstname , image : req.session.imagename});
  console.log('Pick Up Maid Page');
});

router.get('/pickup.list', auth.authorized, function(req, res, next){
	pg.connect(config.CONNECTION_STRING, function(err, client, done) {
		if(!!err){
			res.send(err, 500);
		}
		else{
			client.query(
				"select m.*"
				+" ,(select im.name from image_maid im where im.maid_personalid = m.maid_personalid and im.type = 'Profile') as imagename"
				+" from maid m where m.maid_personalid in (select maid_personalid from pickup where emp_personalid = $1) order by m.rating desc"
				, [req.session.uid]
				, function(err, result){
					if(!!err){
						console.log("err : ", err);
						throw err;	
					}else{
						res.json(result.rows);
					}
					!!done && done();
				}
			);
		}
	});	
})

router.post('/checkpick', function(req, res, next) {
	console.log('Obj ',req.body.maidID);
	//res.json({ RES : req.body });
	console.log('id : ',req.session.uid);
  	pg.connect(config.CONNECTION_STRING, function(err, client, done) {
		if(!!err){
			res.send(err, 500);
		}
		else{
			client.query(
				"select * from pickup where maid_personalid = $1 and emp_personalid = $2"
				, [req.body.maidID,req.session.uid]
				, function(err, result){
					if(!!err){
						console.log("err : ", err);
						throw err;	
					}
					else{
						if (result.rows == false) {
							console.log('result || insert: ',result.rows);
							client.query(
								"insert into pickup (pickup_date,maid_personalid,emp_personalid)"
								+" values(now(),$1,$2)"
								, [req.body.maidID,req.session.uid]
								, function(err, result){
									if(!!err){
										console.log("err : ", err);
										throw err;	
									}
									else{
										res.json(result.rows);
									}
								}
							);
						}else{
							console.log('result || delete: ',result.rows);
							client.query(
								"delete from pickup where maid_personalid = $1 and emp_personalid = $2"
								, [req.body.maidID,req.session.uid]
								, function(err, result){
									if(!!err){
										console.log("err : ", err);
										throw err;	
									}
									else{
										res.json(result.rows);
									}
								}
							);
						}
					}
				}
			);		
		}
		!!done && done();
	});	
});

module.exports = router;
