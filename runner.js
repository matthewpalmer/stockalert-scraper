/*
	RUN during 9-5 weekdays
	Get array of active stocks to be tracked

*/
var stockScraper = require('./stockScraper');
var notifier = require('./notifier');
var arrayOfStocks = ['AAPL', 'YHOO', 'GOOG', 'EBAY', 'MSFT']; //for example

function doTheScrape() {
	notifier.loopThroughUsers(function(arrayOfStocks) {
		console.log(arrayOfStocks);
		for (var e in arrayOfStocks) {
			(function(x) {
				stockScraper.addScraped(function(item) {
					//console.log(item);
				}, 'NASDAQ', arrayOfStocks[x].alert.ticker);
			})(e)
		}
	});
}
function doTheAlerts() {
	notifier.compareAlertAndScraped(function(err, response) {
		if (err) {
			console.log('an error');
		} else {
			console.log('probably worked', response);
		}
	})
}

setInterval(function() {
	doTheScrape();
	console.log('\n\n\nscraped\n\n\n');
}, 10000);
setInterval(function() {
	doTheAlerts();
	console.log('\n\n\n\nalerts\n\n\n\n');
}, 5000);
//doTheScrape();
//doTheAlerts();