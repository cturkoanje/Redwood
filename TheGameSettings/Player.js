/**

Player object for Taboo

*/

function Player() {
	this.firstName = "";
	this.lastName = "";
	this.id = "";
	this.teamName = "";
	this.image = "";
}

function Player(id, firstName, lastName, image, teamName) {
	this.firstName = firstName;
	this.lastName = lastName;
	this.id = id;
	this.teamName = teamName;
	this.image = image;
}

/**
	Get first name
	Should return the users first name 
*/
Player.prototype.getFirstName = function() {
	return this.firstName;
}

/**
	Get last name
	Should return the users last name 
*/
Player.prototype.getLastName = function() {
	return this.lastName;
}

/**
	Get full name
	Should return the users full name 
*/
Player.prototype.getFullName = function() {
	return this.firstName + " " + this.lastName;
}

/**
	Set first name
	Should pass the users first name 
*/
Player.prototype.setFirstName = function(name) {
	this.firstName = name;
}

/**
	Set last name
	Should pass the users last name 
*/
Player.prototype.setLastName = function(name) {
	this.lastName = name;
}

/**
	Get user id
	Should return the users id 
*/
Player.prototype.getId = function() {
	return this.id;
}

/**
	Get image url
	Should return the users image
*/
Player.prototype.getImage = function() {
	return this.image;
}

/**
	Get team name
	Should return the users team name 
*/
Player.prototype.getTeam = function() {
	return this.teamName;
}

/**
	Set team name
	Should pass the users team name 
*/
Player.prototype.srtTeam = function(team) {
	this.teamName = team;
}
