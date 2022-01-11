import { useEffect, useState } from 'react';
import Player from './Player';

const Runplayer = ({ socket, statsdata, gamedata, playerdata, text, disabled }) => {
    const [rusher, setRusher] = useState('');
    const [offense, setOffense] = useState('');

    // on render
    useEffect(() => {
        setRusher(statsdata.rusher);
        setOffense(statsdata.offense);
    }, [statsdata]);

    function onChangeRusher(value){
        setRusher(value);
        socket.emit('playGUIupdate', { item: 'rusher', value: value });
    }

    return (
        <>
            <div className='container' id='runplayer'>
                <div className="row border">
                    <div className="col-sm-6 mb-2">
                        <Player text={text} value={rusher} team={offense} disabled={disabled} gamedata={gamedata} playerdata={playerdata} onChange={(e) => onChangeRusher(e.target.value)}/>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Runplayer
