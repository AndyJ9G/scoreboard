import { useEffect, useState } from 'react';
import GameSituation from './GameSituation';

const Header = ({socket, showDrive}) => {
    const [statsdata, setStatsdata] = useState({});
    const [gamedata, setGamedata] = useState({});

    // on render
    useEffect(() => {
        //socket.emit('requeststatsdata', { message: 'Client requesting stats' });
        socket.emit('requestGuiData', { message: 'Client requesting guiData' });
        socket.on('sendGUIdata', (guiData) => {
            setStatsdata(guiData);
        });
        socket.emit('requestLiveGameData', { message: 'Client requesting liveGameData' });
        socket.on('sendLiveGameData', (gameData) => {setGamedata(gameData)});
    }, [socket]);

    return (
        <>
            <GameSituation socket={socket} statsdata={statsdata} gamedata={gamedata} showDrive={showDrive}/>
        </>
    )
}

export default Header
