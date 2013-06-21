/**

JS Library for game that will use the speech API

@author Christian Turkoanje


*/

var currentObject = null;
var prev = "";
var full = "";

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
            var final_transcript = "";
            var interim_transcript = "";
            for (var i = event.resultIndex; i < event.results.length; ++i) {
                  if (event.results[i].isFinal) {
                    final_transcript += event.results[i][0].transcript;
                  } else {
                    interim_transcript += event.results[i][0].transcript;
                  }
                }
            console.log("final: " + final_transcript);
            console.log("interim: " + interim_transcript);

            //console.log('got result of \n' + event['results'][0][0]['transcript']);

            var killWords = prev.split(" ");
            prev = interim_transcript;
            var toFilter = interim_transcript.split(" ");
            for(var i = 0; i < killWords.length; i++) {
                for(var j = 0; j < toFilter.length; j++) {
                    if(killWords[i] == toFilter[j]) {
                        toFilter[j] = "";
                    }
                }
            }
            var toSend = [];
            for(var i = 0; i < toFilter.length; i++) {
                if(toFilter[i] != "")
                    toSend.push(toFilter[i]);
            }

            var tempTaboo = currentObject.tabooWords;
            var searchTaboo = [];
            for(var i = 0; i < tempTaboo.length; i++) {
                var temp = tempTaboo[i].split(" ");
                temp = temp.join("-");
                temp = temp.split("-");
                for(var j = 0; j < temp.length; j++) {
                    searchTaboo.push(temp[j]);
                }
            }
            console.log(searchTaboo);

            for(var x=0; x < searchTaboo.length; x++) {
                for(var y = 0; y < toSend.length; y++) {
                    if(searchTaboo[x].toLowerCase() == toSend[y].toLowerCase() ) {
                        currentObject.stopListening();
                        toSend = [];
                        window[currentObject.saidIncorrectCall](event);
                    }
                }
            }

            window[currentObject.activeCallback](toSend.join(" "));
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
            var final_transcript = "";
            var interim_transcript = "";
            for (var i = event.resultIndex; i < event.results.length; ++i) {
                  if (event.results[i].isFinal) {
                    final_transcript += event.results[i][0].transcript;
                  } else {
                    interim_transcript += event.results[i][0].transcript;
                  }
                }
            console.log("final: " + final_transcript);
            console.log("interim: " + interim_transcript);
            //console.log('got result of \n' + event['results'][0][0]['transcript']);

            if(final_transcript != "") {
                full += final_transcript;
            }

            var tempTaboo = currentObject.tabooWords;
            var searchTaboo = [];
            for(var i = 0; i < tempTaboo.length; i++) {
                var temp = tempTaboo[i].split(" ");
                temp = temp.join("-");
                temp = temp.split("-");
                for(var j = 0; j < temp.length; j++) {
                    searchTaboo.push(temp[j]);
                }
            }
            console.log(searchTaboo);

            toSend = full + interim_transcript;

            var toSearch = toSend.split(" ");
            for(var x=0; x < searchTaboo.length; x++) {
                for(var y = 0; y < toSearch.length; y++) {
                    if(searchTaboo[x].toLowerCase() == toSearch[y].toLowerCase() ) {
                        currentObject.stopListening();
                        toSend = "";
                        window[currentObject.saidIncorrectCall](event);
                    }
                }
            }

            window[currentObject.activeCallback](toSend);
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


