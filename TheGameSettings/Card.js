/**

Card object for Taboo

*/

function Card() {
	this.word = "";
	this.tabooWords = [];
}

function Card(word, tabooWords) {
	this.word = word;
	this.tabooWords = tabooWords;
}

/**
	Set card word
	Should pass a string with card word 
*/
Card.prototype.setWord = function(word) {
	this.word = word;
}

/**
	Get card word
	Should return a string with card word 
*/
Card.prototype.getWord = function() {
	return this.word;
}

/**
	Set taboo words
	Should pass an array with taboo words 
*/
Card.prototype.setTabooWord = function(words) {
	this.tabooWords = word;
}

/**
	Get card word
	Should return an array with taboo words
*/
Card.prototype.getTabooWord = function() {
	return this.tabooWords;
}


/**
	Does contain taboo word
	Returns true if word is a taboo word
	Falsy is otherwise
*/
Card.prototype.hasTaboo = function(word) {
	var number = this.tabooWords.length;
	for(x=0;x<number;x++)
	{
		if(this.tabooWords[x] === word)
			return true;
	}
	return false;
}

/**
	Formats card object as JSON object
*/
Card.prototype.toJSON = function() {
	
	var returnData = {"word":this.word, "taboo": this.tabooWords};


	return JSON.stringify(returnData);
}


