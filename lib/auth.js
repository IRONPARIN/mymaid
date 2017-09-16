module.exports = {
	authorized: function(req, res, next){

		console.info('auth', req.url, (req.session || {}).uid);
		

		if(!!res){
			//if(req.session == null || req.session.uid == null){
			if(req.session.uid == null || req.session.firstname == null){
				if(req.url.indexOf('.json') > -1)
					res.status(401);
				else
					res.redirect('http://'+req.headers.host);
			}
			else{
				!!next && next();	
			}
		}

		//return req.session != null && req.session.uid != null;
		return req.session.uid != null && req.session.firstname != null;
	}
}