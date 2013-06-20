$(document).ready(function() {

  function signinCallback(authResult) {
    if (authResult['access_token']) {
    // Successfully authorized
    // Hide the sign-in button now that the user is authorized, for example:
      $("#login").css({ display: "none" });
      $("#jointeam").css({ display: "block" });
      $("#help").css({ display: "block" });
      $("body").css({ transition: "none", "-webkit-transition": "none"});
      $("#jointeam").animate({ opacity: 1 }, 200);
      $("#help").animate({ opacity: 1 }, 200);
    } else if (authResult['error']) {
      // There was an error.
      // Possible error codes:
      //   "access_denied" - User denied access to your app
      //   "immediate_failed" - Could not automatically log in the user
      // console.log('There was an error: ' + authResult['error']);
    }
  }

  function gplus() {
    gapi.signin.render("signin", {
      'callback': signinCallback,
      'clientid': '394867862713.apps.googleusercontent.com',
      'cookiepolicy': 'single_host_origin',
      'requestvisibleactions': 'http://schemas.google.com/AddActivity',
      'scope': 'https://www.googleapis.com/auth/plus.login'
    });
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
            if($("#counter")[0])
              countdown(60);
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

  function countdown(seconds) {
    function tick() {
        //This script expects an element with an ID = "counter". You can change that to what ever you want.
        seconds--;
        $("#counter").text(String(seconds));
        if( seconds > 0 ) {
            setTimeout(tick, 1000);
        }
        else{
          $("#counter").text('Time is up!');
        }
    }
    tick();
  }

  function card() {
    $(".vertcard").css({ height: ($(window).height() - 200) + "px" });
  }

  $(window).resize(function() { card(); });

  gplus();
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

  function ready(user) {
    var name = user.name;
    var article = $('article:contains("' + name + '")');
    var img = $('<img src="images/ready.png" />');
    img.css({
      height: "50px",
      width: "50px",
      position: "absolute"
    });
    img.prependTo(article);
  }

});