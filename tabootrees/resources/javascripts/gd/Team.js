/**

Team object for Taboo

*/

function Team() {
	this.score = 0;
	this.teamName = "";
	this.users = [];
	this.lastGuesser = 0;
}

function Team(name, users) {
	this.score = 0;
	this.teamName = name;
	this.users = users;
}

/**
	Set last guesser
	Should pass a string with team name 
*/
Team.prototype.setLastGuesser = function(intNum) {
	this.lastGuesser = intNum;
}

/**
	Get last guesser
	Should return a int with last guesser 
*/
Team.prototype.getLastGuesser = function() {
	return this.lastGuesser;
}

/**
	Set Team name
	Should pass a string with team name 
*/
Team.prototype.setName = function(name) {
	this.teamName = name;
}

/**
	Get Team name
	Should return a string with team name 
*/
Team.prototype.getName = function() {
	return this.teamName;
}


/**
	Set Team score
	Should pass a int with total team score 
*/
Team.prototype.setScore = function(newScore) {
	this.score = newScore;
}

/**
	Get Team scroe
	Should return a int with team score 
*/
Team.prototype.getScore = function() {
	return this.score;
}

/**
	Increment score
	Should increment the score 
*/
Team.prototype.incrementScore = function() {
	this.score = this.score + 1;
}

/**
	Decrement score
	Should decrement the score 
*/
Team.prototype.decrementScore = function() {
	this.score = this.score - 1;
}

/**
	Get the team players
	Should return the team players 
*/
Team.prototype.getPlayers = function() {
	return this.users;
}

/**
	Get number of team players
	Should return an int with team player 
*/
Team.prototype.numberOfPlayers = function() {
	return this.users.length;
}

/**
	Compares 2 teams to see if they are the same
	Should return a boolean 
*/
Team.prototype.compareTo = function(otherTeam) {
	if(otherTeam.getName == this.teamName)
		if(otherTeam.numberOfMembers == this.users.length)
			return true; //sort of

	return false;
}
