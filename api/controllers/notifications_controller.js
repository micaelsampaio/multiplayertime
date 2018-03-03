var request = require('request');
module.exports.sendNotification = function(token, user){
	
	request.get(
		{url: "http://localhost:9000/notify/"+user,
		headers: {
			'Authorization': token
		}},
		function (error, response, body) {
			if (!error && response.statusCode == 200) {
				if(body.success){ 
					console.log("NOTIFICATION SUCESS");
				}else{
					console.log("NOTIFICATION FALSE");
				}
			}else{
				console.log("NOTIFICATION ERROR");
			}
		});
}