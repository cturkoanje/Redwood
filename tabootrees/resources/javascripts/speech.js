/**

JS Library for game that will use the speech API

@author Christian Turkoanje


*/

var currentObject = null;

function Speaker () {
    var recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    
    this.word = "demo";

    this.recognition = recognition;
    currentObject = this;
}
 
Speaker.prototype.startListeningForMatch = function(searchString, resultCallback, activeCallback) {

    this.setupForMatch();

    this.word = searchString;
    this.listening = false;
    this.debug = false;

    this.resultCallback = resultCallback;
    this.activeCallback = activeCallback;

    console.log("Starting to listen to user for match");
    this.listening = true;
    this.recognition.start();
};

Speaker.prototype.startListeningForProhibited = function(tabooWords, saidIncorrectCall, activeCallback, onStartCall) {

    this.setupForProhibited(); //********************

    this.tabooWords = tabooWords;
    this.listening = false;
    this.debug = false;

    this.saidIncorrectCall = saidIncorrectCall;
    this.activeCallback = activeCallback;
    this.onStartCall = onStartCall;

    console.log("Starting to listen to user");
    this.listening = true;
    this.recognition.start();
};


Speaker.prototype.stopListening = function() {


    this.word = null;
    this.listening = false;
    this.resultCallback = null;
    this.activeCallback = null;

    console.log("************************Stopped listening to user***********************");

    this.recognition.abort();
};

Speaker.prototype.setupForMatch = function() {

        
        //Standar speech functions with callbacks.
        this.recognition.onresult = function (event) {
            console.log('got result');

            var searchWord = currentObject.word;
            var searchPhrase = event['results'][0][0]['transcript'];
            //console.log("Searching for \"" + searchWord +  "\" in \"" + searchPhrase + "\"");

            var str=searchPhrase;
            var wordArray=str.split(" ");
            //console.log(wordArray);
            //console.log("Length :" + wordArray.length);


            for(x=wordArray.length;x>0;x--)
            {
                //console.log("Getting value of index " + x + " with value " + wordArray[x-1] + " in array " + wordArray);
                if(wordArray[x-1].indexOf(searchWord) > -1)
                {
                    window[currentObject.resultCallback](event);
                    currentObject.stopListening();
                }
            

            }

            window[currentObject.activeCallback](event);
            //console.log("Found data " + JSON.stringify(event));
        };

        this.recognition.onerror = function (event) {
            //console.log('result onerror\n' + JSON.stringify(event));

        };

        this.recognition.onnomatch = function (event) {
            //console.log('result onnomatch\n' + JSON.stringify(event));
        };
        

        this.recognition.onaudiostart = function (event) {
            
            //console.log("Calling " + currentObject.callback + " with word: " + currentObject.word);
            console.log("Started audio capture for match");
            
            
        };
        
}

Speaker.prototype.setupForProhibited = function() {

        
        //Standar speech functions with callbacks.
        this.recognition.onresult = function (event) {
            //console.log('got result of \n' + event['results'][0][0]['transcript']);
            console.log("got result for prohiboted");

            var searchWords = currentObject.tabooWords;
            var searchPhrase = event['results'][0][0]['transcript'];

            for(x=0; x< searchWords.length; x++)
            {
                if(searchPhrase.indexOf(searchWords[x]) > 1)
                {

                        console.log("YOU SAID A FUCKING WRONG WORDDDDDDDDDDDDDDDDD");
                        currentObject.stopListening();
                        window[currentObject.saidIncorrectCall](event);
                        //console.log("The index is " + wordArray[x-1].indexOf(searchWords[y]));
                    
                }
                else
                {
                    window[currentObject.activeCallback](event);
                }
            }


/*
            var str=searchPhrase;
            var wordArray=str.split(" ");
            //console.log(wordArray);
            //console.log("Length for prohiboted :" + wordArray.length);



            for(x=wordArray.length;x>0;x--)
            {
                //console.log("In first loop, wordArray.length at index" + x );
                for(y=0;y<searchWords.length;y++)
                {
                    //console.log("In second loop, searchWords.length at index" + y );
                    //console.log("Searching for " + wordArray[x-1] + " in " + searchWords[y]);
                    if(wordArray[x-1].indexOf(searchWords[y]) > -1)
                    {
                        console.log("YOU SAID A FUCKING WRONG WORDDDDDDDDDDDDDDDDD");
                        window[currentObject.saidIncorrectCall](event);
                        currentObject.stopListening();
                        console.log("The index is " + wordArray[x-1].indexOf(searchWords[y]));
                    }
                    //console.warn("The index is " + wordArray[x-1].indexOf(searchWords[y]));
                }
            

            }
*/
            //console.log("Found data " + JSON.stringify(event));
            //console.log('callback ' + currentObject.activeCallback);
        };

        this.recognition.onerror = function (event) {
            console.log('result onerror\n' + JSON.stringify(event));

        };

        this.recognition.onnomatch = function (event) {
            console.log('result onnomatch\n' + JSON.stringify(event));
        };
        
        this.recognition.onstart = function (event) {
            console.log('result onstart\n' + JSON.stringify(event));
            window[currentObject.onStartCall](event);
        };

        this.recognition.onaudiostart = function (event) {
            
            //console.log("Calling " + currentObject.callback + " with word: " + currentObject.word);
            console.log("Started audio capture for prohiboted");
            
            
        };
        
}


