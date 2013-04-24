/*
	make an array of keys with currentalerts and their respective user
		by looping through users in db and getting their currentalerts array, then concat these into the userscurrentalerts array


	loop through the userscurrentalerts array and perform stockScraper on it
	check if any of the prices/tickers present have crossed:
		i.e. if the previous current price for that stock was above X and the value recently scraped is below X, run alerter (and vice versa)
		this may need to merge with stockScraper as the check would need to be done before the new value is inserted into the db

	MAYBE REDO WITH EVENTEMITTERS?

*/

var MongoClient = require('mongodb').MongoClient;
var nodemailer = require('nodemailer');
//var stockScraper = require('./stockScraper/stockScraper');

var arrayOf;

var middleArray = [];

function sendAlert(callback, item) {
	//console.log(item);
	var s1 = 'Stock Alert: ';
	var s2 = ' crossed ';
	var totalString = s1.concat(item.alert.ticker, ' ', item.alert.price);
	
	// create reusable transport method (opens pool of SMTP connections)
	var smtpTransport = nodemailer.createTransport("SMTP",{
	    service: "Gmail",
	    auth: {
	        user: "matt@palmer.im",
	        pass: "cvf142zaq569"
	    }
	});

	// setup e-mail data with unicode symbols
	var mailOptions = {
	    from: "matt@palmer.im", // sender address
	    to: item.email, // list of receivers
	    subject: totalString, // Subject line
	    text: totalString.concat('\n visit  for more')
	}

	// send mail with defined transport object
	smtpTransport.sendMail(mailOptions, function(error, response){
	    if(error){
	        console.log(error);
	        callback(error);
	    }else{
	        console.log("Message sent: " + response.message);
	        callback(null, response.message);
	    }

	    // if you don't want to use this transport object anymore, uncomment following line
	    //smtpTransport.close(); // shut down the connection pool, no more messages
	});


	console.log( );
}
//392.05 390.53 390.32
function crossCheck(callback, previousStockPrice, currentStockPrice, desiredStockPrice) {
	//high to low
	//low to high
	//equals
	
	previousStockPrice = parseFloat(previousStockPrice);
	currentStockPrice = parseFloat(currentStockPrice);
	desiredStockPrice = parseFloat(desiredStockPrice);
	//console.log(typeof previousStockPrice);
	//console.log(previousStockPrice, currentStockPrice, desiredStockPrice);
	if (previousStockPrice > desiredStockPrice && currentStockPrice < desiredStockPrice) {
		//console.log('price has dropped from higher than alert to lower than alert');
		callback(true);
		
	} else if (previousStockPrice < desiredStockPrice && currentStockPrice > desiredStockPrice) {
		//console.log('price has rose from lower than alert to higher');
		callback(true);
	} else if (desiredStockPrice == currentStockPrice) {
		//console.log('equalled');
		callback(true);
	} else {

		callback(false);
	}

}

function loopThroughUsers(callback) {
		var arrayOfCurrentAlertsWithUsers = [];
		//mongodb://localhost:27017/stockalertDev

		MongoClient.connect('mongodb://nodejitsu:5a241aff23f5e458c4522bf7fc2cbd5c@alex.mongohq.com:10002/nodejitsudb1837116682', function(err, db) {
			var collection = db.collection('users');
			collection.find({}).toArray(function(err, docs) {
				    //console.log("retrieved records:");
    				//console.log(docs);
    				for (var e in docs) {
    					//console.log(docs[e].currentAlerts);
    					for (var x in docs[e].currentAlerts) {
    						//console.log(docs[e].currentAlerts[x]);
    						var alertWithEmail = {
    							email: docs[e].email,
    							alert: docs[e].currentAlerts[x]
    						}
    						arrayOfCurrentAlertsWithUsers.push(alertWithEmail);
    						//console.log(arrayOfCurrentAlertsWithUsers);
    					}
    				}
    				callback(arrayOfCurrentAlertsWithUsers);
			});


		});
}

function compareAlertAndScraped(callback) {
	loopThroughUsers(function(arrayOfUserAlerts) {

			MongoClient.connect('mongodb://nodejitsu:5a241aff23f5e458c4522bf7fc2cbd5c@alex.mongohq.com:10002/nodejitsudb1837116682', function(err, db) {
				var stocksCollection = db.collection('stocks');
				
				for (var b in arrayOfUserAlerts) {
					
					
						//console.log('user alerts item is ', arrayOfUserAlerts[b]);
						var message = 'SO';

						(function (a) {   
						    //console.log(a);
						    stocksCollection.find({ticker: arrayOfUserAlerts[a].alert.ticker}).toArray(function(err, docs) {
						if (err ) {
							//console.log('user alerts item is ', arrayOfUserAlerts[a]);
							console.log('not found');
						} else {
							
							if (docs.length == 0) {
								//console.log('user alerts item is ', arrayOfUserAlerts[a]);
								//console.log('empty array');
							} else {
								//console.log(docs[0]);
								//console.log('user alerts item is ', arrayOfUserAlerts[a]);
								crossCheck(function(x) {
									if (x) {
										//console.log('was true');
										sendAlert(function(err, response) {
											if (err) {
												callback(err);

											} else {
												callback(null, response);
											}
										} , arrayOfUserAlerts[a]);
									} else {
										//console.log('was not true');

									}
								}, docs[0].pastPrices[0], docs[0].currentPrice, arrayOfUserAlerts[a].alert.price );
								//console.log('tf is ', tf);
							}
							
						}
					});
						})(b);					
							
					
					}
					
				});
				
				
			});

}
/*
compareAlertAndScraped(function(scrapedDoc, specificAlert) {
	//console.log(scrapedDoc, specificAlert);
});*/
/*
getAnAlert(function(b) {
	console.log('here is the ', b);
}, 'matt', 'DTOA', 183);*/


module.exports = {
	crossCheck : crossCheck,
	loopThroughUsers : loopThroughUsers,
	sendAlert : sendAlert,
	compareAlertAndScraped : compareAlertAndScraped
}
