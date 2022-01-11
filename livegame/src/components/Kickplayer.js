import { useEffect, useState } from 'react';
import Player from './Player';

const Kickplayer = ({ socket, statsdata, gamedata, playerdata, text, disabled }) => {
    const [kicker, setKicker] = useState('');
    const [kickteam, setKickteam] = useState('');

    // on render
    useEffect(() => {
        setKicker(statsdata.kicker);
        setKickteam(statsdata.kickteam);
    }, [statsdata]);

    function onChangeKicker(value){
        setKicker(value);
        socket.emit('playGUIupdate', { item: 'kicker', value: value });
    }

    return (
        <>
            <div className='container' id='rushplayer'>
                <div className="row border">
                    <div className="col-sm-6 mb-2">
                        <Player text={text} value={kicker} team={kickteam} gamedata={gamedata} playerdata={playerdata} onChange={(e) => onChangeKicker(e.target.value)}/>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Kickplayer
