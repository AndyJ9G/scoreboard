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
import Button from './Button';
import Halftime from './Halftime';
import Gamefinished from './Gamefinished';

const Plays = ({socket}) => {
    const [statsdata, setStatsdata] = useState({});
    const [gamedata, setGamedata] = useState({});
    const [playerdata, setPlayerdata] = useState({
        team1details: {},
        team2details: {}
    });

    // on render
    useEffect(() => {
        //socket.emit('requeststatsdata', { message: 'Client requesting stats' });
        socket.emit('requestGuiData', { message: 'Client requesting guiData' });
        socket.on('sendGUIdata', (guiData) => {setStatsdata(guiData)});
        socket.emit('requestLiveGameData', { message: 'Client requesting liveGameData' });
        socket.on('sendLiveGameData', (gameData) => {
            setGamedata(gameData);
            let team1details = gameData.team1details;
            let team2details = gameData.team2details;
            let players = {
                team1details: team1details,
                team2details: team2details
            }
            setPlayerdata(players)
        });
    }, [socket]);

    function onClickCancelEdit(){
        // cancel edit mode
        socket.emit('cancelEditPlay', { message: 'Client requesting to cancel play edit mode'});
    }

    return (
        <div style={{backgroundColor: statsdata.editmode === 'on' ? '#e9e9cb' : ''}}>
            {(() => {
                switch (statsdata.actualplay) {
                    case 'startgame':
                    case 'cointoss':
                        return <Cointoss socket={socket}/>
                    case 'cointosswinner':
                        return <Cointosswinner socket={socket} statsdata={statsdata} gamedata={gamedata} playerdata={playerdata}/>
                    case 'cointossdecision':
                        return <Cointossdecision socket={socket} statsdata={statsdata} gamedata={gamedata} playerdata={playerdata}/>
                    case 'cointossdeferdecision':
                        return <Cointossdefer socket={socket} statsdata={statsdata} gamedata={gamedata} playerdata={playerdata}/>
                    case 'gamefinished':
                        return <Gamefinished socket={socket}/>
                    case 'halftime':
                    case 'halftimekickteam':
                        return <Halftime socket={socket} statsdata={statsdata} gamedata={gamedata} playerdata={playerdata}/>
                    case 'kickoff':
                        return <Kickoff socket={socket} statsdata={statsdata} gamedata={gamedata} playerdata={playerdata}/>
                    case 'kickreturn':
                        return <Kickreturn socket={socket} statsdata={statsdata} gamedata={gamedata} playerdata={playerdata}/>
                    case 'chooseplay':
                        return <Chooseplay socket={socket} statsdata={statsdata} gamedata={gamedata} playerdata={playerdata}/>
                    case 'fumble':
                        return <Fumble socket={socket} statsdata={statsdata} gamedata={gamedata} playerdata={playerdata}/>
                    case 'lateral':
                        return <Lateral socket={socket} statsdata={statsdata} gamedata={gamedata} playerdata={playerdata}/>
                    case 'intercepted':
                        return <Intercepted socket={socket} statsdata={statsdata} gamedata={gamedata} playerdata={playerdata}/>
                    case 'puntreturn':
                        return <Puntreturn socket={socket} statsdata={statsdata} gamedata={gamedata} playerdata={playerdata}/>
                    case 'fieldgoalreturn':
                        return <Fieldgoalreturn socket={socket} statsdata={statsdata} gamedata={gamedata} playerdata={playerdata}/>
                    case 'pat':
                        return <PAT socket={socket} statsdata={statsdata} gamedata={gamedata} playerdata={playerdata}/>
                    default:
                        return null
                }
            })()}
            {statsdata.editmode === 'on' &&
                <div className='container' id='canceleditmode'>
                    <div className="row border">
                        <div className="col-sm-12 mb-2">
                            <Button buttonclass='secondary' text='Cancel the play edit' onClick={onClickCancelEdit}/>
                        </div>
                    </div>
                </div>
            }
        </div>
    )
}

export default Plays
