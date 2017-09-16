var express = require('express');
var router = express.Router();
var pg = require("pg");
var config = require("../config.json");
var auth = require("../lib/auth");
var maidid, start, homenum;

router.get('/:id.json', auth.authorized, function(req, res, next){
	pg.connect(config.CONNECTION_STRING, function(err, client, done) {
		if(!!err){
			res.send(err, 500);
		}
		else{
			client.query(
				"select rating , district from maid where maid_personalid = $1"
				, [req.params.id]
				, function(err, result){
					if(!!err){
						console.log("err : ", err);
						throw err;	
					}
					else{
						console.log("result : ", result);						
						res.json(result.rows[0]);						
					}					
				}
			);
		}
		!!done && done();
	});	
})

/* GET home page. */
router.get('/:id', auth.authorized, function(req, res, next) {
	maidid = req.params.id;
  	res.render('employment', {title: 'Express', firstname : req.session.firstname, image : req.session.imagename, config: config, id: req.params.id});
  	console.log('Employment Page', req.params.id);
});

router.post('/getdistrict', function(req, res, next) {
	console.log('Obj ',req.body);
	//res.json({ RES : req.body });
  	pg.connect(config.CONNECTION_STRING, function(err, client, done) {
		if(!!err){
			res.send(err, 500);
		}
		else{
			client.query(
				"select type from district where district = $1 and district2 = $2"
				, [req.body.maiddistrict,req.body.district]
				, function(err, result){
					if(!!err){
						console.log("err : ", err);
						throw err;	
					}
					else{
						console.log("result : ", result);
						res.json(result.rows);							
					}
				}
			);		
		}
		!!done && done();
	});	
});

router.post('/', function(req, res, next) {
	// console.log('body ',req.body);
	console.log('Obj ',req.body.obj);
	//console.log('workdate ',req.body.obj.workdate);
	// var workdate = req.body.obj.workdate;
	// var daynow = new Date();
	// daynow.setDate(workdate);
	// var n = daynow.toUTCString();
	// console.log('daynow ',daynow);
	// console.log('n ',n);
	//res.json({ RES : req.body });
  	pg.connect(config.CONNECTION_STRING, function(err, client, done) {
		if(!!err){
			res.send(err, 500);
		}
		else{
			client.query(
				"insert into employment (id_date, created_date, employ_date, starttime, endtime, wage, checkincode, checkoutcode,"
				+"status, home, soi, road, subdistrict, district, city, detail, maid_personalid, emp_personalid)"
				+"values($16,now(),$1,$2,$3,$4,$5,$6,'Waiting',$7,$8,$9,$10,$11,$12,$15,$13,$14)"
				, [req.body.obj.workdate,req.body.obj.starttime,req.body.endtime,req.body.wage,req.body.digitin,req.body.digitout,
				req.body.obj.hnumber,req.body.obj.soi,req.body.obj.road,req.body.obj.subdistrict,req.body.obj.district,
				req.body.obj.city,maidid,req.session.uid,"{\"insurance\":\""+req.body.obj.insurance+"\"}",req.body.iddate]
				, function(err, result){
					if(!!err){
						console.log("err : ", err);
						throw err;	
					}
					else{
						console.log("result insert : ", result);
						client.query(
							"select id_employ from employment where maid_personalid = $1 and emp_personalid = $2 and starttime = $3 and checkincode = $4 and home = $5"
							, [maidid,req.session.uid,req.body.obj.starttime,req.body.digitin,req.body.obj.hnumber]
							, function(err, result){
								if(!!err){
									console.log("err : ", err);
									throw err;	
								}
								else{
									console.log("result select : ", result);
									res.json(result.rows);
								}
							}
						);
					}
				}
			);		
		}
		!!done && done();
	});	
});

module.exports = router;