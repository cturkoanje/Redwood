var currentUser = {"avatar": "", "name": "", "team": "", "role": ""};
var players = [];

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
    onSignInCallback: function(authResult) {
      if (authResult['access_token']) {
        // The user is signed in
        this.authResult = authResult;
        $("#login").css({ display: "none" });
        helper.connectServer();
        // After we load the Google+ API, render the profile data from Google+.
        gapi.client.load('plus','v1',this.renderProfile);
      } else if (authResult['error']) {
        // There was an error, which means the user is not signed in.
        // As an example, you can troubleshoot by writing to the console:
        console.log('There was an error: ' + authResult['error']);
      }
      console.log('authResult', authResult);

    },
    /**
     * Retrieves and renders the authenticated user's Google+ profile.
     */
    renderProfile: function() {
      var request = gapi.client.plus.people.get( {'userId' : 'me'} );
      request.execute( function(profile) {
        currentUser["avatar"] = profile.image.url;
        getSelf(function() {
          $("#jointeam").css({ display: "block" });
          $("#help").css({ display: "block" });
          $("body").css({ transition: "none", "-webkit-transition": "none"});
          $("#jointeam").animate({ opacity: 1 }, 200);
          $("#help").animate({ opacity: 1 }, 200);
        });
        $.ajax({
          type: 'POST',
          // state!!!
          url: window.location.href + 'adduser',
          contentType: 'application/octet-stream; charset=utf-8',
          processData: false,
          data: JSON.stringify({ "name": profile.displayName,
           "avatar": profile.image.url,
           "team": "",
            "role": ""})
        });
      });
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

function onSignInCallback(authResult) {
  helper.onSignInCallback(authResult);
}

function update(){
  $.ajax({
    type: 'POST',
    // state!!!
    url: window.location.href + 'update',
    contentType: 'application/octet-stream; charset=utf-8',
    processData: false,
    data: JSON.stringify({
     // "avatar": profile.image.url,
     "avatar": currentUser.avatar,
     "team": currentUser.team,
    "role": currentUser.role })
  });
}

function getPlayers(callback){
  $.getJSON('/getplayers', function(data) {
    $.each(data, function(key, val) {
      var toPush = {"name": val[0], "avatar": val[1], "role": val[2], "team": val[3]};
      if(toPush.team && toPush.name != currentUser.name)
        players.push(toPush);
    });
    callback();
  });
}

function getSelf(callback){
  $.getJSON("/getself", { avatar: currentUser.avatar })
    .done(function(data) {
      currentUser["role"]=data[0];
      currentUser["team"]=data[1];
      currentUser["name"]=data[2];
      callback();
    });
}


$(document).ready(function() {
    gplus();
    handlers();
});



function card() {
  $(".vertcard").css({ height: ($(window).height() - 200) + "px" });
}
function saidIncorrect(e) {
  var newPlay = gameData.skipCard();
  changeCard(newPlay.getCard());
  updateUI();
  console.log("New incorrect:   " + JSON.stringify(newPlay.getCard().getTabooWord()));
  currentObject.stopListening();
  var tabooWords = newPlay.getCard().getTabooWord();
  tabooWords.push(newPlay.getCard().getWord());
  mainSpeech = new Speaker();
  mainSpeech.startListeningForProhibited(tabooWords, "saidIncorrect", "replaceSpeechTextForBubble", "");
}

function replaceSpeechTextForBubble(transcript)
{
  var user = {avatar:"/images/avatar.jpg", team:""};
  var text = transcript;
  if(text != "")
    addBubble(user, text);
}

  function gplus() {
    gapi.signin.render("signin", {
      'callback': onSignInCallback,
      'clientid': '394867862713.apps.googleusercontent.com',
      'cookiepolicy': 'single_host_origin',
      'requestvisibleactions': 'http://schemas.google.com/AddActivity',
      'scope': 'https://www.googleapis.com/auth/plus.login'
    });
  }

  function changePage(page) {
    var toLoad = page +' #container';
    $('#container').hide('fast',loadContent);
    $('#load').remove();
    $('body').append('<span id="load">LOADING...</span>');
    $('#load').fadeIn('normal');
    function loadContent() {
        $('#container').load(toLoad, function() {
          if($(".counter")[0])
            countdown(60);

          if(toLoad == "/ #container") {
            gplus();
          }
          if(toLoad != "/ #container") {
            populateUser();
          }
          if(toLoad == "partials/gamescreen.html #container")
          {
            card();
            $("body").keyup(function(e) {
              if((e.keyCode || e.which) == 32 && $('.card')[0])
              {
                var newPlay = gameData.skipCard();
                  changeCard(newPlay.getCard());
                  updateUI();
                  console.log("New incorrect:   " + JSON.stringify(newPlay.getCard().getTabooWord()));
                  currentObject.stopListening();
                  var tabooWords = newPlay.getCard().getTabooWord();
                  tabooWords.push(newPlay.getCard().getWord());
                  mainSpeech = new Speaker();
                  mainSpeech.startListeningForProhibited(tabooWords, "saidIncorrect", "replaceSpeechTextForBubble", "");
              }
            });
            currentPlay = gameData.start();
            var currentCard = currentPlay.getCard();
            console.log("Current card: " + currentPlay.getCard().toJSON());
            $("#guess").html(currentCard.getWord());
            var tabooWords = currentCard.getTabooWord();
            for(x=0; x<tabooWords.length; x++)
            {
              var newWord = $('<li>' + tabooWords[x] + '</li>');
              $('#tabooWords').append(newWord);
            }
            tabooWords.push(currentCard.getWord());
            mainSpeech = new Speaker();
            mainSpeech.startListeningForProhibited(tabooWords, "saidIncorrect", "replaceSpeechTextForBubble", "");
          }
          if(toLoad == "partials/lobby.html #container") {
            loadPlayers();
          }
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

  function handlers() {
    $('a').click(function(e){
      e.preventDefault();
      if($(this).hasClass("teamBtn")) {
        currentUser["team"] = $(this).data("team");
        update();
      }
      if($(this).hasClass("backBtn")) {
        players = [];
        currentUser["team"] = "";
        update();
      }
      if($(this).hasClass("readyBtn")) {
        if($(this).text() == "Ready") {
          ready(currentUser);
          $(this).text("Nevermind");
        }
        else {
          unready(currentUser);
          $(this).text("Ready");
        }
      }
      else {
        changePage($(this).attr("href"));
      }
    });
  }

  function populateUser() {
    $('.navatar').attr("src", currentUser.avatar);
    $('#navusername').text(currentUser.name);
  }

  function loadPlayers() {
    getPlayers(function() {
      $.each(players, function(key, val) {
        addUser(val);
      });
      addUser(currentUser);
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
            players = [];
            currentUser["team"] = "";
            changePage("/");
          }
          else if(roundsLeft == 0 || $("#timeup")[0]) {
            currentObject.stopListening();
            timeup();
          }
          else {
            timeup({"name": "Marvin", "avatar":"images/avatar.jpg", "team":"lumberjacks"}, 10);
          }
        }
    }
    tick();
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
    toAdd.load(function() {
      var height = toAdd.height();
      toAdd.css({ height: 0 });
      toAdd.animate({ height: height + "px" }, 500);
    });
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
    //allReady();
    changePage("partials/gamescreen.html");
  }

  function unready(user) {
    var name = user.name;
    $('article:contains("' + name + '") .readyimg').remove();
  }

  function allReady() {
    if($('article').length == $('.readyimg').length && $('.leftAdd article').length > 1 && $('.rightAdd article').length > 1) {
      changePage("partials/gamescreen.html");
    }
  }

  var changing = false;
  function changeCard(card) {
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

  $(window).unload(function() {
    currentUser["team"] = "";
    update();
  });