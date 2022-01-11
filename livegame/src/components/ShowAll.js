import { useEffect, useState } from 'react';
import Cointoss from './Cointoss';
import Cointosswinner from './Cointosswinner';
import Cointossdecision from './Cointossdecision';
import Cointossdefer from './Cointossdefer';
import Kickoff from './Kickoff';
import Kickreturn from './Kickreturn';
import Chooseplay from './Chooseplay';
import Fumble from './Fumble';
import Lateral from './Lateral';
import Intercepted from './Intercepted';
import Puntreturn from './Puntreturn';
import Fieldgoalreturn from './Fieldgoalreturn';
import PAT from './PAT';

const ShowAll = ({socket}) => {
    const [statsdata, setStatsdata] = useState({});
    const [gamedata, setGamedata] = useState({});
    const [playerdata, setPlayerdata] = useState({});
    const [lastaction, setLastaction] = useState({});

    // on render
    useEffect(() => {
        socket.emit('requeststatsdata', { message: 'Client requesting stats' });
        socket.on('sendGUIdata', (guiData) => {setStatsdata(guiData)});
        socket.on('sendgamedata', (gameData) => {setGamedata(gameData)});
        socket.on('sendplayerlist', (playerData) => {setPlayerdata(playerData)});
        socket.on('sendLastAction', (lastAction) => {setLastaction(lastAction)});
    }, [socket]);

    return (
        <>
            <Cointoss socket={socket}/>
            <Cointosswinner socket={socket} statsdata={statsdata} lastaction={lastaction} gamedata={gamedata} playerdata={playerdata}/>
            <Cointossdecision socket={socket} statsdata={statsdata} lastaction={lastaction} gamedata={gamedata} playerdata={playerdata}/>
            <Cointossdefer socket={socket} statsdata={statsdata} lastaction={lastaction} gamedata={gamedata} playerdata={playerdata}/>
            <Kickoff socket={socket} statsdata={statsdata} lastaction={lastaction} gamedata={gamedata} playerdata={playerdata}/>
            <Kickreturn socket={socket} statsdata={statsdata} lastaction={lastaction} gamedata={gamedata} playerdata={playerdata}/>
            <Chooseplay socket={socket} statsdata={statsdata} lastaction={lastaction} gamedata={gamedata} playerdata={playerdata}/>
            <Fumble socket={socket} statsdata={statsdata} lastaction={lastaction} gamedata={gamedata} playerdata={playerdata}/>
            <Lateral socket={socket} statsdata={statsdata} lastaction={lastaction} gamedata={gamedata} playerdata={playerdata}/>
            <Intercepted socket={socket} statsdata={statsdata} lastaction={lastaction} gamedata={gamedata} playerdata={playerdata}/>
            <Puntreturn socket={socket} statsdata={statsdata} lastaction={lastaction} gamedata={gamedata} playerdata={playerdata}/>
            <Fieldgoalreturn socket={socket} statsdata={statsdata} lastaction={lastaction} gamedata={gamedata} playerdata={playerdata}/>
            <PAT socket={socket} statsdata={statsdata} lastaction={lastaction} gamedata={gamedata} playerdata={playerdata}/>

        </>
    )
}

export default ShowAll
