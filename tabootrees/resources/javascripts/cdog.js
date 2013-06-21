    sendMessage = function(path, opt_param) {

      path += '?g=';
     
      // path += '?g=' + state.game_key;
      // if (opt_param) {
      path += '&' + opt_param;
      // }
      var xhr = new XMLHttpRequest();
      xhr.open('POST', path, true);
      xhr.send();
    };

    onOpened = function() {
      connected = true;
      sendMessage('opened','hi');
      alert("opened!");
      // updateBoard();
    };
 
   onMessage = function(m) {
        alert(m.data);
        newState = JSON.parse(m.data);
        alert(newState);
        // state.board = newState.board || state.board;
        // state.userX = newState.userX || state.userX;
        // state.userO = newState.userO || state.userO;
        // state.moveX = newState.moveX == 'true';
        // state.winner = newState.winner || "";
        // state.winningBoard = newState.winningBoard || "";
        // updateGame();
    }