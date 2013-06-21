var profID = undefined;
var currentTeam = "NoTEAM";
var currentRole = "NoRole"; 
var currentName = "NoName";

var mainSpeech = null;
var oldText = "";


function updateUI()
{
  var teams = gameData.getTeams();
  for(x=0;x<teams.length; x++)
  {
    var teamname = teams[x].getName();
    console.log("Changing scrore for team :" + teamname);
    teamname = teamname.replace(" ","");

    console.log("divid :" + teamname + " with score " + teams[x].getScore());
    $("#" + teamname).html(teams[x].getScore());
  }
}


var helper = (function() {
  var authResult = undefined;

  return {
    /**
     * Hides the sign-in button and connects the server-side app after
     * the user successfully signs in.
     *
     * @param {Object} authResult An Object which contains the access token and
     *   other authentication information.
     */
    onSignInCallback: function(authResult) {
      $('#authResult').html('Auth Result:<br/>');
      for (var field in authResult) {
        $('#authResult').append(' ' + field + ': ' + authResult[field] + '<br/>');
      }
      if (authResult['access_token']) {
        // The user is signed in
        this.authResult = authResult;
        $("#login").css({ display: "none" });
        $("#jointeam").css({ display: "block" });
        $("#help").css({ display: "block" });
        $("body").css({ transition: "none", "-webkit-transition": "none"});
        $("#jointeam").animate({ opacity: 1 }, 200);
        $("#help").animate({ opacity: 1 }, 200);
        helper.connectServer();
        // After we load the Google+ API, render the profile data from Google+.
        gapi.client.load('plus','v1',this.renderProfile);
      } else if (authResult['error']) {
        // There was an error, which means the user is not signed in.
        // As an example, you can troubleshoot by writing to the console:
        console.log('There was an error: ' + authResult['error']);
        $('#authResult').append('Logged out');
        $('#authOps').hide('slow');
        $('#gConnect').show();
      }
      console.log('authResult', authResult);

    },
    /**
     * Retrieves and renders the authenticated user's Google+ profile.
     */
    renderProfile: function() {
      var request = gapi.client.plus.people.get( {'userId' : 'me'} );
      request.execute( function(profile) {
          $('#profile').empty();
          if (profile.error) {
            $('#profile').append(profile.error);
            return;
          }
          // alert(profile.image.url);
          profID = profile.image.url;
          $('#profile').append(
              $('<p><img src=\"' + profile.image.url + '\"></p>'));
          $('#profile').append(
              $('<p>Hello ' + profile.displayName + '!<br />Tagline: ' +
              profile.tagline + '<br />About: ' + profile.aboutMe + '</p>'));
          if (profile.cover && profile.coverPhoto) {
            $('#profile').append(
                $('<p><img src=\"' + profile.cover.coverPhoto.url + '\"></p>'));
          }


          // var data2 = {name: profile.displayName, avatar: profile.image.url, team:""};
          // console.log(data2);
          // $.ajax({
          //     type: 'POST',
          //     // state!!!
          //     url: window.location.href + 'adduser',
          //     contentType: 'application/octet-stream; charset=utf-8',
          //     success: function(result) {
          //     },
          //     processData: false,
          //     data: { data2}
          //   });

                    // console.log(data2);
                    
          $.ajax({
                  type: 'POST',
                  // state!!!
                  url: window.location.href + 'adduser',
                  contentType: 'application/octet-stream; charset=utf-8',
                  // success: function(result) {
                  //   // console.log(result);
                  //   // console.log("HMMM");
                  //   // helper.people();
                  // },
                  processData: false,
                  data: JSON.stringify({ "name": profile.displayName,
                   "avatar": profile.image.url,
                   "team": "",
                    "role": ""})
                });
        });
      $('#authOps').show('slow');
      $('#gConnect').hide();




    },
    
    connectServer: function() {
      console.log("authresult " + this.authResult.code);
      
      $.ajax({
        type: 'POST',
        // state!!!
        url: window.location.href + 'connect?state=SJAOE3GGWDPOLNW9SWCXCXYJWAIJZT0D',
        contentType: 'application/octet-stream; charset=utf-8',
        success: function(result) {
          console.log(result);
          console.log("HMMM");
          helper.people();
        },
        processData: false,
        data: this.authResult.code
      });
      
    },
    /**
     * Calls the server endpoint to get the list of people visible to this app.
     */
    people: function() {
      console.log("calling people");
      $.ajax({
        type: 'GET',
        url: window.location.href + 'people',
        contentType: 'application/octet-stream; charset=utf-8',
        success: function(result) {
          helper.appendCircled(result);
        },
        processData: false
      });
    },
    /**
     * Displays visible People retrieved from server.
     *
     * @param {Object} people A list of Google+ Person resources.
     */
    appendCircled: function(people) {
      $('#visiblePeople').empty();

      $('#visiblePeople').append('Number of people visible to this app: ' +
          people.totalItems + '<br/>');
      for (var personIndex in people.items) {
        person = people.items[personIndex];
        $('#visiblePeople').append('<img src="' + person.image.url + '">');
      }
    },
  };
})();


$(document).ready(function() {


  $(window).resize(function() { card(); });

  gplus();
  handlers();

  $("body").keyup(function(e) {
    if((e.keyCode || e.which) == 32 && $('.card')[0])
    {
      var newPlay = gameData.skipCard();
      changeCard(newPlay.getCard());
      updateUI();
      console.log("New incorrect:   " + JSON.stringify(newPlay.getCard().getTabooWord()));
      currentObject.stopListening();
      mainSpeech = new Speaker();
      mainSpeech.startListeningForProhibited(newPlay.getCard().getTabooWord(), "saidIncorrect", "replaceSpeechTextForBubble", "");
      //mainSpeech.startListeningForProhibited(newPlay.getCard().getTabooWord(), "saidIncorrect", "replaceSpeechTextForBubble", "");
    }
  });


});


  function gplus() {
    gapi.signin.render("signin", {
      'callback': onSignInCallback,
      'clientid': '394867862713.apps.googleusercontent.com',
      'cookiepolicy': 'single_host_origin',
      'requestvisibleactions': 'http://schemas.google.com/AddActivity',
      'scope': 'https://www.googleapis.com/auth/plus.login'
    });
  }

  var roundsLeft = 0;
  function countdown(seconds) {
    function tick() {
        //This script expects an element with an ID = "counter". You can change that to what ever you want.
        seconds--;
        $(".counter").text(String(seconds));
        if( seconds > 0 ) {
            setTimeout(tick, 1000);
        }
        else{
          if($('#timeup:contains("Game is over!")')[0]) {
            $("#overlay").remove();
            $("#timeup").remove();
            var toLoad = '/ #container';
            $('#container').hide('fast',loadContent);
            $('#load').remove();
            $('body').append('<span id="load">LOADING...</span>');
            $('#load').fadeIn('normal');
            function loadContent() {
                $('#container').load(toLoad, function() {
                  card();
                  gplus();
                  handlers();
                  showNewContent();
                });
            }
            function showNewContent() {
                $('#container').show('normal', hideLoader());
            }
            function hideLoader() {
                $('#load').fadeOut('normal');
            }
          }
          else if(roundsLeft == 0 || $("#timeup")[0]) {
            timeup();
          }
          else {
            timeup({"name": "Marvin", "avatar":"images/avatar.jpg", "team":"lumberjacks"}, 10);
          }
        }
    }
    tick();
  }

  function card() {
    $(".vertcard").css({ height: ($(window).height() - 200) + "px" });
  }

function saidIncorrect(e)
{
  //alert("You said an incorrect word!");
  //handlers();
  console.log("Said incorrect word");
  var newPlay = gameData.skipCard();
      changeCard(newPlay.getCard());
      mainSpeech = new Speaker();
      mainSpeech.startListeningForProhibited(newPlay.getCard().getTabooWord(), "saidIncorrect", "replaceSpeechTextForBubble", "");
}

function onSignInCallback(authResult) {
  helper.onSignInCallback(authResult);
}

function replaceSpeechTextForBubble(event)
{
  var user = {avatar:"/images/avatar.jpg", team:""};
  var text = event['results'][0][0]['transcript'];
  var replaced = text.replace(oldText, "");

  //text = replaced;
  if(replaced != "")
    addBubble(user, replaced);
  oldText = replaced;
  //replaceSpeechText(event);
}





  function handlers() {
    $('a').click(function(e){
      e.preventDefault();
      var toLoad = $(this).attr('href')+' #container';
      $('#container').hide('fast',loadContent);
      $('#load').remove();
      $('body').append('<span id="load">LOADING...</span>');
      $('#load').fadeIn('normal');
      function loadContent() {
          $('#container').load(toLoad, function() {
            if($(".counter")[0])
              countdown(60);

            if(toLoad == "partials/gamescreen.html #container")
            {
              mainSpeech = new Speaker();
              currentPlay = gameData.start();

              var currentCard = currentPlay.getCard();
              console.log("Cureent card: " + currentPlay.getCard().toJSON());
              $("#guess").html(currentCard.getWord());
              var tabooWords = currentCard.getTabooWord();

              mainSpeech.startListeningForProhibited(tabooWords, "saidIncorrect", "replaceSpeechTextForBubble", "");
              for(x=0; x<tabooWords.length; x++)
              {
                var newWord = $('<li>' + tabooWords[x] + '</li>');
                $('#tabooWords').append(newWord);
              }

            }
            if(toLoad == "partials/lobby.html #container")
            {
              var gameTeams = gameData.getTeams();

              console.log("Game teams: " + JSON.stringify(gameTeams));

              var team1User = gameTeams[0].getPlayers();

              console.log("Team 1 users: "+JSON.stringify(team1User));

              var team2User = gameTeams[1].getPlayers();
              for(x=0;x<team1User.length;x++)
              {
                var playerName = team1User[x].getFullName();
                var newElement = $('<article class="basic tertiary"><img class="avatar" src="images/avatar.jpg" /><span class="username">' + team1User[x].getFullName() + '</span></article>');
                $("#team1").append(newElement);
              }
              for(x=0;x<team2User.length;x++)
              {
                var playerName = team2User[x].getFullName();
                var newElement = $('<article class="basic tertiary"><img class="avatar" src="images/avatar.jpg" /><span class="username">' + team2User[x].getFullName() + '</span></article>');
                $("#team2").append(newElement);
              }
            }

            card();
            gplus();
            handlers();
            showNewContent();
          });
      }
      function showNewContent() {
          $('#container').show('normal', hideLoader());
      }
      function hideLoader() {
          $('#load').fadeOut('normal');
      }
    });
  }




  function addUser(user) {
    var name = user.name;
    var avatar = user.avatar;
    var team = user.team;
    var toAdd = $('<article class="basic tertiary"><img class="avatar" src="' + avatar + '" /><span class="username">' + name + '</span></article>');
    if(team == "lumberjacks")
      toAdd.prependTo(".leftAdd");
    else
      toAdd.prependTo(".rightAdd");
    var height = toAdd.height();
    toAdd.css({ height: 0 });
    toAdd.animate({ height: height + "px" }, 500);
  }

  function removeUser(user) {
    var name = user.name;
    var toRemove = $('article:contains("' + name + '")');
    toRemove.animate({ height: 0 }, { duration: 500, complete: function() {toRemove.remove()} });
  }

  function ready(user) {
    var name = user.name;
    var article = $('article:contains("' + name + '")');
    var img = $('<img class="readyimg" src="images/ready.png" />');
    img.prependTo(article);
    allReady();
  }

  function allReady() {
    if($('article').length == $('.readyimg').length) {
      alert("hi");
      $("#ready .btn").click();
    }
    else
      alert("fuck");
  }

  var changing = false;
  function changeCard(card) {
    // var newCard = $('<ul><li>' + card.getWord() + '</li><hr></ul>');
    // for(var taboo in card.getTaboo()) {
    //   $('<li>' + taboo + '</li>').appendTo(newCard);
    // }
    if(!changing) {
      $("#bubbleItems").html(" ");
      changing = true;
      var word = card.getWord();
      var taboos = card.getTabooWord();
      var newCard = $('<ul class="card"><li>' + word + '</li><hr></ul>');
      for(var i in taboos) {
        $('<li>' + taboos[i] + '</li>').appendTo(newCard);
      }
      newCard.css({ top: "-" + $('.card').outerHeight() + "px", zIndex: 0 });
      newCard.appendTo("#card");
      $('.card:eq(0)').animate({ left: $('#card').outerWidth() + "px" }, { duration: 500, complete: function() {
          $('.card:eq(1)').css({ "box-shadow": "0 5px 16px black", zIndex: 100 });
          $('.card:eq(0)').delay(300).animate({left: 0}, 500, function() {
            $('.card:eq(0)').remove();
            $('.card:eq(0)').css({ top: 0, "box-shadow": "0 2px 10px black"});
            changing = false;
          });
      } });
    }
  }

  function timeup(user, score) {
    if(user) {
      $('<section id="overlay"></section>').appendTo("body");
      var popup = $('<section id="timeup" class="basic tertiary"></section>');
      var team = user.team == "lumberjacks" ? "Treehuggers saved " : "Lumberjacks chopped ";
      var name = user.name;
      var avatar = user.avatar;
      var content = $('<p>Time is up!</p><p class="roundreport">' + team + '<span>' + score + '</span> forbidden woods.</p><p>Next up...</p><span class="nextuser basic"><img class="avatar" src="' + avatar + '" /><span class="username">' + name + '</span></span><section class="counter"></section>');
      content.appendTo(popup);
      popup.appendTo("body");
      countdown(10);
    }
    else if(roundsLeft == 0) {
      $('<section id="overlay"></section>').appendTo("body");
      var popup = $('<section id="timeup" class="basic tertiary"></section>');
      var team = parseInt($("#lumberscore .score").text()) > parseInt($("#treescore .score").text()) ? "Lumberjacks won by chopping " : "Treehuggers won by saving ";
      var score = parseInt($("#lumberscore .score").text()) > parseInt($("#treescore .score").text()) ? parseInt($("#lumberscore .score").text()) : parseInt($("#treescore .score").text());
      var content = $('<p>Game is over!</p><p class="roundreport">' + team + '<span>' + score + '</span> forbidden woods.</p><p>Returning to home...</p><section class="counter"></section>');
      content.appendTo(popup);
      popup.appendTo("body");
      countdown(10);
    }
    else {
      $("#overlay").remove();
      $("#timeup").remove();
      countdown(60);
    }
  }


<<<<<<< HEAD
=======
var prof= "https://lh3.googleusercontent.com/-Y-O9OQEoryo/AAAAAAAAAAI/AAAAAAAACLQ/FQfxcfxi-6U/photo.jpg?sz=50";


// update("https://lh3.googleusercontent.com/-Y-O9OQEoryo/AAAAAAAAAAI/AAAAAAAACLQ/FQfxcfxi-6U/photo.jpg?sz=50",
//   "CATPowA","MC");


function update(){
  $.ajax({
        type: 'POST',
        // state!!!
        url: window.location.href + 'update',
        contentType: 'application/octet-stream; charset=utf-8',
   
        processData: false,
        data: JSON.stringify({
         // "avatar": profile.image.url,
         "avatar": profID,
         "team": currentTeam,
        "role": currentRole})
      });
}

//just call GetPlayers. It returns which player (0 through n...) - 
//just ignore that number, order is pretty arbitrary
//returns: player name, player prof img, role, team
//
// 1 , Joe Rowley,https://lh3.googleusercontent.com/-Y-O9OQEoryo/AAAAAAAAAAI/AAAAAAAACLQ/FQfxcfxi-6U/photo.jpg?sz=50,NoRole,NoTEAM

function GetPlayers(){
  $.getJSON('/getplayers', function(data) {
  var items = [];
  $.each(data, function(key, val) {
   alert(key + ' , ' + val);
  });
 });
}

//sets the current role, current team and current name js vars
//uses the profID var to make the call. 

function GetSelf(){

$.getJSON("/getself", { avatar: profID})
.done(function(data) {
  alert("Data Loaded: " + data);
  currentRole=data[0];
  currentTeam=data[1];
  currentName=data[2];
  
});
}




function onSignInCallback(authResult) {
  helper.onSignInCallback(authResult);
}
>>>>>>> 87cfb66fdc42239f3c6259f08d9f51fba930333b



<<<<<<< HEAD





function handlersTwo() {
    $('a').click(function(e){
      e.preventDefault();
      var toLoad = $(this).attr('href')+' #container';
      $('#container').hide('fast',loadContent);
      $('#load').remove();
      $('body').append('<span id="load">LOADING...</span>');
      $('#load').fadeIn('normal');
      function loadContent() {
          $('#container').load(toLoad, function() {
            if($(".counter")[0])
              countdown(60);

            if(toLoad == "partials/gamescreen.html #container")
            {
              mainSpeech = new Speaker();
              mainSpeech.startListeningForProhibited(["orange"], "saidIncorrect", "replaceSpeechTextForBubble", "");
              currentPlay = gameData.start();

              var currentCard = currentPlay.getCard();
              console.log("Cureent card: " + currentPlay.getCard().toJSON());
              $("#guess").html(currentCard.getWord());
              var tabooWords = currentCard.getTabooWord();
              for(x=0; x<tabooWords.length; x++)
              {
                var newWord = $('<li>' + tabooWords[x] + '</li>');
                $('#tabooWords').append(newWord);
              }

            }
            if(toLoad == "partials/lobby.html #container")
            {
              var gameTeams = gameData.getTeams();

              console.log("Game teams: " + JSON.stringify(gameTeams));

              var team1User = gameTeams[0].getPlayers();

              console.log("Team 1 users: "+JSON.stringify(team1User));

              var team2User = gameTeams[1].getPlayers();
              for(x=0;x<team1User.length;x++)
              {
                var playerName = team1User[x].getFullName();
                var newElement = $('<article class="basic tertiary"><img class="avatar" src="images/avatar.jpg" /><span class="username">' + team1User[x].getFullName() + '</span></article>');
                $("#team1").append(newElement);
              }
              for(x=0;x<team2User.length;x++)
              {
                var playerName = team2User[x].getFullName();
                var newElement = $('<article class="basic tertiary"><img class="avatar" src="images/avatar.jpg" /><span class="username">' + team2User[x].getFullName() + '</span></article>');
                $("#team2").append(newElement);
              }
            }

            card();
            gplus();
            handlers();
            showNewContent();
          });
      }
      function showNewContent() {
          $('#container').show('normal', hideLoader());
      }
      function hideLoader() {
          $('#load').fadeOut('normal');
      }
    });
  }
=======
  //text = replaced;
  if(replaced != "")
    addBubble(user, replaced);
  oldText = replaced;
  //replaceSpeechText(event);
}
>>>>>>> 87cfb66fdc42239f3c6259f08d9f51fba930333b
