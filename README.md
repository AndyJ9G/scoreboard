# American Football scoreboard and stats

American football scoreboard and stats is used as a live play by play logger and livestreaming overlay.

Each play is saved with user input and a full stats sheet is created.
Additionally there is a live overlay scoreaboard for live streaming.

The backend is based on **node js with express web server** and includes **websockets**.
The scoreboard overlay is running on the node js server.

Main controls can be used on the webpage in the browser or with sending GET requests.
The GET requests can be send by eg. stream deck hardware or similar.

The scoreboard creates **overlays as HTML files** which can be included in livestreaming software like **OBS Studio** or **VMIX**.
The main setup of the scoreboard is done by the web controls, all configurations are **JSON files**.

The stats user interface (frontend) is create with **react js** and the communication to the backend is using **websockets**.

All configurations, team setup, games and stats are stored as **JSON files**.

-- INSTALLATION --
The app need **node js** installed.

After node js is installed, download or clone this GIT repository.
Then run **npm install** on the command line within the parent directory and all node_modules will be installed.
Then run **npm build** on the command line to create the react js statis files.

-- START APPLICATION --
Run **npm start** on the command line within the parent directory (or use the **.BAT** file on windows platforms).

-- USER INTERFACE --
The main controls can then be found under **port 4000** under **"http://localhost:4000"**.
Here you will also find the links to the overlays.

-- FUNCTIONS --
The main communication is running via websockets.

Additionally the control can be managed by GET requests:

The link for the different functions is: http://localhost:3000/getcontrol?action=

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
