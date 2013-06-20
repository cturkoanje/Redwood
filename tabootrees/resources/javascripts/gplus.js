
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
          $('#profile').append(
              $('<p><img src=\"' + profile.image.url + '\"></p>'));
          $('#profile').append(
              $('<p>Hello ' + profile.displayName + '!<br />Tagline: ' +
              profile.tagline + '<br />About: ' + profile.aboutMe + '</p>'));
          if (profile.cover && profile.coverPhoto) {
            $('#profile').append(
                $('<p><img src=\"' + profile.cover.coverPhoto.url + '\"></p>'));
          }

           // $.ajax({
           //    type: 'POST',
           //    // state!!!
           //    contentType: 'application/octet-stream; charset=utf-8',
           //    success: function(result) {
           //    },
           //    processData: false,
           //    data: {data2};
           //  });

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
                  data: JSON.stringify({ "name": profile.displayName, "avatar": profile.image.url })
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


  // function signInCallback(authResult) {
  //   if (authResult['access_token']) {
  //   // Successfully authorized
  //   // Hide the sign-in button now that the user is authorized, for example:
  //     $("#login").css({ display: "none" });
  //     $("#jointeam").css({ display: "block" });
  //     $("#help").css({ display: "block" });
  //     $("body").css({ transition: "none", "-webkit-transition": "none"});
  //     $("#jointeam").animate({ opacity: 1 }, 200);
  //     $("#help").animate({ opacity: 1 }, 200);
  //   } else if (authResult['error']) {
  //     // There was an error.
  //     // Possible error codes:
  //     //   "access_denied" - User denied access to your app
  //     //   "immediate_failed" - Could not automatically log in the user
  //     // console.log('There was an error: ' + authResult['error']);
  //   }
  // }

  // function gplus() {
  //   gapi.signin.render("signin", {
  //     'callback': signinCallback,
  //     'clientid': '394867862713.apps.googleusercontent.com',
  //     'cookiepolicy': 'single_host_origin',
  //     'requestvisibleactions': 'http://schemas.google.com/AddActivity',
  //     'scope': 'https://www.googleapis.com/auth/plus.login'
  //   });
  // }
$(document).ready(function() {
  $('#disconnect').click(helper.disconnectServer);
  if ($('[data-clientid="YOUR_CLIENT_ID"]').length > 0) {
    alert('This sample requires your OAuth credentials (client ID) ' +
        'from the Google APIs console:\n' +
        '    https://code.google.com/apis/console/#:access\n\n' +
        'Find and replace YOUR_CLIENT_ID with your client ID and ' +
        'YOUR_CLIENT_SECRET with your client secret in the project sources.'
    );
  }
});

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
              countdown(1000);
            card();
            //gplus();
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
                  //gplus();
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

  $(window).resize(function() { card(); });

  //gplus();
  handlers();

  function addUser(user) {
    var name = user.name;
    var avatar = user.avatar;
    var team = user.team;
    var toAdd = $('<article class="basic tertiary"><img class="avatar" src="' + avatar + '" /><span class="username">' + name + '</span></article>');
    if(team == "lumberjacks")
      toAdd.appendTo(".left");
    else
      toAdd.appendTo(".right");
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
  }

  function changeCard(card) {
    // var newCard = $('<ul><li>' + card.getWord() + '</li><hr></ul>');
    // for(var taboo in card.getTaboo()) {
    //   $('<li>' + taboo + '</li>').appendTo(newCard);
    // }
    var word = "hi";
    var taboos = ["no", "blah", "fuck", "shit", "gay"];
    var newCard = $('<ul class="card"><li>' + "hi" + '</li><hr></ul>');
    for(var i in taboos) {
      $('<li>' + taboos[i] + '</li>').appendTo(newCard);
    }
    newCard.css({ top: "-" + $('.card').outerHeight() + "px", left: $('#card').outerWidth() + "px" });
    newCard.appendTo("#card");
    $('.card:eq(0)').animate({ left: "-" + $('#card').outerWidth() + "px" }, 500);
    $('.card:eq(1)').animate({ left: 0 }, { duration: 500, complete: function() {
      $('.card').css({ top: 0 });
      $('.card:eq(0)').remove();
    } });
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

});



function onSignInCallback(authResult) {
  alert("HI");
  helper.onSignInCallback(authResult);
}
