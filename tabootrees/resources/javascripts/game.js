function addBubble(user, newText) {
  var avatar = user.avatar;
  var team = user.team;

  var text = newText;
  if(text.length > 3909090909090090)
  {
    var startIndex = text.length - 30;
    text = text.substring(startIndex);
    console.log(newText + " is longer than 70 character.(" + newText.length + ") New index start is " + startIndex + " new one is " + text);
  }

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
  $(".speechtext").html(text['results'][0][0]['transcript']);
  var speech = document.getElementById("speech");
  speech.scrollTop = speech.scrollHeight;
}