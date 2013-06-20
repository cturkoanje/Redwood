/**

Game object for Taboo

*/

function TabooGame(numberOfRounds, lowCardCallback, endGameCallback) {
	this.teams = [];
	this.cards = [];
	this.play = null;
	this.currentCardIndex = 0;
	this.currentTeamIndex = 0;
	this.numberOfRounds = numberOfRounds;
	this.lowCardFunction = lowCardCallback;
	this.endGameCallback = endGameCallback;
}

/**
	Get card index.
	Should return current card index 
*/
TabooGame.prototype.getCardIndex = function(teams) {
	return this.currentCardIndex;
}
/**
	Set teams.
	Should pass an ARRAY of Team() members 
*/
TabooGame.prototype.setTeams = function(teams) {
	this.teams = teams;
	console.log("game teams" + JSON.stringify(teams));
	this.numberOfRounds = this.numberOfRounds*teams.length;
}

/**
	Get teams.
	Should return an array of Team() objects 
*/
TabooGame.prototype.getTeams = function() {
	return this.teams;
}

/**
	Set cards.
	Should pass an ARRAY of Card() items 
*/
TabooGame.prototype.setCards = function(newCards) {
	this.cards = newCards;
	this.currentCardIndex = 0;
}

/**
	Add a Card().
	Should add a card object.
	Pass an object of type Card() 
*/
TabooGame.prototype.addCard = function(newCard) {
	var currentCards = this.cards;
	currentCards.push(newCard);
}

/**
	Get cards.
	Should return an array of Card() objects 
*/
TabooGame.prototype.getCards = function() {
	return this.cards;
}

/**
	Get card at index.
	Should return a Card() object at given index 
*/
TabooGame.prototype.getCardAtIndex = function(index) {
	if(this.cards.length < index)
		return null;

	return this.cards[index];
}

/**
	Set curreing play state.
	Should pass a PlayState object
*/
TabooGame.prototype.setPlayState = function(currentPlay) {
	this.play = currentPlay;
}

/**
	Get the current play state object.
	Should return a PlayState() object 
*/
TabooGame.prototype.getPlayState = function() {
	return this.play;
}

// ________________________________________________________________________________________________
// ________________________________________________________________________________________________
// ________________________________                          ______________________________________
// ________________________________     Actual Game play     ______________________________________
// ________________________________                          ______________________________________
// ________________________________________________________________________________________________
// ________________________________________________________________________________________________
// ________________________________________________________________________________________________


/**
	Start the game!
*/
TabooGame.prototype.start = function() {
	var gamePlayState = new PlayState();
	gamePlayState.setCard(this.cards[0]);
	gamePlayState.setCurrentTeam(this.teams[0]);
	gamePlayState.setGuesser(this.teams[0].getPlayers()[0]);
	this.teams[0].setLastGuesser(0);
	this.play = gamePlayState;
	console.log("Starting game: " + this.cards[0]);
	return gamePlayState;
}

/**
	Guessed corrent word!
*/
TabooGame.prototype.gotClue = function() {

	if(this.currentCardIndex == (this.cards.length - 2))
		window[this.lowCardFunction];
	else
		this.currentCardIndex = this.currentCardIndex + 1;

	this.play.setCard(this.cards[this.currentCardIndex]);
	this.play.getCurrentTeam().incrementScore();

	return this.play;
}

/**
	Said a taboo word!
*/
TabooGame.prototype.saidTaboo = function() {

	if(this.currentCardIndex == (this.cards.length - 2))
		window[this.lowCardFunction];
	else
		this.currentCardIndex = this.currentCardIndex + 1;

	this.play.setCard(this.cards[this.currentCardIndex]);

	return this.play;
}

/**
	Skip the current card!
*/
TabooGame.prototype.skipCard = function() {

	if(this.currentCardIndex == (this.cards.length - 2))
		window[this.lowCardFunction];
	else
		this.currentCardIndex = this.currentCardIndex + 1;
	
	this.play.setCard(this.cards[this.currentCardIndex]);

	for(x=0; x<this.teams.length;x++)
	{
		if(this.currentTeamIndex != x)
		{
			this.teams[x].incrementScore();
		}
	}

	return this.play;
}


/**
	Change up teams!
*/
TabooGame.prototype.changeUp = function() {

	if(this.numberOfRounds == 0)
		window[this.endGameCallback](this.play);

	var currentPlay = this.play;
	var newPlay = new PlayState();
	var newTeam = this.teams[this.currentTeamIndex];

	if(this.currentCardIndex == (this.cards.length - 1))
		this.currentCardIndex = 0;
	else
		this.currentCardIndex = this.currentCardIndex + 1;

	if(this.currentTeamIndex == (this.teams.length - 1))
		this.currentTeamIndex = 0;
	else
		this.currentTeamIndex = this.currentTeamIndex + 1;

	if(newTeam.getLastGuesser() == (newTeam.numberOfPlayers() - 1))
		newTeam.setLastGuesser(0);
	else
		newTeam.setLastGuesser(newTeam.getLastGuesser()+1);

	newPlay.setCard(this.cards[this.currentCardIndex]);
	newPlay.setCurrentTeam(newTeam);
	newPlay.setGuesser(this.teams[newTeam.getLastGuesser()]);
	this.numberOfRounds = this.numberOfRounds - 1;


	return newPlay;
}