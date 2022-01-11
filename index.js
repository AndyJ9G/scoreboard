// define express webserver
const express = require('express');
// define webserver app
const app = express();
// define http server
const server = require('http').Server(app);
const port = process.env.PORT || '4000'; // port
// define socket.io with cors for Cross-Origin Resource Sharing
const io = require('socket.io')(server, {
  cors: {
    origin: '*'
  }
});
// define cors for cross origin
const cors = require('cors');
// define websocket ws
const WebSocket = require('ws');
// define body parser for url encode
const bodyParser = require("body-parser");
// define read files
const fs = require('fs');
// define multer for file upload
const multer = require('multer');

// winston logger
const winston = require('winston');
const path = require('path');
// create logger itself
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'MMM-DD-YYYY HH:mm:ss'
    }),
    winston.format.printf(info => `${[info.timestamp]}: ${info.level}: ${info.message}`),
  ),
  transports: [
    // write all logs error (and below) to `error.log`
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    // write to all logs with level `info` and below to `combined.log` 
    new winston.transports.File({ filename: 'logs/combined.log' }),
    // write all logs to console
    new winston.transports.Console()
  ]
});

// use url encode
app.use(bodyParser.urlencoded({
    extended:true
}));

// define static files
app.use(express.static("logos"));
app.use(express.static("images"));
app.use(express.static("css"));
app.use(express.static("script"));
app.use(express.static("logs"));
app.use(express.static("teams"));
app.use(express.static("games"));

// use cors
app.use(cors());

// http server port
server.listen(port, function(){
  logger.info("HTTP server is running on port "+port);
});

// file upload storage
var storage = multer.diskStorage({
  destination: function(req, file, cb){
    cb(null, 'teams');
  },
  filename: function (req, file, cb){
    cb(null, file.originalname);
  }
});
// file upload instance
var upload = multer({storage: storage}).single('file');
// post / upload file
app.post('/upload',function(req, res){
  upload(req, res, function(err){
    if(err instanceof multer.MulterError){
      return res.status(500).json(err);
    }else if(err){
      return res.status(500).json(err);
    }

    // display uploaded image
    res.status(200).send(req.file);
  })
})

// --- initial data setup ---
var gameData;
var playerData;
var teamData;
// define base initial game data
// team 1
var team1= 'Razorbacks';
var logo1= 'fursty-razorbacks.png';
var color1= '#ee1818';
// team 2
var team2= 'Guest';
var logo2= 'no-logo.png';
var color2= '#ffffff';
// ball
var ballbesitz= 'team1';
// points
var points1= 0;
var points2= 0;
// timeouts
var team1timeouts= 3;
var team2timeouts= 3;
// visible parts
// quarter
var quartershow= 'yes';
var quarter= 'PRE';
// gameclock
var clockshow= 'yes';
var clockmin= 12;
var clocksec= 0;
var clockseconds= 720;
// gameclock quarter in seconds
var clocksetup= 720;
// clock as string
var clock= '12:00';
// playclock
var playclockshow= 'yes';
var playclock= 30;
// down
var downshow= 'yes';
var down= '1st';
// distance
var distanceshow= 'yes';
var distance= '10';
var distanceyard= 10;
// score display
var score= 'no';
var scorelogo= 'no';
// flag
var flag= 'no';
// teamlist
var teams;
// player lists
var team1players;
var team2players;
// field side
var team1fieldside = 'left';
var team2fieldside = 'right';
// commentator
var kommentator1 = '';
var kommentator2 = '';
var kommentator1logo= 'fursty-razorbacks.png';
var kommentator2logo= 'fursty-razorbacks.png';
var showkommentator = 'no';
// name overlay
var showtimer = 'no';
var bauchbinde1 = '';
var bauchbinde2 = '';
var bauchbindelogo = '';
var showbauchbinde = 'no';
// playclock run
var playclockrun = 'stop';

// other variables
// obs connection
var obsconnection= '';
var obsscene= '';
// logos for streamdeck
var logo1base64;
var logo1streamdeck;
var logo2base64;
var logo2streamdeck;

// --- websocket server ws for StreamDeck connection and communication --- 
// websocket ws server
const wsServer = new WebSocket.Server({ port: 3001 });
// check ws socket connection
wsServer.on('connection', function(socket){
  logger.info('StreamDeck connection received');

  // check received message
  socket.on('message', function (data) {
    logger.info('message from StreamDeck:', data);
    // save json data from StreamDeck
    var streamdeckdata = JSON.parse(data);
    logger.verbose('StreamDeck JSON data:', streamdeckdata);
    // define empty button data
    var contextid = '';
    var event = '';
    var id = '';
    // loop StreamDeck data
    for(var key in streamdeckdata){
      // find context
      if(key.match('context')){
        // save context
        contextid = streamdeckdata[key];
      }
      // find event
      if(key.match('event')){
        // save context
        event = streamdeckdata[key];
      }
      // find payload
      if(key.match('payload')){
        // save payload as json data
        var payload = streamdeckdata[key];
        // loop through payload
        for(var pkey in payload){
          // find settings
          if(pkey.match('settings')){
            // save settings as json data
            var settings = payload[pkey];
            // loop through settings
            for(var skey in settings){
              // find id
              if(skey.match('id')){
                // save id
                id = settings[skey];
              }
            }
          }
        }
      }
    }

    // read logos and create base64 images
    streamDeckLogos();

    // check the StreamDeck data based on event and id with context identifier
    // main actions from StreamDeck buttons
    // check id with keyUp
    if(event === 'keyUp'){
      // button id
      if(id === 'countquarter'){
        var newdata = JSON.stringify({event:"setTitle",context:contextid, payload:{title:quarter, target: 0}});
        logger.info('Streamdeck event data:', JSON.parse(newdata));
        socket.send(newdata);
      }else if(id === 'countdowns'){
        var newdata = JSON.stringify({event:"setTitle",context:contextid, payload:{title:down, target: 0}});
        logger.info('Streamdeck event data:', JSON.parse(newdata));
        socket.send(newdata);
      }else if(id === 'counttimeoutteam1'){
        var newdata = JSON.stringify({event:"setTitle",context:contextid, payload:{title:team1timeouts.toString(), target: 0}});
        logger.info('Streamdeck event data:', JSON.parse(newdata));
        socket.send(newdata);
        var newdata = JSON.stringify({event:"setImage",context:contextid, payload:{image:logo1streamdeck, target: 0}});
        logger.info('Streamdeck event data:', JSON.parse(newdata));
        socket.send(newdata);
      }else if(id === 'counttimeoutteam2'){
        var newdata = JSON.stringify({event:"setTitle",context:contextid, payload:{title:team2timeouts.toString(), target: 0}});
        logger.info('Streamdeck event data:', JSON.parse(newdata));
        socket.send(newdata);
        var newdata = JSON.stringify({event:"setImage",context:contextid, payload:{image:logo2streamdeck, target: 0}});
        logger.info('Streamdeck event data:', JSON.parse(newdata));
        socket.send(newdata);
      }
    }
  });
});

// create images for stream deck from team logos
function streamDeckLogos(){
  // read logos from team1 and team2 and create base64 images
  logo1base64 = fs.readFileSync('logos/'+logo1, 'base64');
  logo1streamdeck = "data:image/png;base64,"+logo1base64+"\"";
  logo2base64 = fs.readFileSync('logos/'+logo2, 'base64');
  logo2streamdeck = "data:image/png;base64,"+logo2base64+"\"";
}

/*
// `server` is a vanilla Node.js HTTP server, so use
// the same ws upgrade process described here:
// https://www.npmjs.com/package/ws#multiple-servers-sharing-a-single-https-server
const server2 = app.listen(3001);
server2.on('upgrade', (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, socket => {
    wsServer.emit('connection', socket, request);
  });
});
*/

// --- functions ---
// sleep function
function sleep(millis) {
    return new Promise(resolve => setTimeout(resolve, millis));
}

// create JSON data from game data
function gameDataToJSON(){
  // create json data for gamedata
  gameData = {
    team1: team1,
    logo1: logo1,
    color1: color1,
    team2: team2,
    logo2: logo2,
    color2: color2,
    ballbesitz: ballbesitz,
    points1: points1,
    team1timeouts: team1timeouts,
    points2: points2,
    team2timeouts: team2timeouts,
    quartershow: quartershow,
    quarter: quarter,
    clockshow: clockshow,
    clocksetup: clocksetup,
    clockseconds: clockseconds,
    clock: clock,
    playclockshow: playclockshow,
    playclock: playclock,
    downshow: downshow,
    down: down,
    distanceshow: distanceshow,
    distance: distance,
    distanceyard: distanceyard,
    score: score,
    scorelogo: scorelogo,
    flag: flag,
    obsconnection: obsconnection,
    obsscene: obsscene,
    teams: teams,
    team1fieldside: team1fieldside,
    team2fieldside: team2fieldside,
    // bauchbinde
    kommentator1: kommentator1,
    kommentator2: kommentator2,
    kommentator1logo: kommentator1logo,
    kommentator2logo: kommentator2logo,
    showkommentator: showkommentator,
    bauchbinde1: bauchbinde1,
    bauchbinde2: bauchbinde2,
    bauchbindelogo: bauchbindelogo,
    showbauchbinde: showbauchbinde,
    showtimer: showtimer
  };
}

// send json object from game data
// perform some checks on data before sending
function sendGameData() {
  // check distance
  distanceYards();
  // check distance smaller than 1 yard
  if(distanceyard<1){
    // show inches
    distance = 'inches';
  }else{
    // show distance
    distance = distanceyard.toString();
  }
  // check points smaller than 0
  checkPoints();
  // create json data
  gameDataToJSON();
  // send data
  //io.emit('loadedscoreboard', gameData);
  io.emit('sendgamedata', gameData);
}

// load game data from file
function loadGameDataFromFile(){
  // read file
  fs.readFile('logs/gamedata.log', 'utf8' , (err, data) => {
    // error
    if (err) {
      logger.error(err);
    }
    // parse as json
    var jsongamedata = JSON.parse(data);
    // gamedata = Object.assign(gamedata, JSON.parse(data));
    // get json data
    team1 = jsongamedata.team1;
    logo1 = jsongamedata.logo1;
    color1 = jsongamedata.color1;
    team2 = jsongamedata.team2;
    logo2 = jsongamedata.logo2;
    color2 = jsongamedata.color2;
    ballbesitz = jsongamedata.ballbesitz;
    points1 = jsongamedata.points1;
    team1timeouts = jsongamedata.team1timeouts;
    points2 = jsongamedata.points2;
    team2timeouts = jsongamedata.team2timeouts;
    quartershow = jsongamedata.quartershow;
    quarter = jsongamedata.quarter;
    clockshow = jsongamedata.clockshow;
    clocksetup = jsongamedata.clocksetup;
    clockseconds = jsongamedata.clockseconds;
    clock = jsongamedata.clock;
    playclockshow = jsongamedata.playclockshow;
    playclock = jsongamedata.playclock;
    downshow = jsongamedata.downshow;
    down = jsongamedata.down;
    distanceshow = jsongamedata.distanceshow;
    distance = jsongamedata.distance;
    distanceyard = jsongamedata.distanceyard;
    score = jsongamedata.score;
    scorelogo = jsongamedata.scorelogo;
    flag = jsongamedata.flag;
    obsconnection = jsongamedata.obsconnection;
    obsscene = jsongamedata.obsscene;
    teams = jsongamedata.teams;
    team1fieldside = jsongamedata.team1fieldside;
    team2fieldside = jsongamedata.team2fieldside;
    // bauchbinde
    kommentator1 = jsongamedata.kommentator1;
    kommentator2 = jsongamedata.kommentator2;
    kommentator1logo = jsongamedata.kommentator1logo;
    kommentator2logo = jsongamedata.kommentator2logo;
    showkommentator = jsongamedata.showkommentator;
    bauchbinde1 = jsongamedata.bauchbinde1;
    bauchbinde2 = jsongamedata.bauchbinde2;
    bauchbindelogo = jsongamedata.bauchbindelogo;
    showbauchbinde = jsongamedata.showbauchbinde;
    showtimer = jsongamedata.showtimer;
  })
}

// write game data to file
function writeGameDataToFile(){
  fs.writeFile('logs/gamedata.log', JSON.stringify(gameData), err => {
    if (err) {
      logger.error(err);
      return
    }
    //file written successfully
  })
}

// read team list from file
function readTeams(){
  // read file
  fs.readFile('logos/teams.json', 'utf8' , (err, data) => {
    // error
    if (err) {
      logger.error(err);
    }
    // parse as json
    try {
      // parse as json
      teams = JSON.parse(data);
    } catch (err) {
      logger.error(err);
    }
  })
}

// read team1 player file and return as json
function readTeam1players(){
  // read file
  fs.readFile('logos/team1.json', 'utf8' , (err, data) => {
    // error
    if (err) {
      logger.error(err);
    }
    // parse as json
    try {
      // parse as json
      team1players = JSON.parse(data);
    } catch (err) {
      logger.error(err);
    }
  })
}
// read team2 player file and return as json
function readTeam2players(){
  // read file
  fs.readFile('logos/team2.json', 'utf8' , (err, data) => {
    // error
    if (err) {
      logger.error(err);
    }
    // parse as json
    try {
      // parse as json
      team2players = JSON.parse(data);
    } catch (err) {
      logger.error(err);
    }
  })
}

// setup teams as team1 and team2
function setupTeams(teamnumber, teamname){
  // loop through teams
  for(var i = 0; i < teams.length; i++){
    // check team name
    if(teamname.match(teams[i].team_name)){
      // setup team
      if(teamnumber === 1){
        // team1
        team1= teams[i].name;
        logo1= teams[i].logo;
        color1= teams[i].color;
      }else if(teamnumber === 2){
        // team1
        team2= teams[i].name;
        logo2= teams[i].logo;
        color2= teams[i].color;
      }
    }
  }
}

// create ans send json object from teams list data
function sendAllTeamsData() {
  // create json data
  teamData = {
    teamlist: teams,
  };
  // send data
  //io.emit('loadedteams', teamData);
  io.emit('sendteamlist', teamData);
}

// create ans send json object from team player data
function sendTeamData() {
  // create json data
  playerData = {
    team1players: team1players,
    team2players: team2players,
  };
  // send data
  //io.emit('loadedplayers', playerData);
  io.emit('sendplayerlist', playerData);
}

// start playclock
function playclockRun(){
  // set interval
  var myInt = setInterval(() => {
    if(playclockrun === 'start'){
      // count clock
      if(clockseconds > 0){
        // reduce one second, count seconds
        setClock('minus1Second');
      }else{
        logger.info("Clock finished ");
        clearInterval(myInt);
      }
      // set game data
      sendGameData();
    }else{
      // stop clock
      clearInterval(myInt);
    }
  }, 1000);
}

// create time string from min and sec
function setClock(action) {
  // get action
  if(action === 'reset12Clock'){
    // set seconds
    clocksetup = 720;
  } else if(action === 'reset15Clock'){
    // set seconds
    clocksetup = 900;
  } else if(action === 'reset30Clock'){
    // set seconds
    clocksetup = 1800;
  } else if(action === 'plusMinute'){
    // set clock
    clockseconds = clockseconds+60;  
  } else if(action === 'minusMinute'){
    // set clock
    clockseconds = clockseconds-60;
  } else if(action === 'plus10Second'){
    // set clock
    clockseconds = clockseconds+10;
  } else if(action === 'minus10Second'){
    // set clock
    clockseconds = clockseconds-10;
  } else if(action === 'plus1Second'){
    // set clock
    clockseconds = clockseconds+1;
  } else if(action === 'minus1Second'){
    // set clock
    clockseconds = clockseconds-1;
  } else if(action === 'resetClock'){
    // set clock
    clockseconds = clocksetup;
  }
  // calculate seconds in min and sec
  var mins = ~~(clockseconds/60);
  var secs = ~~clockseconds % 60;
  var stringsec = (secs<10 ? "0" : "")+secs;
  clock = mins + ":" + (secs<10 ? "0" : "") + secs;
}

// game field functions
// flip sides
function flipSides() {
  // check and change sides
  if(team1fieldside === 'left'){
    team1fieldside = 'right';
    team2fieldside = 'left';
  }else{
    team1fieldside = 'left';
    team2fieldside = 'right';
  }
}

// points functions
// touchdownTeam
function touchdownTeam(team){
  // set score
  score= 'TOUCHDOWN';
  showtimer = 'TOUCHDOWN'+team;
  var points;
  // check team
  // count points
  if(team === 'team1'){
    scorelogo= logo1;
    points1 = points1 + 6;
    points = points1;
  }else{
    scorelogo= logo2;
    points2 = points2 + 6;
    points = points2;
  }
  logger.info(team+' points: '+points);
  // send GameData
  sendGameData();
  // wait 6 seconds
  sleep(6000).then(() => {
    // check if score is visible
    if(showtimer === 'TOUCHDOWN'+team){
      // remove score
      score= 'no';
      scorelogo= 'no';
      showtimer = 'no';
    }
    // send GameData
    sendGameData();
  });
}
// twopointTeam
function twopointTeam(team){
  // set score
  score= '2PT CONVERSION';
  showtimer = '2PT CONVERSION'+team;
  var points;
  // check team
  // count points
  if(team === 'team1'){
    scorelogo= logo1;
    points1 = points1 + 2;
    points = points1;
  }else{
    scorelogo= logo2;
    points2 = points2 + 2;
    points = points2;
  }
  logger.info(team+' points: '+points);
  // send GameData
  sendGameData();
  // wait 6 seconds
  sleep(6000).then(() => {
    // check if score is visible
    if(showtimer === '2PT CONVERSION'+team){
      // remove score
      score= 'no';
      scorelogo= 'no';
      showtimer = 'no';
    }
    // send GameData
    sendGameData();
  });
}
// fieldgoalTeam
function fieldgoalTeam(team){
  // set score
  score= 'FIELDGOAL';
  showtimer = 'FIELDGOAL'+team;
  var points;
  // check team
  // count points
  if(team === 'team1'){
    scorelogo= logo1;
    points1 = points1 + 3;
    points = points1;
  }else{
    scorelogo= logo2;
    points2 = points2 + 3;
    points = points2;
  }
  logger.info(team+' points: '+points);
  // send GameData
  sendGameData();
  // wait 6 seconds
  sleep(6000).then(() => {
    // check if score is visible
    if(showtimer === 'FIELDGOAL'+team){
      // remove score
      score= 'no';
      scorelogo= 'no';
      showtimer = 'no';
    }
    // send GameData
    sendGameData();
  });
}
// safetyTeam
function safetyTeam(team){
  // set score
  score= 'SAFETY';
  showtimer = 'SAFETY'+team;
  var points;
  // check team
  // count points
  if(team === 'team1'){
    scorelogo= logo1;
    points1 = points1 + 2;
    points = points1;
  }else{
    scorelogo= logo2;
    points2 = points2 + 2;
    points = points2;
  }
  logger.info(team+' points: '+points);
  // send GameData
  sendGameData();
  // wait 6 seconds
  sleep(6000).then(() => {
    // check if score is visible
    if(showtimer === 'SAFETY'+team){
      // remove score
      score= 'no';
      scorelogo= 'no';
      showtimer = 'no';
    }
    // send GameData
    sendGameData();
  });
}
// points
function points(action){
  // check action
  if(action === 'plusTeam1' || action === 'extrapointTeam1'){
    points1 = points1+1;
  }else if (action === 'minusTeam1'){
    points1 = points1-1;
  }else if(action === 'plusTeam2' || action === 'extrapointTeam2'){
    points2 = points2+1;
  }else if (action === 'minusTeam2'){
    points2 = points2-1;
  }
}

// timeoutTeam
function timeoutTeam(action,team){
  // check action
  if(action === 'plus'){
    // increase timeouts
    countTimeout('plus',team);
  }else if(action === 'minus'){
    // decrease timeouts
    countTimeout('minus',team);
  }else if(action === 'count'){
    // set score
    score= 'TIMEOUT';
    showtimer = 'TIMEOUT'+team;
    // check team
    if(team === 'team1'){
      scorelogo= logo1;
    }else{
      scorelogo= logo2;
    }
    // count timeouts
    countTimeout('minus',team);
    logger.info(team+' timeout');
    // send GameData
    sendGameData();
    // wait 6 seconds
    sleep(6000).then(() => {
      // check if score is visible
      if(showtimer === 'TIMEOUT'+team){
        // remove score
        score= 'no';
        scorelogo= 'no';
        showtimer = 'no';
      }
      // send GameData
      sendGameData();
    });
  }
}

// bauchbinde functions
// kommentatorenShow
function kommentatorenShow(data){
  // set kommentator
  kommentator1 = data.kommentator1;
  kommentator2 = data.kommentator2;
  kommentator1logo = logo1;
  kommentator2logo = logo1;
  showkommentator = 'yes';
  // send GameData
  sendGameData();
}
// kommentatorenHide
function kommentatorenHide(){
  showkommentator = 'no';
  // send GameData
  sendGameData();
}
// bauchbindeShow
function bauchbindeShow(team,data){
  // check team
  if(team === 'team1'){
    bauchbindelogo = logo1;
  }else if(team === 'team2'){
    bauchbindelogo = logo2;
  }else{
    bauchbindelogo = '';
  }
  // set bauchbinde
  bauchbinde1 = data.bauchbinde1;
  bauchbinde2 = data.bauchbinde2;
  showbauchbinde = 'yes';
  showtimer = bauchbinde1+bauchbinde2;
  // send GameData
  sendGameData();
  // wait 6 seconds
  sleep(6000).then(() => {
    // check if score is visible
    if(showtimer === bauchbinde1+bauchbinde2){
      // remove score
      score= 'no';
      scorelogo= 'no';
      showtimer = 'no';
    }
    bauchbindeHide();
  });
}
// bauchbindeHide
function bauchbindeHide(){
  showbauchbinde= 'no';
  // send GameData
  sendGameData();
}

// bauchbindeShowTeamPlayer
function bauchbindeShowTeamPlayer(team,data){
  // get player number
  var num = data.player;
  // setup variables
  var number = '';
  var name = '';
  var position = '';
  // loop player data
  // check team
  if(team === 'team1'){
    bauchbindelogo = logo1;
    for (var i = 0; i < team1players.length; i++){
      // get array object
      var obj = team1players[i];
      // check player number
      if(num === obj['number']){
        // player data
        name = obj['name'];
        position = obj['position'];
      }
    }
  }else{
    bauchbindelogo = logo2;
    for (var i = 0; i < team2players.length; i++){
      // get array object
      var obj = team2players[i];
      // check player number
      if(num === obj['number']){
        // player data
        name = obj['name'];
        position = obj['position'];
      }
    }
  }
  // set bauchbinde
  // check player number is a number
  if(isNaN(num)){
    // NAN (Not A Number) dont' add the number to the name
  }else{
    // add the number to the name
    number = "#"+num+" ";
  }
  bauchbinde1 = number+name;
  bauchbinde2 = position;
  showbauchbinde = 'yes';
  showtimer = bauchbinde1+bauchbinde2;
  // send GameData
  sendGameData();
  // wait 6 seconds
  sleep(6000).then(() => {
    // check if score is visible
    if(showtimer === bauchbinde1+bauchbinde2){
      // remove score
      score= 'no';
      scorelogo= 'no';
      showtimer = 'no';
    }
    bauchbindeHide();
  });
}

// update team playerlist
function updateTeamPlayer(team,data){
  var teamlist;
  var filename;
  // check team
  if(team === 'team1'){
    // file
    filename = 'logos/team1.json';
    // set team data
    team1players = data;
    // parse list
    teamlist = JSON.parse(team1players);
  }else{
    // file
    filename = 'logos/team2.json';
    // set team data
    team2players = data;
    // parse list
    teamlist = JSON.parse(team2players);
  }
  // set JSON string, human readable
  var teamlistjson = JSON.stringify(teamlist, null, 2);
  // write file
  fs.writeFile(filename, teamlistjson, err => {
    if (err) {
      logger.error(err);
    }
  });
}

// update AllTeams List
function updateAllTeamsList(data){
  // parse list
  var teamslist = JSON.parse(data);
  // file
  var filename = 'logos/teams.json';
  // set JSON string, human readable
  var teamslistjson = JSON.stringify(teamslist, null, 2);
  // write file
  fs.writeFile(filename, teamslistjson, err => {
    if (err) {
      logger.error(err);
    }
  });
}

// control show functions
// quarter Show
function quarterShow(){
  // change quarter show
  if(quartershow === 'yes'){
    quartershow = 'no';
  } else if(quartershow === 'no'){
    quartershow = 'yes';
  }
}
// gameclock Show
function gameclockShow(){
  // change gameclock show
  if(clockshow === 'yes'){
    clockshow = 'no';
  } else if(clockshow === 'no'){
    clockshow = 'yes';
  }
}
// playclock Show
function playclockShow(){
  // change playclock show
  if(playclockshow === 'yes'){
    playclockshow = 'no';
  } else if(playclockshow === 'no'){
    playclockshow = 'yes';
  }
}
// down Show
function downShow(){
  // change down show
  if(downshow === 'yes'){
    downshow = 'no';
  } else if(downshow === 'no'){
    downshow = 'yes';
  }
}
// distance Show
function distanceShow(){
  // change distance show
  if(distanceshow === 'yes'){
    distanceshow = 'no';
  } else if(distanceshow === 'no'){
    distanceshow = 'yes';
  }
}

// count quarter up
function countQuarter(){
  // count quarter
  if(quarter === 'PRE'){
    quarter = '1st';
  } else if (quarter === '1st'){
    quarter = '2nd';
  } else if (quarter === '2nd'){
    quarter = 'HT';
  } else if (quarter === 'HT'){
    quarter = '3rd';
  } else if (quarter === '3rd'){
    quarter = '4th';
  } else if (quarter === '4th'){
    quarter = 'FINAL';
  } else if (quarter === 'FINAL'){
    quarter = 'PRE';
  }
}

// count timeout
function countTimeout(count,team){
  // check count
  if(count === 'minus'){
    //check team
    if(team === 'team1'){
      // reduce timeout number
      if(team1timeouts == 0){
        team1timeouts = 3;
      } else {
        team1timeouts--;
      }
    }else if(team === 'team2'){
      // reduce timeout number
      if(team2timeouts == 0){
        team2timeouts = 3;
      } else {
        team2timeouts--;
      }
    }
  }else if(count === 'plus'){
    //check team
    if(team === 'team1'){
      // increase timeout number
      if(team1timeouts == 3){
        team1timeouts = 0;
      } else {
        team1timeouts++;
      }
    }else if(team === 'team2'){
      // increase timeout number
      if(team2timeouts == 3){
        team2timeouts = 0;
      } else {
        team2timeouts++;
      }
    }
  }
}

// count downs
function countDowns(){
  // count downs
  if(down === '1st'){
    down = '2nd';
  } else if(down === '2nd'){
    down = '3rd';;
  } else if(down === '3rd'){
    down = '4th';;
  } else if(down === '4th'){
    down = '1st';;
  }
}

// ballbesitz
function ballBesitz(team){
  ballbesitz = team;
}

// ballbesitzwechsel
function ballbesitzwechsel(){
  // toggle
  if(ballbesitz === 'team1'){
    ballbesitz = 'team2';
  }else if(ballbesitz === 'team2'){
    ballbesitz = 'team1';
  }
  // check teamname
  if(ballbesitz === 'team1'){
    teamball = team1;
  }else if(ballbesitz === 'team2'){
    teamball = team2;
  }
}

// distanceYards
function distanceYards(action){
  // check action
  if(action === 'firstDown'){
    down = '1st';
    distanceyard= 10;
  }else if(action === 'yardsplus10'){
    distanceyard= distanceyard+10;
  }else if(action === 'yardsminus10'){
    distanceyard= distanceyard-10;
  }else if(action === 'yardsplus5'){
    distanceyard= distanceyard+5;
  }else if(action === 'yardsminus5'){
    distanceyard= distanceyard-5;
  }else if(action === 'yardsplus1'){
    distanceyard= distanceyard+1;
  }else if(action === 'yardsminus1'){
    distanceyard= distanceyard-1;
  }
  // check distance smaller than 0 yard
  if(distanceyard<0){
    // show 0
    distanceyard = 0;
  }
}

// checkPoints
function checkPoints(){
  // check points smaller than 0
  if(points1<0){
    points1 = 0;
  }
  if(points2<0){
    points2 = 0;
  }
}

// flag
function setflag(){
  // set flag
  flag = 'yes';
  // send GameData
  sendGameData();
  // wait 6 seconds
  sleep(6000).then(() => {
    // reset flag
    flag = 'no';
    // send GameData
    sendGameData();
  });
}

// --- http server requests ---
// serve the files for the buildreact app
app.use(express.static(path.join(__dirname, '../livegame/build')));
// ### react app routes ###
// get / file
app.get('/', function(req, res) {
  // send control file
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type'); // If needed
  res.setHeader('Access-Control-Allow-Credentials', true); // If needed
  res.sendFile(path.join(__dirname, '../livegame/build/index.html'));
});
// get / file
app.get('/teamsetup', function(req, res) {
  res.sendFile(path.join(__dirname, '../livegame/build/index.html'));
});
// get / file
app.get('/gamesetup', function(req, res) {
  res.sendFile(path.join(__dirname, '../livegame/build/index.html'));
});
// get / file
app.get('/livegame', function(req, res) {
  res.sendFile(path.join(__dirname, '../livegame/build/index.html'));
});
// ### react app routes end ###
// get index file
app.get('/index', function(req, res) {
  // send control file
  res.sendFile(path.join(__dirname, '/index.html'));
});
// get control file
app.get('/control', function(req, res) {
  // send control file
  res.sendFile(path.join(__dirname, '/control.html'));
});
// get control-big file
app.get('/control-big', function(req, res) {
  // send control file
  res.sendFile(path.join(__dirname, '/control-big.html'));
});
// get team1 file
app.get('/team1', function(req, res) {
  // send control file
  res.sendFile(path.join(__dirname, '/team1.html'));
});
// get team2 file
app.get('/team2', function(req, res) {
  // send control file
  res.sendFile(path.join(__dirname, '/team2.html'));
});
// get teams file
app.get('/teams', function(req, res) {
  // send control file
  res.sendFile(path.join(__dirname, '/teams.html'));
});

// get canvas drawing file
app.get('/canvas', function(req, res) {
  // send file
  res.sendFile(path.join(__dirname, '/canvas.html'));
});

// get stats file
app.get('/stats', function(req, res) {
  // send control file
  res.sendFile(path.join(__dirname, '/stats.html'));
});

// get scoreboardsmall file
app.get('/scoreboardsmall', function(req, res) {
  // send file
  res.sendFile(path.join(__dirname, '/scoreboardsmall.html'));
});

// get names file
// this is our names overlay html file
app.get('/names', function(req, res) {
  // send file
  res.sendFile(path.join(__dirname, '/names.html'));
});

// get scoreboard file
// this is our overlay html file
app.get('/scoreboard', function(req, res) {
  // send file
  res.sendFile(path.join(__dirname, '/scoreboard.html'));
});

// get getcontrol file
// we can trigger actions with GET requests
// link: http://localhost:port/getcontrol?action=
app.get("/getcontrol", function(req, res) {
  // read action
  var action = req.query.action;
  // check action
  if(action === 'countquarter'){
    logger.info('GET countquarter');
    countQuarter();
    // show the GET request as response
    res.send(quarter);
  } else if(action === 'countdowns'){
    logger.info('GET countdowns');
    countDowns();
    // show the GET request as response
    res.send(down);
  } else if(action === 'flag'){
    logger.info('GET flag');
    setflag();
    // show the GET request as response
    res.send('Flag');
  } else if(action === 'quarterShow'){
    logger.info('GET quarterShow');
    quarterShow();
    // show the GET request as response
    res.send('quarterShow');
  } else if(action === 'gameclockShow'){
    logger.info('GET gameclockShow');
    gameclockShow();
    // show the GET request as response
    res.send('gameclockShow');
  } else if(action === 'playclockShow'){
    logger.info('GET playclockShow');
    playclockShow();
    // show the GET request as response
    res.send('playclockShow');
  } else if(action === 'downShow'){
    logger.info('GET downShow');
    downShow();
    // show the GET request as response
    res.send('downShow');
  } else if(action === 'distanceShow'){
    logger.info('GET distanceShow');
    distanceShow();
    // show the GET request as response
    res.send('distanceShow');
  } else if(action === 'firstDown'){
    logger.info('GET firstDown');
    distanceYards('firstDown');
    // show the GET request as response
    res.send(down+' & '+distanceyard.toString());
  } else if(action === 'yardsplus10'){
    logger.info('GET yardsplus10');
    distanceYards('yardsplus10');
    // show the GET request as response
    res.send(distanceyard.toString());
  } else if(action === 'yardsminus10'){
    logger.info('GET yardsminus10');
    distanceYards('yardsminus10');
    // show the GET request as response
    res.send(distanceyard.toString());
  } else if(action === 'yardsplus5'){
    logger.info('GET yardsplus5');
    distanceYards('yardsplus5');
    // show the GET request as response
    res.send(distanceyard.toString());
  } else if(action === 'yardsminus5'){
    logger.info('GET yardsminus5');
    distanceYards('yardsminus5');
    // show the GET request as response
    res.send(distanceyard.toString());
  } else if(action === 'yardsplus1'){
    logger.info('GET yardsplus1');
    distanceYards('yardsplus1');
    // show the GET request as response
    res.send(distanceyard.toString());
  } else if(action === 'yardsminus1'){
    logger.info('GET yardsminus1');
    distanceYards('yardsminus1');
    // show the GET request as response
    res.send(distanceyard.toString());
  } else if(action === 'reset12Clock'){
    logger.info('GET reset12Clock');
    setClock('reset12Clock');
    // show the GET request as response
    res.send(clock);
  } else if(action === 'reset15Clock'){
    logger.info('GET reset15Clock');
    setClock('reset15Clock');
    // show the GET request as response
    res.send(clock);
  } else if(action === 'reset30Clock'){
    logger.info('GET reset30Clock');
    setClock('reset30Clock');
    // show the GET request as response
    res.send(clock);
  } else if(action === 'plusMinute'){
    logger.info('GET plusMinute');
    setClock('plusMinute');
    // show the GET request as response
    res.send(clock);   
  } else if(action === 'minusMinute'){
    logger.info('GET minusMinute');
    setClock('minusMinute');
    // show the GET request as response
    res.send(clock);
  } else if(action === 'plus10Second'){
    logger.info('GET plus10Second');
    setClock('plus10Second');
    // show the GET request as response
    res.send(clock);
  } else if(action === 'minus10Second'){
    logger.info('GET minus10Second');
    setClock('minus10Second');
    // show the GET request as response
    res.send(clock);
  } else if(action === 'plus1Second'){
    logger.info('GET plus1Second');
    setClock('plus1Second');
    // show the GET request as response
    res.send(clock);
  } else if(action === 'minus1Second'){
    logger.info('GET minus1Second');
    setClock('minus1Second');
    // show the GET request as response
    res.send(clock);
  } else if(action === 'resetClock'){
    logger.info('GET resetClock');
    setClock('resetClock');
    // show the GET request as response
    res.send(clock);
  } else if(action === 'startClock'){
    logger.info('GET startClock');
    // set playclock
    playclockrun = 'start';
    playclockRun();
    // show the GET request as response
    res.send(playclockrun);
  } else if(action === 'stopClock'){
    logger.info('GET stopClock');
    // set playclock
    playclockrun = 'stop';
    // show the GET request as response
    res.send(playclockrun);  
  } else if(action === 'counttimeoutteam1'){
    logger.info('GET counttimeoutteam1');
    timeoutTeam('count','team1');
    // show the GET request as response
    res.send(team1timeouts.toString()); 
  } else if(action === 'counttimeoutteam2'){
    logger.info('GET counttimeoutteam2');
    timeoutTeam('count','team2');
    // show the GET request as response
    res.send(team2timeouts.toString()); 
  } else if(action === 'ballbesitzteam1'){
    logger.info('GET ballbesitzteam1');
    ballBesitz('team1');
    // show the GET request as response
    res.send(ballbesitz); 
  } else if(action === 'ballbesitzteam2'){
    logger.info('GET ballbesitzteam2');
    ballBesitz('team2');
    // show the GET request as response
    res.send(ballbesitz); 
  } else if(action === 'ballbesitzwechsel'){
    logger.info('GET ballbesitzwechsel');
    ballbesitzwechsel();
    // show the GET request as response
    res.send(teamball); 
  } else if(action === 'touchdownTeam1'){
    logger.info('GET touchdownTeam1');
    touchdownTeam('team1');
    // show the GET request as response
    res.send('TD');
  } else if(action === 'touchdownTeam2'){
    logger.info('GET touchdownTeam2');
    touchdownTeam('team2');
    // show the GET request as response
    res.send('TD');
  } else if(action === 'extrapointTeam1'){
    logger.info('GET extrapointTeam1');
    points('extrapointTeam1');
    // show the GET request as response
    res.send('EP');
  } else if(action === 'extrapointTeam2'){
    logger.info('GET extrapointTeam2');
    points('extrapointTeam2');
    // show the GET request as response
    res.send('EP');
  } else if(action === 'twopointTeam1'){
    logger.info('GET twopointTeam1');
    twopointTeam('team1');
    // show the GET request as response
    res.send('2 PT');
  } else if(action === 'twopointTeam2'){
    logger.info('GET twopointTeam2');
    twopointTeam('team2');
    // show the GET request as response
    res.send('2 PT');
  } else if(action === 'fieldgoalTeam1'){
    logger.info('GET fieldgoalTeam1');
    fieldgoalTeam('team1');
    // show the GET request as response
    res.send('FG');
  } else if(action === 'fieldgoalTeam2'){
    logger.info('GET fieldgoalTeam2');
    fieldgoalTeam('team2');
    // show the GET request as response
    res.send('FG');
  } else if(action === 'safetyTeam1'){
    logger.info('GET safetyTeam1');
    safetyTeam('team1');
    // show the GET request as response
    res.send('SAFETY');
  } else if(action === 'safetyTeam2'){
    logger.info('GET safetyTeam2');
    safetyTeam('team2');
    // show the GET request as response
    res.send('SAFETY');
  } else if(action === 'plusTeam1'){
    logger.info('GET plusTeam1');
    points('plusTeam1');
    // show the GET request as response
    res.send('+1');
  } else if(action === 'minusTeam1'){
    logger.info('GET minusTeam1');
    points('minusTeam1');
    // show the GET request as response
    res.send('-1');
  } else if(action === 'plusTeam2'){
    logger.info('GET plusTeam2');
    points('plusTeam2');
    // show the GET request as response
    res.send('+1');
  } else if(action === 'minusTeam2'){
    logger.info('GET minusTeam2');
    points('minusTeam2');
    // show the GET request as response
    res.send('-1');
  } else if(action === 'plusTimeoutTeam1'){
    logger.info('GET plusTimeoutTeam1');
    timeoutTeam('plus','team1');
    // show the GET request as response
    res.send('plusTimeoutTeam1');
  } else if(action === 'minusTimeoutTeam1'){
    logger.info('GET minusTimeoutTeam1');
    timeoutTeam('minus','team1');
    // show the GET request as response
    res.send('minusTimeoutTeam1');
  } else if(action === 'plusTimeoutTeam2'){
    logger.info('GET plusTimeoutTeam2');
    timeoutTeam('plus','team2');
    // show the GET request as response
    res.send('plusTimeoutTeam2');
  } else if(action === 'minusTimeoutTeam2'){
    logger.info('GET minusTimeoutTeam2');
    timeoutTeam('minus','team2');
    // show the GET request as response
    res.send('minusTimeoutTeam2');
  } else if(action === 'setupTeam1'){
    logger.info('GET setupTeam1');
    // setup team1
    // read name
    var name = req.query.name;
    setupTeams(1,name);
    // show the GET request as response
    res.send(name);
  } else if(action === 'setupTeam2'){
    logger.info('GET setupTeam2');
    // setup team2
    // read name
    var name = req.query.name;
    setupTeams(2,name);
    // show the GET request as response
    res.send(name);
  }
  // send GameData
  sendGameData();
  // write game data to file
  writeGameDataToFile();
});

// --- our socket connection to send, receive data ---
// check socket connection
io.on('connection', function(socket){
  logger.info('Client connection received');
  // when clients connect, inform all clients
  socket.emit('announcement', { message: 'New client joined.' });

  // read team list to show in control file
  readTeams();
  // read team player list to show in teams file
  readTeam1players();
  readTeam2players();

  // check message
  socket.on('message', function (data) {
    logger.info('message from client:', data.message);
    io.emit('announcement', { message: 'New client message.' });
  });

  // check event
  socket.on('event', function (data) {
    logger.info('Event from client:', data.message);
    io.emit('announcement', { message: 'New client event.' });
  });

  // check scoreboardloaded
  socket.on('scoreboardloaded', function (data) {
    logger.info('scoreboard loaded:', data.message);
    // send GameData
    sendGameData();
  });
  // check requestgamedata
  socket.on('requestgamedata', function (data) {
    logger.info('requestgamedata:', data.message);
    // send GameData
    sendGameData();
  });

  // check teamsloaded
  socket.on('teamsloaded', function (data) {
    logger.info('teams loaded:', data.message);
    // send AllTeamData
    sendAllTeamsData();
  });
  // check requestteamlist
  socket.on('requestteamlist', function (data) {
    logger.info('requestteamlist:', data.message);
    // send AllTeamData
    sendAllTeamsData();
  });

  // check playersloaded
  socket.on('playersloaded', function (data) {
    logger.info('players loaded:', data.message);
    // send TeamData
    sendTeamData();
  });
  // check requestplayerlist
  socket.on('requestplayerlist', function (data) {
    logger.info('requestplayerlist:', data.message);
    // send TeamData
    sendTeamData();
  });

  // control setup
  // check quarterShow
  socket.on('quarterShow', function (data) {
    logger.info('quarterShow clicked:', data.message);
    quarterShow();
    // send GameData
    sendGameData();
    // write game data to file
    writeGameDataToFile();
  });
  // check gameclockShow
  socket.on('gameclockShow', function (data) {
    logger.info('gameclockShow clicked:', data.message);
    gameclockShow();
    // send GameData
    sendGameData();
    // write game data to file
    writeGameDataToFile();
  });
  // check playclockShow
  socket.on('playclockShow', function (data) {
    logger.info('playclockShow clicked:', data.message);
    playclockShow();
    // send GameData
    sendGameData();
    // write game data to file
    writeGameDataToFile();
  });
  // check downShow
  socket.on('downShow', function (data) {
    logger.info('downShow clicked:', data.message);
    downShow();
    // send GameData
    sendGameData();
    // write game data to file
    writeGameDataToFile();
  });
  // check distanceShow
  socket.on('distanceShow', function (data) {
    logger.info('distanceShow clicked:', data.message);
    distanceShow();
    // send GameData
    sendGameData();
    // write game data to file
    writeGameDataToFile();
  });

  // counts
  // check countquarter
  socket.on('countquarter', function (data) {
    logger.info('countquarter clicked:', data.message);
    countQuarter();
    // send GameData
    sendGameData();
    // write game data to file
    writeGameDataToFile();
  });

  // check countDowns
  socket.on('countDowns', function (data) {
    logger.info('countDowns clicked:', data.message);
    countDowns();
    // send GameData
    sendGameData();
    // write game data to file
    writeGameDataToFile();
  });

  // check firstDown
  socket.on('firstDown', function (data) {
    logger.info('firstDown clicked:', data.message);
    distanceYards('firstDown');
    // send GameData
    sendGameData();
    // write game data to file
    writeGameDataToFile();
  });
  // check yardsplus10
  socket.on('yardsplus10', function (data) {
    logger.info('yardsplus10 clicked:', data.message);
    distanceYards('yardsplus10');
    // send GameData
    sendGameData();
    // write game data to file
    writeGameDataToFile();
  });
  // check yardsminus10
  socket.on('yardsminus10', function (data) {
    logger.info('yardsminus10 clicked:', data.message);
    distanceYards('yardsminus10');
    // send GameData
    sendGameData();
    // write game data to file
    writeGameDataToFile();
  });
  // check yardsplus5
  socket.on('yardsplus5', function (data) {
    logger.info('yardsplus5 clicked:', data.message);
    distanceYards('yardsplus5');
    // send GameData
    sendGameData();
    // write game data to file
    writeGameDataToFile();
  });
  // check yardsminus5
  socket.on('yardsminus5', function (data) {
    logger.info('yardsminus5 clicked:', data.message);
    distanceYards('yardsminus5');
    // send GameData
    sendGameData();
    // write game data to file
    writeGameDataToFile();
  });
  // check yardsplus1
  socket.on('yardsplus1', function (data) {
    logger.info('yardsplus1 clicked:', data.message);
    distanceYards('yardsplus1');
    // send GameData
    sendGameData();
    // write game data to file
    writeGameDataToFile();
  });
  // check yardsminus1
  socket.on('yardsminus1', function (data) {
    logger.info('yardsminus1 clicked:', data.message);
    distanceYards('yardsminus1');
    // send GameData
    sendGameData();
    // write game data to file
    writeGameDataToFile();
  });

  // check flag
  socket.on('flag', function (data) {
    logger.info('flag clicked:', data.message);
    // set flag
    setflag();
    // write game data to file
    writeGameDataToFile();
  });

  // clock functions
  // reset12Clock
  socket.on('reset12Clock', function (data) {
    logger.info('reset12Clock clicked:', data.message);
    setClock('reset12Clock');
    // send GameData
    sendGameData();
    // write game data to file
    writeGameDataToFile();
  });
  // reset15Clock
  socket.on('reset15Clock', function (data) {
    logger.info('reset15Clock clicked:', data.message);
    setClock('reset15Clock');
    // send GameData
    sendGameData();
    // write game data to file
    writeGameDataToFile();
  });
  // reset30Clock
  socket.on('reset30Clock', function (data) {
    logger.info('reset30Clock clicked:', data.message);
    setClock('reset30Clock');
    // send GameData
    sendGameData();
    // write game data to file
    writeGameDataToFile();
  });
  // plusMinute
  socket.on('plusMinute', function (data) {
    logger.info('plusMinute clicked:', data.message);
    setClock('plusMinute');
    // send GameData
    sendGameData();
    // write game data to file
    writeGameDataToFile();
  });
  // minusMinute
  socket.on('minusMinute', function (data) {
    logger.info('minusMinute clicked:', data.message);
    setClock('minusMinute');
    // send GameData
    sendGameData();
    // write game data to file
    writeGameDataToFile();
  });
  // plus10Second
  socket.on('plus10Second', function (data) {
    logger.info('plus10Second clicked:', data.message);
    setClock('plus10Second');
    // send GameData
    sendGameData();
    // write game data to file
    writeGameDataToFile();
  });
  // minus10Second
  socket.on('minus10Second', function (data) {
    logger.info('minus10Second clicked:', data.message);
    setClock('minus10Second');
    // send GameData
    sendGameData();
    // write game data to file
    writeGameDataToFile();
  });
  // plus1Second
  socket.on('plus1Second', function (data) {
    logger.info('plus1Second clicked:', data.message);
    setClock('plus1Second');
    // send GameData
    sendGameData();
    // write game data to file
    writeGameDataToFile();
  });
  // minus1Second
  socket.on('minus1Second', function (data) {
    logger.info('minus1Second clicked:', data.message);
    setClock('minus1Second');
    // send GameData
    sendGameData();
    // write game data to file
    writeGameDataToFile();
  });
  // resetClock
  socket.on('resetClock', function (data) {
    logger.info('resetClock clicked:', data.message);
    setClock('resetClock');
    // send GameData
    sendGameData();
    // write game data to file
    writeGameDataToFile();
  });
  //startClock
  socket.on('startClock', function (data) {
    logger.info('startClock clicked:', data.message);
    playclockrun = 'start';
    playclockRun();
    // send GameData
    sendGameData();
    // write game data to file
    writeGameDataToFile();
  });
  //stopClock
  socket.on('stopClock', function (data) {
    logger.info('stopClock clicked:', data.message);
    playclockrun = 'stop';
    // send GameData
    sendGameData();
    // write game data to file
    writeGameDataToFile();
  });

  // team setup
  // setupTeam1button
  socket.on('setupTeam1', function (data) {
    logger.info('setupTeam1button clicked:', data);
    // setup teams
    setupTeams(1,data);
    // send GameData
    sendGameData();
    // write game data to file
    writeGameDataToFile();
  });
  // setupTeam2button
  socket.on('setupTeam2', function (data) {
    logger.info('setupTeam2button clicked:', data);
    // setup teams
    setupTeams(2,data);
    // send GameData
    sendGameData();
    // write game data to file
    writeGameDataToFile();
  });

  // team 1
  // check countTimeoutTeam1
  socket.on('countTimeoutTeam1', function (data) {
    logger.info('countTimeoutTeam1 clicked:', data.message);
    timeoutTeam('count','team1');
    // send GameData
    sendGameData();
    // write game data to file
    writeGameDataToFile();
  });
  // check ballbesitzTeam1
  socket.on('ballbesitzTeam1', function (data) {
    logger.info('ballbesitzTeam1 clicked:', data.message);
    ballBesitz('team1');
    // send GameData
    sendGameData();
    // write game data to file
    writeGameDataToFile();
  });
  // check touchdownTeam1
  socket.on('touchdownTeam1', function (data) {
    logger.info('touchdownTeam1 clicked:', data.message);
    touchdownTeam('team1');
    // send GameData
    sendGameData();
    // write game data to file
    writeGameDataToFile();
  });
  // check extrapointTeam1
  socket.on('extrapointTeam1', function (data) {
    logger.info('extrapointTeam1 clicked:', data.message);
    points('extrapointTeam1');
    logger.info('Team 1 points: '+points1);
    // send GameData
    sendGameData();
    // write game data to file
    writeGameDataToFile();
  });
  // check twopointTeam1
  socket.on('twopointTeam1', function (data) {
    logger.info('twopointTeam1 clicked:', data.message);
    twopointTeam('team1');
    // send GameData
    sendGameData();
    // write game data to file
    writeGameDataToFile();
  });
  // check fieldgoalTeam1
  socket.on('fieldgoalTeam1', function (data) {
    logger.info('fieldgoalTeam1 clicked:', data.message);
    fieldgoalTeam('team1');
    // send GameData
    sendGameData();
    // write game data to file
    writeGameDataToFile();
  });
  // check safetyTeam1
  socket.on('safetyTeam1', function (data) {
    logger.info('safetyTeam1 clicked:', data.message);
    safetyTeam('team1');
    // send GameData
    sendGameData();
    // write game data to file
    writeGameDataToFile();
  });
  // check plusTeam1
  socket.on('plusTeam1', function (data) {
    logger.info('plusTeam1 clicked:', data.message);
    points('plusTeam1');
    logger.info('Team 1 points: '+points1);
    // send GameData
    sendGameData();
    // write game data to file
    writeGameDataToFile();
  });
  // check minusTeam1
  socket.on('minusTeam1', function (data) {
    logger.info('minusTeam1 clicked:', data.message);
    points('minusTeam1');
    logger.info('Team 1 points: '+points1);
    // send GameData
    sendGameData();
    // write game data to file
    writeGameDataToFile();
  });
  // check plusTimeoutTeam1
  socket.on('plusTimeoutTeam1', function (data) {
    logger.info('plusTimeoutTeam1 clicked:', data.message);
    timeoutTeam('plus','team1');
    // send GameData
    sendGameData();
    // write game data to file
    writeGameDataToFile();
  });
  // check minusTimeoutTeam1
  socket.on('minusTimeoutTeam1', function (data) {
    logger.info('minusTimeoutTeam1 clicked:', data.message);
    timeoutTeam('minus','team1');
    // send GameData
    sendGameData();
    // write game data to file
    writeGameDataToFile();
  });

  // team 2
  // check countTimeoutTeam2
  socket.on('countTimeoutTeam2', function (data) {
    logger.info('countTimeoutTeam2 clicked:', data.message);
    timeoutTeam('count','team2');
    // send GameData
    sendGameData();
    // write game data to file
    writeGameDataToFile();
  });

  // check ballbesitzTeam2
  socket.on('ballbesitzTeam2', function (data) {
    logger.info('ballbesitzTeam2 clicked:', data.message);
    ballBesitz('team2');
    // send GameData
    sendGameData();
    // write game data to file
    writeGameDataToFile();
  });

  // check touchdownTeam2
  socket.on('touchdownTeam2', function (data) {
    logger.info('touchdownTeam2 clicked:', data.message);
    touchdownTeam('team2');
    // send GameData
    sendGameData();
    // write game data to file
    writeGameDataToFile();
  });
  // check extrapointTeam2
  socket.on('extrapointTeam2', function (data) {
    logger.info('extrapointTeam2 clicked:', data.message);
    points('extrapointTeam2');
    logger.info('Team 1 points: '+points2);
    // send GameData
    sendGameData();
    // write game data to file
    writeGameDataToFile();
  });
  // check twopointTeam2
  socket.on('twopointTeam2', function (data) {
    logger.info('twopointTeam2 clicked:', data.message);
    twopointTeam('team2');
    // send GameData
    sendGameData();
    // write game data to file
    writeGameDataToFile();
  });
  // check fieldgoalTeam2
  socket.on('fieldgoalTeam2', function (data) {
    logger.info('fieldgoalTeam2 clicked:', data.message);
    fieldgoalTeam('team2');
    // send GameData
    sendGameData();
    // write game data to file
    writeGameDataToFile();
  });
  // check safetyTeam2
  socket.on('safetyTeam2', function (data) {
    logger.info('safetyTeam2 clicked:', data.message);
    safetyTeam('team2');
    // send GameData
    sendGameData();
    // write game data to file
    writeGameDataToFile();
  });
  // check plusTeam2
  socket.on('plusTeam2', function (data) {
    logger.info('plusTeam2 clicked:', data.message);
    points('plusTeam2');
    logger.info('Team 2 points: '+points2);
    // send GameData
    sendGameData();
    // write game data to file
    writeGameDataToFile();
  });
  // check minusTeam2
  socket.on('minusTeam2', function (data) {
    logger.info('minusTeam2 clicked:', data.message);
    points('minusTeam2');
    logger.info('Team 2 points: '+points2);
    // send GameData
    sendGameData();
    // write game data to file
    writeGameDataToFile();
  });
  // check plusTimeoutTeam2
  socket.on('plusTimeoutTeam2', function (data) {
    logger.info('plusTimeoutTeam2 clicked:', data.message);
    timeoutTeam('plus','team2');
    // send GameData
    sendGameData();
    // write game data to file
    writeGameDataToFile();
  });
  // check minusTimeoutTeam2
  socket.on('minusTimeoutTeam2', function (data) {
    logger.info('minusTimeoutTeam2 clicked:', data.message);
    timeoutTeam('minus','team2');
    // send GameData
    sendGameData();
    // write game data to file
    writeGameDataToFile();
  });

  // check ballbesitzteamwechsel
  socket.on('ballbesitzwechsel', function (data) {
    logger.info('ballbesitzwechsel clicked:', data.message);
    ballbesitzwechsel();
    // send GameData
    sendGameData();
    // write game data to file
    writeGameDataToFile();
  });

  // bauchbinde buttons
  // check kommentatorenShow
  socket.on('kommentatorenShow', function (data) {
    logger.info('kommentatorenShow clicked:', data.kommentator1, data.kommentator2);
    kommentatorenShow(data);
    // send GameData
    sendGameData();
    // write game data to file
    writeGameDataToFile();
  });
  // check kommentatorenHide
  socket.on('kommentatorenHide', function (data) {
    logger.info('kommentatorenHide clicked');
    kommentatorenHide();
    // send GameData
    sendGameData();
    // write game data to file
    writeGameDataToFile();
  });
  // check bauchbindeTeam1
  socket.on('bauchbindeTeam1', function (data) {
    logger.info('bauchbindeTeam1 clicked:', data.bauchbinde1, data.bauchbinde2);
    bauchbindeShow('team1',data);
    // send GameData
    sendGameData();
    // write game data to file
    writeGameDataToFile();
  });
  // check bauchbindeTeam2
  socket.on('bauchbindeTeam2', function (data) {
    logger.info('bauchbindeTeam2 clicked:', data.bauchbinde1, data.bauchbinde2);
    bauchbindeShow('team2',data);
    // send GameData
    sendGameData();
    // write game data to file
    writeGameDataToFile();
  });
  // check bauchbindeShow
  socket.on('bauchbindeShow', function (data) {
    logger.info('bauchbindeShow clicked:', data.bauchbinde1, data.bauchbinde2);
    bauchbindeShow('noteam',data);
    // send GameData
    sendGameData();
    // write game data to file
    writeGameDataToFile();
  });
  // check bauchbindeHide
  socket.on('bauchbindeHide', function (data) {
    logger.info('bauchbindeHide clicked');
    bauchbindeHide();
    // send GameData
    sendGameData();
    // write game data to file
    writeGameDataToFile();
  });
  // check bauchbindeTeam1player
  socket.on('bauchbindeTeam1player', function (data) {
    logger.info('bauchbindeTeam1player clicked:', data.player);
    bauchbindeShowTeamPlayer('team1',data);
    // send GameData
    sendGameData();
  });
  // check bauchbindeTeam2player
  socket.on('bauchbindeTeam2player', function (data) {
    logger.info('bauchbindeTeam2player clicked:', data.player);
    bauchbindeShowTeamPlayer('team2',data);
    // send GameData
    sendGameData();
  });

  // updateTeam1player
  socket.on('updateTeam1player', function (data) {
    logger.info('updateTeam1player clicked:', data);
    updateTeamPlayer('team1',data);
    // send GameData
    sendGameData();
  });
  // updateTeam2player
  socket.on('updateTeam2player', function (data) {
    logger.info('updateTeam2player clicked:', data);
    updateTeamPlayer('team2',data);
    // send GameData
    sendGameData();
  });

  // updateAllTeamsList
  socket.on('updateAllTeamsList', function (data) {
    logger.info('updateAllTeamsList clicked:', data);
    updateAllTeamsList(data);
    // send GameData
    sendGameData();
  });

  // load game data
  socket.on('loadGamedata', function (data) {
    logger.info('loadGamedata clicked:', data);
    loadGameDataFromFile();
    // send GameData
    sendGameData();
  });

  // field buttons
  // check flipsides
  socket.on('flipsides', function (data) {
    logger.info('flipsides clicked:', data);
    flipSides();
    // send GameData
    sendGameData();
  });

  // --- mouse drawing ---
  socket.on('mouse', function (data) {
    socket.broadcast.emit('mouse', data);
  });
  // --- mouse drawing ---

  // check disconnection
  socket.on('disconnect', function () {
    logger.info('Client connection closed');
    // inform all
    io.emit('announcement', { message: 'One client left.' });
  });
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// live game

// --- our socket connection to send, receive data for statistics ---
// socket timer, send time
function sendTimer (socket) {
  const timer = new Date();
  // Emitting a new message. Will be consumed by the client
  socket.emit("sendTimer", timer);
};
// check socket connection
io.on('connection', function(socket){
  logger.info('Stats Client connection received');
  // when clients connect, inform all clients
  socket.emit('announcement', { message: 'Stats new client joined.' });

  // check interval and clear
  let interval;
  if(interval){
    clearInterval(interval);
  }
  // set interval for every second, call function
  interval = setInterval(() => sendTimer(socket), 1000);

  // check disconnection
  socket.on('disconnect', function () {
    logger.info('Stats Client connection closed');
    // inform all
    io.emit('announcement', { message: 'Stats one client left.' });
    clearInterval(interval);
  });

  // check message
  socket.on('message', function (data) {
    logger.info('Stats message from client:', data.message);
    io.emit('announcement', { message: 'Stats new client message.' });
  });

  // check event
  socket.on('event', function (data) {
    logger.info('Stats event from client:', data.message);
    io.emit('announcement', { message: 'Stats new client event.' });
  });

  /*  // requeststatsdata
  socket.on('requeststatsdata', function (data) {
    logger.info('requeststatsdata', { message: 'Request stats data from client.' });
    sendGUIdata();
    sendGameData();
    sendTeamData();
    sendPlayArray();
    sendLiveGameData();
  });
  */

  // request guiData, send guiData
  socket.on('requestGuiData', function (data) {
    logger.info('requestGuiData', { message: 'Request guiData from client.' });
    sendGUIdata();
  });

  // new playGUIupdate
  socket.on('playGUIupdate', function (data) {
    logger.info('playGUIupdate:', data.item, data.value);
    playGUIupdate(data.item, data.value);
  });

  // get teamlist, send all teams
  socket.on('getTeamList', function (data) {
    logger.info('getTeamList:');
    sendFullTeamList(data);
  });

  // get teamlogos, send all logo filenames from folder
  socket.on('getTeamLogos', function (data) {
    logger.info('getTeamLogos:');
    sendTeamLogos(data.teamjson);
  });

  // get team details from team json, send team details and team logos
  socket.on('getTeamDetails', function (data) {
    logger.info('getTeamDetails:', data.message, data.teamjson);
    sendTeamDetails(data.teamjson);
    sendTeamLogos(data.teamjson);
  });

  // save new team details
  socket.on('saveTeamDetails', function (data) {
    logger.info('saveTeamDetails:', data.message, data.teamjson, data.teamdetails);
    saveTeamDetails(data.teamjson, data.teamdetails);
  });

  // add new team
  socket.on('addNewTeam', function (data) {
    logger.info('addNewTeam:', data.message, data.teamdetails, data.players);
    addNewTeam(data.teamdetails, data.players);
  });

  // delete team
  socket.on('deleteTeam', function (data) {
    logger.info('deleteTeam:', data.message, data.teamjson);
    deleteTeam(data.teamjson);
  });

  // save new team player in team player list
  socket.on('savePlayerDetails', function (data) {
    logger.info('savePlayerDetails:', data.message, data.teamjson, data.players);
    saveTeamPlayers(data.teamjson, data.players);
  });

  // get gamelist
  socket.on('getGameList', function (data) {
    logger.info('getGameList:');
    sendFullGameList(data);
  });

  // save game details for new game
  socket.on('saveGameDetails', function (data) {
    logger.info('saveGameDetails:', data.message, data.gamejson, data.gamedetails);
    saveGameDetails(data.gamejson, data.gamedetails);
  });

  // save players for game details
  socket.on('savePlayerDetailsGame', function (data) {
    logger.info('savePlayerDetailsGame:', data.message, data.gamejson, data.team, data.players);
    savePlayerDetailsGame(data.gamejson, data.team, data.players);
  });

  // get game details
  socket.on('getGameDetails', function (data) {
    logger.info('getGameDetails:', data.message, data.gamejson);
    sendGameDetails(data.gamejson);
  });

  // add new game
  socket.on('addNewGame', function (data) {
    logger.info('addNewGame:', data.message, data.gamedetails);
    addNewGame(data.gamedetails);
  });

  // delete game
  socket.on('deleteGame', function (data) {
    logger.info('deleteGame:', data.message, data.gamejson);
    deleteGame(data.gamejson);
  });

  // declare live game
  socket.on('runningLiveGame', function (data) {
    logger.info('runningLiveGame:', data.message, data.gamejson);
    runningLiveGame(data.gamejson);
  });

  // request liveGameData
  socket.on('requestLiveGameData', function (data) {
    logger.info('requestLiveGameData', { message: 'Request liveGameData from client.' });
    sendLiveGameData();
  });

  // request config
  socket.on('requestConfig', function (data) {
    logger.info('requestConfig', { message: 'Request config from client.' });
    sendConfig();
  });

  // request game details
  socket.on('requestGameDetails', function (data) {
    logger.info('requestGameDetails', { message: 'Request Game Details from client.' });
    sendGameDetails();
  });

  // request team1details
  socket.on('requestTeam1details', function (data) {
    logger.info('requestTeam1details', { message: 'Request team1details from client.' });
    sendTeam1details();
  });

  // request team2details
  socket.on('requestTeam2details', function (data) {
    logger.info('requestTeam2details', { message: 'Request team2details from client.' });
    sendTeam2details();
  });

  // request plays
  socket.on('requestPlays', function (data) {
    logger.info('requestPlays', { message: 'Request plays from client.' });
    sendPlays();
  });

  // request gui
  socket.on('requestGui', function (data) {
    logger.info('requestGui', { message: 'Request gui from client.' });
    sendGui();
  });

  // delete Play
  socket.on('deletePlay', function (data) {
    logger.info('deletePlay', data.message, data.play);
    deletePlay(data.play);
  });

  // edit Play
  socket.on('editPlay', function (data) {
    logger.info('editPlay', data.message, data.play);
    editPlay(data.play);
  });

  // cancel edit Play
  socket.on('cancelEditPlay', function (data) {
    logger.info('cancelEditPlay', data.message, data.play);
    cancelEditPlay();
  });

  // request tableStats
  socket.on('requestTableStats', function (data) {
    logger.info('requestTableStats', { message: 'Request tableStats from client.' });
    sendTableStats();
  });
});

// --- functions for stats ---

// ### initial data setup ###
// store all gui data in object
let guiData = {};
let guiArray = [];
// save quarterback player numbers
let qb1 = '';
let qb2 = '';
// save kicker player numbers
let kicker1 = '';
let kicker2 = '';
// ### save the plays in array ###
// play data objects
let playData = {};
let playArray = [];
let playtext = '';
// last play objects
let lastguiData = {};
// config
let config = {};
// live game data
let liveGameData = {};

// empty stats data object
var teamStats = {};

// ### defined config for the game ###
function defineConfig(){
  let conf = {};
  // start numbering
  conf.actionid = 0;
  conf.playid = 0;
  conf.scoreTouchdown = 6;
  conf.scoreFieldgoal = 3;
  conf.scorePatkick = 1;
  conf.scorePatrun = 2;
  conf.scorePatpass = 2;
  conf.scorePatdefense = 2;
  conf.scoreSafety = 2;
  conf.quarters = 4;
  conf.halftime = 2;
  conf.quarterLength = 12;
  conf.gameDowns = 4;
  conf.firstdownLength = 10;
  conf.kickoffYardline = 35;
  conf.kickoffYardlineAfterSafety = 20;
  conf.kickoffYardlineAfterOutofbounds = 35;
  conf.touchbackYardlineKickoff = 25;
  conf.touchbackYardline = 20;
  conf.patYardline = 3;
  conf.fieldLength = 100;
  conf.gameStartTeam = 'team1';
  conf.startgame = 'cointoss';
  //conf.startgame = 'chooseplay';
  return conf;
}

// ### defined liveGameData for the game ###
function defineLiveGameData(){
// live game data setup
  let livegd = {};
  livegd.gameData = {};
  livegd.config = {};
  livegd.team1details = {};
  livegd.team2details = {};
  livegd.plays = [];
  livegd.gui = [];
  livegd.guiData = {};
  livegd.playData = {};
  livegd.stats = {};
  livegd.team1stats = {};
  livegd.team2stats = {};
  return livegd;
}

// ### defined stats for the game ###
function defineTeamStats(){
  let stats = {
    team1: {
      team: {},
      player: {}
    },
    team2: {
      team: {},
      player: {}
    }
  };
  return stats;
}

config = defineConfig();
liveGameData = defineLiveGameData();
teamStats = defineTeamStats();

// set game config and team stats
liveGameData.config = config;
liveGameData.teamStats = teamStats;

// return setup start of the game
function setupStartGameData(conf = config){
  let dataObject = {};

  // set id
  dataObject.actionid = 1;
  dataObject.playid = 0;

  // set period and drive
  dataObject.period = 1;
  dataObject.drive = 0;

  // set possession team
  dataObject.possession = conf.gameStartTeam;

  // set down/distance
  dataObject.down = 0;
  dataObject.distance = 10;
  // downlos/downlosteam
  dataObject.downlos = conf.fieldLength/2;
  dataObject.downlosteam = conf.gameStartTeam;

  // set offense
  dataObject.offense = conf.gameStartTeam;

  // set LOS from team
  dataObject.los = conf.fieldLength/2;
  dataObject.losteam = conf.gameStartTeam;

  // set ballposition
  dataObject.ballposition = conf.fieldLength/2;
  dataObject.ballpositionteam = conf.gameStartTeam;

  // set next play
  dataObject.actualplay = conf.startgame;

  // create new gui play setup
  dataObject = Object.assign(dataObject, setupNewPlayData(dataObject));

  return dataObject;
}

// setup clean play data in GUI
// define the standard button activation for the plays
function setupCleanPlayData(offense, los, losteam, rusher = ''){
  let defense = oppositeTeam(offense);
  let dataObject = {};

  // button for play selection
  dataObject.play = 'run';
  // button for run selection
  dataObject.runplay = 'handoff';
  // button for run result
  dataObject.rushresult = 'tackle';
  // cleanup rusher and tackler numbers
  dataObject.rusher = rusher;
  dataObject.tackler1 = '';
  dataObject.tackler2 = '';
  dataObject.tackler3 = '';
  // cleanup receiver and interceptedby brokenupby numbers
  dataObject.receiver = '';
  dataObject.interceptedby = '';
  dataObject.brokenupby = '';
  // button for pass result
  dataObject.passplay = 'complete';
  // button for pass result
  dataObject.passresult = 'tackle';
  // clean player for fumble
  dataObject.recovered = '';
  dataObject.forced = '';
  // set fumble recovered team
  dataObject.recoveredteam = offense;
  // set fumble position at los from team
  dataObject.fumble = los;
  dataObject.fumbleteam = losteam;
  // clean player for lateral
  dataObject.lateral = '';
  // set lateral position at los from team
  dataObject.lateralfrom = los;
  dataObject.lateralfromteam = losteam;
  // set punt
  dataObject.punt = 'puntgood';
  dataObject.puntresult = 'returned';
  // set punt to team
  dataObject.punttoteam = defense;
  // set punt blocked
  dataObject.puntrecoveredteam = defense;
  // set fieldgoal
  dataObject.fieldgoal = 'good';
  dataObject.fieldgoalresult = 'returned';
  dataObject.kickteam = offense;
  // set fieldgoal short
  dataObject.returnedbyteam = defense;
  // set fieldgoal blocked
  dataObject.fieldgoalrecoveredteam = defense;
  dataObject.fieldgoalrecoveredatteam = defense;
  // set pat
  dataObject.pat = 'patkick';
  dataObject.patresult = 'good';
  // set penalty
  dataObject.penalty = 'penalty';
  dataObject.penaltyresult = 'repeatdown';
  // set penalty position at los from team
  dataObject.enforced = los;
  dataObject.enforcedteam = losteam;
  // set penalty team
  dataObject.penaltyonteam = defense;

  return dataObject;
}

// clear the guiData object and insert offense and ball position
// remember passer, teams and LOS
function setupNewPlayData(olddata = lastguiData){

  // save quarterback
  let passer = '';
  // check the team for quarterback
  if(olddata.offense && olddata.offense === 'team1'){
    passer = qb1;
  }else if(olddata.offense && olddata.offense === 'team2'){
    passer = qb2;
  }
  // save kicker
  let kicker = '';
  // check the team for kicker
  if(olddata.offense && olddata.offense === 'team1'){
    kicker = kicker1;
  }else if(olddata.offense && olddata.offense === 'team2'){
    kicker = kicker2;
  }
  let rusher = '';
  // check rusher
  if(olddata.rusher && olddata.rusher !== 'undefined'){
    rusher = olddata.rusher;
  }

  let dataObject = {};
  // setup new Data
  dataObject.actionid = olddata.actionid;
  dataObject.playid = olddata.playid;

  // remember period, drive
  dataObject.period = olddata.period;
  dataObject.drive = olddata.drive;

  // remember possession team
  dataObject.possession = olddata.possession;

  // remember down/distance
  dataObject.down = olddata.down;
  dataObject.distance = olddata.distance;
  // remember downlos, team
  dataObject.downlos = olddata.downlos;
  dataObject.downlosteam = olddata.downlosteam;

  // remember teams (offense, defense)
  dataObject.offense = olddata.offense;
  dataObject.defense = oppositeTeam(olddata.offense);

  // remember LOS
  dataObject.los = olddata.los;
  dataObject.losteam = olddata.losteam;
  // remember ball
  dataObject.ballposition = olddata.ballposition;
  dataObject.ballpositionteam = olddata.ballpositionteam;

  // remember player (passer, kicker)
  dataObject.passer = passer;
  dataObject.kicker = kicker;

  // rememer rusher
  dataObject.rusher = rusher;

  // remember edit mode
  dataObject.editmode = olddata.editmode;

  // get clean play setup for GUI based on dataObject
  dataObject = Object.assign(dataObject, setupCleanPlayData(dataObject.offense, dataObject.los, dataObject.losteam, dataObject.rusher));

  return dataObject;
}

// setup start game data
guiData = setupStartGameData(config);

// get playGUIupdate
function playGUIupdate(item, value){
  // set received item from gui to guiData object
  guiData[item] = value;
  // save quarterback player
  saveQuarterback(item, value, guiData.offense);
  // save kicker player
  saveKicker(item, value, guiData.offense);

  // check if enter button is clicked = we have a new action
  // guiData showing the new status of LOS and the players = result of the play
  if(guiData.enter === 'clicked' && guiData.editmode !== 'on'){
    // check if changequarter is selected
    if(guiData.changequarter === 'clicked' && guiData.editmode !== 'on'){
      // check if end of game is achieved
      if(guiData.period === config.quarters){
        // set end of game action
        guiData.actualplay = 'gamefinished';
      }else{
        // set halftime action
        guiData.previousactualplay = guiData.actualplay;
        guiData.actualplay = 'endofperiod';
        // increase period
        guiData.period = guiData.period + 1;
        guiData.increaseperiod = guiData.period;
        playData.increaseperiod = guiData.period;
      }
      // set changequarter back to empty
      guiData.changequarter = '';
    }

    // check if halftime is selected
    if(guiData.halftime === 'clicked' && guiData.editmode !== 'on'){
      // check if end of game is achieved
      if(guiData.period === config.quarters){
        // set end of game action
        guiData.actualplay = 'gamefinished';
      }else{
        // set halftime action
        guiData.actualplay = 'halftime';
        // increase period
        guiData.period = guiData.period + 1;
        guiData.increaseperiod = guiData.period;
        playData.increaseperiod = guiData.period;
      }
      // set halftime back to empty
      guiData.halftime = '';
    }

    // check if gamefinished is selected
    if(guiData.gamefinished === 'clicked' && guiData.editmode !== 'on'){
      // set end of game action
      guiData.actualplay = 'gamefinished';
      // set halftime back to empty
      guiData.gamefinished = '';
    }

    // remember existing playData object as last play
    lastplayData = playData;
    // remember existing guiData as last guiStatus
    lastguiData = (JSON.parse(JSON.stringify(guiData)));

    // add the guiData object to the array, use JSON parse and stringify to create copied object
    guiArray.push(JSON.parse(JSON.stringify(lastguiData)));

    // clean the play data object and text
    playData = {};
    // clean the gui data object
    guiData = {};

    // now we set what action is performed based on gui data buttons
    let guiplay = {};
    // we save the result in object
    guiplay = newAction(lastguiData, playArray);
    // we get the setup for the new GUI returned
    // this is our setup for the next play
    guiData = guiplay.gui;
    // we get the play returned
    // this is the result of the play
    playData = guiplay.play;
    // we get the playText
    playtext = guiplay.playtext.join('');
    // we add to the playData object
    playData.playtext = playtext;

    // add the playData object to the array, use JSON parse and stringify to create copied object
    playArray.push(JSON.parse(JSON.stringify(playData)));

    // send playText to websocket
    sendPlayText();
    // send playData to websocket
    sendPlayData();
    // send playArray to websocket
    sendPlayArray();
    // set enter to blank again
    guiData.enter = '';

    // write to live game data
    // set gui data from Array
    liveGameData.gui = guiArray;
    // set play data from Array
    liveGameData.plays = playArray;
    // set gui Data
    liveGameData.guiData = guiData;
    // set play Data
    liveGameData.playData = playData;
    // read game data and write playtext and stats
    liveGameData = readLiveGame(liveGameData);
    // write live game data to file
    writeLiveGameDataToFile(liveGameData);
    // send live game data
    sendLiveGameData(liveGameData);
    // send table game data
    sendTableStats(liveGameData);
  }

  // check if edit mode changes clicked
  if(guiData.enter === 'clicked' && guiData.editmode === 'on'){
    // remember existing playData object as last play
    lastplayData = playData;
    // remember existing guiData as last guiStatus
    lastguiData = (JSON.parse(JSON.stringify(guiData)));
    // clean the play data object and text
    playData = {};
    // clean the gui data object
    guiData = {};

    // now we set what action is performed based on gui data buttons
    let guiplay = {};
    // we save the result in object
    guiplay = newAction(lastguiData, playArray);
    // we get the play returned
    // this is the result of the play
    playData = guiplay.play;
    // we get the playText
    playtext = guiplay.playtext.join('');
    // we add to the playData object
    playData.playtext = playtext;

    // update the play and gui based on the results
    updatePlay(lastguiData, playData);

    // write to live game data
    // set gui data from Array
    guiArray = liveGameData.gui;
    // set play data from Array
    playArray = liveGameData.plays;
    // set gui Data
    guiData = liveGameData.guiData;
    // set play Data
    playData = liveGameData.playData;
    // read game data and write playtext and stats
    liveGameData = readLiveGame(liveGameData);
    // write live game data to file
    writeLiveGameDataToFile(liveGameData);
    // send live game data
    sendLiveGameData(liveGameData);
    // send table game data
    sendTableStats(liveGameData);
  }
  sendGUIdata();
}

// send json object from stats data
function sendGUIdata(gui = guiData) {
  // send data
  io.emit('sendGUIdata', gui);
}

// send json object from playText data
function sendPlayText(ptext = playtext) {
  // send data
  io.emit('sendPlayText', ptext);
}

// send json object from playData data
function sendPlayData(play = playData) {
  // send data
  io.emit('sendPlayData', play);
}

// send json object from playArray data
function sendPlayArray(pArray = playArray) {
  // send data
  io.emit('sendPlayArray', pArray);
}

// ### play calculations ###
// yards gained
function yardsGained(start, startteam, end, endteam, offense, conf = config){
  let startnr = parseInt(start, 10);
  let endnr = parseInt(end, 10);
  let yards = 0;
  let middle = 50;
  // check middle of field
  if(conf.fieldLength){
    middle = conf.fieldLength/2;
  }

  // check if we have numbers
  if(Number.isInteger(startnr) && Number.isInteger(endnr)){
    // check if start side is offense side
    if(offense === startteam){
      // direction is to other teams side
      // check if teams are identical
      if(startteam === endteam){
        // yards gained = endnr is higher than startnr
        yards = endnr - startnr;
      }else{
        // teams are not identical, going in the other teams direction
        // combine yards from the middle yardline
        yards = middle-endnr + middle-startnr;
      }
    }else{
      // direction is to same teams side
      // check if teams are identical
      if(startteam === endteam){
        // yards gained = startnr is higher thatn endnr
        yards = startnr - endnr;
      }else{
        // teams are not identical, going in the negative direction
        // combine yards to the middle yardline
        yards = startnr-middle + endnr-middle;
      }
    }
  }
  // return gain
  return yards;
}

// ### game actions ###

// save Quarterback players
function saveQuarterback(item, value, team){
  // check if passer is set
  if(item === 'passer'){
    // check the team
    if(team === 'team1'){
      // set actual quarterback number team1
      qb1 = value;
    }else if(team === 'team2'){
      // set actual quarterback number team2
      qb2 = value;
    }
  }
}

// save Kicker players
function saveKicker(item, value, team){
  // check if kicker is set
  if(item === 'kicker'){
    // check the team
    if(team === 'team1'){
      // set actual kicker number team1
      kicker1 = value;
    }else if(team === 'team2'){
      // set actual kicker number team2
      kicker2 = value;
    }
  }
}

// setup kickoffStartData
function kickoffStartData(data = lastguiData, conf = config){
  let dataObject = {};

  // set next play
  dataObject.actualplay = 'kickoff';
  // set kicktype
  dataObject.kicktype = 'kickoff';
  // button for result
  dataObject.kickresult = 'returned';
  // kick position and teamside
  dataObject.from = conf.kickoffYardline;
  dataObject.fromteam = data.kickteam;
  // receive side and team
  dataObject.los = conf.touchbackYardlineKickoff;
  dataObject.losteam = data.receiveteam;
  dataObject.returnedteam = data.receiveteam;
  // set possession
  dataObject.possession = data.kickteam;
  // set LOS
  dataObject.downlos = conf.kickoffYardline;
  dataObject.downlosteam = data.kickteam;
  // set ball
  dataObject.ballposition = conf.kickoffYardline;
  dataObject.ballpositionteam = data.kickteam;

  // count new drive
  dataObject.drive = countNewDrive(data.drive);

  return dataObject;
}

// setup score, kickoffStartData
function ScoreKickoffStartData(data = lastguiData, conf = config){
  let dataObject = {};

  // set next play
  dataObject.actualplay = 'kickoff';
  // set kicktype
  dataObject.kicktype = 'kickoff';
  // button for result
  dataObject.kickresult = 'returned';
  // kickteams
  dataObject.kickteam = data.offense;
  dataObject.receiveteam = oppositeTeam(data.offense);
  // kick position and teamside
  dataObject.from = conf.kickoffYardline;
  dataObject.fromteam = data.offense;
  // receive side and team
  dataObject.los = conf.touchbackYardlineKickoff;
  dataObject.losteam = oppositeTeam(data.offense);
  dataObject.returnedteam = oppositeTeam(data.offense);
  // set empty down/distance
  dataObject.down = 0;
  dataObject.distance = conf.firstdownLength;
  // set LOS
  dataObject.downlos = conf.kickoffYardline;
  dataObject.downlosteam = data.offense;
  // set ball
  dataObject.ballposition = conf.kickoffYardline;
  dataObject.ballpositionteam = data.offense;

  dataObject.possession = data.kickteam;

  // count new drive
  dataObject.drive = countNewDrive(data.drive);

  dataObject.period = data.period;

  return dataObject;
}

// setup Safety, kickoffStartData
function SafetyKickoffStartData(data = lastguiData, conf = config){
  let dataObject = {};

  // set next play
  dataObject.actualplay = 'kickoff';
  // set kicktype
  dataObject.kicktype = 'kickoff';
  // button for result
  dataObject.kickresult = 'returned';
  // kickteams
  dataObject.kickteam = data.offense;
  dataObject.receiveteam = oppositeTeam(data.offense);
  // kick position and teamside
  dataObject.from = conf.kickoffYardlineAfterSafety;
  dataObject.fromteam = data.offense;
  // receive side and team
  dataObject.los = conf.touchbackYardlineKickoff;
  dataObject.losteam = oppositeTeam(data.offense);
  dataObject.returnedteam = oppositeTeam(data.offense);
  // set empty down/distance
  dataObject.down = 0;
  dataObject.distance = conf.firstdownLength;
  // set LOS
  dataObject.downlos = conf.kickoffYardlineAfterSafety;
  dataObject.downlosteam = data.offense;
  // set ball
  dataObject.ballposition = conf.kickoffYardlineAfterSafety;
  dataObject.ballpositionteam = data.offense;

  dataObject.possession = data.kickteam;

  // count new drive
  dataObject.drive = countNewDrive(data.drive);

  return dataObject;
}

// setup Interception, Touchback, StartData
function InterceptionTouchbackStartData(data = lastguiData, conf = config){
  let dataObject = {};

  // set next play
  dataObject.actualplay = 'kickoff';
  // set kicktype
  dataObject.kicktype = 'kickoff';
  // button for result
  dataObject.kickresult = 'returned';
  // kickteams
  dataObject.kickteam = data.offense;
  dataObject.receiveteam = oppositeTeam(data.offense);
  // kick position and teamside
  dataObject.from = conf.touchbackYardline;
  dataObject.fromteam = data.offense;
  // receive side and team
  dataObject.los = conf.touchbackYardline;
  dataObject.losteam = oppositeTeam(data.offense);
  dataObject.returnedteam = oppositeTeam(data.offense);
  // set LOS
  dataObject.downlos = conf.touchbackYardline;
  dataObject.downlosteam = data.offense;
  // set ball
  dataObject.ballposition = conf.touchbackYardline;
  dataObject.ballpositionteam = data.offense;

  dataObject.possession = data.kickteam;

  // count new drive
  dataObject.drive = countNewDrive(data.drive);

  return dataObject;
}

// setup PAT data
function PATStartData(data = lastguiData, conf = config){
  let dataObject = {};

  // set next play
  dataObject.actualplay = 'pat';
  // set pat to kick
  dataObject.pat = 'patkick';
  // set pat result
  dataObject.patresult = 'good';
  // set the los ball position
  dataObject.los = conf.patYardline;
  dataObject.losteam = data.offense;
  // set empty down/distance
  dataObject.down = 0;
  dataObject.distance = conf.patYardline;
  // set LOS
  dataObject.downlos = conf.patYardline;
  dataObject.downlosteam = data.offense;
  // set ball
  dataObject.ballposition = conf.patYardline;
  dataObject.ballpositionteam = data.offense;

  dataObject.possession = data.offense;

  return dataObject;
}

// check team and return opposite team
function oppositeTeam(team){
  if(team === 'team1'){
    return 'team2';
  }else if(team === 'team2'){
    return 'team1';
  }else{
    return null;
  }
}

// get tackler
function getTackler(data = lastguiData){
  let tackler1 = data.tackler1;
  let tackler2 = data.tackler2;
  let tackler3 = data.tackler3;
  let tackler = '';
  // tackler1
  if(tackler1.length > 0){
    tackler = tackler1;
  }
  // tackler2
  if(tackler2.length > 0){
    // check if we have a tackler value already
    if(tackler.length > 0){
      tackler += ',';
    }
    tackler += tackler2;
  }
  // tackler3
  if(tackler3.length > 0){
    // check if we have a tackler value already
    if(tackler.length > 0){
      tackler += ',';
    }
    tackler += tackler3;
  }
  // no tackler
  if(tackler.length === 0){
    tackler = 'Team';
  }
  return tackler;
}

// get player
function getPlayer(player){
  if(!player){
    return 'Team';
  }else if(player.length === 0){
    return 'Team';
  }else{
    return player;
  }
}

// get yardline after kickoff out of bounds
function yardlineAfterOutofbounds(los, losteam, kickteam, conf = config){
  // ball is placed on worst spot
  // either on the defined kickoffYardlineAfterOutofbounds
  // or on the LOS based where the kick was out of bounds
  let losNR = parseInt(los, 10);
  let kickoffYardlineAfterOutofboundsNR = parseInt(conf.kickoffYardlineAfterOutofbounds, 10);
  let position = 0;
  // check if we have numbers
  if(Number.isInteger(losNR) && Number.isInteger(kickoffYardlineAfterOutofboundsNR)){
    // check if the LOS is on the kicking team side
    if(losteam === kickteam){
      // calculate yards to receiving team endzone
      losNR = 50-losNR+50;
    }
    // check what is the higher number
    if(losNR > kickoffYardlineAfterOutofboundsNR){
      position = los;
    }else{
      position = conf.kickoffYardlineAfterOutofbounds;
    }
  }
  return position;
}

// set first down
function setFirstDown(data = lastguiData, conf = config){
  let dataObject = {};

  // set first down
  dataObject.down = 1;

  // check if distance to goalline is for GOAL
  dataObject.distance = checkYardsToGoalline(data.los, data.losteam, data.defense, conf);

  return dataObject;
}

// count new drive
function countNewDrive(drive, conf = config){
  // check existing drive
  if(drive > 0){
    return drive + 1;
  }else{
    // no drive set = first drive
    return 1;
  }
}

// set new down
function setNewDown(yardsGainedNumber, data = lastguiData, changeofpossession = false, conf = config){
  let gui = {};
  let play = {};

  let firstdownreturns = [
    'kickreturn',
    'fieldgoalreturn',
    'puntreturn',
    'patreturn',
    'patkickreturn',
    'intercepted'
  ];
  let nofirstdownplays = ['fumble', 'lateral'];

  // check if this is a first down return play
  if(firstdownreturns.includes(data.actualplay)){
    // next play = first down
    let {down,distance} = setFirstDown(data);
    gui.down = down;
    gui.distance = distance;
    gui.downlos = data.los;
    gui.downlosteam = data.losteam;
    play.newdown = 'First Down';
  }else{
    // check if result of the play is a fumble or lateral = no new down
    if(nofirstdownplays.includes(data.rushresult) || nofirstdownplays.includes(data.passresult)){
      // result of the play is a fumble or lateral = no new down
    }else if(data.down > 0){
      // check yards gained for fumble/lateral return
      if(nofirstdownplays.includes(data.actualplay)){
        // calculate yards
        yardsGainedNumber = yardsGained(data.downlos, data.downlosteam, data.los, data.losteam, data.offense);
      }
      // check if yards gained higher than distance needed = first down
      if(yardsGainedNumber >= data.distance){
        let {down,distance} = setFirstDown(data);
        gui.down = down;
        gui.distance = distance;
        gui.downlos = data.los;
        gui.downlosteam = data.losteam;
        play.newdown = 'First Down';
      }else if(changeofpossession === true){
        // check if change of possession
        let guiplay = changeOfPossession(data);
        gui.downlos = data.los;
        gui.downlosteam = data.losteam;
        gui = Object.assign(gui, guiplay.gui);
        play = Object.assign(play, guiplay.play);
      }else{
        // check if change of possession due to max number of downs achieved
        if(data.down === conf.gameDowns){
          let guiplay = changeOfPossession(data);
          gui.downlos = data.los;
          gui.downlosteam = data.losteam;
          gui = Object.assign(gui, guiplay.gui);
          play = Object.assign(play, guiplay.play);
        }else{
          // increase down to go
          gui.down = Number(data.down) + 1;
          // reduce yards to go
          gui.distance = Number(data.distance) - yardsGainedNumber;
          gui.downlos = data.los;
          gui.downlosteam = data.losteam;
        }
      }
    }else{
      // no down set = first down
      // first down
      let {down,distance} = setFirstDown(data);
      gui.down = down;
      gui.distance = distance;
      gui.downlos = data.los;
      gui.downlosteam = data.losteam;
      play.newdown = 'First Down';
    }
  }

  return {gui,play};
}

// change Of Possession
function changeOfPossession(data = lastguiData, conf = config){
  let gui = {};
  let play = {};

  // change offense
  gui.offense = data.defense;
  gui.defense = oppositeTeam(data.defense);
  gui.possession = oppositeTeam(data.possession);

  // first down
  let {down,distance} = setFirstDown(data);
  gui.down = down;
  gui.distance = distance;
  play.newdown = 'Change of Possession on Downs';

  gui.drive = countNewDrive(data.drive);

  return {gui,play};
}

// check distance to goalline
function checkYardsToGoalline(los, losteam, defense, conf = config){
  let distance = conf.firstdownLength;

  // check if ball is on the defensive ballposition
  if(losteam === defense){
    // check if los is smaller than first down lenght
    if (los <= conf.firstdownLength){
      distance = los;
    }
  }

  return distance;
}

// ##### get new Action #####
// actualplay
function newAction(data = lastguiData, pArray = playArray, conf = config){
  let gui = {};
  let play = {};
  let playtext = [];

  // save the play
  // set the period
  play.period = data.period;
  play.drive = data.drive;
  // set actionid
  play.actionid = data.actionid;
  play.playid = data.playid;
  // save down/distance
  play.down = data.down;
  play.distance = data.distance;
  // save LOS
  play.downlos = data.downlos;
  play.downlosteam = data.downlosteam;
  // save ball
  play.ballposition = data.ballposition;
  play.ballpositionteam = data.ballpositionteam;
  // save teams
  play.offense = data.offense;
  play.defense = data.defense;

  // check playtype
  let guiplay = {};
  switch(data.actualplay) {
    case 'cointoss':
      guiplay = cointoss(data);
      break;

    case 'cointosswinner':
      guiplay = cointosswinner(data);
      break;

    case 'cointossdecision':
      guiplay = cointossdecision(data);
      break;

    case 'cointossdeferdecision':
      guiplay = cointossdeferdecision(data);
      break;

    case 'endofperiod':
      guiplay = endofperiod(data);
      break;

    case 'halftime':
      guiplay = halftime(data);
      break;

    case 'gamefinished':
      guiplay = gamefinished(data);
      break;

    case 'halftimekickteam':
      guiplay = halftimekickteam(data);
      break;

    case 'kickoff':
      guiplay = kickoff(data);
      break;
      
    case 'kickreturn':
      guiplay = kickreturn(data);
      break;
      
    case 'fumble':
      guiplay = fumble(data);
      break;
      
    case 'lateral':
      guiplay = lateral(data);
      break;
      
    case 'chooseplay':
      guiplay = chooseplay(data);
      break;
      
    case 'intercepted':
      guiplay = intercepted(data);
      break;
      
    case 'puntreturn':
      guiplay = puntreturn(data);
      break;
      
    case 'fieldgoalreturn':
      guiplay = fieldgoalreturn(data);
      break;
      
    case 'pat':
      guiplay = pat(data);
      break;
      
    case 'patreturn':
      guiplay = patreturn(data);
      break;
      
    case 'patkickreturn':
      guiplay = patkickreturn(data);
      break;
      
    default:
      //
  }
  gui = Object.assign(gui, guiplay.gui);
  play = Object.assign(play, guiplay.play);
  playtext.push(guiplay.playtext);

  // count actionid
  gui.actionid = data.actionid + 1;

  // count playid, check if next play is a chooseplay
  // this means, the next play is a new play to be counted
  if(gui.actualplay === 'chooseplay'){
    gui.playid = data.playid + 1;
  }else{
    gui.playid = data.playid;
  }

  return {gui, play, playtext};
}

// cointoss
function cointoss(data = lastguiData, conf = config){
  let gui = {};
  let play = {};
  let playtext = [];

  // save the play
  play.action = 'Cointoss';
  playtext.push('Cointoss');
  // set next GUI play based on previous play data
  gui = setupNewPlayData(data);
  gui.cointossteamwinner = conf.gameStartTeam;
  gui.actualplay = 'cointosswinner';

  return {gui, play, playtext};
}

// cointosswinner
function cointosswinner(data = lastguiData){
  let gui = {};
  let play = {};
  let playtext = [];

  // save the play
  play.action = 'Cointoss Winner';
  play.winner = data.cointossteamwinner;
  playtext.push(`Cointoss Winner is ${teamName(play.winner)}`);
  // set next GUI play based on previous play data
  gui = setupNewPlayData(data);
  gui.cointossteamwinner = data.cointossteamwinner;
  gui.actualplay = 'cointossdecision';

  return {gui, play, playtext};
}

// cointossdecision
function cointossdecision(data = lastguiData){
  let gui = {};
  let play = {};
  let playtext = [];

  // save the play
  play.action = 'Cointoss Decision';
  play.winner = data.cointossteamwinner;
  // set next GUI play based on previous play data
  gui = setupNewPlayData(data);

  // check decision
  switch(data.cointossteamdecision){
    case 'kick':
      // save the play
      play.decision = 'Kick';
      play.kickteam = data.cointossteamwinner;
      play.receiveteam = oppositeTeam(data.cointossteamwinner);
      // set gui play - kickteam
      gui.kickteam = data.cointossteamwinner;
      gui.receiveteam = oppositeTeam(data.cointossteamwinner);
      // add kickoff play setup
      gui = Object.assign(gui, kickoffStartData(gui));
      break;

    case 'receive':
      // save the play
      play.decision = 'Receive';
      play.kickteam = oppositeTeam(data.cointossteamwinner);
      play.receiveteam = data.cointossteamwinner;
      // set gui play - kickteam
      gui.kickteam = oppositeTeam(data.cointossteamwinner);
      gui.receiveteam = data.cointossteamwinner;
      // add kickoff play setup
      gui = Object.assign(gui, kickoffStartData(gui));
      break;

    case 'defer':
    // save the play
      play.decision = 'Defer';
      // set next gui play
      gui.cointossteamwinner = data.cointossteamwinner;
      gui.actualplay = 'cointossdeferdecision';
      break;

    default:
      //
  }
  // save play text
  playtext.push(`Cointoss Winner, ${teamName(play.winner)} choose to ${play.decision}`);

  return {gui, play, playtext};
}

// get cointoss deffered decision
function cointossdeferdecision(data = lastguiData){
  let gui = {};
  let play = {};
  let playtext = [];

  // save the play
  play.action = 'Cointoss Defer Decision';
  play.winner = data.cointossteamwinner;
  play.decision = 'Defer';
  // set next GUI play based on previous play data
  gui = setupNewPlayData(data);

  // check decision
  switch(data.cointossteamdeferdecision){
    case 'receive':
      // save the play
      play.deferdecision = 'Receive';
      play.kickteam = data.cointossteamwinner;
      // set next gui play - kickteam
      gui.kickteam = data.cointossteamwinner;
      break;

    case 'kick':
      // save the play
      play.deferdecision = 'Kick';
      play.kickteam = oppositeTeam(data.cointossteamwinner);
      // set next gui play - kickteam
      gui.kickteam = oppositeTeam(data.cointossteamwinner);
      break;

    default:
      //
  }
  // save the play
  play.receiveteam = oppositeTeam(play.kickteam);
  playtext.push(`Cointoss Winner, ${teamName(play.winner)} choose to ${play.decision}, ${teamName(oppositeTeam(play.winner))} choose to ${play.deferdecision}`);
  // set next gui play - receive team
  gui.receiveteam = oppositeTeam(gui.kickteam);
  gui.returnedteam = gui.receiveteam;
  // add kickoff play setup
  gui = Object.assign(gui, kickoffStartData(gui));

  return {gui, play, playtext};
}

// endofperiod
function endofperiod(data = lastguiData){
  let gui = {};
  let play = {};
  let playtext = [];

  // save the play
  play.action = 'End of Period';
  playtext.push(`End of Period`);
  // set next GUI play based on previous play data
  gui = setupNewPlayData(data);
  gui.actualplay = data.previousactualplay;

  return {gui, play, playtext};
}

// halftime
function halftime(data = lastguiData){
  let gui = {};
  let play = {};
  let playtext = [];

  // save the play
  play.action = 'Halftime';
  playtext.push(`Halftime`);
  // set next GUI play based on previous play data
  gui = setupNewPlayData(data);
  gui.actualplay = 'halftimekickteam';

  return {gui, play, playtext};
}

// gamefinished
function gamefinished(data = lastguiData){
  let gui = {};
  let play = {};
  let playtext = [];

  // save the play
  play.action = 'Game Finished';
  playtext.push(`Game Finished`);
  // set next GUI play based on previous play data
  gui = setupNewPlayData(data);
  gui.actualplay = 'gamefinished';

  return {gui, play, playtext};
}

// halftimekickteam
function halftimekickteam(data = lastguiData){
  let gui = {};
  let play = {};
  let playtext = [];

  // save the play
  play.action = 'Kickoff after Halftime';
  // set next GUI play based on previous play data
  gui = setupNewPlayData(data);

  // save the play
  play.kickteam = data.halftimekickteam;
  play.receiveteam = oppositeTeam(data.halftimekickteam);
  // set gui play - kickteam
  gui.kickteam = data.halftimekickteam;
  gui.receiveteam = oppositeTeam(data.halftimekickteam);
  // add kickoff play setup
  gui = Object.assign(gui, kickoffStartData(gui));

  // save play text
  playtext.push(`Kickoff after Halftime`);

  return {gui, play, playtext};
}

// kickoff
function kickoff(data = lastguiData, conf = config){
  let gui = {};
  let play = {};
  let playtext = [];

  // set next GUI
  gui = setupNewPlayData(data);

  // save the play
  play.action = 'Kickoff';
  play.kicker = data.kicker;
  play.kickteam = data.kickteam;
  play.rusher = data.returned;
  play.offense = data.returnedteam;
  play.possession = data.returnedteam;
  play.defense = oppositeTeam(data.offense);
  play.from = data.from;
  play.fromteam = data.fromteam;
  play.los = data.los;
  play.losteam = data.losteam;
  play.ballposition = data.los;
  play.ballpositionteam = data.losteam;
  // check kicktype
  if(data.kicktype === 'onside'){
    play.kicktype = 'Onside Kick';
  }else{
    play.kicktype = 'Kickoff';
  }
  play.kickresult = data.kickresult;
  let yardsKick = yardsGained(data.ballposition, data.ballpositionteam, data.los, data.losteam, data.kickteam);
  play.yardsKick = yardsKick;

  // save gui data
  gui.yardsKick = yardsKick;
  gui.rusher = data.returned;
  gui.offense = data.returnedteam;
  gui.possession = data.returnedteam;
  // save los position
  gui.los = data.los;
  gui.losteam = data.losteam;
  gui.ballposition = data.los;
  gui.ballpositionteam = data.losteam;

  // check kickresult
  // get first down data
  let kickresulttext = '';
  switch(data.kickresult){
    case 'returned':
      // save the play
      kickresulttext = `Catched by ${teamName(data.offense)}, #${data.rusher}`;
      // set next gui play
      gui = setupNewPlayData(gui);
      // set next play and rusher
      gui.actualplay = 'kickreturn';
      break;
    
    case 'faircatch':
      // save the play
      kickresulttext = `Faircatch by ${teamName(data.offense)}, #${data.rusher}`;
      // set next gui play
      gui.rusher = '';
      gui.downlos = gui.ballposition;
      gui.downlosteam = gui.ballpositionteam;
      gui = setupNewPlayData(gui);
      // set first down
      gui = Object.assign(gui, setFirstDown(gui));
      // set next play
      gui.actualplay = 'chooseplay';
      break;

    case 'touchback':
      // save the play
      kickresulttext = `Touchback, Ball`;
      yardsKick = yardsGained(data.from, data.fromteam, 0, data.losteam, data.kickteam);
      // set LOS
      gui.rusher = '';
      gui.los = conf.touchbackYardlineKickoff;
      gui.losteam = gui.offense;
      gui.ballposition = gui.los;
      gui.ballpositionteam = gui.losteam;
      gui.downlos = gui.ballposition;
      gui.downlosteam = gui.ballpositionteam;
      // set next gui play
      gui = setupNewPlayData(gui);
      // set first down
      gui = Object.assign(gui, setFirstDown(gui));
      // set next play
      gui.actualplay = 'chooseplay';
      break;

    case 'outofbounds':
      // save the play
      kickresulttext = 'Out Of Bounds';
      // set LOS
      gui.rusher = '';
      let kickoffOutofboundsYardline = yardlineAfterOutofbounds(data.los,data.losteam,data.kickteam);
      gui.los = kickoffOutofboundsYardline;
      gui.losteam = gui.offense;
      gui.ballposition = gui.los;
      gui.ballpositionteam = gui.losteam;
      gui.downlos = gui.ballposition;
      gui.downlosteam = gui.ballpositionteam;
      // set next gui play
      gui = setupNewPlayData(gui);
      // set first down
      gui = Object.assign(gui, setFirstDown(gui));
      // set next play
      gui.actualplay = 'chooseplay';
      // set penalty
      gui.penalty = 'flag';
      break;

    default:
      //
  }
  // save the play
  playtext.push(`${play.kicktype} by ${teamName(play.kickteam)}, #${play.kicker}, ${kickresulttext} at the ${teamName(play.losteam)} ${play.los} yardline, Kick for ${yardsKick} yards`);

  return {gui, play, playtext};
}

// kickreturn
function kickreturn(data = lastguiData, conf = config){
  let gui = {};
  let play = {};
  let playtext = [];

  // set next GUI
  gui = setupNewPlayData(gui);

  // kickoff return, no new down/distance
  play.down = data.down;
  play.distance = data.distance;
  play.action = 'Kickoff Return';
  play.rusher = data.rusher;
  play.offense = data.offense;
  play.possession = data.possession;
  play.defense = oppositeTeam(data.offense);
  play.los = data.los;
  play.losteam = data.losteam;
  play.yardsGained = yardsGained(data.ballposition, data.ballpositionteam, data.los, data.losteam, data.offense);
  playtext.push(`Kickoff Return, `);
  // set ballposition
  play.ballposition = data.ballposition;
  play.ballpositionteam = data.ballpositionteam;

  // kickreturn is a run play
  let guiplay = rush(data);
  // add result to objects
  gui = Object.assign(gui, guiplay.gui);
  play = Object.assign(play, guiplay.play);
  playtext.push(guiplay.playtext);

  return {gui, play, playtext};
}

// fumble return
function fumble(data = lastguiData, conf = config){
  let gui = {};
  let play = {};
  let playtext = [];

  // fumble return, no new down/distance
  play.down = data.down;
  play.distance = data.distance;
  // set rusher for fumble rush
  play.action = 'Fumble Return';
  play.rusher = data.rusher;
  play.recovered = data.recovered;
  play.recoveredteam = data.recoveredteam;
  play.offense = data.offense;
  play.defense = oppositeTeam(data.offense);
  play.los = data.los;
  play.losteam = data.losteam;
  play.yardsGained = data.yardsGained + yardsGained(data.ballposition, data.ballpositionteam, data.los, data.losteam, data.offense);
  // set ballposition
  play.ballposition = data.ballposition;
  play.ballpositionteam = data.ballpositionteam;

  // fumble return is a run play
  let guiplay = rush(data);
  // add result to objects
  gui = Object.assign(gui, guiplay.gui);
  play = Object.assign(play, guiplay.play);
  playtext.push(guiplay.playtext);

  return {gui, play, playtext};
}

// lateral
function lateral(data = lastguiData, conf = config){
  let gui = {};
  let play = {};
  let playtext = [];

  // lateral, no new down/distance
  play.down = data.down;
  play.distance = data.distance;
  // set rusher
  play.action = 'Lateral';
  play.rusher = data.rusher;
  play.lateral = data.lateral;
  play.offense = data.offense;
  play.defense = oppositeTeam(data.offense);
  play.los = data.los;
  play.losteam = data.losteam;
  play.yardsGained = data.yardsGained + yardsGained(data.ballposition, data.ballpositionteam, data.los, data.losteam, data.offense);
  // set ballposition
  play.ballposition = data.ballposition;
  play.ballpositionteam = data.ballpositionteam;

  // lateral run is a run play
  let guiplay = rush(data);
  // add result to objects
  gui = Object.assign(gui, guiplay.gui);
  play = Object.assign(play, guiplay.play);
  playtext.push(guiplay.playtext);

  return {gui, play, playtext};
}

// intercepted
function intercepted(data = lastguiData, conf = config){
  let gui = {};
  let play = {};
  let playtext = [];

  // interception return, no new down/distance
  play.down = data.down;
  play.distance = data.distance;
  // set rusher for fumble rush
  play.action = 'Interception Return';
  // set ballposition
  play.ballposition = data.ballposition;
  play.ballpositionteam = data.ballpositionteam;

  // interception is a run play
  let guiplay = rush(data);
  // add result to objects
  gui = Object.assign(gui, guiplay.gui);
  play = Object.assign(play, guiplay.play);
  playtext.push(guiplay.playtext);

  return {gui, play, playtext};
}

// fieldgoalreturn
function fieldgoalreturn(data = lastguiData, conf = config){
  let gui = {};
  let play = {};
  let playtext = [];

  // fieldgoal return, no new down/distance
  play.down = gui.down;
  play.distance = gui.distance;
  // set rusher for fumble rush
  play.action = 'Fieldgoal Return';
  // set ballposition
  play.ballposition = gui.ballposition;
  play.ballpositionteam = gui.ballpositionteam;

  // fieldgoalreturn is a run play
  let guiplay = rush(data);
  // add result to objects
  gui = Object.assign(gui, guiplay.gui);
  play = Object.assign(play, guiplay.play);
  playtext.push(guiplay.playtext);

  return {gui, play, playtext};
}

// puntreturn
function puntreturn(data = lastguiData, conf = config){
  let gui = {};
  let play = {};
  let playtext = [];

  // punt return, no new down/distance
  play.down = data.down;
  play.distance = data.distance;
  // set rusher for fumble rush
  play.action = 'Punt Return';
  // set ballposition
  play.ballposition = data.ballposition;
  play.ballpositionteam = data.ballpositionteam;

  // puntreturn is a run play
  let guiplay = rush(data);
  // add result to objects
  gui = Object.assign(gui, guiplay.gui);
  play = Object.assign(play, guiplay.play);
  playtext.push(guiplay.playtext);

  return {gui, play, playtext};
}

// patreturn
function patreturn(data = lastguiData, conf = config){
  let gui = {};
  let play = {};
  let playtext = [];

  // pat return, no new down/distance
  play.down = data.down;
  play.distance = data.distance;
  // set rusher for fumble rush
  play.action = 'PAT Return';
  // set ballposition
  play.ballposition = data.ballposition;
  play.ballpositionteam = data.ballpositionteam;

  // patreturn is a run play
  let guiplay = rush(data);
  // add result to objects
  gui = Object.assign(gui, guiplay.gui);
  play = Object.assign(play, guiplay.play);
  playtext.push(guiplay.playtext);

  return {gui, play, playtext};
}

// patkickreturn
function patkickreturn(data = lastguiData, conf = config){
  let gui = {};
  let play = {};
  let playtext = [];

  gui.runplay = 'pat kick return';
  // pat kick return, no new down/distance
  play.down = data.down;
  play.distance = data.distance;
  // set rusher for fumble rush
  play.action = 'PAT Kick Return';
  // set ballposition
  play.ballposition = data.ballposition;
  play.ballpositionteam = data.ballpositionteam;

  // patkickreturn is a run play
  let guiplay = rush(data);
  // add result to objects
  gui = Object.assign(gui, guiplay.gui);
  play = Object.assign(play, guiplay.play);
  playtext.push(guiplay.playtext);

  return {gui, play, playtext};
}

// chooseplay
function chooseplay(data = lastguiData, conf = config){
  let gui = {};
  let play = {};
  let playtext = [];

  playtext.push(`${data.down} and ${data.distance} on ${teamName(data.ballpositionteam)} ${data.ballposition} yardline: `);
  // check play
  let guiplay = {};
  switch(data.play){
    case 'run':
      play.action = 'Run';
      guiplay = rush(data);
      break;

    case 'pass':
      play.action = 'Pass';
      guiplay = pass(data);
      break;

    case 'punt':
      play.action = 'Punt';
      guiplay = punt(data);
      break;

    case 'fieldgoal':
      play.action = 'Fieldgoal';
      guiplay = fieldgoal(data);
      break;

    case 'penalty':
      play.action = 'Penalty';
      guiplay = penalty(data);
      break;

    default:
      //
  }
  gui = Object.assign(gui, guiplay.gui);
  play = Object.assign(play, guiplay.play);
  playtext.push(guiplay.playtext);

  return {gui, play, playtext};
}

// rush
function rush(data = lastguiData, conf = config){
  let gui = {};
  let play = {};
  let playtext = [];

  play.runplay = data.runplay;
  play.rushresult = data.rushresult;
  play.offense = data.offense;
  play.defense = oppositeTeam(data.offense);
  play.rusher = data.rusher;
  play.los = data.los;
  play.losteam = data.losteam;
  play.possession = data.possession;

  // define variables
  let nextGUI = {};
  let guiplay = {};
  let yardsGainedNumber = 0;
  let changeofpossession = false;

  // get tackler
  play.tackler = getTackler(data);

  // check runplay
  switch(data.runplay){
    case 'sack':
      playtext.push(`Sack (${teamName(data.offense)}, #${data.rusher}), `);
      // check rushresult
      switch(data.rushresult){
        case 'tackle':
          playtext.push(`Sacked by ${teamName(data.defense)}, #${data.tackler} at the ${teamName(data.losteam)} ${data.los} yardline, `);
          yardsGainedNumber = yardsGained(data.ballposition, data.ballpositionteam, data.los, data.losteam, data.offense);
          play.yardsGained = yardsGainedNumber;
          playtext.push(`Yard Loss: ${play.yardsGained}`);
          break;

        case 'safety':
          play.score = 'Safety';
          yardsGainedNumber = yardsGained(data.ballposition, data.ballpositionteam, 0, data.offense, data.offense);
          play.yardsGained = yardsGainedNumber;
          playtext.push(`Sacked by ${teamName(data.defense)}, #${data.tackler}, Result is a Safety`);
          break;

        case 'fumble':
          play.forced = data.forced;
          play.forcedteam = data.defense;
          play.fumble = data.fumble;
          play.fumbleteam = data.fumbleteam;
          play.recovered = data.recovered;
          play.recoveredteam = data.recoveredteam;
          playtext.push(`Sacked by ${teamName(data.defense)}, #${data.forced}, `);
          playtext.push(`Forced Fumble at the ${teamName(data.fumbleteam)} ${data.fumble} yardline, `);
          playtext.push(`Recovered at the ${teamName(data.losteam)} ${data.los} yardline from ${teamName(data.recoveredteam)}, #${data.recovered}, `);
          yardsGainedNumber = yardsGained(data.ballposition, data.ballpositionteam, data.los, data.losteam, data.recoveredteam);
          break;

        default:
          //
      }

    case 'kneeldown':
      playtext.push(`Kneeldown (${teamName(data.offense)}, #${data.rusher}), `);
      // check rushresult
      switch(data.rushresult){
        case 'notackle':
          playtext.push(`Down at the ${teamName(data.losteam)} ${data.los} yardline`);
          yardsGainedNumber = yardsGained(data.ballposition, data.ballpositionteam, data.los, data.losteam, data.offense);
          play.yardsGained = yardsGainedNumber;
          playtext.push(`Yards Gained: ${play.yardsGained}`);
          break;

        case 'safety':
          play.score = 'Safety';
          yardsGainedNumber = yardsGained(data.ballposition, data.ballpositionteam, 0, data.offense, data.offense);
          play.yardsGained = yardsGainedNumber;
          playtext.push(`Result is a Safety`);
          break;

        default:
          //
      }

    default:
      playtext.push(`Rush(${data.runplay}) by ${teamName(data.offense)}, #${data.rusher} from the ${teamName(data.ballpositionteam)} ${data.ballposition} yardline`);
      yardsGainedNumber = yardsGained(data.ballposition, data.ballpositionteam, data.los, data.losteam, data.offense);
      // check rushresult
      switch(data.rushresult){
        case 'tackle':
          playtext.push(` to the ${teamName(data.losteam)} ${data.los} yardline, `);
          playtext.push(`Tackled by ${teamName(data.defense)}, #${play.tackler}, `);
          break;

        case 'notackle':
          playtext.push(` to the ${teamName(data.losteam)} ${data.los} yardline, `);
          playtext.push(`No Tackle, `);
          break;

        case 'outofbounds':
          playtext.push(` to the ${teamName(data.losteam)} ${data.los} yardline, `);
          playtext.push(`Out Of Bounds, `);
          break;

        case 'fumble':
          playtext.push(` to the ${teamName(data.losteam)} ${data.los} yardline, `);
          play.forced = data.forced;
          play.forcedteam = data.defense;
          play.fumble = data.fumble;
          play.fumbleteam = data.fumbleteam;
          play.recovered = data.recovered;
          play.recoveredteam = data.recoveredteam;
          playtext.push(`Fumble at ${teamName(data.fumbleteam)}, #${data.fumble} yardline, Forced by ${teamName(data.defense)}, #${data.forced}, `);
          playtext.push(`Recovered at ${teamName(data.losteam)}, #${data.los} yardline from ${teamName(data.recoveredteam)}, #${data.recovered}, `);
          break;

        case 'safety':
          play.score = 'Safety';
          yardsGainedNumber = yardsGained(data.ballposition, data.ballpositionteam, 0, data.offense, data.offense);
          play.yardsGained = yardsGainedNumber;
          playtext.push(`, Safety, Tackled by ${teamName(data.defense)}, #${play.tackler}, `);
          break;

        case 'lateral':
          playtext.push(` to the ${teamName(data.losteam)} ${data.los} yardline, `);
          // get lateral player
          play.lateral = data.lateral;
          play.lateralteam = data.offense;
          play.lateralfrom = data.lateralfrom;
          play.lateralfromteam = data.lateralfromteam;
          playtext.push(`Lateral at ${teamName(data.lateralfromteam)}, #${data.lateralfrom} yardline, to ${teamName(data.offense)}, #${data.lateral}, `);
          break;

        case 'touchdown':
          play.score = 'Touchdown';
          yardsGainedNumber = yardsGained(data.ballposition, data.ballpositionteam, 0, data.defense, data.offense);
          play.yardsGained = yardsGainedNumber;
          playtext.push(`, Touchdown, `);
          break;

        default:
          //
      }
  }

  let returnplays = ['fumble', 'lateral'];
  // set next gui play
  nextGUI.period = data.period;
  nextGUI.drive = data.drive;
  nextGUI.down = data.down;
  nextGUI.distance = data.distance;
  nextGUI.ballposition = data.los;
  nextGUI.ballpositionteam = data.losteam;
  nextGUI.offense = data.offense;
  nextGUI.los = data.los;
  nextGUI.losteam = data.losteam;
  nextGUI.possession = data.possession;
  switch(data.rushresult){
    case 'tackle':
      // ### set gui status for new play ###
      // check if run is a result of a fumble or lateral
      if(returnplays.includes(data.actualplay)){
        // downlos stays
        nextGUI.downlos = data.downlos;
        nextGUI.downlosteam = data.downlosteam;
      }else{
        // downlos is los
        nextGUI.downlos = data.los;
        nextGUI.downlosteam = data.losteam;
      }
      // set new down
      guiplay = setNewDown(yardsGainedNumber, data);
      nextGUI = Object.assign(nextGUI, guiplay.gui);
      play = Object.assign(play, guiplay.play);
      // new play
      gui = setupNewPlayData(nextGUI);
      // set next play
      gui.actualplay = 'chooseplay'
      break;

    case 'notackle':
      // ### set gui status for new play ###
      // check if run is a result of a fumble or lateral
      if(returnplays.includes(data.actualplay)){
        // downlos stays
        nextGUI.downlos = data.downlos;
        nextGUI.downlosteam = data.downlosteam;
      }else{
        // downlos is los
        nextGUI.downlos = data.los;
        nextGUI.downlosteam = data.losteam;
      }
      // set new down
      guiplay = setNewDown(yardsGainedNumber, data);
      nextGUI = Object.assign(nextGUI, guiplay.gui);
      play = Object.assign(play, guiplay.play);
      // new play
      gui = setupNewPlayData(nextGUI);
      // set next play
      gui.actualplay = 'chooseplay'
      break;  

    case 'outofbounds':
      // ### set gui status for new play ###
      // check if run is a result of a fumble or lateral
      if(returnplays.includes(data.actualplay)){
        // downlos stays
        nextGUI.downlos = data.downlos;
        nextGUI.downlosteam = data.downlosteam;
      }else{
        // downlos is los
        nextGUI.downlos = data.los;
        nextGUI.downlosteam = data.losteam;
      }
      // set new down
      guiplay = setNewDown(yardsGainedNumber, data);
      nextGUI = Object.assign(nextGUI, guiplay.gui);
      play = Object.assign(play, guiplay.play);
      // new play
      gui = setupNewPlayData(nextGUI);
      // set next play
      gui.actualplay = 'chooseplay'
      break;

    case 'fumble':
      // ### set gui status for new play ###
      // check change of possession
      if(data.possession !==  data.recoveredteam){
        changeofpossession = true;
      }
      // set next gui play
      nextGUI.downlos = data.downlos;
      nextGUI.downlosteam = data.downlosteam;
      nextGUI.rusher = data.recovered;
      nextGUI.offense = data.recoveredteam;
      // set new down
      guiplay = setNewDown(yardsGainedNumber, data, changeofpossession);
      nextGUI = Object.assign(nextGUI, guiplay.gui);
      play = Object.assign(play, guiplay.play);
      // new play
      gui = setupNewPlayData(nextGUI);
      // set next play
      gui.actualplay = 'fumble';
      break;

    case 'safety':
      // ### set gui status for new play ###
      // set next gui play
      nextGUI.period = data.period;
      gui = setupNewPlayData(nextGUI);
      // set setup for next play
      gui = Object.assign(gui, SafetyKickoffStartData(data));
      break;

    case 'lateral':
      // ### set gui status for new play ###
      // set next gui play
      nextGUI.downlos = data.downlos;
      nextGUI.downlosteam = data.downlosteam;
      nextGUI.rusher = data.lateral;
      nextGUI.offense = data.offense;
      // set new down
      guiplay = setNewDown(yardsGainedNumber, data);
      nextGUI = Object.assign(nextGUI, guiplay.gui);
      play = Object.assign(play, guiplay.play);
      // new play
      gui = setupNewPlayData(nextGUI);
      // set next play
      gui.actualplay = 'lateral';
      break;

    case 'touchdown':
      // ### set gui status for new play ###
      // set next gui play
      nextGUI.period = data.period;
      gui = setupNewPlayData(nextGUI);
      // set setup for next play
      gui = Object.assign(gui, PATStartData(data));
      break;

    default:
      //
  }

  play.yardsGained = yardsGainedNumber;
  playtext.push(`Yards gained: ${play.yardsGained}`);

  return {gui, play, playtext};
}

// pass
function pass(data = lastguiData, conf = config){
  let gui = {};
  let play = {};
  let playtext = [];

  play.passresult = data.passresult;
  play.passplay = data.passplay;
  play.offense = data.offense;
  play.defense = oppositeTeam(data.offense);
  play.passer = data.passer;
  play.receiver = data.receiver;
  play.losteam = data.losteam;
  play.los = data.los;

  // define variables
  let nextGUI = {};
  let guiplay = {};
  let yardsGainedNumber = 0;
  let changeofpossession = false;

  playtext.push(`Pass from ${teamName(data.offense)}, #${data.passer}, `);

  // set next gui play
  nextGUI.period = data.period;
  nextGUI.drive = data.drive;
  nextGUI.down = data.down;
  nextGUI.distance = data.distance;
  nextGUI.ballposition = data.los;
  nextGUI.ballpositionteam = data.losteam;
  nextGUI.offense = data.offense;
  nextGUI.los = data.los;
  nextGUI.losteam = data.losteam;
  nextGUI.downlos = data.los;
  nextGUI.downlosteam = data.losteam;
  nextGUI.possession = data.possession;
  // get tackler
  play.tackler = getTackler(data);
  // check passplay
  switch(data.passplay){
    case 'complete':
      playtext.push(`Complete, Catched by ${teamName(data.offense)}, #${data.receiver} at the ${teamName(data.losteam)} ${data.los} yardline, `);
      yardsGainedNumber = yardsGained(data.ballposition, data.ballpositionteam, data.los, data.losteam, data.offense);
      // check passresult
      switch(data.passresult){
        case 'tackle':
          playtext.push(`Tackled by ${teamName(data.defense)}, #${play.tackler}, `);
          // ### set gui status for new play ###
          // set new down
          guiplay = setNewDown(yardsGainedNumber, data);
          nextGUI = Object.assign(nextGUI, guiplay.gui);
          play = Object.assign(play, guiplay.play);
          // new play
          gui = setupNewPlayData(nextGUI);
          // set next play
          gui.actualplay = 'chooseplay'
          break;

        case 'notackle':
          playtext.push(`No Tackle, `);
          // ### set gui status for new play ###
          // set new down
          guiplay = setNewDown(yardsGainedNumber, data);
          nextGUI = Object.assign(nextGUI, guiplay.gui);
          play = Object.assign(play, guiplay.play);
          // new play
          gui = setupNewPlayData(nextGUI);
          // set next play
          gui.actualplay = 'chooseplay'
          break;

        case 'outofbounds':
          playtext.push(`Out Of Bounds, `);
          // ### set gui status for new play ###
          // set new down
          guiplay = setNewDown(yardsGainedNumber, data);
          nextGUI = Object.assign(nextGUI, guiplay.gui);
          play = Object.assign(play, guiplay.play);
          // new play
          gui = setupNewPlayData(nextGUI);
          // set next play
          gui.actualplay = 'chooseplay'
          break;

        case 'fumble':
          play.forced = data.forced;
          play.forcedteam = data.defense;
          play.fumble = data.fumble;
          play.fumbleteam = data.fumbleteam;
          play.recovered = data.recovered;
          play.recoveredteam = data.recoveredteam;
          playtext.push(`Fumble at ${teamName(data.fumbleteam)}, #${data.fumble} yardline, Forced by ${teamName(data.defense)}, #${data.forced}, `);
          playtext.push(`Recovered at ${teamName(data.losteam)}, #${data.los} yardline from ${teamName(data.recoveredteam)}, #${data.recovered}, `);
          // ### set gui status for new play ###
          // check change of possession
          if(data.possession !==  data.recoveredteam){
            changeofpossession = true;
          }
          // set next gui play
          nextGUI.downlos = data.downlos;
          nextGUI.downlosteam = data.downlosteam;
          nextGUI.rusher = data.recovered;
          nextGUI.offense = data.recoveredteam;
          // set new down
          guiplay = setNewDown(yardsGainedNumber, data, changeofpossession);
          nextGUI = Object.assign(nextGUI, guiplay.gui);
          play = Object.assign(play, guiplay.play);
          // new play
          gui = setupNewPlayData(nextGUI);
          // set next play
          gui.actualplay = 'fumble';
          break;

        case 'safety':
          play.score = 'Safety';
          yardsGainedNumber = yardsGained(data.ballposition, data.ballpositionteam, 0, data.offense, data.offense);
          play.yardsGained = yardsGainedNumber;
          playtext.push(`Safety, Tackled by ${teamName(data.defense)}, #${play.tackler}, `);
          // ### set gui status for new play ###
          // set next gui play
          nextGUI.period = data.period;
          gui = setupNewPlayData(nextGUI);
          // set setup for next play
          gui = Object.assign(gui, SafetyKickoffStartData(data));
          break;

        case 'lateral':
          // get lateral player
          play.lateral = data.lateral;
          play.lateralteam = data.offense;
          play.lateralfrom = data.lateralfrom;
          play.lateralfromteam = data.lateralfromteam;
          playtext.push(`Lateral at ${teamName(data.lateralfromteam)}, #${data.lateralfrom} yardline, to ${teamName(data.offense)}, #${data.lateral}, `);
          // ### set gui status for new play ###
          // set next gui play
          nextGUI.downlos = data.downlos;
          nextGUI.downlosteam = data.downlosteam;
          nextGUI.rusher = data.lateral;
          nextGUI.offense = data.offense;
          // set new down
          guiplay = setNewDown(yardsGainedNumber, data);
          nextGUI = Object.assign(nextGUI, guiplay.gui);
          play = Object.assign(play, guiplay.play);
          // new play
          gui = setupNewPlayData(nextGUI);
          // set next play
          gui.actualplay = 'lateral';
          break;

        case 'touchdown':
          play.score = 'Touchdown';
          playtext.push(`Touchdown, `);
          yardsGainedNumber = yardsGained(data.ballposition, data.ballpositionteam, 0, data.defense, data.offense);
          play.yardsGained = yardsGainedNumber;
          play.los = '0';
          play.losteam = data.defense;
          // ### set gui status for new play ###
          // set next gui play
          nextGUI.period = data.period;
          gui = setupNewPlayData(nextGUI);
          // set setup for next play
          gui = Object.assign(gui, PATStartData(data));
          break;

        default:
          //
      }
      play.yardsGained = yardsGainedNumber;
      playtext.push(`Yards gained: ${play.yardsGained}`);
      break;

    case 'intercepted':
      playtext.push(`Intended for ${teamName(data.offense)}, #${data.receiver}, `);
      play.interceptedby = data.interceptedby;
      play.interceptedbyteam = data.defense;
      playtext.push(`Intercepted by ${teamName(data.defense)}, #${data.interceptedby}, `);

      nextGUI.rusher = data.interceptedby;
      nextGUI.offense = data.defense;
      changeofpossession = true;

      // check passresult
      switch(data.passresult){
        case 'notackle':
          playtext.push(`at the ${teamName(data.losteam)} ${data.los} yardline`);
          // ### set gui status for new play ###
          // set new down
          guiplay = setNewDown(yardsGainedNumber, data, changeofpossession);
          nextGUI = Object.assign(nextGUI, guiplay.gui);
          play = Object.assign(play, guiplay.play);
          // new play
          gui = setupNewPlayData(nextGUI);
          // set next play
          gui.actualplay = 'intercepted'
          break;

        case 'touchback':
          playtext.push(`Touchback`);
          // ### set gui status for new play ###
          // set new down
          guiplay = setNewDown(yardsGainedNumber, data, changeofpossession);
          nextGUI = Object.assign(nextGUI, guiplay.gui);
          play = Object.assign(play, guiplay.play);
          // new play
          gui = setupNewPlayData(nextGUI);
          // set setup for next play
          gui = Object.assign(gui, InterceptionTouchbackStartData(data.offense));
          break;

        default:
          //
      }
      break;

    case 'thrownaway':
      playtext.push(`Intended for ${teamName(data.offense)}, #${data.receiver}, `);
      playtext.push(`Thrown Away`);
      yardsGainedNumber = 0;
      // check passresult
      switch(data.passresult){
        case 'notackle':
          // ### set gui status for new play ###
          // set new down
          guiplay = setNewDown(yardsGainedNumber, data);
          nextGUI = Object.assign(nextGUI, guiplay.gui);
          play = Object.assign(play, guiplay.play);
          // new play
          gui = setupNewPlayData(nextGUI);
          // set next play
          gui.actualplay = 'chooseplay'
          break;
      
        case 'safety':
          play.score = 'Safety';
          playtext.push(`, Result is a Safety`);
          // ### set gui status for new play ###
          // set next gui play
          nextGUI.period = data.period;
          gui = setupNewPlayData(nextGUI);
          // set setup for next play
          gui = Object.assign(gui, SafetyKickoffStartData(data));
          break;
      }
      break;

    case 'brokenup':
      playtext.push(`Intended for ${teamName(data.offense)}, #${data.receiver}, `);
      play.brokenupby = data.brokenupby;
      play.brokenupbyteam = data.defense;
      playtext.push(`Broken Up by ${teamName(data.defense)}, #${data.brokenupby}`);
      yardsGainedNumber = 0;
      // ### set gui status for new play ###
      // set new down
      guiplay = setNewDown(yardsGainedNumber, data);
      nextGUI = Object.assign(nextGUI, guiplay.gui);
      play = Object.assign(play, guiplay.play);
      // new play
      gui = setupNewPlayData(nextGUI);
      // set next play
      gui.actualplay = 'chooseplay'
      break;

    case 'incomplete':
      playtext.push(`Intended for ${teamName(data.offense)}, #${data.receiver}, `);
      playtext.push(`Incomplete`);
      yardsGainedNumber = 0;
      // ### set gui status for new play ###
      // set new down
      guiplay = setNewDown(yardsGainedNumber, data);
      nextGUI = Object.assign(nextGUI, guiplay.gui);
      play = Object.assign(play, guiplay.play);
      // new play
      gui = setupNewPlayData(nextGUI);
      // set next play
      gui.actualplay = 'chooseplay';
      break;

    case 'uncatchable':
      playtext.push(`Intended for ${teamName(data.offense)}, #${data.receiver}, `);
      playtext.push(`Uncatchable`);
      yardsGainedNumber = 0;
      // ### set gui status for new play ###
      // set new down
      guiplay = setNewDown(yardsGainedNumber, data);
      nextGUI = Object.assign(nextGUI, guiplay.gui);
      play = Object.assign(play, guiplay.play);
      // new play
      gui = setupNewPlayData(nextGUI);
      // set next play
      gui.actualplay = 'chooseplay';
      break;

    case 'dropped':
      playtext.push(`Intended for ${teamName(data.offense)}, #${data.receiver}, `);
      playtext.push(`Dropped`);
      yardsGainedNumber = 0;
      // ### set gui status for new play ###
      // set new down
      guiplay = setNewDown(yardsGainedNumber, data);
      nextGUI = Object.assign(nextGUI, guiplay.gui);
      play = Object.assign(play, guiplay.play);
      // new play
      gui = setupNewPlayData(nextGUI);
      // set next play
      gui.actualplay = 'chooseplay';
      break;

    case 'spiked':
      playtext.push(`Spiked`);
      yardsGainedNumber = 0;
      // ### set gui status for new play ###
      // set new down
      guiplay = setNewDown(yardsGainedNumber, data);
      nextGUI = Object.assign(nextGUI, guiplay.gui);
      play = Object.assign(play, guiplay.play);
      // new play
      gui = setupNewPlayData(nextGUI);
      // set next play
      gui.actualplay = 'chooseplay';
      break;

    default:
      //
  }

  return {gui, play, playtext};
}

// punt
function punt(data = lastguiData, conf = config){
  let gui = {};
  let play = {};
  let playtext = [];

  play.punt = data.punt;
  play.puntresult = data.puntresult;
  play.offense = data.offense;
  play.defense = oppositeTeam(data.offense);
  play.punter = data.punter;
  play.losteam = data.losteam;
  play.los = data.los;
  play.puntto = data.puntto;
  play.punttoteam = data.punttoteam;
  play.returnedby = data.returnedby;

  // define variables
  let nextGUI = {};
  let guiplay = {};
  let yardsGainedNumber = 0;
  let changeofpossession = false;

  // set next gui play
  nextGUI.period = data.period;
  nextGUI.drive = data.drive;
  nextGUI.down = data.down;
  nextGUI.distance = data.distance;
  nextGUI.ballposition = data.los;
  nextGUI.ballpositionteam = data.losteam;
  nextGUI.offense = data.offense;
  nextGUI.los = data.los;
  nextGUI.losteam = data.losteam;

  playtext.push(`Punt from ${teamName(data.offense)}, #${data.punter}, `);
  // check if punt is blocked or good
  switch(data.punt){
    case 'blocked':
      play.blockedby = data.blockedby;
      play.blockedbyteam = data.defense;
      play.puntrecovered = data.puntrecovered;
      play.puntrecoveredteam = data.puntrecoveredteam;
      playtext.push(`Blocked by ${teamName(data.blockedbyteam)}, #${data.blockedby}, `);
      playtext.push(`Recovered by ${teamName(data.puntrecoveredteam)}, #${data.puntrecovered}, `);
      // recovered team gets the ball
      play.returnedby = data.returnedby;
      play.offense = data.puntrecoveredteam;
      play.defense = oppositeTeam(data.offense);
      // setup data for punt blocked
      nextGUI.offense = data.puntrecoveredteam;
      play.returnedby = data.puntrecovered;
      break;

    case 'puntgood':
      playtext.push(`Catched by ${teamName(data.defense)}, #${data.returnedby}, `);
      break;

    default:
      //
  }

  play.yardsPunt = yardsGained(data.ballposition, data.ballpositionteam, data.puntto, data.punttoteam, data.offense);
  // check puntresult
  switch(data.puntresult){
    case 'returned':
      playtext.push(`Return, `);
      playtext.push(`Punt for (${data.yardsPunt} yards), `);
      // ### set gui status for new play ###
      nextGUI.offense = data.defense;
      nextGUI.los = data.puntto;
      nextGUI.losteam = data.punttoteam;
      nextGUI.ballposition = data.puntto;
      nextGUI.ballpositionteam = data.punttoteam;
      nextGUI.rusher = play.returnedby;
      // set new down
      guiplay = setNewDown(yardsGainedNumber, data);
      nextGUI = Object.assign(nextGUI, guiplay.gui);
      play = Object.assign(play, guiplay.play);
      // new play
      gui = setupNewPlayData(nextGUI);
      // set next play
      gui.actualplay = 'puntreturn';
      break;

    case 'downed':
      playtext.push(`Downed, `);
      playtext.push(`Punt for (${data.yardsPunt} yards), `);
      // ### set gui status for new play ###
      nextGUI.offense = data.defense;
      nextGUI.los = data.puntto;
      nextGUI.losteam = data.punttoteam;
      nextGUI.ballposition = data.puntto;
      nextGUI.ballpositionteam = data.punttoteam;
      nextGUI.downlos = data.puntto;
      nextGUI.downlosteam = data.punttoteam;
      changeofpossession = true;
      // set new down
      guiplay = setNewDown(yardsGainedNumber, data, changeofpossession);
      nextGUI = Object.assign(nextGUI, guiplay.gui);
      play = Object.assign(play, guiplay.play);
      // new play
      gui = setupNewPlayData(nextGUI);
      // set next play
      gui.actualplay = 'chooseplay';
  
    case 'faircatch':
      playtext.push(`Faircatch, `);
      playtext.push(`Punt for (${data.yardsPunt} yards), `);
      // ### set gui status for new play ###
      nextGUI.offense = data.defense;
      nextGUI.los = data.puntto;
      nextGUI.losteam = data.punttoteam;
      nextGUI.ballposition = data.puntto;
      nextGUI.ballpositionteam = data.punttoteam;
      nextGUI.downlos = data.puntto;
      nextGUI.downlosteam = data.punttoteam;
      changeofpossession = true;
      // set new down
      guiplay = setNewDown(yardsGainedNumber, data, changeofpossession);
      nextGUI = Object.assign(nextGUI, guiplay.gui);
      play = Object.assign(play, guiplay.play);
      // new play
      gui = setupNewPlayData(nextGUI);
      // set next play
      gui.actualplay = 'chooseplay';
      break;

    case 'touchback':
      playtext.push(`Touchback, `);
      play.yardsPunt = yardsGained(data.los, data.losteam, '0', data.punttoteam, data.offense);
      playtext.push(`Punt for (${play.yardsPunt} yards), `);
      // ### set gui status for new play ###
      nextGUI.offense = data.defense;
      nextGUI.los = config.touchbackYardline;
      nextGUI.losteam = data.defense;
      nextGUI.ballposition = config.touchbackYardline;
      nextGUI.ballpositionteam = data.defense;
      nextGUI.downlos = config.touchbackYardline;
      nextGUI.downlosteam = data.defense;
      changeofpossession = true;
      // set new down
      guiplay = setNewDown(yardsGainedNumber, data, changeofpossession);
      nextGUI = Object.assign(nextGUI, guiplay.gui);
      play = Object.assign(play, guiplay.play);
      // new play
      gui = setupNewPlayData(nextGUI);
      // set next play
      gui.actualplay = 'chooseplay';
      break;

    case 'outofbounds':
      playtext.push(`Out Of Bounds, `);
      playtext.push(`Punt for (${data.yardsPunt} yards), `);
      // ### set gui status for new play ###
      nextGUI.offense = data.defense;
      nextGUI.los = data.puntto;
      nextGUI.losteam = data.punttoteam;
      nextGUI.ballposition = data.puntto;
      nextGUI.ballpositionteam = data.punttoteam;
      nextGUI.downlos = data.puntto;
      nextGUI.downlosteam = data.punttoteam;
      changeofpossession = true;
      // set new down
      guiplay = setNewDown(yardsGainedNumber, data, changeofpossession);
      nextGUI = Object.assign(nextGUI, guiplay.gui);
      play = Object.assign(play, guiplay.play);
      // new play
      gui = setupNewPlayData(nextGUI);
      // set next play
      gui.actualplay = 'chooseplay';
      break;

    default:
      //
  }

  return {gui, play, playtext};
}

// fieldgoal
function fieldgoal(data = lastguiData, conf = config){
  let gui = {};
  let play = {};
  let playtext = [];

  play.fieldgoal = data.fieldgoal;
  play.kicker = data.kicker;
  play.kickerteam = data.offense;
  play.offense = data.offense;
  play.defense = oppositeTeam(data.offense);
  play.losteam = data.losteam;
  play.los = data.los;

  // define variables
  let nextGUI = {};
  let guiplay = {};
  let yardsGainedNumber = 0;
  let changeofpossession = false;

  // set next gui play
  nextGUI.period = data.period;
  nextGUI.drive = data.drive;
  nextGUI.down = data.down;
  nextGUI.distance = data.distance;
  nextGUI.ballposition = data.los;
  nextGUI.ballpositionteam = data.losteam;
  nextGUI.offense = data.offense;
  nextGUI.los = data.los;
  nextGUI.losteam = data.losteam;

  playtext.push(`Field Goal from ${teamName(data.kickerteam)}, #${data.kicker}, `);
  // check fieldgoaltype
  switch(data.fieldgoal){
    case 'short':
      playtext.push(`Short, `);
      // check fieldgoalresult
      switch(data.fieldgoalresult){
        case 'returned':
          play.recoveredby = data.returnedby;
          play.recoveredbyteam = data.defense;
          play.recoveredat = data.recoveredto;
          play.recoveredatteam = data.recoveredtoteam;
          playtext.push(`Recovered from ${teamName(data.defense)}, #${data.recoveredby}, at the ${teamName(data.recoveredatteam)}, #${data.recoveredat} yardline, `);
          yardsGainedNumber = yardsGained(data.ballposition, data.ballpositionteam, data.recoveredat, data.recoveredatteam, offense);
          // ### set gui status for new play ###
          nextGUI.losteam = data.defense;
          nextGUI.offense = data.defense;
          nextGUI.los = data.recoveredto;
          nextGUI.ballposition = data.recoveredto;
          nextGUI.ballpositionteam = data.losteam;
          nextGUI.rusher = data.returnedby;
          // set new down
          guiplay = setNewDown(yardsGainedNumber, data);
          nextGUI = Object.assign(nextGUI, guiplay.gui);
          play = Object.assign(play, guiplay.play);
          // new play
          gui = setupNewPlayData(nextGUI);
          // set next play
          gui.actualplay = 'fieldgoalreturn';
          break;

        case 'downed':
          play.downedby = data.returnedby;
          play.downedbyteam = data.defense;
          play.downedat = data.recoveredto;
          play.downedatteam = data.recoveredtoteam;
          playtext.push(`Downed from ${teamName(data.defense)}, #${data.recoveredby}, at the ${teamName(data.recoveredatteam)}, #${data.recoveredat} yardline, `);
          // ### set gui status for new play ###
          nextGUI.losteam = data.defense;
          nextGUI.offense = data.defense;
          nextGUI.los = conf.touchbackYardline;
          nextGUI.downlos = conf.touchbackYardline;
          nextGUI.downlosteam = data.defense;
          nextGUI.ballposition = conf.touchbackYardline;
          nextGUI.ballpositionteam = data.defense;
          nextGUI.changeofpossession = true;
          // set new down
          guiplay = setNewDown(yardsGainedNumber, data, nextGUI.changeofpossession);
          nextGUI = Object.assign(nextGUI, guiplay.gui);
          play = Object.assign(play, guiplay.play);
          // new play
          gui = setupNewPlayData(nextGUI);
          // set next play
          gui.actualplay = 'chooseplay';
          break;

        default:
          //
      }
      break;
  
    case 'blocked':
      play.blockedby = data.blockedby;
      play.blockedbyteam = data.defense;
      playtext.push(`Blocked from ${teamName(data.defense)}, #${data.blockedby}, `);
      // setup data
      nextGUI.losteam = data.recoveredtoteam;
      nextGUI.offense = data.fieldgoalrecoveredteam;
      nextGUI.defense = oppositeTeam(data.offense);
      // check fieldgoalresult
      switch(data.fieldgoalresult){
        case 'returned':
          play.fieldgoalrecovered = data.fieldgoalrecovered;
          play.fieldgoalrecoveredteam = data.fieldgoalrecoveredteam;
          play.recoveredat = data.recoveredto;
          play.recoveredatteam = data.recoveredtoteam;
          playtext.push(`Recovered from ${teamName(data.fieldgoalrecoveredteam)}, #${data.fieldgoalrecovered}, at the ${teamName(data.recoveredatteam)}, #${data.recoveredat} yardline, `);
          // ### set gui status for new play ###
          nextGUI.losteam = data.defense;
          nextGUI.offense = data.defense;
          nextGUI.defense = data.offense;
          nextGUI.los = data.recoveredto;
          nextGUI.ballposition = data.recoveredto;
          nextGUI.ballpositionteam = data.defense;
          nextGUI.rusher = data.fieldgoalrecovered;
          // set new down
          guiplay = setNewDown(yardsGainedNumber, data);
          nextGUI = Object.assign(nextGUI, guiplay.gui);
          play = Object.assign(play, guiplay.play);
          // new play
          gui = setupNewPlayData(nextGUI);
          // set next play
          gui.actualplay = 'fieldgoalreturn';
          break;

        case 'downed':
          play.downedby = data.fieldgoalrecovered;
          play.downedbyteam = data.fieldgoalrecoveredteam;
          play.downedat = data.recoveredto;
          play.downedatteam = data.recoveredtoteam;
          playtext.push(`Downed from ${teamName(data.downedbyteam)}, #${data.downedby}, at the ${teamName(data.recoveredatteam)}, #${data.recoveredat} yardline, `);
          // ### set gui status for new play ###
          // set first down
          setFirstDown();
          // new play
          setupNewPlayData();
          // setup data
          nextGUI.losteam = data.defense;
          nextGUI.offense = data.defense;
          nextGUI.los = data.recoveredto;
          nextGUI.downlos = data.recoveredto;
          nextGUI.downlosteam = data.defense;
          nextGUI.ballposition = data.recoveredto;
          nextGUI.ballpositionteam = data.defense;
          nextGUI.changeofpossession = true;
          // set new down
          guiplay = setNewDown(yardsGainedNumber, data, nextGUI.changeofpossession);
          nextGUI = Object.assign(nextGUI, guiplay.gui);
          play = Object.assign(play, guiplay.play);
          // new play
          gui = setupNewPlayData(nextGUI);
          // set next play
          gui.actualplay = 'chooseplay';
          break;

        case 'faircatch':
          play.faircatchby = data.fieldgoalrecovered;
          play.faircatchyteam = data.fieldgoalrecoveredteam;
          play.downedat = data.recoveredto;
          play.downedatteam = data.recoveredtoteam;
          playtext.push(`Faircatch from ${teamName(data.faircatchyteam)}, #${data.faircatchby}, at the ${teamName(data.recoveredatteam)}, #${data.recoveredat} yardline, `);
          // ### set gui status for new play ###
          nextGUI.losteam = data.defense;
          nextGUI.offense = data.defense;
          nextGUI.defense = data.offense;
          nextGUI.los = data.recoveredto;
          nextGUI.downlos = data.recoveredto;
          nextGUI.downlosteam = data.defense;
          nextGUI.ballposition = data.recoveredto;
          nextGUI.ballpositionteam = data.defense;
          nextGUI.changeofpossession = true;
          // set new down
          guiplay = setNewDown(yardsGainedNumber, data, nextGUI.changeofpossession);
          nextGUI = Object.assign(nextGUI, guiplay.gui);
          play = Object.assign(play, guiplay.play);
          // new play
          gui = setupNewPlayData(nextGUI);
          // set next play
          gui.actualplay = 'chooseplay';
          break;

        case 'touchback':
          playtext.push(`Touchback`);
          // ### set gui status for new play ###
          nextGUI.losteam = data.defense;
          nextGUI.offense = data.defense;
          nextGUI.defense = data.offense;
          nextGUI.los = conf.touchbackYardline;
          nextGUI.downlos = conf.touchbackYardline;
          nextGUI.downlosteam = data.defense;
          nextGUI.ballposition = conf.touchbackYardline;
          nextGUI.ballpositionteam = data.defense;
          nextGUI.changeofpossession = true;
          // set new down
          guiplay = setNewDown(yardsGainedNumber, data, nextGUI.changeofpossession);
          nextGUI = Object.assign(nextGUI, guiplay.gui);
          play = Object.assign(play, guiplay.play);
          // new play
          gui = setupNewPlayData(nextGUI);
          // set next play
          gui.actualplay = 'chooseplay';
          break;

        case 'outofbounds':
          play.outofbounds = data.recoveredto;
          play.outofboundsteam = data.recoveredtoteam;
          playtext.push(`Out Of Bounds at the ${teamName(data.outofboundsteam)}, #${data.outofbounds} yardline`);
          // ### set gui status for new play ###
          nextGUI.losteam = data.defense;
          nextGUI.offense = data.defense;
          nextGUI.defense = data.offense;
          nextGUI.los = data.recoveredto;
          nextGUI.downlos = data.recoveredto;
          nextGUI.downlosteam = data.defense;
          nextGUI.ballposition = data.recoveredto;
          nextGUI.ballpositionteam = data.defense;
          nextGUI.changeofpossession = true;
          // set new down
          guiplay = setNewDown(yardsGainedNumber, data, nextGUI.changeofpossession);
          nextGUI = Object.assign(nextGUI, guiplay.gui);
          play = Object.assign(play, guiplay.play);
          // new play
          gui = setupNewPlayData(nextGUI);
          // set next play
          gui.actualplay = 'chooseplay';
          break;

        default:
          //
      }
      break;

    case 'wideleft':
      playtext.push(`Wide Left`);
      // ### set gui status for new play ###
      nextGUI.losteam = data.defense;
      nextGUI.offense = data.defense;
      nextGUI.defense = data.offense;
      nextGUI.downlos = data.los;
      nextGUI.downlosteam = data.defense;
      nextGUI.ballposition = data.los;
      nextGUI.ballpositionteam =data. defense;
      nextGUI.changeofpossession = true;
      // set new down
      guiplay = setNewDown(yardsGainedNumber, data, nextGUI.changeofpossession);
      nextGUI = Object.assign(nextGUI, guiplay.gui);
      play = Object.assign(play, guiplay.play);
      // new play
      gui = setupNewPlayData(nextGUI);
      // set next play
      gui.actualplay = 'chooseplay';
      break;

    case 'wideright':
      playtext.push(`Wide Right`);
      // ### set gui status for new play ###
      nextGUI.losteam = data.defense;
      nextGUI.offense = data.defense;
      nextGUI.defense = data.offense;
      nextGUI.downlos = data.los;
      nextGUI.downlosteam = data.defense;
      nextGUI.ballposition = data.los;
      nextGUI.ballpositionteam = data.defense;
      nextGUI.changeofpossession = true;
      // set new down
      guiplay = setNewDown(yardsGainedNumber, data, nextGUI.changeofpossession);
      nextGUI = Object.assign(nextGUI, guiplay.gui);
      play = Object.assign(play, guiplay.play);
      // new play
      gui = setupNewPlayData(nextGUI);
      // set next play
      gui.actualplay = 'chooseplay';
      break;

    case 'good':
      play.score = 'Fieldgoal';
      play.yardsFieldgoal = yardsGained(data.los, data.losteam, '0', data.defense, data.offense);
      playtext.push(`Field Goal GOOD for (${play.yardsFieldgoal} yards), `);
      // ### set gui status for new play ###
      nextGUI.offense = data.defense;
      nextGUI.defense = data.offense;
      // set new down
      guiplay = setNewDown(yardsGainedNumber, data, nextGUI.changeofpossession);
      nextGUI = Object.assign(nextGUI, guiplay.gui);
      play = Object.assign(play, guiplay.play);
      // set setup for next play
      gui = Object.assign(gui, ScoreKickoffStartData(data));
      break;

    default:
      //
  }

  return {gui, play, playtext};
}

// pat
function pat(data = lastguiData, conf = config){
  let gui = {};
  let play = {};
  let playtext = [];

  play.action = 'PAT';
  play.pat = data.pat;
  play.patresult = data.patresult;
  play.offense = data.offense;
  play.defense = oppositeTeam(data.offense);

  // define variables
  let nextGUI = {};
  let guiplay = {};
  let yardsGainedNumber = 0;
  let changeofpossession = false;

  // set next gui play
  nextGUI.period = data.period;
  nextGUI.drive = data.drive;
  nextGUI.down = data.down;
  nextGUI.distance = data.distance;
  nextGUI.ballposition = data.los;
  nextGUI.ballpositionteam = data.losteam;
  nextGUI.offense = data.offense;
  nextGUI.los = data.los;
  nextGUI.losteam = data.losteam;

  playtext.push(`PAT, `);
  // check PAT
  switch(data.pat){
    case 'patkick':
      play.kicker = data.kicker;
      playtext.push(`Kick from ${teamName(data.offense)}, #${data.kicker}, `);
      // check result
      if(data.patresult === 'good'){
        play.score = 'PAT Kick';
        playtext.push(`Kick is Good`);
      }else if(data.patresult === 'nogood'){
        playtext.push(`Kick is No Good`);
      }else if(data.patresult === 'blocked'){
        play.blockedby = data.blockedby;
        play.blockedbyteam = data.defense;
        play.recovered = data.recovered;
        play.recoveredteam = data.recoveredteam;
        playtext.push(`Blocked from ${teamName(data.blockedbyteam)}, #${data.blockedby}, `);
        playtext.push(`Recovered from ${teamName(data.recoveredteam)}, #${data.recovered}, `);
      }
      break;
  
    case 'patrun':
      play.rusher = data.rusher;
      playtext.push(`Run from ${teamName(data.offense)}, #${data.rusher}, `);
      // check result
      if(data.patresult === 'good'){
        play.score = 'PAT Run';
        playtext.push(`Run is Good`);
      }else if(data.patresult === 'nogood'){
        playtext.push(`Run is No Good`);
      }else if(data.patresult === 'fumble'){
        play.forced = data.forced;
        play.recovered = data.recovered;
        play.recoveredteam = data.recoveredteam;
        playtext.push(`Fumbled, Forced by ${teamName(data.defense)}, #${data.blockedby}, `);
        playtext.push(`Recovered from ${teamName(data.recoveredteam)}, #${data.recovered}, `);
      }
      break;

    case 'patpass':
      play.passer = data.passer;
      play.receiver = data.receiver;
      playtext.push(`Pass from ${teamName(data.offense)}, #${data.passer}, `);
      // check result
      if(data.patresult === 'good'){
        play.score = 'PAT Pass';
        playtext.push(`Catched from ${teamName(data.offense)}, #${data.receiver}, `);
        playtext.push(`PAT is Good`);
      }else if(data.patresult === 'nogood'){
        playtext.push(`PAT is No Good`);
      }else if(data.patresult === 'fumble'){
        play.forced = data.forced;
        play.recovered = data.recovered;
        play.recoveredteam = data.recoveredteam;
        playtext.push(`Catched from ${teamName(data.offense)}, #${data.receiver}, `);
        playtext.push(`Fumbled, Forced by ${teamName(data.defense)}, #${data.blockedby}, `);
        playtext.push(`Recovered from ${teamName(data.recoveredteam)}, #${data.recovered}, `);
      }else if(data.patresult === 'intercepted'){
        play.interceptedby = data.interceptedby;
        playtext.push(`Intercepted by ${teamName(data.defense)}, #${data.interceptedby}, `);
      }
      break;

    default:
      //
  }
  // ### set gui status for new play ###
  nextGUI.actualplay = 'kickoff';
  gui = Object.assign(gui, ScoreKickoffStartData(data));

  return {gui, play, playtext};
}

// penalty
function penalty(data = lastguiData, plays = playArray){
  let gui = {};
  let play = {};
  let playtext = [];

  play.penalty = data.penalty;
  play.los = data.los;
  play.losteam = data.losteam;

  // define variables
  let nextGUI = {};
  let guiplay = {};
  let yardsGainedNumber = 0;
  let changeofpossession = false;

  // set next gui play
  nextGUI.period = data.period;
  nextGUI.drive = data.drive;
  nextGUI.down = data.down;
  nextGUI.distance = data.distance;
  nextGUI.ballposition = data.los;
  nextGUI.ballpositionteam = data.losteam;
  nextGUI.offense = data.offense;
  nextGUI.los = data.los;
  nextGUI.losteam = data.losteam;
  nextGUI.possession = data.possession;

  // check penalty
  switch(data.penalty){
    case 'penalty':
    case 'nullifyplay':
      play.penaltyresult = data.penaltyresult;
      play.penaltytype = data.penaltytype;
      play.offense = data.offense;
      play.defense = oppositeTeam(data.offense);
      play.penaltyon = data.penaltyon;
      play.penaltyonteam = data.penaltyonteam;
      play.enforced = data.enforced;
      play.enforcedteam = data.enforcedteam;
      // check nullify
      // count for play before
      let countPlaysBefore = 1;
      if(data.penalty === 'nullifyplay'){
        playtext.push(`Penalty (Nullify Last Play) - ${data.penaltytype}`);
        // get last play before penalty and save nullify
        plays[plays.length - countPlaysBefore].penalty = 'Nullify Play Due To Penalty';
        plays[plays.length - countPlaysBefore].playtext += ', Nullify Play Due To Penalty';

        // loop the previous plays to check if play was a return, then also nullify
        // return plays
        const returnplays = [
          'kickoff return',
          'fieldgoal return',
          'punt return',
          'pat return',
          'pat kick return',
          'interception return',
          'fumble return',
          'lateral'
        ];
        // increase previous play counter to check
        countPlaysBefore += 1;
        while(returnplays.includes(plays[plays.length - countPlaysBefore].runplay)){
          // get play and save nullify
          plays[plays.length - countPlaysBefore].penalty = 'Nullify Play Due To Penalty';
          plays[plays.length - countPlaysBefore].playtext += ', Nullify Play Due To Penalty';
          // increase counter again
          countPlaysBefore += 1;
        }
      }else{
        playtext.push(`Penalty `);
      }
      yardsGainedNumber = yardsGained(data.enforced, data.enforcedteam, data.los, data.losteam, data.offense);
      // check penaltyresult
      switch(data.penaltyresult){
        case 'repeatdown':
          // get player
          play.penaltyplayer = getPlayer(data.penaltyon);
          play.penaltyYards = yardsGainedNumber;
          playtext.push(`by ${teamName(data.penaltyonteam)}, #${play.penaltyplayer} for ${play.penaltyYards} yards, `);
          playtext.push(`Repeat Down`);
          // ### set gui status for new play ###
          // calculate distance, get distance of previous play
          let previousDistance = plays[plays.length - 1].distance;
          nextGUI.distance = previousDistance - yardsGainedNumber;
          play.distance = previousDistance - yardsGainedNumber;
          // count for play before
          nextGUI.losteam = data.losteam;
          nextGUI.offense = data.offense;
          nextGUI.defense = data.defense;
          nextGUI.downlos = data.los;
          nextGUI.downlosteam = data.losteam;
          nextGUI.ballposition = data.los;
          nextGUI.ballpositionteam = data.losteam;
          // check down
          if(data.down === 1){
            // we have first down, no need to change
            nextGUI.down = data.down;
            play.down = data.down;
          }else{
            // delete last down, we repeat the down
            nextGUI.down = data.down - 1;
            play.down = data.down -1;
          }
          // new play
          gui = setupNewPlayData(nextGUI);
          // set next play
          gui.actualplay = 'chooseplay';
          break;

        case 'changedown':
          // get player
          play.penaltyplayer = getPlayer(data.penaltyon);
          play.penaltyYards = yardsGainedNumber;
          playtext.push(`by ${teamName(data.penaltyonteam)}, #${play.penaltyplayer} for ${play.penaltyYards} yards, `);
          playtext.push(`Next Down`);
          // ### set gui status for new play ###
          nextGUI.losteam = data.losteam;
          nextGUI.offense = data.offense;
          nextGUI.defense = data.defense;
          nextGUI.downlos = data.los;
          nextGUI.downlosteam = data.losteam;
          nextGUI.ballposition = data.los;
          nextGUI.ballpositionteam = data.losteam;
          // set new down
          guiplay = setNewDown(yardsGainedNumber, data);
          nextGUI = Object.assign(nextGUI, guiplay.gui);
          play = Object.assign(play, guiplay.play);
          // new play
          gui = setupNewPlayData(nextGUI);
          // set next play
          gui.actualplay = 'chooseplay';
          break;

        case 'firstdown':
          // get player
          play.penaltyplayer = getPlayer(data.penaltyon);
          play.penaltyYards = yardsGainedNumber;
          playtext.push(`by ${teamName(data.penaltyonteam)}, #${play.penaltyplayer} for ${play.penaltyYards} yards, `);
          playtext.push(`First Down`);
          // ### set gui status for new play ###
          nextGUI.losteam = data.losteam;
          nextGUI.offense = data.offense;
          nextGUI.defense = data.defense;
          nextGUI.downlos = data.los;
          nextGUI.downlosteam = data.losteam;
          nextGUI.ballposition = data.los;
          nextGUI.ballpositionteam = data.losteam;
          // set first down
          let {down,distance} = setFirstDown(data);
          nextGUI.down = down;
          nextGUI.distance = distance;
          // new play
          gui = setupNewPlayData(nextGUI);
          // set next play
          gui.actualplay = 'chooseplay';
          break;

        case 'offsetting':
          // get player
          play.penaltyplayer = getPlayer(data.penaltyon);
          playtext.push(`Offsetting Penalty (${teamName(data.penaltyonteam)}, #${play.penaltyplayer})`);
          // ### set gui status for new play ###
          nextGUI.losteam = data.losteam;
          nextGUI.offense = data.offense;
          nextGUI.defense = data.defense;
          nextGUI.downlos = data.los;
          nextGUI.downlosteam = data.losteam;
          nextGUI.ballposition = data.los;
          nextGUI.ballpositionteam = data.losteam;
          // new play
          gui = setupNewPlayData(nextGUI);
          // set next play
          gui.actualplay = 'chooseplay';
          break;

        default:
          //
      }
      break;

    case 'decline':
      playtext.push(`Penalty decline, Play Stands`);
      // ### set gui status for new play ###
      nextGUI.losteam = data.losteam;
      nextGUI.offense = data.offense;
      nextGUI.defense = data.defense;
      nextGUI.downlos = data.los;
      nextGUI.downlosteam = data.losteam;
      nextGUI.ballposition = data.los;
      nextGUI.ballpositionteam = data.losteam;
      // new play
      gui = setupNewPlayData(nextGUI);
      // set next play
      gui.actualplay = 'chooseplay';
      break;

    default:
      //
  }

  return {gui, play, playtext};
}

// ###################################################################
// ###################################################################
// ###################################################################
// ###################################################################
// team and game setup

// read file with promise return
const readFilePromise = (fileName) => {
  return new Promise((resolve, reject) => {
    fs.readFile(fileName, (err, data) => {
      if (err) {
        reject(err)  // calling `reject` will cause the promise to fail with or without the error passed as an argument
        return        // and we don't want to go any further
      }
      resolve(data)
    })
  })
}

// read files in directory with promise return
const readDirectoryPromise = (dirName) => {
  return new Promise((resolve, reject) => {
    fs.readdir(dirName, (err, files) => {
      if (err) {
        reject(err)  // calling `reject` will cause the promise to fail with or without the error passed as an argument
        return        // and we don't want to go any further
      }
      resolve(files)
    })
  })
}

// delete file with promise return
const deleteFilePromise = (fileName) => {
  return new Promise((resolve, reject) => {
    fs.unlink(fileName, (err) => {
      if (err) {
        reject(err)  // calling `reject` will cause the promise to fail with or without the error passed as an argument
        return        // and we don't want to go any further
      }
      resolve(fileName);
    })
  })
}

// write file with promise return
const writeFilePromise = (fileName, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(fileName, JSON.stringify(data, null, 2), (err, data) => {
      if (err) {
        reject(err)
        return
      }
      resolve(data)
    })
  })
}

// read team list and send io
async function sendFullTeamList() {
  let teamArray = [];

  // read files from directory
  let files = await readDirectoryPromise('teams');
  // get all json file names in array
  let teamFilesList = await files.filter(file => path.extname(file).toLowerCase().match('.json'));
  
  // loop array of team files
  for (let teamFile of teamFilesList){
    // read team json file
    let data = await readFilePromise('teams/'+teamFile);
    // parse data into object
    let teamObj = await JSON.parse(data);
    // add the json file name
    teamObj.json = teamFile;
    // add the object to the team array
    teamArray = [...teamArray, teamObj];
  }
  // send array
  io.emit('sendFullTeamList', teamArray);
}

// read team details and send io
const sendTeamDetails = (datajson) => {
  // read team details from provided json file
  readFilePromise('teams/'+datajson)
  .then(teamdetails => {
    // send data
    io.emit('sendTeamDetails', JSON.parse(teamdetails));
  })
  .catch(err => {
    logger.error(err)
  })
}

// get team logos and send io
const sendTeamLogos = (teamjson) => {
  readDirectoryPromise('teams')
  // read files in directory
  .then(files => {
    // filter files, get images
    let imgFiles = files.filter(file => path.extname(file).toLowerCase().match('.png|.jpg|.jpeg'));
    // send data
    io.emit('sendTeamLogos', imgFiles);
  })
  .catch(err => {
    logger.error(err)
  })
}

// save team details within json file
const saveTeamDetails = (teamjson, teamdetails) => {
  // object for team data
  let saveTeamData = {};
  // read team details from provided json file
  readFilePromise('teams/'+teamjson)
  .then(details => {
    // save team data in object
    saveTeamData = JSON.parse(details);
    // update data object
    saveTeamData = Object.assign(saveTeamData, teamdetails);
    // save into file
    writeFilePromise('teams/'+teamjson, saveTeamData)
    .then(() => {
      // send data
      sendTeamDetails(teamjson);
    })
    .catch(err => {
      logger.error(err)
    })
  })
  .catch(err => {
    logger.error(err)
  })
}

// add new team
const addNewTeam = (teamdetails, players) => {
  // object for team data
  let saveTeamData = {};
  let playerList = {
    players: players
  };
  // save team data in object
  saveTeamData = teamdetails;
  // update data object
  saveTeamData = Object.assign(saveTeamData, playerList);

  let teamjson = teamdetails.team_name+'.json';

  // save into file
  writeFilePromise('teams/'+teamjson, saveTeamData)
  .then(() => {
    // send data
    sendTeamDetails(teamjson);
    sendFullTeamList();
  })
  .catch(err => {
    logger.error(err)
  })
}

// delete team
async function deleteTeam(teamjson) {
  await deleteFilePromise('teams/'+teamjson);
  sendFullTeamList();
}

// save team players within json file
const saveTeamPlayers = (teamjson, players) => {
  // object for team data
  let saveTeamData = {};
  // create object for players and add players array
  let playerList = {
    players: players
  };
  // read team details from provided json file
  readFilePromise('teams/'+teamjson)
  .then(teamdetails => {
    // save team data in object
    saveTeamData = JSON.parse(teamdetails);
    // update data object
    saveTeamData = Object.assign(saveTeamData, playerList);
    // save into file
    writeFilePromise('teams/'+teamjson, saveTeamData)
    .then(() => {
      // send data
      sendTeamDetails(teamjson);
    })
    .catch(err => {
      logger.error(err)
    })
  })
  .catch(err => {
    logger.error(err)
  })
}

// save game details
const saveGameDetails = async (gamejson, gamedetails) => {
  // object for game data
  let saveGameData = {};
  // read game details from provided json file
  let details = await readFilePromise('games/'+gamejson);

  // save game data in object
  saveGameData = JSON.parse(details);
  // update data object
  saveGameData = Object.assign(saveGameData, gamedetails);

  // check selected teams
  if(gamedetails.team1json !== '' && !gamedetails.team1details){
    // read team details from provided json file
    let teamdetails = await readFilePromise('teams/'+gamedetails.team1json);
    
    saveGameData.team1details = JSON.parse(teamdetails);
  }

  // check selected teams
  if(gamedetails.team2json !== '' && !gamedetails.team2details){
    // read team details from provided json file
    let teamdetails = await readFilePromise('teams/'+gamedetails.team2json);
    
    saveGameData.team2details = JSON.parse(teamdetails);
  }

  // save into file
  writeFilePromise('games/'+gamejson, saveGameData)
  .then(() => {
    // send data
    sendGameDetails(gamejson);
  })
  .catch(err => {
    logger.error(err)
  })
}

// save players for game details
const savePlayerDetailsGame = async (gamejson, team, players) => {
  console.log(gamejson, team, players);
  // object for game data
  let saveGameData = {};
  // read game details from provided json file
  let details = await readFilePromise('games/'+gamejson);

  // save game data in object
  saveGameData = JSON.parse(details);

  // check selected team is home and details available
  if(team === 'home' && saveGameData.team1details){
    // update players
    saveGameData.team1details.players = players;
  }else if(team === 'guest' && saveGameData.team2details){
    // update players
    saveGameData.team2details.players = players;
  }

  // save into file
  writeFilePromise('games/'+gamejson, saveGameData)
  .then(() => {
    // send data
    sendGameDetails(gamejson);
  })
  .catch(err => {
    logger.error(err)
  })
}

// add new game
const addNewGame = async (gamedetails) => {
  // object for game data
  let saveGameData = gamedetails;
  // save json file name
  let gamejson = gamedetails.gamename+'.json';

  // add start guiData
  saveGameData.guiData = guiData;

  // add start config
  saveGameData.config = config;
  
  // add start guiData
  saveGameData.guiData = setupStartGameData(config);

  // check selected teams and no teamdetails already available
  if(gamedetails.team1json !== '' && !gamedetails.team1details){
    // read team details from provided json file
    let teamdetails = await readFilePromise('teams/'+gamedetails.team1json);
    
    saveGameData.team1details = JSON.parse(teamdetails);
  }

  // check selected teams
  if(gamedetails.team2json !== '' && !gamedetails.team2details){
    // read team details from provided json file
    let teamdetails = await readFilePromise('teams/'+gamedetails.team2json);
    
    saveGameData.team2details = JSON.parse(teamdetails);
  }

  // save into file
  writeFilePromise('games/'+gamejson, saveGameData)
  .then(() => {
    // send data
    sendGameDetails(gamejson);
    sendFullGameList();
  })
  .catch(err => {
    logger.error(err)
  })
}

// delete game
async function deleteGame(gamejson) {
  await deleteFilePromise('games/'+gamejson);
  sendFullGameList();
}

// read game list and send io
async function sendFullGameList() {
  let gameArray = [];

  // read files from directory
  let files = await readDirectoryPromise('games');
  // get all json file names in array
  let gameFilesList = await files.filter(file => path.extname(file).toLowerCase().match('.json'));
  
  // loop array of team files
  for (let gameFile of gameFilesList){
    // read team json file
    let data = await readFilePromise('games/'+gameFile);
    // parse data into object
    let gameObj = await JSON.parse(data);
    // add the json file name
    gameObj.json = gameFile;
    // add the object to the game array
    gameArray = [...gameArray, gameObj];
  }
  // send array
  io.emit('sendFullGameList', gameArray);
}

// read game details and send io
const sendGameDetails = (datajson) => {
  // read game details from provided json file
  readFilePromise('games/'+datajson)
  .then(gamedetails => {
    // send data
    io.emit('sendGameDetails', JSON.parse(gamedetails));
  })
  .catch(err => {
    logger.error(err)
  })
}

// ###################################################################
// ###################################################################
// ###################################################################
// ###################################################################

// send json object from live game data
function sendLiveGameData() {
  // add old gameData
  liveGameData.gameData = gameData;
  // send data
  io.emit('sendLiveGameData', liveGameData);
}

// send json object from config
function sendConfig(conf = config) {
  // send data
  io.emit('sendConfig', conf);
}

// send json object from team1details
function sendTeam1details() {
  let team1details = liveGameData.team1details;
  // send data
  io.emit('sendTeam1details', team1details);
}

// send json object from team2details
function sendTeam2details() {
  let team2details = liveGameData.team2details;
  // send data
  io.emit('sendTeam2details', team2details);
}

// send json object from plays array
function sendPlays() {
  let plays = liveGameData.plays;
  // send data
  io.emit('sendPlays', plays);
}

// send json object from gui array
function sendGui() {
  let gui = liveGameData.gui;
  // send data
  io.emit('sendGui', gui);
}

// write live game data to file
function writeLiveGameDataToFile(lgdata = liveGameData){
  fs.writeFile('games/'+lgdata.json, JSON.stringify(lgdata, null, 4), err => {
    if (err) {
      logger.error(err);
      return
    }
    //file written successfully
  })
}

// declare live game
const runningLiveGame = async (gamejson) => {
  // empty liveGameData
  liveGameData = {};
  // set live game json file
  liveGameData.json = gamejson;

  // read game details from provided json file
  let gamedetails = await readFilePromise('games/'+gamejson);
  
  // add all details from gamedetails to live game data
  liveGameData = Object.assign(liveGameData, JSON.parse(gamedetails));

  // ### check if this is a new game or if we have any game details ###
  // ### check if the needed objects are empty ###
  // check config
  if(liveGameData.config === 'undefined' || Object.keys(liveGameData.config).length === 0){
    // set game config
    liveGameData.config = config;
  }

  // check guiData
  if(liveGameData.guiData === 'undefined' || Object.keys(liveGameData.guiData).length === 0){
    // setup start game data
    guiData = setupStartGameData(config);
    // set guiData
    liveGameData.guiData = guiData;
  }else{
    // guiData available in game details, use guiData
    guiData = liveGameData.guiData;
  }

  // check playArray
  if(Array.isArray(liveGameData.plays)){
    // check playArray is not empty
    if(liveGameData.plays.length){
      // playArray available in game details, use playArray
      playArray = liveGameData.plays;
    }
    else{
      playArray = [];
      // set playArray
      liveGameData.plays = playArray;
    }
  }else{
    // playArray is empty
    playArray = [];
    // set playArray
    liveGameData.plays = playArray;
  }

  // check guiArray
  if(Array.isArray(liveGameData.gui)){
    // check guiArray is not empty
    if(liveGameData.gui.length){
      // guiArray available in game details, use guiArray
      guiArray = liveGameData.gui;
    }
    else{
      guiArray = [];
      // set guiArray
      liveGameData.gui = guiArray;
    }
  }else{
    // guiArray is empty
    guiArray = [];
    // set guiArray
    liveGameData.gui = guiArray;
  }

  sendLiveGameData();
  sendGUIdata();
}

// delete selected play
const deletePlay = (id) => {
  // get the last play of the play array and gui array
  let lastPlay = liveGameData.plays.slice(-1);
  let lastGui = liveGameData.gui.slice(-1);

  // check if we want to delete the last play
  if(lastPlay[0].actionid === id){
    // our lastGui will be the new actual gui
    // set guiData
    liveGameData.guiData = lastGui[0];
  }

  // ### delete the play and gui in arrays ###
  // filter the array of plays in new playarray, remove the play based on id
  let newPlays = liveGameData.plays.filter((play) => play.actionid !== id);
  // set the new array to the game data
  liveGameData.plays = newPlays;

  // filter the array of gui in new guiarray, remove the play based on id
  let newGui = liveGameData.gui.filter((gui) => gui.actionid !== id);
  // add the new array to the game data
  liveGameData.gui = newGui;

  // set new game arrays
  playArray = liveGameData.plays;
  guiArray = liveGameData.gui;
  guiData = liveGameData.guiData;
  // set empty modes
  guiData.editmode = '';
  guiData.enter = '';

  // read game data and write playtext and stats
  liveGameData = readLiveGame(liveGameData);
  // write live game data to file
  writeLiveGameDataToFile(liveGameData);
  // send live game data
  sendLiveGameData(liveGameData);
  // send table game data
  sendTableStats(liveGameData);
  sendGUIdata();
}

// edit selected play
const editPlay = (id) => {
  // filter the array of gui to get the play based on id
  let changeGuiPlay = liveGameData.gui.filter((gui) => gui.actionid === id);

  // set the guiData
  guiData = changeGuiPlay[0];
  // set the edit mode
  guiData.editmode = 'on';
  // set enter clicked off
  guiData.enter = '';

  sendGUIdata(guiData);
}

// cancel edit play mpde
const cancelEditPlay = () => {
  // just call the game file load
  runningLiveGame(liveGameData.json);
}

// update edited selected play
const updatePlay = (lastguiData, playData) => {
  // filter the array of gui to get the play based on id
  let indexGui = liveGameData.gui.findIndex((gui) => gui.actionid === lastguiData.actionid);

  // insert the guiData in the found slot with splice
  liveGameData.gui.splice(indexGui, 1, lastguiData);

  // filter the array of plays to get the play based on id
  let indexPlay = liveGameData.plays.findIndex((play) => play.actionid === playData.actionid);

  // insert the guiData in the found slot with splice
  liveGameData.plays.splice(indexPlay, 1, playData);
}

// ###################################################################
// ###################################################################
// ###################################################################
// ###################################################################
// stats parsing

// round the number
function roundNumber(number,decimals = 1){
  // round to one decimal
  // toFixed return string with # decimals
  // parseFloat makes number again
  return parseFloat((number).toFixed(decimals));
}

// get team name
function teamName(team){
  if(team === 'team1'){
    return liveGameData.team1;
  }else if(team === 'team2'){
    return liveGameData.team2;
  }else{
    return null;
  }
}

// declare live game
const readLiveGame = (liveGameData) => {
  let teamStats = {
    team1: {
      team: {},
      player: {}
    },
    team2: {
      team: {},
      player: {}
    }
  };
  let playtext = [];

  // loop plays
  liveGameData.plays.forEach((play,index) => {
    // read action
    let resultObject = readAction(teamStats,play);
    // check if the play was nullified by penalty
    if(play.penalty){
      // add penalty, don't count stats
      resultObject.playtext.push('; ');
      resultObject.playtext.push(play.penalty);
    }else{
      // write team stats
      teamStats = Object.assign(teamStats, resultObject.teamStats);
    }
    // get playtext as one line, change in plays array
    liveGameData.plays[index].playtext = resultObject.playtext.join('');
    // push the playtext line into array
    playtext.push(resultObject.playtext.join(''));
  });

  // calculate averages
  let resultAverages = calculateAverages(teamStats);
  // write team stats
  teamStats = Object.assign(teamStats, resultAverages);

  // set teamStats
  liveGameData.teamStats = teamStats;

  return liveGameData;
}

// ##### get new Action #####
// actualplay
function readAction(teamStats, play){
  let resultObject = {};

  // check playtype
  switch(play.action) {
    case 'Cointoss':
      resultObject = readCointoss(teamStats, play);
      break;

    case 'Cointoss Winner':
      resultObject = readCointosswinner(teamStats, play);
      break;

    case 'Cointoss Decision':
      resultObject = readCointossdecision(teamStats, play);
      break;

    case 'Cointoss Defer Decision':
      resultObject = readCointossdeferdecision(teamStats, play);
      break;

    case 'End of Period':
      resultObject = readEndofperiod(teamStats, play);
      break;

    case 'Halftime':
      resultObject = readHalftime(teamStats, play);
      break;

    case 'Game Finished':
      resultObject = readGamefinished(teamStats, play);
      break;

    case 'Kickoff':
    case 'Kickoff after Halftime':
      resultObject = readKickoff(teamStats, play);
      break;
      
    case 'Kickoff Return':
      resultObject = readKickreturn(teamStats, play);
      break;
      
    case 'Fumble Return':
      resultObject = readFumble(teamStats, play);
      break;
      
    case 'Lateral':
      resultObject = readLateral(teamStats, play);
      break;
      
    case 'Interception Return':
      resultObject = readIntercepted(teamStats, play);
      break;
      
    case 'Punt Return':
      resultObject = readPuntreturn(teamStats, play);
      break;
      
    case 'Fieldgoal Return':
      resultObject = readFieldgoalreturn(teamStats, play);
      break;
      
    case 'PAT':
      resultObject = readPAT(teamStats, play);
      break;
      
    case 'PAT Return':
      resultObject = readPATreturn(teamStats, play);
      break;
      
    case 'PAT Kick Return':
      resultObject = readPATkickreturn(teamStats, play);
      break;
      
    default:
      resultObject = readChooseplay(teamStats, play);
      //
  }

  return resultObject;
}

// cointoss
function readCointoss(teamStats, play){
  let playtext = [];

  playtext.push('Cointoss');

  return {playtext, teamStats};
}

// cointosswinner
function readCointosswinner(teamStats, play){
  let playtext = [];

  playtext.push(`Cointoss Winner is ${teamName(play.winner)}`);

  teamStats = Object.assign(teamStats, saveTeamValue(teamStats, play.winner, 'cointoss', 'winner'));

  return {playtext, teamStats};
}

// cointossdecision
function readCointossdecision(teamStats, play){
  let playtext = [];

  playtext.push(`Cointoss Winner, ${teamName(play.winner)} choose to ${play.decision}`);

  teamStats = Object.assign(teamStats, saveTeamValue(teamStats, play.winner, 'cointossdecision', play.decision));

  return {playtext, teamStats};
}

// get cointoss deffered decision
function readCointossdeferdecision(teamStats, play){
  let playtext = [];

  playtext.push(`Cointoss Winner, ${teamName(play.winner)} choose to ${play.decision}, ${teamName(oppositeTeam(play.winner))} choose to ${play.deferdecision}`);

  teamStats = Object.assign(teamStats, saveTeamValue(teamStats, oppositeTeam(play.winner), 'cointossdeferdecision', play.deferdecision));

  return {playtext, teamStats};
}

// endofperiod
function readEndofperiod(teamStats, play){
  let playtext = [];

  playtext.push(`End of Period`);

  return {playtext, teamStats};
}

// halftime
function readHalftime(teamStats, play){
  let playtext = [];

  playtext.push(`Halftime`);

  return {playtext, teamStats};
}

// gamefinished
function readGamefinished(teamStats, play){
  let playtext = [];

  playtext.push(`Game Finished`);

  return {playtext, teamStats};
}

// kickoff
function readKickoff(teamStats, play){
  let playtext = [];
  let kickresulttext = '';

  // check rusher available
  if(!play.rusher || play.rusher === ''){play.rusher = 'unknown'}
  // check kicker available
  if(!play.kicker || play.kicker === ''){play.kicker = 'unknown'}

  switch(play.kickresult){
    case 'returned':
      kickresulttext = `Catched by ${teamName(play.offense)}, #${play.rusher}`;
      break;
    
    case 'faircatch':
      kickresulttext = `Faircatch by ${teamName(play.offense)}, #${play.rusher}`;
      break;

    case 'touchback':
      kickresulttext = `Touchback, Ball`;
      break;

    case 'outofbounds':
      kickresulttext = 'Out Of Bounds';
      break;

    default:
      //
  }
  playtext.push(`${play.kicktype} by ${teamName(play.kickteam)}, #${play.kicker}, ${kickresulttext} at the ${teamName(play.losteam)} ${play.los} yardline, Kick for ${play.yardsKick} yards`);
  // count player
  teamStats = Object.assign(teamStats, countPlayer(teamStats, play.kickteam, play.kicker, play.kicktype, 'kickingyards', 'longestkick', play.yardsKick, play.period));
  teamStats = Object.assign(teamStats, countTeam(teamStats, play.kickteam, play.kicktype, 'kickingyards', 'longestkick', play.yardsKick, play.period));

  return {playtext, teamStats};
}

// kickreturn
function readKickreturn(teamStats, play){
  let playtext = [];

  playtext.push(`Kickoff Return, `);

  play.rushtype = 'kickoffreturn';

  let resultObject = {};
  resultObject = readRush(teamStats,play);
  playtext.push(resultObject.playtext);
  teamStats = Object.assign(teamStats, resultObject.teamStats);

  return {playtext, teamStats};
}

// fumble return
function readFumble(teamStats, play){
  let playtext = [];

  playtext.push(`Fumble Return, `);

  play.rushtype = 'fumblereturn';

  let resultObject = {};
  resultObject = readRush(teamStats,play);
  playtext.push(resultObject.playtext);
  teamStats = Object.assign(teamStats, resultObject.teamStats);

  return {playtext, teamStats};
}

// lateral
function readLateral(teamStats, play){
  let playtext = [];

  playtext.push(`Lateral, `);

  let resultObject = {};
  resultObject = readRush(teamStats,play);
  playtext.push(resultObject.playtext);
  teamStats = Object.assign(teamStats, resultObject.teamStats);

  return {playtext, teamStats};
}

// intercepted
function readIntercepted(teamStats, play){
  let playtext = [];

  playtext.push(`Interception Return, `);

  play.rushtype = 'interceptionreturn';

  let resultObject = {};
  resultObject = readRush(teamStats,play);
  playtext.push(resultObject.playtext);
  teamStats = Object.assign(teamStats, resultObject.teamStats);

  return {playtext, teamStats};
}

// fieldgoalreturn
function readFieldgoalreturn(teamStats, play){
  let playtext = [];

  playtext.push(`Field Goal Return, `);

  play.rushtype = 'fieldgoalreturn';

  let resultObject = {};
  resultObject = readRush(teamStats,play);
  playtext.push(resultObject.playtext);
  teamStats = Object.assign(teamStats, resultObject.teamStats);

  return {playtext, teamStats};
}

// puntreturn
function readPuntreturn(teamStats, play){
  let playtext = [];

  playtext.push(`Punt Return, `);

  play.rushtype = 'puntreturn';

  let resultObject = {};
  resultObject = readRush(teamStats,play);
  playtext.push(resultObject.playtext);
  teamStats = Object.assign(teamStats, resultObject.teamStats);

  return {playtext, teamStats};
}

// patreturn
function readPATreturn(teamStats, play){
  let playtext = [];

  playtext.push(`PAT Return, `);

  play.rushtype = 'patreturn';

  let resultObject = {};
  resultObject = readRush(teamStats,play);
  playtext.push(resultObject.playtext);
  teamStats = Object.assign(teamStats, resultObject.teamStats);

  return {playtext, teamStats};
}

// patkickreturn
function readPATkickreturn(teamStats, play){
  let playtext = [];

  playtext.push(`PAT Kick Return, `);

  play.rushtype = 'patkickreturn';

  let resultObject = {};
  resultObject = readRush(teamStats,play);
  playtext.push(resultObject.playtext);
  teamStats = Object.assign(teamStats, resultObject.teamStats);

  return {playtext, teamStats};
}

// chooseplay
function readChooseplay(teamStats, play){
  let resultObject = {};
  let playtext = [];

  playtext.push(`${play.down} and ${play.distance} on ${teamName(play.ballpositionteam)} ${play.ballposition} yardline: `);
  switch(play.action){
    case 'Run':
      resultObject = readRush(teamStats,play);
      break;

    case 'Pass':
      resultObject = readPass(teamStats,play);
      break;

    case 'Punt':
      resultObject = readPunt(teamStats,play);
      break;

    case 'Fieldgoal':
      resultObject = readFieldgoal(teamStats,play);
      break;

    case 'Penalty':
      resultObject = readPenalty(teamStats,play);
      break;

    default:
      //
  }
  playtext.push(resultObject.playtext);
  teamStats = Object.assign(teamStats, resultObject.teamStats);

  return {playtext, teamStats};
}

// rush
function readRush(teamStats, play){
  let playtext = [];

  // check rusher available
  if(!play.rusher || play.rusher === ''){play.rusher = 'unknown'}
  // check tackler available
  if(!play.tackler || play.tackler === ''){play.tackler = 'team'}

  // check runplay
  switch(play.runplay){
    case 'sack':
      playtext.push(`Sack (${teamName(play.offense)}, #${play.rusher}), `);
      // check rushresult
      switch(play.rushresult){
        case 'tackle':
          playtext.push(`Sacked by ${teamName(play.defense)}, #${play.tackler} at the ${teamName(play.losteam)} ${play.los} yardline, `);
          playtext.push(`Yard Loss: ${play.yardsGained}`);
          // count defense
          teamStats = Object.assign(teamStats, countTackler(teamStats, play.defense, play.tackler, 'tackle', '', '', play.yardsGained, play.period));
          teamStats = Object.assign(teamStats, countTackleTeam(teamStats, play.defense, 'tackle', '', '', play.yardsGained, play.period));
          break;

        case 'safety':
          playtext.push(`Sacked by ${teamName(play.defense)}, #${play.tackler}, Result is a Safety`);
          // count defense
          teamStats = Object.assign(teamStats, countTackler(teamStats, play.defense, play.tackler, 'forcedsafety', '', '', play.yardsGained, play.period));
          teamStats = Object.assign(teamStats, countTackleTeam(teamStats, play.defense, 'forcedsafety', '', '', play.yardsGained, play.period));
          // count points
          teamStats = Object.assign(teamStats, saveTeamScore(teamStats, play.defense, 'safety', 2, play.period));
          break;

        case 'fumble':
          playtext.push(`Sacked by ${teamName(play.defense)}, #${play.forced}, `);
          playtext.push(`Forced Fumble at the ${teamName(play.fumbleteam)} ${play.fumble} yardline, `);
          playtext.push(`Recovered at the ${teamName(play.losteam)} ${play.los} yardline from ${teamName(play.recoveredteam)}, #${play.recovered}, `);
          // count offense fumble
          teamStats = Object.assign(teamStats, countPlayer(teamStats, play.offense, play.rusher, 'fumbled', '', '', play.yardsGained, play.period));
          teamStats = Object.assign(teamStats, countTeam(teamStats, play.offense, 'fumbled', '', '', play.yardsGained, play.period));
          // check forced fumble
          if(play.forced){
            // count defense
            teamStats = Object.assign(teamStats, countPlayer(teamStats, play.defense, play.forced, 'forcedfumble', '', '', play.yardsGained, play.period));
            teamStats = Object.assign(teamStats, countTeam(teamStats, play.defense, 'forcedfumble', '', '', play.yardsGained, play.period));
          }
          break;

        default:
          //
      }

    case 'kneeldown':
      playtext.push(`Kneeldown (${teamName(play.offense)}, #${play.rusher}), `);
      // check rushresult
      switch(play.rushresult){
        case 'notackle':
          playtext.push(`Down at the ${teamName(play.losteam)} ${play.los} yardline`);
          playtext.push(`Yards Gained: ${play.yardsGained}`);
          break;

        case 'safety':
          playtext.push(`Result is a Safety`);
          // count defense
          teamStats = Object.assign(teamStats, countTackler(teamStats, play.defense, play.tackler, 'forcedsafety', '', '', play.yardsGained, play.period));
          teamStats = Object.assign(teamStats, countTackleTeam(teamStats, play.defense, 'forcedsafety', '', '', play.yardsGained, play.period));
          // count points
          teamStats = Object.assign(teamStats, saveTeamScore(teamStats, play.defense, 'safety', 2, play.period));
          break;

        default:
          //
      }

    default:
      // check rushtype is not run, write without play.runplay
      if(play.rushtype !== 'run' && play.rushtype !== undefined){
        playtext.push(` by ${teamName(play.offense)}, #${play.rusher} from the ${teamName(play.ballpositionteam)} ${play.ballposition} yardline`);
      }else{
        playtext.push(`Rush(${play.runplay}) by ${teamName(play.offense)}, #${play.rusher} from the ${teamName(play.ballpositionteam)} ${play.ballposition} yardline`);
      }
      // check rushresult
      switch(play.rushresult){
        case 'tackle':
          playtext.push(` to the ${teamName(play.losteam)} ${play.los} yardline, `);
          playtext.push(`Tackled by ${teamName(play.defense)}, #${play.tackler}, `);
          // count defense
          teamStats = Object.assign(teamStats, countTackler(teamStats, play.defense, play.tackler, 'tackle', '', '', play.yardsGained, play.period));
          teamStats = Object.assign(teamStats, countTackleTeam(teamStats, play.defense, 'tackle', '', '', play.yardsGained, play.period));
          break;

        case 'notackle':
          playtext.push(` to the ${teamName(play.losteam)} ${play.los} yardline, `);
          playtext.push(`No Tackle, `);
          break;

        case 'outofbounds':
          playtext.push(` to the ${teamName(play.losteam)} ${play.los} yardline, `);
          playtext.push(`Out Of Bounds, `);
          break;

        case 'fumble':
          playtext.push(` to the ${teamName(play.losteam)} ${play.los} yardline, `);
          playtext.push(`Fumble at ${teamName(play.fumbleteam)}, #${play.fumble} yardline, Forced by ${teamName(play.defense)}, #${play.forced}, `);
          playtext.push(`Recovered at ${teamName(play.losteam)}, #${play.los} yardline from ${teamName(play.recoveredteam)}, #${play.recovered}, `);
          // count offense fumble
          teamStats = Object.assign(teamStats, countPlayer(teamStats, play.offense, play.rusher, 'fumbled', '', '', play.yardsGained, play.period));
          teamStats = Object.assign(teamStats, countTeam(teamStats, play.offense, 'fumbled', '', '', play.yardsGained, play.period));
          // check forced fumble
          if(play.forced){
            // count defense
            teamStats = Object.assign(teamStats, countPlayer(teamStats, play.defense, play.forced, 'forcedfumble', '', '', play.yardsGained, play.period));
            teamStats = Object.assign(teamStats, countTeam(teamStats, play.defense, 'forcedfumble', '', '', play.yardsGained, play.period));
          }
          break;

        case 'safety':
          playtext.push(`, Safety, Tackled by ${teamName(play.defense)}, #${play.tackler}, `);
          // count defense
          teamStats = Object.assign(teamStats, countTackler(teamStats, play.defense, play.tackler, 'forcedsafety', '', '', play.yardsGained, play.period));
          teamStats = Object.assign(teamStats, countTackleTeam(teamStats, play.defense, 'forcedsafety', '', '', play.yardsGained, play.period));
          // count points
          teamStats = Object.assign(teamStats, saveTeamScore(teamStats, play.defense, 'safety', 2, play.period));
          break;

        case 'lateral':
          playtext.push(` to the ${teamName(play.losteam)} ${play.los} yardline, `);
          playtext.push(`Lateral at ${teamName(play.lateralfromteam)}, #${play.lateralfrom} yardline, to ${teamName(play.offense)}, #${play.lateral}, `);
          break;

        case 'touchdown':
          playtext.push(`, Touchdown, `);
          teamStats = Object.assign(teamStats, countPlayer(teamStats, play.offense, play.rusher, 'touchdownrun', '', '', play.yardsGained, play.period));
          teamStats = Object.assign(teamStats, countTeam(teamStats, play.offense, 'touchdownrun', '', '', play.yardsGained, play.period));
          // count points
          teamStats = Object.assign(teamStats, saveTeamScore(teamStats, play.offense, 'touchdown', 6, play.period));
          break;

        default:
          //
      }
  }
  // check rushtype is not present, set rushtype, else, use rushtype defined
  if(!play.rushtype){
    play.rushtype = 'run';
  }
  // count run
  teamStats = Object.assign(teamStats, countPlayer(teamStats, play.offense, play.rusher, play.rushtype, play.rushtype+'yards', 'longest'+play.rushtype, play.yardsGained, play.period));
  teamStats = Object.assign(teamStats, countTeam(teamStats, play.offense, play.rushtype, play.rushtype+'yards', 'longest'+play.rushtype, play.yardsGained, play.period));

  playtext.push(`Yards gained: ${play.yardsGained}`);

  return {playtext, teamStats};
}

// pass
function readPass(teamStats, play){
  let playtext = [];

  // check passer available
  if(!play.passer || play.passer === ''){play.passer = 'unknown'}
  // check receiver available
  if(!play.receiver || play.receiver === ''){play.receiver = 'unknown'}
  // check tackler available
  if(!play.tackler || play.tackler === ''){play.tackler = 'team'}

  playtext.push(`Pass from ${teamName(play.offense)}, #${play.passer}, `);

  // check passplay
  switch(play.passplay){
    case 'complete':
      playtext.push(`Complete, Catched by ${teamName(play.offense)}, #${play.receiver} at the ${teamName(play.losteam)} ${play.los} yardline, `);
      // count pass
      teamStats = Object.assign(teamStats, countPlayer(teamStats, play.offense, play.passer, 'pass', 'passingyards', 'longestpass', play.yardsGained, play.period));
      teamStats = Object.assign(teamStats, countPlayer(teamStats, play.offense, play.passer, 'complete', '', '', play.yardsGained, play.period));
      teamStats = Object.assign(teamStats, countPlayer(teamStats, play.offense, play.receiver, 'catched', 'receivingyards', 'longestcatch', play.yardsGained, play.period));
      teamStats = Object.assign(teamStats, countTeam(teamStats, play.offense, 'pass', 'passingyards', 'longestpass', play.yardsGained, play.period));
      teamStats = Object.assign(teamStats, countTeam(teamStats, play.offense, 'catched', 'receivingyards', 'longestcatch', play.yardsGained, play.period));
      // check passresult
      switch(play.passresult){
        case 'tackle':
          playtext.push(`Tackled by ${teamName(play.defense)}, #${play.tackler}, `);
          // count defense
          teamStats = Object.assign(teamStats, countTackler(teamStats, play.defense, play.tackler, 'tackle', '', '', play.yardsGained, play.period));
          teamStats = Object.assign(teamStats, countTackleTeam(teamStats, play.defense, 'tackle', '', '', play.yardsGained, play.period));
          break;

        case 'notackle':
          playtext.push(`No Tackle, `);
          break;

        case 'outofbounds':
          playtext.push(`Out Of Bounds, `);
          break;

        case 'fumble':
          playtext.push(`Fumble at ${teamName(play.fumbleteam)}, #${play.fumble} yardline, Forced by ${teamName(play.defense)}, #${play.forced}, `);
          playtext.push(`Recovered at ${teamName(play.losteam)}, #${play.los} yardline from ${teamName(play.recoveredteam)}, #${play.recovered}, `);
          // count offense fumble
          teamStats = Object.assign(teamStats, countPlayer(teamStats, play.offense, play.rusher, 'fumbled', '', '', play.yardsGained, play.period));
          teamStats = Object.assign(teamStats, countTeam(teamStats, play.offense, 'fumbled', '', '', play.yardsGained, play.period));
          // check forced fumble
          if(play.forced){
            // count defense
            teamStats = Object.assign(teamStats, countPlayer(teamStats, play.defense, play.forced, 'forcedfumble', '', '', play.yardsGained, play.period));
            teamStats = Object.assign(teamStats, countTeam(teamStats, play.defense, 'forcedfumble', '', '', play.yardsGained, play.period));
          }
          break;

        case 'safety':
          playtext.push(`Safety, Tackled by ${teamName(play.defense)}, #${play.tackler}, `);
          // count defense
          teamStats = Object.assign(teamStats, countTackler(teamStats, play.defense, play.tackler, 'forcedsafety', '', '', play.yardsGained, play.period));
          teamStats = Object.assign(teamStats, countTackleTeam(teamStats, play.defense, 'forcedsafety', '', '', play.yardsGained, play.period));
          // count points
          teamStats = Object.assign(teamStats, saveTeamScore(teamStats, play.defense, 'safety', 2, play.period));
          break;

        case 'lateral':
          playtext.push(`Lateral at ${teamName(play.lateralfromteam)}, #${play.lateralfrom} yardline, to ${teamName(play.offense)}, #${play.lateral}, `);
          break;

        case 'touchdown':
          playtext.push(`Touchdown, `);
          // count touchdown
          teamStats = Object.assign(teamStats, countPlayer(teamStats, play.offense, play.passer, 'touchdownpass', '', '', play.yardsGained, play.period));
          teamStats = Object.assign(teamStats, countPlayer(teamStats, play.offense, play.receiver, 'touchdowncatch', '', '', play.yardsGained, play.period));
          teamStats = Object.assign(teamStats, countTeam(teamStats, play.offense, 'touchdownpass', '', '', play.yardsGained, play.period));
          // count points
          teamStats = Object.assign(teamStats, saveTeamScore(teamStats, play.offense, 'touchdown', 6, play.period));
          break;

        default:
          //
      }
      playtext.push(`Yards gained: ${play.yardsGained}`);
      break;

    case 'intercepted':
      playtext.push(`Intended for ${teamName(play.offense)}, #${play.receiver}, `);
      playtext.push(`Intercepted by ${teamName(play.defense)}, #${play.interceptedby}, `);
      // count pass
      teamStats = Object.assign(teamStats, countPlayer(teamStats, play.offense, play.passer, 'pass', '', '', play.yardsGained, play.period));
      teamStats = Object.assign(teamStats, countPlayer(teamStats, play.offense, play.passer, 'interception', '', '', play.yardsGained, play.period));
      teamStats = Object.assign(teamStats, countTeam(teamStats, play.offense, 'pass', '', '', play.yardsGained, play.period));
      teamStats = Object.assign(teamStats, countTeam(teamStats, play.offense, 'interception', '', '', play.yardsGained, play.period));
      // count defense
      teamStats = Object.assign(teamStats, countPlayer(teamStats, play.defense, play.interceptedby, 'intercepted', '', '', play.yardsGained, play.period));
      teamStats = Object.assign(teamStats, countTeam(teamStats, play.defense, 'intercepted', '', '', play.yardsGained, play.period));

      // check passresult
      switch(play.passresult){
        case 'notackle':
          playtext.push(`at the ${teamName(play.losteam)} ${play.los} yardline`);
          break;

        case 'touchback':
          playtext.push(`Touchback`);
          break;

        default:
          //
      }
      break;

    case 'thrownaway':
      playtext.push(`Intended for ${teamName(play.offense)}, #${play.receiver}, `);
      playtext.push(`Thrown Away`);
      // check passresult
      switch(play.passresult){
        case 'notackle':
          // play is not counted as a pass
          break;
      
        case 'safety':
          playtext.push(`, Result is a Safety`);
          // count defense
          teamStats = Object.assign(teamStats, countTackler(teamStats, play.defense, play.tackler, 'forcedsafety', '', '', play.yardsGained, play.period));
          teamStats = Object.assign(teamStats, countTackleTeam(teamStats, play.defense, 'forcedsafety', '', '', play.yardsGained, play.period));
          // count points
          teamStats = Object.assign(teamStats, saveTeamScore(teamStats, play.defense, 'safety', 6, play.period));
          break;
      }
      break;

    case 'brokenup':
      playtext.push(`Intended for ${teamName(play.offense)}, #${play.receiver}, `);
      playtext.push(`Broken Up by ${teamName(play.defense)}, #${play.brokenupby}`);
      // count pass
      teamStats = Object.assign(teamStats, countPlayer(teamStats, play.offense, play.passer, 'pass', '', '', play.yardsGained, play.period));
      teamStats = Object.assign(teamStats, countPlayer(teamStats, play.offense, play.passer, 'passbrokenup', '', '', play.yardsGained, play.period));
      teamStats = Object.assign(teamStats, countTeam(teamStats, play.offense, 'pass', '', '', play.yardsGained, play.period));
      teamStats = Object.assign(teamStats, countTeam(teamStats, play.offense, 'passbrokenup', '', '', play.yardsGained, play.period));
      break;

    case 'incomplete':
      playtext.push(`Intended for ${teamName(play.offense)}, #${play.receiver}, `);
      playtext.push(`Incomplete`);
      // count pass
      teamStats = Object.assign(teamStats, countPlayer(teamStats, play.offense, play.passer, 'pass', '', '', play.yardsGained, play.period));
      teamStats = Object.assign(teamStats, countPlayer(teamStats, play.offense, play.passer, 'passincomplete', '', '', play.yardsGained, play.period));
      teamStats = Object.assign(teamStats, countTeam(teamStats, play.offense, 'pass', '', '', play.yardsGained, play.period));
      teamStats = Object.assign(teamStats, countTeam(teamStats, play.offense, 'passincomplete', '', '', play.yardsGained, play.period));
      break;

    case 'uncatchable':
      playtext.push(`Intended for ${teamName(play.offense)}, #${play.receiver}, `);
      playtext.push(`Uncatchable`);
      // count pass
      teamStats = Object.assign(teamStats, countPlayer(teamStats, play.offense, play.passer, 'pass', '', '', play.yardsGained, play.period));
      teamStats = Object.assign(teamStats, countPlayer(teamStats, play.offense, play.passer, 'passuncatchable', '', '', play.yardsGained, play.period));
      teamStats = Object.assign(teamStats, countTeam(teamStats, play.offense, 'pass', '', '', play.yardsGained, play.period));
      teamStats = Object.assign(teamStats, countTeam(teamStats, play.offense, 'passuncatchable', '', '', play.yardsGained, play.period));
      break;

    case 'dropped':
      playtext.push(`Intended for ${teamName(play.offense)}, #${play.receiver}, `);
      playtext.push(`Dropped`);
      // count pass
      teamStats = Object.assign(teamStats, countPlayer(teamStats, play.offense, play.passer, 'pass', '', '', play.yardsGained, play.period));
      teamStats = Object.assign(teamStats, countPlayer(teamStats, play.offense, play.passer, 'passwasdropped', '', '', play.yardsGained, play.period));
      teamStats = Object.assign(teamStats, countPlayer(teamStats, play.offense, play.receiver, 'droppedpass', '', '', play.yardsGained, play.period));
      teamStats = Object.assign(teamStats, countTeam(teamStats, play.offense, 'pass', '', '', play.yardsGained, play.period));
      teamStats = Object.assign(teamStats, countTeam(teamStats, play.offense, 'droppedpass', '', '', play.yardsGained, play.period));
      break;

    case 'spiked':
      playtext.push(`Spiked`);
      // count pass
      teamStats = Object.assign(teamStats, countPlayer(teamStats, play.offense, play.passer, 'pass', '', '', play.yardsGained, play.period));
      teamStats = Object.assign(teamStats, countPlayer(teamStats, play.offense, play.passer, 'passspiked', '', '', play.yardsGained, play.period));
      teamStats = Object.assign(teamStats, countTeam(teamStats, play.offense, 'pass', '', '', play.yardsGained, play.period));
      teamStats = Object.assign(teamStats, countTeam(teamStats, play.offense, 'passspiked', '', '', play, play.yardsGained.period));
      break;

    default:
      //
  }

  return {playtext, teamStats};
}

// punt
function readPunt(teamStats, play){
  let playtext = [];

  // check punter available
  if(!play.punter || play.punter === ''){play.punter = 'unknown'}

  playtext.push(`Punt from ${teamName(play.offense)}, #${play.punter}, `);
  // check if punt is blocked or good
  switch(play.punt){
    case 'blocked':
      playtext.push(`Blocked by ${teamName(play.blockedbyteam)}, #${play.blockedby}, `);
      playtext.push(`Recovered by ${teamName(play.puntrecoveredteam)}, #${play.puntrecovered}, `);
      // count blocked punt
      teamStats = Object.assign(teamStats, countPlayer(teamStats, play.blockedbyteam, play.passer, 'puntblock', '', '', '', play.period));
      teamStats = Object.assign(teamStats, countTeam(teamStats, play.blockedbyteam, 'puntblock', '', '', '', play.period));
      break;

    case 'puntgood':
      playtext.push(`Catched by ${teamName(play.defense)}, #${play.returnedby}, `);
      break;

    default:
      //
  }

  // check puntresult
  switch(play.puntresult){
    case 'returned':
      playtext.push(`Return, `);
      playtext.push(`Punt for (${play.yardsPunt} yards), `);
      break;

    case 'downed':
      playtext.push(`Downed, `);
      playtext.push(`Punt for (${play.yardsPunt} yards), `);
  
    case 'faircatch':
      playtext.push(`Faircatch, `);
      playtext.push(`Punt for (${play.yardsPunt} yards), `);
      break;

    case 'touchback':
      playtext.push(`Touchback, `);
      playtext.push(`Punt for (${play.yardsPunt} yards), `);
      break;

    case 'outofbounds':
      playtext.push(`Out Of Bounds, `);
      playtext.push(`Punt for (${play.yardsPunt} yards), `);
      break;

    default:
      //
  }
  // count punt
  teamStats = Object.assign(teamStats, countPlayer(teamStats, play.offense, play.punter, 'punt', 'puntyards', 'longestpunt', play.yardsPunt, play.period));
  teamStats = Object.assign(teamStats, countTeam(teamStats, play.offense, 'punt', 'puntyards', 'longestpunt', play.yardsPunt, play.period));

  return {playtext, teamStats};
}

// fieldgoal
function readFieldgoal(teamStats, play){
  let playtext = [];

  // check kicker available
  if(!play.kicker || play.kicker === ''){play.kicker = 'unknown'}

  playtext.push(`Field Goal from ${teamName(play.kickerteam)}, #${play.kicker}, `);
  // check fieldgoaltype
  switch(play.fieldgoal){
    case 'short':
      playtext.push(`Short, `);
      // count fieldgoal
      teamStats = Object.assign(teamStats, countPlayer(teamStats, play.kickerteam, play.kicker, 'fieldgoalshort', '', '', '', play.period));
      teamStats = Object.assign(teamStats, countTeam(teamStats, play.kickerteam, 'fieldgoalshort', '', '', '', play.period));
      // check fieldgoalresult
      switch(play.fieldgoalresult){
        case 'returned':
          playtext.push(`Recovered from ${teamName(play.defense)}, #${play.recoveredby}, at the ${teamName(play.recoveredatteam)}, #${play.recoveredat} yardline, `);
          break;

        case 'downed':
          playtext.push(`Downed from ${teamName(play.defense)}, #${play.recoveredby}, at the ${teamName(play.recoveredatteam)}, #${play.recoveredat} yardline, `);
          break;

        default:
          //
      }
      break;
  
    case 'blocked':
      playtext.push(`Blocked from ${teamName(play.defense)}, #${play.blockedby}, `);
      // count fieldgoal
      teamStats = Object.assign(teamStats, countPlayer(teamStats, play.kickerteam, play.kicker, 'fieldgoalblocked', '', '', '', play.period));
      teamStats = Object.assign(teamStats, countTeam(teamStats, play.kickerteam, 'fieldgoalblocked', '', '', '', play.period));
      // count defense
      teamStats = Object.assign(teamStats, countPlayer(teamStats, play.defense, play.blockedby, 'blockedfieldgoal', '', '', '', play.period));
      teamStats = Object.assign(teamStats, countTeam(teamStats, play.defense, 'blockedfieldgoal', '', '', '', play.period));
      // check fieldgoalresult
      switch(play.fieldgoalresult){
        case 'returned':
          playtext.push(`Recovered from ${teamName(play.fieldgoalrecoveredteam)}, #${play.fieldgoalrecovered}, at the ${teamName(play.recoveredatteam)}, #${play.recoveredat} yardline, `);
          break;

        case 'downed':
          playtext.push(`Downed from ${teamName(play.downedbyteam)}, #${play.downedby}, at the ${teamName(play.recoveredatteam)}, #${play.recoveredat} yardline, `);
          break;

        case 'faircatch':
          playtext.push(`Faircatch from ${teamName(play.faircatchyteam)}, #${play.faircatchby}, at the ${teamName(play.recoveredatteam)}, #${play.recoveredat} yardline, `);
          break;

        case 'touchback':
          playtext.push(`Touchback`);
          break;

        case 'outofbounds':
          playtext.push(`Out Of Bounds at the ${teamName(play.outofboundsteam)}, #${play.outofbounds} yardline`);
          break;

        default:
          //
      }
      break;

    case 'wideleft':
      playtext.push(`Wide Left`);
      // count fieldgoal
      teamStats = Object.assign(teamStats, countPlayer(teamStats, play.kickerteam, play.kicker, 'fieldgoalmissed', '', '', '', play.period));
      teamStats = Object.assign(teamStats, countTeam(teamStats, play.kickerteam, 'fieldgoalmissed', '', '', '', play.period));
      break;

    case 'wideright':
      playtext.push(`Wide Right`);
      // count fieldgoal
      teamStats = Object.assign(teamStats, countPlayer(teamStats, play.kickerteam, play.kicker, 'fieldgoalmissed', '', '', '', play.period));
      teamStats = Object.assign(teamStats, countTeam(teamStats, play.kickerteam, 'fieldgoalmissed', '', '', '', play.period));
      break;

    case 'good':
      playtext.push(`Field Goal GOOD for (${play.yardsFieldgoal} yards), `);
      // count fieldgoal
      teamStats = Object.assign(teamStats, countPlayer(teamStats, play.kickerteam, play.kicker, 'fieldgoalgood', 'fieldgoalyards', 'longestfieldgoal', play.yardsFieldgoal, play.period));
      teamStats = Object.assign(teamStats, countTeam(teamStats, play.kickerteam, 'fieldgoalgood', 'fieldgoalyards', 'longestfieldgoal', play.yardsFieldgoal, play.period));
      // count points
      teamStats = Object.assign(teamStats, saveTeamScore(teamStats, play.kickerteam, 'fieldgoal', 3, play.period));
      break;

    default:
      //
  }

  return {playtext, teamStats};
}

// pat
function readPAT(teamStats, play){
  let playtext = [];

  // check kicker available
  if(!play.kicker || play.kicker === ''){play.kicker = 'unknown'}

  playtext.push(`PAT, `);
  // check PAT
  switch(play.pat){
    case 'patkick':
      playtext.push(`Kick from ${teamName(play.offense)}, #${play.kicker}, `);
      // check result
      if(play.patresult === 'good'){
        playtext.push(`Kick is Good`);
        // count patkick
        teamStats = Object.assign(teamStats, countPlayer(teamStats, play.offense, play.kicker, 'patkickgood', '', '', '', play.period));
        teamStats = Object.assign(teamStats, countTeam(teamStats, play.offense, 'patkickgood', '', '', '', play.period));
        // count points
        teamStats = Object.assign(teamStats, saveTeamScore(teamStats, play.offense, 'PAT', 1, play.period));
      }else if(play.patresult === 'nogood'){
        playtext.push(`Kick is No Good`);
        // count patkick
        teamStats = Object.assign(teamStats, countPlayer(teamStats, play.offense, play.kicker, 'patkickmissed', '', '', '', play.period));
        teamStats = Object.assign(teamStats, countTeam(teamStats, play.offense, 'patkickmissed', '', '', '', play.period));
      }else if(play.patresult === 'blocked'){
        playtext.push(`Blocked from ${teamName(play.blockedbyteam)}, #${play.blockedby}, `);
        playtext.push(`Recovered from ${teamName(play.recoveredteam)}, #${play.recovered}, `);
        // count patkick
        teamStats = Object.assign(teamStats, countPlayer(teamStats, play.offense, play.kicker, 'patkickblocked', '', '', '', play.period));
        teamStats = Object.assign(teamStats, countTeam(teamStats, play.offense, 'patkickblocked', '', '', '', play.period));
        // count defense
        teamStats = Object.assign(teamStats, countPlayer(teamStats, play.blockedbyteam, play.blockedby, 'blockedpatkick', '', '', '', play.period));
        teamStats = Object.assign(teamStats, countTeam(teamStats, play.blockedbyteam, 'blockedpatkick', '', '', '', play.period));
      }
      break;
  
    case 'patrun':
      playtext.push(`Run from ${teamName(play.offense)}, #${play.rusher}, `);
      // check result
      if(play.patresult === 'good'){
        playtext.push(`Run is Good`);
        // count patrun
        teamStats = Object.assign(teamStats, countPlayer(teamStats, play.offense, play.rusher, 'patrungood', '', '', '', play.period));
        teamStats = Object.assign(teamStats, countTeam(teamStats, play.offense, 'patrungood', '', '', '', play.period));
        // count points
        teamStats = Object.assign(teamStats, saveTeamScore(teamStats, play.offense, 'PAT', 2, play.period));
      }else if(play.patresult === 'nogood'){
        playtext.push(`Run is No Good`);
        // count patrun
        teamStats = Object.assign(teamStats, countPlayer(teamStats, play.offense, play.rusher, 'patrunnogood', '', '', '', play.period));
        teamStats = Object.assign(teamStats, countTeam(teamStats, play.offense, 'patrunnogood', '', '', '', play.period));
      }else if(play.patresult === 'fumble'){
        playtext.push(`Fumbled, Forced by ${teamName(play.defense)}, #${play.blockedby}, `);
        playtext.push(`Recovered from ${teamName(play.recoveredteam)}, #${play.recovered}, `);
        // count patrun
        teamStats = Object.assign(teamStats, countPlayer(teamStats, play.offense, play.rusher, 'fumble', '', '', '', play.period));
        teamStats = Object.assign(teamStats, countTeam(teamStats, play.offense, 'fumble', '', '', '', play.period));
      }
      break;

    case 'patpass':
      playtext.push(`Pass from ${teamName(play.offense)}, #${play.passer}, `);
      teamStats = Object.assign(teamStats, countPlayer(teamStats, play.offense, play.passer, 'patpass', '', '', '', play.period));
      teamStats = Object.assign(teamStats, countTeam(teamStats, play.offense, 'patpass', '', '', '', play.period));
      // check result
      if(play.patresult === 'good'){
        playtext.push(`Catched from ${teamName(play.offense)}, #${play.receiver}, `);
        playtext.push(`PAT is Good`);
        // count patpass
        teamStats = Object.assign(teamStats, countPlayer(teamStats, play.offense, play.receiver, 'patpasscatchedgood', '', '', '', play.period));
        teamStats = Object.assign(teamStats, countTeam(teamStats, play.offense, 'patpasscatchedgood', '', '', '', play.period));
        // count points
        teamStats = Object.assign(teamStats, saveTeamScore(teamStats, play.offense, 'PAT', 2, play.period));
      }else if(play.patresult === 'nogood'){
        playtext.push(`PAT is No Good`);
        // count patpass
        teamStats = Object.assign(teamStats, countPlayer(teamStats, play.offense, play.rusher, 'patpassnogood', '', '', '', play.period));
        teamStats = Object.assign(teamStats, countTeam(teamStats, play.offense, 'patpassnogood', '', '', '', play.period));
      }else if(play.patresult === 'fumble'){
        playtext.push(`Catched from ${teamName(play.offense)}, #${play.receiver}, `);
        playtext.push(`Fumbled, Forced by ${teamName(play.defense)}, #${play.blockedby}, `);
        playtext.push(`Recovered from ${teamName(play.recoveredteam)}, #${play.recovered}, `);
        // count patpass
        teamStats = Object.assign(teamStats, countPlayer(teamStats, play.offense, play.receiver, 'patpasscatched', '', '', '', play.period));
        teamStats = Object.assign(teamStats, countTeam(teamStats, play.offense, 'patpasscatched', '', '', '', play.period));
        teamStats = Object.assign(teamStats, countPlayer(teamStats, play.offense, play.rusher, 'fumble', '', '', '', play.period));
        teamStats = Object.assign(teamStats, countTeam(teamStats, play.offense, 'fumble', '', '', '', play.period));
      }else if(play.patresult === 'intercepted'){
        playtext.push(`Intercepted by ${teamName(play.defense)}, #${play.interceptedby}, `);
        // count patpass
        teamStats = Object.assign(teamStats, countPlayer(teamStats, play.offense, play.receiver, 'patpassinterception', '', '', '', play.period));
        teamStats = Object.assign(teamStats, countTeam(teamStats, play.offense, 'patpassinterception', '', '', '', play.period));
        // count defense
        teamStats = Object.assign(teamStats, countPlayer(teamStats, play.defense, play.interceptedby, 'intercepted', '', '', '', play.period));
        teamStats = Object.assign(teamStats, countTeam(teamStats, play.defense, 'intercepted', '', '', '', play.period));
      }
      break;

    default:
      //
  }

  return {playtext, teamStats};
}

// penalty
function readPenalty(teamStats, play){
  let playtext = [];

  // check penalty
  switch(play.penalty){
    case 'penalty':
    case 'nullifyplay':
      if(play.penalty === 'nullifyplay'){
        playtext.push(`Penalty (Nullify Last Play) - ${play.penaltytype}`);
      }else{
        playtext.push(`Penalty - ${play.penaltytype}`);
      }
      // count penalty
      teamStats = Object.assign(teamStats, countPlayer(teamStats, play.penaltyonteam, play.penaltyplayer, `penalty-${play.penaltytype}`, '', '', play.penaltyYards, play.period));
      teamStats = Object.assign(teamStats, countTeam(teamStats, play.penaltyonteam, `penalty-${play.penaltytype}`, '', '', play.penaltyYards, play.period));
      teamStats = Object.assign(teamStats, countPlayer(teamStats, play.penaltyonteam, play.penaltyplayer, 'penalty', '', '', play.penaltyYards, play.period));
      teamStats = Object.assign(teamStats, countTeam(teamStats, play.penaltyonteam, 'penalty', '', '', play.penaltyYards, play.period));
      // check penaltyresult
      switch(play.penaltyresult){
        case 'repeatdown':
          playtext.push(`by ${teamName(play.penaltyonteam)}, #${play.penaltyplayer} for ${play.penaltyYards} yards, `);
          playtext.push(`Repeat Down`);
          break;

        case 'changedown':
          playtext.push(`by ${teamName(play.penaltyonteam)}, #${play.penaltyplayer} for ${play.penaltyYards} yards, `);
          break;

        case 'firstdown':
          playtext.push(`by ${teamName(play.penaltyonteam)}, #${play.penaltyplayer} for ${play.penaltyYards} yards, `);
          playtext.push(`First Down`);
          break;

        case 'offsetting':
          playtext.push(`Offsetting Penalty (${teamName(play.penaltyonteam)}, #${play.penaltyplayer})`);
          break;

        default:
          //
      }
      break;

    case 'decline':
      playtext.push(`Penalty decline, Play Stands`);
      break;

    default:
      //
  }

  return {playtext, teamStats};
}

// count Tackler
// we count the defense, tackles per player
// we check if we have tackle for loss or assist tackles
function countTackler(teamStats, teamname, tackler, playname, yardname, longestyardname, yards, period) {
  // split the tackler to single player numbers
  var tacklerarray = tackler.split(',');
  var action = '';

  // check if we have more than one tackler = assist
  if(tacklerarray.length > 1){
    action = 'assist';
  }

  // check if we have negative yards = tackle for loss - add to action string
  if(yards < 0){
    // add string 'forloss'
    action = `${action}forloss`;
  }

  // loop through tackler player in array
  tacklerarray.forEach(player => {
    // count tacklers , add result to stats
    teamStats = Object.assign(teamStats, countPlayer(teamStats,teamname, player, playname+action, '', '', yards, period));
  });

  return teamStats;
}

// count Tackle Team
// we count the defense, tackles and check if we have tackle for loss
function countTackleTeam(teamStats, teamname, playname, yardname, longestyardname, yards, period) {
  var action = '';

  // check if we have negative yards = tackle for loss - add to action string
  if(yards < 0){
    // add string 'forloss'
    action = `${action}forloss`;
  }

  // count tacklers, add result to stats
  teamStats = Object.assign(teamStats, countTeam(teamStats, teamname, playname+action, '', '', yards, period));

  return teamStats;
}

// count player stats
// count player based on team and number
// count playname (run, pass etc.)
// check if longest run, pass etc.
function countPlayer(teamStats, teamname, playernumber, playname, yardname, longestyardname, yards, period) {
  // check playernumber not existing
  if(!teamStats[teamname].player[playernumber]){
    // set playernumber
    teamStats[teamname].player[playernumber] = {};
  }

  // check playname
  if(teamStats[teamname].player[playernumber][playname]){
    // increase playname
    teamStats[teamname].player[playernumber][playname] += 1;
  }else{
    // set playname
    teamStats[teamname].player[playernumber][playname] = 1;
  }

  // check yards present
  if(yards !== '' && yardname !== ''){
    // check yardname existing
    if(teamStats[teamname].player[playernumber][yardname]){
      // increase yardname
      teamStats[teamname].player[playernumber][yardname] += yards;
    }else{
      // set yardname
      teamStats[teamname].player[playernumber][yardname] = yards;
    }

    // calculate average
    let averagename = yardname+'average';
    let average = teamStats[teamname].player[playernumber][yardname] / teamStats[teamname].player[playernumber][playname];
    teamStats[teamname].player[playernumber][averagename] = roundNumber(average);
  }

  // check yards present
  if(yards !== '' && longestyardname !== ''){
    // check longestyardname
    if(teamStats[teamname].player[playernumber][longestyardname]){
      // check if new longest play
      if(yards > teamStats[teamname].player[playernumber][longestyardname]){
        // set new longest play
        teamStats[teamname].player[playernumber][longestyardname] = yards;
      }
    }else{
      // set new longest play
      teamStats[teamname].player[playernumber][longestyardname] = yards;
    }
  }

  return teamStats;
}

// count team stats, we count same as player but for the whole team
// count based on team
// count playname (run, pass etc.)
// check if longest run, pass etc.
function countTeam(teamStats, teamname, playname, yardname, longestyardname, yards, period) {
  // set periods, 0 for the whole game
  const periods = [0];
  // check if period assigned
  if(period !== 'undefined'){
    // add period to array
    periods.push(period);
  }

  // loop periods
  periods.forEach(p => {
    // check period not existing
    if(!teamStats[teamname].team[p]){
      // set period
      teamStats[teamname].team[p] = {};
    }

    // check playname
    if(teamStats[teamname].team[p][playname]){
      // increase playname
      teamStats[teamname].team[p][playname] += 1;
    }else{
      // set playname
      teamStats[teamname].team[p][playname] = 1;
    }

    // check yards present
    if(yards !== '' && yardname !== ''){
      // check yardname
      if(teamStats[teamname].team[p][yardname]){
        // increase yardname
        teamStats[teamname].team[p][yardname] += yards;
      }else{
        // set yardname
        teamStats[teamname].team[p][yardname] = yards;
      }

      // calculate average
      let averagename = yardname+'average';
      let average = teamStats[teamname].team[p][yardname] / teamStats[teamname].team[p][playname];
      teamStats[teamname].team[p][averagename] = roundNumber(average);
    }

    // check yards present
    if(yards !== '' && longestyardname !== ''){
      // check longestyardname
      if(teamStats[teamname].team[p][longestyardname]){
        // check if new longest play
        if(yards > teamStats[teamname].team[p][longestyardname]){
          // set new longest play
          teamStats[teamname].team[p][longestyardname] = yards;
        }
      }else{
        // set new longest play
        teamStats[teamname].team[p][longestyardname] = yards;
      }
    }
  });

  return teamStats;
}

// saveTeamValue
// we save a simple value for the team, like cointoss, timeouts etc.
function saveTeamValue(teamStats, teamname, playname, value, period){
  // set periods, 0 for the whole game
  const periods = [0];
  // check if period assigned
  if(period){
    // add period to array
    periods.push(period);
  }

  // loop periods
  periods.forEach(p => {
    // check period not existing
    if(!teamStats[teamname].team[p]){
      // set period
      teamStats[teamname].team[p] = {};
    }

    // set value
    teamStats[teamname].team[p][playname] = value;
  });

  return teamStats;
}

// saveTeamScore
// we save the score and the points
function saveTeamScore(teamStats, teamname, score, addpoints, period){
  // set periods, 0 for the whole game
  const periods = [0];
  // check if period assigned
  if(period){
    // add period to array
    periods.push(period);
  }

  // loop periods
  periods.forEach(p => {
    // check period not existing
    if(!teamStats[teamname].team[p]){
      // set period
      teamStats[teamname].team[p] = {};
    }

    // check score
    if(teamStats[teamname].team[p][score]){
      // increase score count
      teamStats[teamname].team[p][score] = teamStats[teamname].team[p][score] + 1;
    }else{
      // set playname
      teamStats[teamname].team[p][score] = 1;
    }

    // check points
    if(teamStats[teamname].team[p].points){
      // increase points
      teamStats[teamname].team[p].points = teamStats[teamname].team[p].points + addpoints;
    }else{
      // set points
      teamStats[teamname].team[p].points = addpoints;
    }
  });

  return teamStats;
}

// calculate averages for specific plays
function calculateAverages(teamStats) {
  let teamStatsAverages = teamStats;

  let playerTeam1Array = [];
  // loop through players from team1 stats, get numbers in array
  if(teamStatsAverages.team1){
    if(teamStatsAverages.team1.player){
      // get the player stats objects as keys
      playerTeam1Array = Object.keys(teamStatsAverages.team1.player);
    }
  }
  let playerTeam2Array = [];
  // loop through players from team2 stats, get numbers in array
  if(teamStatsAverages.team2){
    if(teamStatsAverages.team2.player){
      // get the player stats objects as keys
      playerTeam2Array = Object.keys(teamStatsAverages.team2.player);
    }
  }
  let periodsTeam1Array = [];
  // loop through team from team1 stats, get periods in array
  if(teamStatsAverages.team1){
    if(teamStatsAverages.team1.team){
      // get the team stats objects as keys
      periodsTeam1Array = Object.keys(teamStatsAverages.team1.team);
    }
  }
  let periodsTeam2Array = [];
  // loop through team from team1 stats, get periods in array
  if(teamStatsAverages.team2){
    if(teamStatsAverages.team2.team){
      // get the team stats objects as keys
      periodsTeam2Array = Object.keys(teamStatsAverages.team2.team);
    }
  }

  let playerPassPlays = [
    'pass',
    'complete',
    'passingyards'
  ];


  // loop through player array from team1
  playerTeam1Array.forEach((key) => {
    // find team object
    if(teamStatsAverages.team1){
      if(teamStatsAverages.team1.player){
        if(teamStatsAverages.team1.player[key]){
          // get the player objects and create keys array
          let playerKeys = Object.keys(teamStatsAverages.team1.player[key])
          // check if every pass value existing
          if(playerPassPlays.every(i => playerKeys.includes(i))){
            // we found pass values for calculation
            // calculate pass average
            let averagename = 'passingyardsaverage';
            let average = teamStatsAverages.team1.player[key].passingyards / teamStatsAverages.team1.player[key].complete;
            // add to stats
            teamStatsAverages.team1.player[key][averagename] = roundNumber(average,1);
            // calculate pass completion rate
            let percentagename = 'completionrate';
            let percentage = teamStatsAverages.team1.player[key].complete / teamStatsAverages.team1.player[key].pass;
            teamStatsAverages.team1.player[key][percentagename] = `${roundNumber(percentage*100,0)}%`;
          }
        }
      }
    }
  });

  // loop through player array from team2
  playerTeam2Array.forEach((key) => {
    // find team object
    if(teamStatsAverages.team2){
      if(teamStatsAverages.team2.player){
        if(teamStatsAverages.team2.player[key]){
          // get the player objects and create keys array
          let playerKeys = Object.keys(teamStatsAverages.team2.player[key])
          // check if every pass value existing
          if(playerPassPlays.every(i => playerKeys.includes(i))){
            // we found pass values for calculation
            // calculate pass average
            let averagename = 'passingyardsaverage';
            let average = teamStatsAverages.team2.player[key].passingyards / teamStatsAverages.team2.player[key].complete;
            // add to stats
            teamStatsAverages.team2.player[key][averagename] = roundNumber(average,1);
            // calculate pass completion rate
            let percentagename = 'completionrate';
            let percentage = teamStatsAverages.team2.player[key].complete / teamStatsAverages.team2.player[key].pass;
            teamStatsAverages.team2.player[key][percentagename] = `${roundNumber(percentage*100,0)}%`;
          }
        }
      }
    }
  });

  let teamPassPlays = [
    'pass',
    'catched',
    'passingyards'
  ];

  // get team stats, loop through periods
  periodsTeam1Array.forEach((key) => {
    // find team object
    if(teamStatsAverages.team1){
      if(teamStatsAverages.team1.team){
        if(teamStatsAverages.team1.team[key]){
          // get the team objects and create keys array
          let teamKeys = Object.keys(teamStatsAverages.team1.team[key])
          // check if every pass value existing
          if(teamPassPlays.every(i => teamKeys.includes(i))){
            // we found pass values for calculation
            // calculate pass average
            let averagename = 'passingyardsaverage';
            let average = teamStatsAverages.team1.team[key].passingyards / teamStatsAverages.team1.team[key].complete;
            // add to stats
            teamStatsAverages.team1.team[key][averagename] = roundNumber(average,1);
            // calculate pass completion rate
            let percentagename = 'completionrate';
            let percentage = teamStatsAverages.team1.team[key].catched / teamStatsAverages.team1.team[key].pass;
            teamStatsAverages.team1.team[key][percentagename] = `${roundNumber(percentage*100,0)}%`;
          }
        }
      }
    }
  });

  // get team stats, loop through periods
  periodsTeam2Array.forEach((key) => {
    // find team object
    if(teamStatsAverages.team2){
      if(teamStatsAverages.team2.team){
        if(teamStatsAverages.team2.team[key]){
          // get the team objects and create keys array
          let teamKeys = Object.keys(teamStatsAverages.team2.team[key])
          // check if every pass value existing
          if(teamPassPlays.every(i => teamKeys.includes(i))){
            // we found pass values for calculation
            // calculate pass average
            let averagename = 'passingyardsaverage';
            let average = teamStatsAverages.team2.team[key].passingyards / teamStatsAverages.team2.team[key].complete;
            // add to stats
            teamStatsAverages.team2.team[key][averagename] = roundNumber(average,1);
            // calculate pass completion rate
            let percentagename = 'completionrate';
            let percentage = teamStatsAverages.team2.team[key].catched / teamStatsAverages.team2.team[key].pass;
            teamStatsAverages.team2.team[key][percentagename] = `${roundNumber(percentage*100,0)}%`;
          }
        }
      }
    }
  });

  return teamStatsAverages;
}

// ###################################################################
// ###################################################################
// ###################################################################
// ###################################################################
// stats for table

// saveTeamScore
// we create the table with the stats data
function createTableStats(liveGameData){
  let playerTeamBothStats = createPlayerTableStats(liveGameData);

  let playerTeam1Stats = playerTeamBothStats.playerTeam1Stats;
  let playerTeam2Stats = playerTeamBothStats.playerTeam2Stats;

  let teamOverviewStats = createTeamTableStats(liveGameData);

  return {playerTeam1Stats,playerTeam2Stats,teamOverviewStats};
}

// we create the player table stats data
function createPlayerTableStats(liveGameData){
  let liveGameDataStats = liveGameData;

  let playerTeam1Array = [];
  // loop through players from team1 stats, get names in array
  try{
    // get the player stats objects as keys
    playerTeam1Array = Object.keys(liveGameDataStats.teamStats.team1.player);
  }catch{
    // nothing
  }

  let playerRosterTeam1 = [];
  // get team1 roster
  try{
    // get the player stats objects as keys
    playerRosterTeam1 = liveGameDataStats.team1details.players;
  }catch{
    // nothing
  }

  let playerTeam2Array = [];
  // loop through players from team2 stats, get names in array
  try{
    // get the player stats objects as keys
    playerTeam2Array = Object.keys(liveGameDataStats.teamStats.team2.player);
  }catch{
    // nothing
  }

  let playerRosterTeam2 = [];
  // get team2 roster
  try{
    // get the player stats objects as keys
    playerRosterTeam2 = liveGameDataStats.team2details.players;
  }catch{
    // nothing
  }

  let playerTeam1Stats = [];
  // loop through player array from team1
  playerTeam1Array.forEach((key) => {
    // get name from roster based on number
    let playerName = playerRosterTeam1.filter(player => player.number === key).map(player => player.name);
    // set player number as ID
    let playerID = key;
    // check if we found a name
    if(playerName.length > 0){
        // add the name to the ID
        playerID = `${playerName} (${key})`;
    }
    // find team object
    try{
      // get the player objects by number and add the name
      liveGameDataStats.teamStats.team1.player[key].playername = playerID;
      // push player into stats array
      playerTeam1Stats.push(liveGameDataStats.teamStats.team1.player[key]);
    }catch{
      // nothing
    }
  });

  let playerTeam2Stats = [];
  // loop through player array from team2
  playerTeam2Array.forEach((key) => {
    // get name from roster based on number
    let playerName = playerRosterTeam2.filter(player => player.number === key).map(player => player.name);
    // set player number as ID
    let playerID = key;
    // check if we found a name
    if(playerName.length > 0){
        // add the name to the ID
        playerID = `${playerName} (${key})`;
    }
    // find team object
    try{
      // get the player objects by number and add the name
      liveGameDataStats.teamStats.team2.player[key].playername = playerID;
      // push player into stats array
      playerTeam2Stats.push(liveGameDataStats.teamStats.team2.player[key]);
    }catch{
      // nothing
    }
  });

  return {playerTeam1Stats,playerTeam2Stats};
}

// we create the team comparison table with the stats data
function createTeamTableStats(liveGameData){
  let liveGameDataStats = liveGameData;

  let teamOverviewStats = [];

  let team1keys = [];
  // loop through team from team1 stats, get period 0 for full game
  try{
    // get the keys from team1 period 0
    team1keys = Object.keys(liveGameDataStats.teamStats.team1.team[0]);
  }catch{
    // nothing
  }
  let team2keys = [];
  // loop through team from team2 stats, get period 0 for full game
  try{
    // get the keys from team2 period 0
    team2keys = Object.keys(liveGameDataStats.teamStats.team2.team[0]);
  }catch{
    // nothing
  }

  let bothTeamKeys = [...team1keys, ...team2keys];
  // remove duplicates
  let uniqueTeamKeys = [...new Set(bothTeamKeys)];

  // loop through uniqueTeamKeys
  uniqueTeamKeys.forEach((key) => {
    // create Object
    let teamObject = {};
    // set name
    teamObject.name = key;
    // check value team1
    try{
      // set value
      teamObject.team1 = liveGameDataStats.teamStats.team1.team[0][key];
    }catch{
      // not found
    }

    // check value team2
    try{
      // set value
      teamObject.team2 = liveGameDataStats.teamStats.team2.team[0][key];
    }catch{
      // not found
    }
    // push to array
    teamOverviewStats.push(teamObject);
  });

  return teamOverviewStats;
}

// send json object from live game data for table stats
function sendTableStats() {
  // add old gameData
  let liveGameDataTableStats = createTableStats(liveGameData);
  // send data
  io.emit('sendTableStats', liveGameDataTableStats);
}


