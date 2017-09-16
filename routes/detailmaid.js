var express = require('express');
var router = express.Router();
var pg = require("pg");
var config = require("../config.json");
var auth = require("../lib/auth");

router.get('/:id.json', auth.authorized, function(req, res, next){
	pg.connect(config.CONNECTION_STRING, function(err, client, done) {
		if(!!err){
			res.send(err, 500);
		}
		else{
			client.query(
				"select m.*"
				+" ,(select im.name from image_maid im where im.maid_personalid = m.maid_personalid and im.type = 'Profile') as imagename"
				+" ,(select p.id_pickup from pickup p where p.maid_personalid = m.maid_personalid and p.emp_personalid = $2) as pickup"
				+" from maid m where m.maid_personalid = $1"
				, [req.params.id,req.session.uid]
				, function(err, result){
					if (!!err) {
						throw(err);
					}else{
						res.json(result.rows[0]);	
					}
					!!done && done();
				}
			);
		}
	});	
})

router.get('/:id.comment', auth.authorized, function(req, res, next){
	pg.connect(config.CONNECTION_STRING, function(err, client, done) {
		if(!!err){
			res.send(err, 500);
		}
		else{
			client.query(
				"select emp.emp_personalid, re.comment, re.created_date, re.type, e.name as empname, ime.name as imgname"
				+" from employment emp"
				+" inner join review re on emp.id_employ = re.id_employ"
				+" inner join employer e on e.emp_personalid = emp.emp_personalid"
				+" inner join image_employer ime on ime.emp_personalid = emp.emp_personalid"
				+" where emp.maid_personalid = $1 and re.type = 'employer' and ime.type = 'Profile' and re.comment is not null and re.comment != 'Maid Cancel This Employment'"
				, [req.params.id]
				, function(err, result){
					if (!!err) {
						throw(err);
					}else{
						res.json(result.rows);
						console.info('result comment : ',result);
					}					
					!!done && done();
				}
			);
		}
	});	
})

router.get('/:id', auth.authorized, function(req, res, next) {
	res.render('detailmaid', { title: 'Express', firstname : req.session.firstname, id: req.params.id , image : req.session.imagename});
	console.log('Detail Maid Page', req.params.id);
});
module.exports = router;
