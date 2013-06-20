/**

PlayState object for Taboo

*/

function PlayState() {
	this.guesser = null;
	this.describer = null;
	this.currentTeam = null;
	this.currentCard = null;
}

/**
	Get the guesser Player() object
	Should return Player() object of person guessing 
*/
PlayState.prototype.getGuesser = function() {
	return this.guesser;
}

/**
	Get the describer Player() object
	Should return Player() object of person describing a clue 
*/
PlayState.prototype.getDescriber = function() {
	return this.describer;
}

/**
	Set the guesser Player() object
	Should pass Player() object of person guessing 
*/
PlayState.prototype.setGuesser = function(person) {
	this.guesser = person;
}

/**
	Set the describer Player() object
	Should pass Player() object of person describing a clue 
*/
PlayState.prototype.setDescriber = function(person) {
	this.describer = person;
}

/**
	Set the current team Team() object
	Should pass Team() object of current team 
*/
PlayState.prototype.setCurrentTeam = function(team) {
	this.currentTeam = team;
}

/**
	Get the current team Team() object
	Should return Team() object of current team 
*/
PlayState.prototype.getCurrentTeam = function() {
	return this.currentTeam;
}

/**
	Set the current card Card() object
	Should pass Card() object of current card 
*/
PlayState.prototype.setCard = function(card) {
	this.currentCard = card;
}

/**
	Get the current Card() object
	Should return Card() object of current card 
*/
PlayState.prototype.getCard = function() {
	return this.currentCard;
}