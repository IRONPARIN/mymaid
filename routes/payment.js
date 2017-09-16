var express = require('express');
var router = express.Router();
var pg = require("pg");
var config = require("../config.json");
var auth = require("../lib/auth");
var now = new Date();

router.get('/:id.json', auth.authorized, function(req, res, next){
	console.log(req.params.id);
	pg.connect(config.CONNECTION_STRING, function(err, client, done) {
		if(!!err){
			res.send(err, 500);
		}
		else{
			client.query(
				"select * from employment where id_employ = $1"
				, [req.params.id]
				, function(err, result){
					res.json(result.rows);
					!!done && done();
				}
			);
		}
	});	
})

router.get('/:id', auth.authorized, function(req, res, next) {
	var id = req.params.id;
  	res.render('payment', { title: 'Express' ,firstname : req.session.firstname,image : req.session.imagename , config: config , id: req.params.id});
  	console.log('Payment Page', req.params.id);
});

pg.connect(config.CONNECTION_STRING, function(err, client, done) {
	if(!!err){
		res.send(err, 500);
	}
	else{
		client.query(
			"SELECT id_employ, EXTRACT(DAY FROM (employ_date)) as Empday" 
			+" ,EXTRACT(MONTH FROM (employ_date)) as Empmonth"
			+" ,EXTRACT(YEAR  FROM (employ_date)) as Empyear"
			+" from employment where status != 'Paid' and status != 'Service Complete' and status != 'In Service' and status != 'Cancel'"
			, function(err, result){
				if (!!err) {
					throw(err);
				}else{
					var valid;
					if (result.rows != false) {
						console.log('result : ',result.rows);
						result.rows.forEach(function(e, i){
							console.log(i,e);
							var empday = parseInt(e.empday);
							var empmonth = parseInt(e.empmonth);
							var empyear = parseInt(e.empyear);
							var emp_id = e.id_employ;
							console.log('Employdate : ',e.empday,e.empmonth,e.empyear);

							var day = now.getDate();
							var month = now.getMonth()+1; 
							var year = now.getFullYear();
							console.log('Nowdate : ',day,month,year);
							if (year >= empyear) {
								valid = true;
								if (month >= empmonth) {
									valid = true;
									if (day >= empday) {
										valid = true;
									}else{
										valid = false; 
									}
								}else{
									valid = false;
								}
							}else{
								valid = false;
							}if (valid == true) {
								console.log('cancel employment id: ',e.id_employ);								
								client.query(
									"update employment set status = 'Cancel',modifier_date = now() where id_employ = $1"
									, [e.id_employ]
									, function(err, result){
										if (!!err) {
											console.log("err : ", err);
											throw err;	
										}else{
											console.log('result : ',result.rows);
										}
										!!done && done();
									}
								);
							}
						})
					}else{
						console.log('Dont have employment status Matched or Wating');
					}					
				}
			}
		);
		!!done && done();
	}
});	

module.exports = router;