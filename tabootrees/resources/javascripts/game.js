function addBubble(user, text) {
  var avatar = user.avatar;
  var team = user.team;
  var toAdd = $('<li class="bubbleitem"><img class="navatar" src="' + avatar + '" /><span class="bubble">' + text + '</span></li>');
  toAdd.appendTo(".bubbles");
  var height = toAdd.height();
  var speech = document.getElementById("chat");
  toAdd.css({ height: 0 });
  toAdd.animate({ height: height + "px" }, { duration: 500, progress: function() {
    speech.scrollTop = speech.scrollHeight;
  } });
}

function clearBubbles(){
  $(".bubbles").empty();
}

function addSpeechText(text){
  $(".speechtext").append(" " + text);
  var speech = document.getElementById("speech");
  speech.scrollTop = speech.scrollHeight;
}


function replaceSpeechText(text){
  $(".speechtext").html(text);
  var speech = document.getElementById("speech");
  speech.scrollTop = speech.scrollHeight;
}