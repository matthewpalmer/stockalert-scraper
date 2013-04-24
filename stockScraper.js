var MongoClient = require('mongodb').MongoClient;
var Stock = require('./stockModel');
var request = require('request');


function scrape(callback, market, ticker) {

		try {
			if (!ticker || !market) {
				throw new Error('invalid args');
			} else {

				var baseStr = 'https://www.google.com/finance/info?&q=';
				baseStr = baseStr.concat(market,':', ticker);

				request(baseStr, function(err, res, body) {
					try {
						if (err || res.statusCode != 200) {
							console.log(res.statusCode);
							throw new Error ('error scraping');
						} else {
							var string = body.replace('[','');
							string = string.replace(']','');
							string = string.replace('//','');

							var jsonBody = JSON.parse(string);
							//console.log(jsonBody);
							callback(null, jsonBody);
						}
					} catch (err) {
						callback(err);
					}
				})
			}
		} catch (err) {
			callback(err);
		}

}

function addScraped(callback, exchange, name) {
	
	scrape(function(err, item) {
		
		try {
			if (err) {
				
				throw new Error('scrape error');
			} else {
				
				//console.log('here');
				MongoClient.connect("mongodb://localhost:27017/stockalertDev", function(err, db) {
				
					var collection = db.collection('stocks');
					//console.log('here');
				collection.findOne({ticker: item.t}, function(err, doc) {
					
					try {
						//console.log('here');
						
						var aStock = new Stock(item.e, item.t, item.l, item.lt);
						if (err || !doc) {
							console.log(doc);
							//not an error, just means an item doesn't exist yet; let's create one
							
								console.log('here');
								collection.insert(aStock, {safe:true}, function(err, records) {
								if (err) {
									throw new Error('insertion error');
								} else {
									callback(null,records)
								}

							});
							
							

						} else {
							//an item with this ticker exists. Push the old current price to the end of the pastTimePrices array. 
							//console.log('item existed');

							//we are just replacing the currentPrice with the one we got
							//we are not adding to the end of the array - too many resources, too little reward

							var oldPrices = doc.pastPrices;

							oldPrices[0] = doc.currentPrice;

							console.log('old prices is ', oldPrices);
							//console.log(oldPrices);
							//console.log(doc);
							if (doc.currentPrice == item.l) {
								console.log('current prices equal');
								
								callback(null, item);
							} else {
								collection.update({ticker:item.t}, {$set: {
								currentPrice: item.l,
								pastPrices: oldPrices,
								mostRecentTime: item.lt
							}}, {safe:true}, function(err, c) {
								if (err) {
									throw new Error('update error');
								} else {
									callback(null,c);
								}
							});
							}
							
						}
					} catch (err) {
						callback(err);
					}
				});
			});	
			}

		} catch (err) {
			callback(err);
		}
	}, exchange, name);
}
/*
addScraped(function(err, item) {
	//console.log(err, item);
}, 'NASDAQ', 'EBAY');*/

module.exports = {
	scrape: scrape,
	addScraped: addScraped
}