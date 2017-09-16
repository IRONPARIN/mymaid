var express = require('express');
var router = express.Router();
var pg = require("pg");
var config = require("../config.json");
var auth = require("../lib/auth");
var id; var idemploy; var totalMaidrate; var maid_id; var employer_id; var totalEmprate;

/* GET home page. */
router.get('/:id', auth.authorized, function(req, res, next) {
  res.render('rating', { title: 'Express', firstname : req.session.firstname, image : req.session.imagename, role : req.session.role});
  console.log('Rating Page', req.params.id);
  id = req.params.id;
  idemploy = id.split(',');
  console.log('idemploy[0]', idemploy[0] , 'idemploy[1]', idemploy[1] );
});

router.post('/postrating', function(req, res, next) {
	console.log('Obj ',req.body);
	console.log('idemploy[0]', idemploy[0], 'idemploy[1]', idemploy[1], 'rating', req.body.model.rating, 'comment',req.body.model.comment);
	console.log('session ',req.session.role);
	//res.json({ RES : req.body });
  	pg.connect(config.CONNECTION_STRING, function(err, client, done) {
		if(!!err){
			res.send(err, 500);
		}
		else{
			if (req.session.role == 'employer') {
				client.query(
					"insert into review (id_date, rating, comment, created_date, id_employ, type)"
					+" values($1,$2,$3,now(),$4,'employer')"
					, [idemploy[1],req.body.model.rating,req.body.model.comment,idemploy[0]]
					, function(err, result){
						if(!!err){
							console.log("err : ", err);
							throw err;	
						}
						else{
							console.log("result : ", result);
							res.json(result.rows);
							client.query(
								"select maid_personalid from employment where id_employ = $1"
								, [idemploy[0]]
								, function(err, result){
									if(!!err){
										console.log("err : ", err);
										throw err;	
									}
									else{
										console.log("rows[0].maid : ", result.rows[0].maid_personalid);
										maid_id = result.rows[0].maid_personalid;
										getMaidRate()
									}
									!!done && done();
								}
							);
						}
						!!done && done();
					}
				);	
			}else{
				client.query(
					"insert into review (id_date, rating, comment, created_date, id_employ, type)"
					+" values($1,$2,$3,now(),$4,'maid')"
					, [idemploy[1],req.body.model.rating,req.body.model.comment,idemploy[0]]
					, function(err, result){
						if(!!err){
							console.log("err : ", err);
							throw err;	
						}
						else{
							console.log("result : ", result);
							res.json(result.rows);
							client.query(
								"select emp_personalid from employment where id_employ = $1"
								, [idemploy[0]]
								, function(err, result){
									if(!!err){
										console.log("err : ", err);
										throw err;	
									}
									else{
										console.log("rows[0].emp : ", result.rows[0].emp_personalid);
										employer_id = result.rows[0].emp_personalid;
										getEmpRate()
									}
									!!done && done();
								}
							);
						}
						!!done && done();
					}
				);	
			}	
		}
		!!done && done();
	});	
});

router.post('/maidcancel', function(req, res, next) {
	console.log('Obj ',req.body);	
  	pg.connect(config.CONNECTION_STRING, function(err, client, done) {
		if(!!err){
			res.send(err, 500);
		}
		else{	
			client.query(
				"insert into review (id_date, rating, comment, created_date, id_employ, type)"
				+" values($1,'0','Maid Cancel This Employment',now(),$2,'employer')"
				, [req.body.date_id,req.body.idemp]
				, function(err, result){
					if(!!err){
						console.log("err : ", err);
						throw err;	
					}
					else{
						console.log("result : ", result);
						res.json(result.rows);
						client.query(
							"select maid_personalid from employment where id_employ = $1"
							, [req.body.idemp]
							, function(err, result){
								if(!!err){
									console.log("err : ", err);
									throw err;	
								}
								else{
									console.log("rows[0].maid : ", result.rows[0].maid_personalid);
									maid_id = result.rows[0].maid_personalid;
									getMaidRate()
								}
								!!done && done();
							}
						);
					}
					!!done && done();
				}
			);	
		!!done && done();
		}
	});	
});

function getMaidRate() {
	var rateM1;
	var rateM2;
	var rateM3;
	var rateM4;
	var rateM5;
	pg.connect(config.CONNECTION_STRING, function(err, client, done) {
		client.query(
			"select count(id_review)as rate5 from review where id_employ in (select id_employ from employment where maid_personalid = $1) and rating = '5' and type = 'employer'"
			, [maid_id]
			, function(err, result){
				if(!!err){
					console.log("err : ", err);
					throw err;	
				}
				else{
					console.log("rows[0].rate5 : ", result.rows[0].rate5);
					rateM5 = parseInt(result.rows[0].rate5);
					client.query(
						"select count(id_review)as rate4 from review where id_employ in (select id_employ from employment where maid_personalid = $1) and rating = '4' and type = 'employer'"
						, [maid_id]
						, function(err, result){
							if(!!err){
								console.log("err : ", err);
								throw err;	
							}
							else{
								console.log("rows[0].rate4 : ", result.rows[0].rate4);
								rateM4 = parseInt(result.rows[0].rate4);
								client.query(
									"select count(id_review)as rate3 from review where id_employ in (select id_employ from employment where maid_personalid = $1) and rating = '3' and type = 'employer'"
									, [maid_id]
									, function(err, result){
										if(!!err){
											console.log("err : ", err);
											throw err;	
										}
										else{
											console.log("rows[0].rate3 : ", result.rows[0].rate3);
											rateM3 = parseInt(result.rows[0].rate3);
											client.query(
												"select count(id_review)as rate2 from review where id_employ in (select id_employ from employment where maid_personalid = $1) and rating = '2' and type = 'employer'"
												, [maid_id]
												, function(err, result){
													if(!!err){
														console.log("err : ", err);
														throw err;	
													}
													else{
														console.log("rows[0].rate2 : ", result.rows[0].rate2);
														rateM2 = parseInt(result.rows[0].rate2);
														client.query(
															"select count(id_review)as rate1 from review where id_employ in (select id_employ from employment where maid_personalid = $1) and rating = '1' and type = 'employer'"
															, [maid_id]
															, function(err, result){
																if(!!err){
																	console.log("err : ", err);
																	throw err;	
																}
																else{
																	console.log("rows[0].rate1 : ", result.rows[0].rate1);
																	rateM1 = parseInt(result.rows[0].rate1);
																	client.query(
																		"select count(id_review)as rate0 from review where id_employ in (select id_employ from employment where maid_personalid = $1) and rating = '0' and type = 'employer'"
																		, [maid_id]
																		, function(err, result){
																			if(!!err){
																				console.log("err : ", err);
																				throw err;	
																			}
																			else{
																				console.log("rows[0].rate0 : ", result.rows[0].rate0);
																				rateM0 = parseInt(result.rows[0].rate0);
																				console.log("rateM0 : ",rateM0,"rateM1 : ",rateM1,"rateM2 : ",rateM2,"rateM3 : ",rateM3,"rateM4 : ",rateM4,"rateM5 : ",rateM5);
																				if (rateM0 != null && rateM1 != null && rateM2 != null && rateM3 != null && rateM4 != null && rateM5 != null) {
																					totalMaidrate = (((5*rateM5)+(4*rateM4)+(3*rateM3)+(2*rateM2)+(1*rateM1)+(0*rateM0))/(rateM0+rateM1+rateM2+rateM3+rateM4+rateM5));
																				    console.log("totalMaidrate : ", totalMaidrate);
																				    if (totalMaidrate != null) {
																				    	client.query(
																							"update maid set rating = $2 where maid_personalid = $1"
																							, [maid_id,totalMaidrate]
																							, function(err, result){
																								if(!!err){
																									console.log("err : ", err);
																									throw err;	
																								}
																								else{
																									console.log("result : ", result.rows);
																									console.log("update rating complete");
																								}
																							}
																						);
																				    }
																				}
																			}
																		}
																	);							
																}
															}
														);
													}
												}
											);
										}
									}
								);
							}
						}
					);
				}
			}
		);	    
	    !!done && done();
    });
}

function getEmpRate() {
	var rateE1;
	var rateE2;
	var rateE3;
	var rateE4;
	var rateE5;
	pg.connect(config.CONNECTION_STRING, function(err, client, done) {
		client.query(
			"select count(id_review)as rate5 from review where id_employ in (select id_employ from employment where emp_personalid = $1) and rating = '5' and type = 'maid'"
			, [employer_id]
			, function(err, result){
				if(!!err){
					console.log("err : ", err);
					throw err;	
				}
				else{
					console.log("rows[0].rate5 : ", result.rows[0].rate5);
					rateE5 = parseInt(result.rows[0].rate5);
					client.query(
						"select count(id_review)as rate4 from review where id_employ in (select id_employ from employment where emp_personalid = $1) and rating = '4' and type = 'maid'"
						, [employer_id]
						, function(err, result){
							if(!!err){
								console.log("err : ", err);
								throw err;	
							}
							else{
								console.log("rows[0].rate4 : ", result.rows[0].rate4);
								rateE4 = parseInt(result.rows[0].rate4);
								client.query(
									"select count(id_review)as rate3 from review where id_employ in (select id_employ from employment where emp_personalid = $1) and rating = '3' and type = 'maid'"
									, [employer_id]
									, function(err, result){
										if(!!err){
											console.log("err : ", err);
											throw err;	
										}
										else{
											console.log("rows[0].rate3 : ", result.rows[0].rate3);
											rateE3 = parseInt(result.rows[0].rate3);
											client.query(
												"select count(id_review)as rate2 from review where id_employ in (select id_employ from employment where emp_personalid = $1) and rating = '2' and type = 'maid'"
												, [employer_id]
												, function(err, result){
													if(!!err){
														console.log("err : ", err);
														throw err;	
													}
													else{
														console.log("rows[0].rate2 : ", result.rows[0].rate2);
														rateE2 = parseInt(result.rows[0].rate2);
														client.query(
															"select count(id_review)as rate1 from review where id_employ in (select id_employ from employment where emp_personalid = $1) and rating = '1' and type = 'maid'"
															, [employer_id]
															, function(err, result){
																if(!!err){
																	console.log("err : ", err);
																	throw err;	
																}
																else{
																	console.log("rows[0].rate1 : ", result.rows[0].rate1);
																	rateE1 = parseInt(result.rows[0].rate1);
																	console.log("rateE1 : ",rateE1,"rateE2 : ",rateE2,"rateE3 : ",rateE3,"rateE4 : ",rateE4,"rateE5 : ",rateE5);
																	if (rateE1 != null && rateE2 != null && rateE3 != null && rateE4 != null && rateE5 != null) {
																		totalEmprate = ((5*rateE5)+(4*rateE4)+(3*rateE3)+(2*rateE2)+(1*rateE1))/(rateE1+rateE2+rateE3+rateE4+rateE5);
																	    console.log("totalEmprate : ", totalEmprate);
																	    if (totalEmprate != null) {
																	    	client.query(
																				"update employer set rating = $2 where emp_personalid = $1"
																				, [employer_id,totalEmprate]
																				, function(err, result){
																					if(!!err){
																						console.log("err : ", err);
																						throw err;	
																					}
																					else{
																						console.log("result : ", result.rows);
																						console.log("update rating complete");
																					}
																				}
																			);
																	    }
																	}
																}
															}
														);
													}
												}
											);
										}
									}
								);
							}
						}
					);
				}
			}
		);	    
	    !!done && done();
    });
}

module.exports = router;