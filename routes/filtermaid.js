var express = require('express');
var router = express.Router();
var pg = require("pg");
var config = require("../config.json");
var auth = require("../lib/auth");
var gender;
var expert;

/* GET home page. */
router.get('/', auth.authorized, function(req, res, next) {
  res.render('filtermaid', { title: 'Express' , firstname : req.session.firstname, image : req.session.imagename});
  console.log('Filter Maid Page');
});

router.post('/filter1', auth.authorized, function(req, res, next) {
	console.log('Obj1 ',req.body);
	gender = req.body.obj.gender;	
	console.log('Gender.post ',gender);
	res.render('showgendermaid', {title: 'Express', firstname : req.session.firstname, image : req.session.imagename});
});

router.post('/filter2', auth.authorized, function(req, res, next) {
	console.log('Obj2 ',req.body);
	gender = req.body.obj.gender;
	expert = req.body.expert;
	console.log('Gender.post ',gender);
	console.log('expert.post ',expert);
	res.render('showfiltermaid', {title: 'Express', firstname : req.session.firstname, image : req.session.imagename});
});

router.get('/showgendermaid', auth.authorized, function(req, res, next) {
  	res.render('showgendermaid', {title: 'Express', firstname : req.session.firstname, image : req.session.imagename});
  	console.log('Filter Gender Maid Page');
});

router.get('/gendermaid.json', auth.authorized, function(req, res, next) {
	console.log(gender);
  	pg.connect(config.CONNECTION_STRING, function(err, client, done) {
		if(!!err){
			res.send(err, 500);
		}
		else{
			client.query(
				"select m.*,(select im.name from image_maid im where im.maid_personalid = m.maid_personalid and im.type = 'Profile') as imagename from maid m where m.gender = $1"
				, [gender]
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

router.get('/showfiltermaid', auth.authorized, function(req, res, next) {
  res.render('showfiltermaid', {title: 'Express', firstname : req.session.firstname, image : req.session.imagename});
  console.log('Filter Maid');
});

router.get('/filtermaid.json', auth.authorized, function(req, res, next) {
	console.log(gender,expert);
  	pg.connect(config.CONNECTION_STRING, function(err, client, done) {
		if(!!err){
			res.send(err, 500);
		}
		else{
			client.query(
				"select m.*,(select im.name from image_maid im where im.maid_personalid = m.maid_personalid and im.type = 'Profile') as imagename from maid m where m.gender = $1 and m.expert Like $2"
				, [gender,'%'+expert+'%']
				, function(err, result){
					if(!!err){
						console.log("err : ", err);
						throw err;	
					}
					else{
						console.log("result : ", result);
						res.json(result.rows);
					}
					!!done && done();
				}
			);		
		}
		!!done && done();
	});
});

router.get('/check.json', auth.authorized, function(req, res, next){
	pg.connect(config.CONNECTION_STRING, function(err, client, done) {
		if(!!err){
			console.log(err);
			res.send(err, 500);
		}
		else{
			client.query(
				"select e.*"
				+",(select im.name from image_maid im where im.maid_personalid = e.maid_personalid and im.type = 'Profile') as imagename"
				+",(select m.name from maid m where m.maid_personalid = e.maid_personalid) as maidname"
				+" from employment e where e.emp_personalid = $1 and e.status = 'Paid'"
				, [req.session.uid]
				, function(err, result){
					if (!!err) {
						console.log("err : ", err);
						throw err;	
					}else{
						console.log('/check.json', result);
						res.json(result.rows);
					}				
				}
			);
		}
		!!done && done();
	});	
});

router.get('/rating.json', auth.authorized, function(req, res, next){
	pg.connect(config.CONNECTION_STRING, function(err, client, done) {
		if(!!err){
			console.log(err);
			res.send(err, 500);
		}
		else{
			client.query(
				"select e.* from employment e where e.emp_personalid = $1"
				+" and e.status = 'Service Complete' and e.id_employ not in (select id_employ from review where type = 'employer')"
				, [req.session.uid]
				, function(err, result){
					if (!!err) {
						console.log("err : ", err);
						throw err;	
					}else{
						console.log('/rating.json', result);
						res.json(result.rows);
					}				
				}
			);
		}
		!!done && done();
	});	
});

router.get('/checkout.json', auth.authorized, function(req, res, next){
	pg.connect(config.CONNECTION_STRING, function(err, client, done) {
		if(!!err){
			console.log(err);
			res.send(err, 500);
		}
		else{
			client.query(
				"select e.* from employment e where e.emp_personalid = $1 and e.status = 'In Service'"
				, [req.session.uid]
				, function(err, result){
					if (!!err) {
						console.log("err : ", err);
						throw err;	
					}else{
						console.log('/rating.json', result);
						res.json(result.rows);
					}				
				}
			);
		}
		!!done && done();
	});	
});

router.post('/getDigit', function(req, res, next) {
	console.log('Obj ',req.body);
	//res.json({ RES : req.body });
  	pg.connect(config.CONNECTION_STRING, function(err, client, done) {
		if(!!err){
			res.send(err, 500);
		}
		else{
			client.query(
				"select * from employment where id_employ = $1"
				, [req.body.id]
				, function(err, result){
					console.log('result ',result);
					res.json(result.rows);
					!!done && done();
				}
			);		
		}
		!!done && done();
	});	
});

router.post('/checkout', function(req, res, next) {
	console.log('Obj ',req.body);
	//res.json({ RES : req.body });
  	pg.connect(config.CONNECTION_STRING, function(err, client, done) {
		if(!!err){
			res.send(err, 500);
		}
		else{
			client.query(
				"update employment set status = 'Service Complete',checkout = now() where id_employ = $1"
				, [req.body.id]
				, function(err, result){
					console.log('result ',result);
					res.json(result.rows);
					!!done && done();
				}
			);		
		}
		!!done && done();
	});	
});

module.exports = router;