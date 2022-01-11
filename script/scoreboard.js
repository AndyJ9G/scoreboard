// socket connection
var socket = io.connect('/');
// document loaded
$(document).ready(function(){
	// send requestgamedata
	socket.emit('requestgamedata', { message: 'Request game data' });
});
// socket announcement
socket.on('announcement', function(data) {
	console.log('Received announcement:', data.message);
});
// socket get sendgamedata
socket.on('sendgamedata', function(data) {
	console.log('sendgamedata:', data);
	// live overlay
	// playclock
	$('#time').text(data.clock);
	// downclock
	$('#playclock').text(":"+data.playclock);
	// control setup
	if(data.quartershow === 'yes'){
		$("#quarter").show();
	}else if(data.quartershow === 'no'){
		$("#quarter").hide();
	}
	if(data.clockshow === 'yes'){
		$("#time").show();
	}else if(data.clockshow === 'no'){
		$("#time").hide();
	}
	if(data.playclockshow === 'yes'){
		$("#playclock").show();
	}else if(data.playclockshow === 'no'){
		$("#playclock").hide();
	}
	// count
	$("#quarter").text(data.quarter);
	if(data.downshow === 'yes' && data.distanceshow === 'yes'){
		$("#downdistance").text(data.down+' & '+data.distance);
	}else if(data.downshow === 'yes' && data.distanceshow === 'no'){
		$("#downdistance").text(data.down+' down');
	}else if(data.downshow === 'no'){
		$("#downdistance").text('gfl.info');
	}
	// flag
	if(data.flag === 'yes'){
		$("#flagbox").show();
		$("#flag").show();
	}else if(data.flag === 'no'){
		$("#flagbox").hide();
		$("#flag").hide();
	}
	// score
	if(data.score === 'no'){
		$("#scorebox").hide();
		$("#scorelogobox").hide();
		$("#scorenamebox").hide();
		$("#scorename").hide();
	}else{
		$("#scorename").text(data.score);
		$("#scorelogo").attr("src", data.scorelogo);
		$("#scorebox").show();
		$("#scorelogobox").show();
		$("#scorenamebox").show();
		$("#scorename").show();
	}
	// teams
	$("#teamname1").text(data.team1);
	$("#teamlogo1").attr("src", data.logo1);
	$("#teamfarbe1box").css( "background-color", data.color1);
	$("#teamname2").text(data.team2);
	$("#teamlogo2").attr("src", data.logo2);
	$("#teamfarbe2box").css( "background-color", data.color2);
	if(data.team1timeouts == 3){
		$("#team1timeout1box").show();
		$("#team1timeout2box").show();
		$("#team1timeout3box").show();
	}else if(data.team1timeouts == 2){
		$("#team1timeout1box").show();
		$("#team1timeout2box").show();
		$("#team1timeout3box").hide();
	}else if(data.team1timeouts == 1){
		$("#team1timeout1box").show();
		$("#team1timeout2box").hide();
		$("#team1timeout3box").hide();
	}else if(data.team1timeouts == 0){
		$("#team1timeout1box").hide();
		$("#team1timeout2box").hide();
		$("#team1timeout3box").hide();
	}
	if(data.team2timeouts == 3){
		$("#team2timeout1box").show();
		$("#team2timeout2box").show();
		$("#team2timeout3box").show();
	}else if(data.team2timeouts == 2){
		$("#team2timeout1box").show();
		$("#team2timeout2box").show();
		$("#team2timeout3box").hide();
	}else if(data.team2timeouts == 1){
		$("#team2timeout1box").show();
		$("#team2timeout2box").hide();
		$("#team2timeout3box").hide();
	}else if(data.team2timeouts == 0){
		$("#team2timeout1box").hide();
		$("#team2timeout2box").hide();
		$("#team2timeout3box").hide();
	}
	if(data.ballbesitz === 'team1'){
		$("#ballbesitz1box").show();
		$("#ballbesitz2box").hide();
	}else if(data.ballbesitz === 'team2'){
		$("#ballbesitz1box").hide();
		$("#ballbesitz2box").show();
	}
	$("#spielstand1").text(data.points1);
	$("#spielstand2").text(data.points2);
	// bauchbinde
	if(data.showbauchbinde === 'yes'){
		$("#bauchbindetoptext").text(data.bauchbinde1);
		$("#bauchbindebottomtext").text(data.bauchbinde2);
		$("#bauchbindelogo").attr("src", data.bauchbindelogo);
		if(data.bauchbindelogo === ''){
			$("#bauchbindelogobox").hide();
		}else{
			$("#bauchbindelogobox").show();
		}
		$("#bauchbindelogo").attr("src", data.bauchbindelogo);
		$("#bauchbinde").show();
	}else if(data.showbauchbinde === 'no'){
		$("#bauchbindetoptext").text(data.bauchbinde1);
		$("#bauchbindebottomtext").text(data.bauchbinde2);
		$("#bauchbindelogo").attr("src", data.bauchbindelogo);
		$("#bauchbinde").hide();
	}
	// kommentatoren
	if(data.showkommentator === 'yes'){
		$("#kommentator1text").text(data.kommentator1);
		$("#kommentator2text").text(data.kommentator2);
		$("#kommentator1logo").attr("src", data.kommentator1logo);
		$("#kommentator2logo").attr("src", data.kommentator2logo);
		if(data.kommentator1logo === ''){
			$("#kommentator1logobox").hide();
		}else{
			$("#kommentator1logobox").show();
		}
		if(data.kommentator2logo === ''){
			$("#kommentator2logobox").hide();
		}else{
			$("#kommentator2logobox").show();
		}
		$("#kommentatoren").show();
	}else if(data.showkommentator === 'no'){
		$("#kommentator1text").text(data.kommentator1);
		$("#kommentator2text").text(data.kommentator2);
		$("#kommentator1logo").attr("src", data.kommentator1logo);
		$("#kommentator2logo").attr("src", data.kommentator2logo);
		$("#kommentatoren").hide();
	}
});