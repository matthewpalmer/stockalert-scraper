module.exports = function(exchange, ticker, currentPrice, mostRecentTime, pastPrices) {
	this.ticker = ticker;
	this.exchange = exchange;
	if (currentPrice) {
		this.currentPrice = currentPrice;
	} else {
		this.currentPrice;
	}

	if (mostRecentTime) {
		this.mostRecentTime = mostRecentTime;
	} else {
		this.mostRecentTime;
	}

	if (pastPrices) {
		this.pastPrices = pastPrices;
	} else {
		this.pastPrices = [];
	}

}