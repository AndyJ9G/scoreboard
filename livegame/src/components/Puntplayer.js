import { useEffect, useState } from 'react';
import Player from './Player';

const Puntplayer = ({ socket, statsdata, gamedata, playerdata, text, disabled }) => {
    const [punter, setPunter] = useState('');
    const [offense, setOffense] = useState('');

    // on render
    useEffect(() => {
        setPunter(statsdata.punter);
        setOffense(statsdata.offense);
    }, [statsdata]);

    function onChangePunter(value){
        setPunter(value);
        socket.emit('playGUIupdate', { item: 'punter', value: value });
    }

    return (
        <>
            <div className='container' id='rushplayer'>
                <div className="row border">
                    <div className="col-sm-6 mb-2">
                        <Player text={text} value={punter} team={offense} disabled={disabled} gamedata={gamedata} playerdata={playerdata} onChange={(e) => onChangePunter(e.target.value)}/>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Puntplayer
