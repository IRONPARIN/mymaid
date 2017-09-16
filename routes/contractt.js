var express = require('express');
var router = express.Router();
var pg = require("pg");
var config = require("../config.json");
var auth = require("../lib/auth");
var empid, iddate, employdate, endtime;

router.get('/:empid.json', auth.authorized, function(req, res, next){
	console.log(empid);
	pg.connect(config.CONNECTION_STRING, function(err, client, done) {
		if(!!err){
			res.send(err, 500);
		}
		else{
			client.query(
				"select *"
				+" ,(select name from maid where maid_personalid = (select maid_personalid from employment where id_employ = $1)) as maidname"
				+" ,(select name from employer where emp_personalid = (select emp_personalid from employment where id_employ = $1)) as empname"
				+" from employment where id_employ = $1"
				, [empid]
				, function(err, result){
					if(!!err){
						console.log("err : ", err);
						throw err;	
					}
					else{
						console.log("result : ", result);						
						res.json(result.rows[0]);	
						console.log("idemp : ",result.rows[0].id_employ,"iddate : ",result.rows[0].id_date);
						iddatee = result.rows[0].id_date;
						employdate = result.rows[0].employ_date;
						if (req.session.role == 'employer') {
							client.query(
								"insert into contract (id_date,created_date,startdate,enddate,status,id_employ)"
								+" values($1,now(),now(),$2,'created',$3)"
								, [iddatee,employdate,empid]
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
					}					
				}
			);
		}
		!!done && done();
	});	
})

router.get('/:empid', auth.authorized, function(req, res, next) {
  	res.render('contract', {title: 'Express', firstname : req.session.firstname, image : req.session.imagename, empid : req.params.empid, role : req.session.role, config: config});
  	console.log('Contract Page', req.params.empid);
  	empid = req.params.empid;
});

module.exports = router;