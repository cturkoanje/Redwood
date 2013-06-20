$(document).ready(function(){
	
	
	$('#send').click(function(){
		var text = $('#text').val();
		var nick = $('#nick').attr('value');
		var channel_id = $('#channel_api_params').attr('channel_id');
		var newData = ["anObject", "another", "and another"];

		$.ajax({
			url: '/newMessage/',
			type: 'POST',
			data:{
				text:text,
				nick:nick,
				type:"some data that we will post",
				channel_id:channel_id,
				data:JSON.stringify(newData),
			},
			success: function(data){
			},
			complete:function(){ 
	        }			
		});
	});
	
	$('#text').bind('keydown',function(e){
		var code = (e.keyCode ? e.keyCode : e.which);
		 if(code == 13) { //Enter keycode
			$('#send').trigger('click');
		 }
	});
	
	var chat_token = $('#channel_api_params').attr('chat_token');
	var channel = new goog.appengine.Channel(chat_token);
	var socket = channel.open();
	socket.onopen = function(){		
	};
	socket.onmessage = function(m){
		var data = $.parseJSON(m.data);
		console.log("The data returned \n" + JSON.stringify(m) + "\n\n" + JSON.stringify(data) + "\n************************************************************");

		$('#center').append("<br><br>" + data['words']);
		$('#center').animate({scrollTop: $("#center").attr("scrollHeight")}, 500);
		if(data['type'] == "correctWord")
			alert("Said correct workd");
	};
    socket.onerror =  function(err){
		alert("Error => "+err.description);
	};
    socket.onclose =  function(){
		alert("channel closed");
	};
	
	$(window).unload(function (){
		socket.close();		
	});
	
	
	$('#center').animate({scrollTop: $("#center").attr("scrollHeight")}, 500);
});