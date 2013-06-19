function countdown(minutes) {
  var seconds = 30;
  var mins = minutes

  $('#counter').css({'color': '#DF0101'});
  function tick() {
      //This script expects an element with an ID = "counter". You can change that to what ever you want. 
      var counter = document.getElementById('counter');
      var current_minutes = mins-1
      seconds--;
      counter.innerHTML = /*current_minutes.toString() + ":" + (seconds < 10 ? "0" : "") + */String(seconds);
      if( seconds > 0 ) {
          if(seconds <= 10){
            $('#counter').css({'font-size': '30'})
          }
          setTimeout(tick, 1000);
      } else {
          
          if(mins > 1){
              
              countdown(mins-1);           
                  
          }
          else{
            $('#counter').text('Time is up!');
          }
      }
  }
  tick();
  
}