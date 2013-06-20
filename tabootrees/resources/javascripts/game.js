function addBubble(user, text) {
  var avatar = user.avatar;
  var team = user.team;
  var toAdd = $('<li class="bubbleitem"><img class="avatar" src="' + avatar + '" /><span class="bubble">' + text + '</span></li>');
  toAdd.appendTo(".bubbles");
  var height = toAdd.height();
  toAdd.css({ height: 0 });
  toAdd.animate({ height: height + "px" }, 500);
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