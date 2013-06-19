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

      $('a').click(function(e){
        e.preventDefault();
        var toLoad = $(this).attr('href')+' #container';
        $('#container').hide('fast',loadContent);
        $('#load').remove();
        $('body').append('<span id="load">LOADING...</span>');
        $('#load').fadeIn('normal');
        function loadContent() {
            $('#container').load(toLoad, showNewContent());
        }
        function showNewContent() {
            $('#container').show('normal', hideLoader());
        }
        function hideLoader() {
            $('#load').fadeOut('normal');
        }
      });
    } else if (authResult['error']) {
      // There was an error.
      // Possible error codes:
      //   "access_denied" - User denied access to your app
      //   "immediate_failed" - Could not automatically log in the user
      // console.log('There was an error: ' + authResult['error']);
    }
  }

  gapi.signin.render("signin", {
    'callback': signinCallback,
    'clientid': '394867862713.apps.googleusercontent.com',
    'cookiepolicy': 'single_host_origin',
    'requestvisibleactions': 'http://schemas.google.com/AddActivity',
    'scope': 'https://www.googleapis.com/auth/plus.login'
  });

});