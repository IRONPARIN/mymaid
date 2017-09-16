var express = require('express');
var router = express.Router();
var pg = require("pg");
var config = require("../config.json");
var auth = require("../lib/auth");

/* GET home page. */
router.get('/', function(req, res, next) {
	if(false && auth.authorized(req)){
		req.session.destroy();
		res.redirect('/');
	}
	else{
		res.render('index', {message: "",un: ""});
	}
});

router.post('/', function(req, res, next) {
  	console.log('login', req.body, req.params);

  	pg.connect(config.CONNECTION_STRING, function(err, client, done) {

		if(!!err){
			res.status(500).send(err);
		}
		else{
			client.query(
				"select m.*,"
				+" (select im.name from image_maid im where im.maid_personalid = m.maid_personalid and type = 'Profile') as imagename"
				+" from maid m where m.maid_personalid = $1 AND m.password = MD5($2)"
				,[req.body.username, req.body.password]
				, function(err, result){
					console.log('auth1', err, result.rows);
					if (result != null && result.rows.length > 0) {
						req.session.uid = result.rows[0].maid_personalid;
						req.session.firstname = result.rows[0].name;
						req.session.imagename = result.rows[0].imagename;
						req.session.role = 'maid';
						req.session.save(function(err) {
							//console.log('session', err, req.session);
							console.log('session.uid : ', req.session.uid);
							console.log('session.firstname : ', req.session.firstname);
							console.log('session.imagename : ', req.session.imagename);
							console.log('session.role : ', req.session.role);
							if (req.session.role == 'maid') {
								//res.redirect('/requestemployment');
								res.render('requestemployment',{firstname: req.session.firstname , image : req.session.imagename})
							}				            
			   			});
					}else{
						client.query(
							"select e.*," 
							+" (select ie.name from image_employer ie where ie.emp_personalid = e.emp_personalid and type = 'Profile') as imagename"
							+" from employer e where emp_personalid = $1 AND password = MD5($2)"
							,[req.body.username, req.body.password]
							, function(err, result){

								console.log('auth2', err, result.rows);
								if (result != null && result.rows.length > 0) {
									req.session.uid = result.rows[0].emp_personalid;
									req.session.firstname = result.rows[0].name;
									req.session.imagename = result.rows[0].imagename;
									req.session.role = 'employer';
									req.session.save(function(err) {
										//console.log('session', err, req.session);
										console.log('session.uid : ', req.session.uid);
										console.log('session.firstname : ', req.session.firstname);
										console.log('session.imagename : ', req.session.imagename);
										console.log('session.role : ', req.session.role);
										if (req.session.role == 'employer') {
											//res.redirect('/showmaid');
											res.render('filtermaid',{firstname: req.session.firstname , image : req.session.imagename})
										}
						   			});
								}
								else{
									res.render('index',{message: 'Invalid Username or Password.', un: req.body.username, err: err});
								}

								!!done && done();
							}
						);
					}			
			});
			
		}
	});
});

module.exports = router;