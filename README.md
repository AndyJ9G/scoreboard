# razorbacks_scoreboard
American football scoreboard used as overlay for livestreaming.

the scoreboard is based on **node js web server** and includes **websockets**.


the main controls can be used within the browser or sending GET requests from links.

the GET requests can be send by eg. stream deck hardware or similar.


the scoreboard creates **overlays as HTML files** which can be included in livestreaming software like **OBS Studio** or **VMIX**.

the main setup of the scoreboard is done by the web controls, all configurations are **JSON files**.

with the JSON files the team names and the team images can be defined, but also player lists with names and numbers.


the scoreboard need **node js** installed.

after node js is installed, just run **npm install** within the parent directory and all node_modules will be installed.


to run the scoreboard, just run **node server.js** on the command line (or use the **.BAT** file on windows platforms).


the main controls can then be found under **port 3000** like "http://localhost:3000".

the overlay can be found under "http://localhost:3000/scoreboard" and the player name overlay under "http://localhost:3000/names".


if the scoreboard and the livestreaming software are running on different machines, change the localhost to the IP or the scoreboard machine.

the main communication is running via websockets through the different HTML pages, made possible by javascript.

additionally the control can be managed by GET requests:

the link is: http://localhost:3000/getcontrol?action=

// setup scoreboard

'quarterShow';			http://localhost:3000/getcontrol?action=quarterShow

'gameclockShow';		http://localhost:3000/getcontrol?action=gameclockShow

'playclockShow';		http://localhost:3000/getcontrol?action=playclockShow

'downShow';				http://localhost:3000/getcontrol?action=downShow

'distanceShow';			http://localhost:3000/getcontrol?action=distanceShow

// counts & flag

'countquarter';			http://localhost:3000/getcontrol?action=countquarter

'countdowns';			http://localhost:3000/getcontrol?action=countdowns

'flag';					http://localhost:3000/getcontrol?action=flag

// distance

'firstDown';			http://localhost:3000/getcontrol?action=firstDown

'yardsplus10';			http://localhost:3000/getcontrol?action=yardsplus10

'yardsminus10';			http://localhost:3000/getcontrol?action=yardsminus10

'yardsplus5';			http://localhost:3000/getcontrol?action=yardsplus5

'yardsminus5';			http://localhost:3000/getcontrol?action=yardsminus5

'yardsplus1';			http://localhost:3000/getcontrol?action=yardsplus1

'yardsminus1';			http://localhost:3000/getcontrol?action=yardsminus1

// setup time

'reset12Clock';			http://localhost:3000/getcontrol?action=reset12Clock

'reset15Clock';			http://localhost:3000/getcontrol?action=reset15Clock

'reset30Clock';			http://localhost:3000/getcontrol?action=reset30Clock

// change time

'plusMinute';			http://localhost:3000/getcontrol?action=plusMinute

'minusMinute';			http://localhost:3000/getcontrol?action=minusMinute

'plus10Second';			http://localhost:3000/getcontrol?action=plus10Second

'minus10Second';		http://localhost:3000/getcontrol?action=minus10Second

'plus1Second';			http://localhost:3000/getcontrol?action=plus1Second

'minus1Second';			http://localhost:3000/getcontrol?action=minus1Second

// clock

'resetClock';			http://localhost:3000/getcontrol?action=resetClock

'startClock';			http://localhost:3000/getcontrol?action=startClock

'stopClock';			http://localhost:3000/getcontrol?action=stopClock

// timeouts

'counttimeoutteam1';	http://localhost:3000/getcontrol?action=counttimeoutteam1

'counttimeoutteam2';	http://localhost:3000/getcontrol?action=counttimeoutteam2

// ball

'ballbesitzteam1';		http://localhost:3000/getcontrol?action=ballbesitzteam1

'ballbesitzteam2';		http://localhost:3000/getcontrol?action=ballbesitzteam2

'ballbesitzwechsel';	http://localhost:3000/getcontrol?action=ballbesitzwechsel

// points

'touchdownTeam1';		http://localhost:3000/getcontrol?action=touchdownTeam1

'touchdownTeam2';		http://localhost:3000/getcontrol?action=touchdownTeam2

'extrapointTeam1';		http://localhost:3000/getcontrol?action=extrapointTeam1

'extrapointTeam2';		http://localhost:3000/getcontrol?action=extrapointTeam2

'twopointTeam1';		http://localhost:3000/getcontrol?action=twopointTeam1

'twopointTeam2';		http://localhost:3000/getcontrol?action=twopointTeam2

'fieldgoalTeam1';		http://localhost:3000/getcontrol?action=fieldgoalTeam1

'fieldgoalTeam2';		http://localhost:3000/getcontrol?action=fieldgoalTeam2

'safetyTeam1';			http://localhost:3000/getcontrol?action=safetyTeam1

'safetyTeam2';			http://localhost:3000/getcontrol?action=safetyTeam2

'plusTeam1';			http://localhost:3000/getcontrol?action=plusTeam1

'minusTeam1';			http://localhost:3000/getcontrol?action=minusTeam1

'plusTeam2';			http://localhost:3000/getcontrol?action=plusTeam2

'minusTeam2';			http://localhost:3000/getcontrol?action=minusTeam2

// setup teams with names

'setupTeam1';			http://localhost:3000/getcontrol?action=setupTeam1

'setupTeam2';			http://localhost:3000/getcontrol?action=setupTeam2
