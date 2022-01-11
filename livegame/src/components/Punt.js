import { useEffect, useState } from 'react';
import Button from './Button';
import RushPunt from './RushPunt';
import Puntplayer from './Puntplayer';

const Punt = ({ socket, statsdata, gamedata, playerdata }) => {
    const [punt, setPunt] = useState('puntgood');

    // on render
    useEffect(() => {
        setPunt(statsdata.punt);
    }, [statsdata]);

    // playDetail
    function playDetail(detail) {
        setPunt(detail);
        socket.emit('playGUIupdate', { item: 'punt', value: detail });
    }

    return (
        <>
            <div className='container' id='punt'>
                <div className="row border">
                    <div className="d-block bg-secondary text-white col-sm-12 mb-2">Punt</div>
                    <div className="w-100"></div>

                    <div className="col-sm-2 mb-2">
                        <Button buttonclass={punt === 'puntgood' ? 'success' : 'outline-success'} text='Punt Good' onClick={(e) => playDetail('puntgood')}/>
                    </div>
                    <div className="col-sm-2 mb-2">
                        <Button buttonclass={punt === 'blocked' ? 'danger' : 'outline-danger'} text='Blocked' onClick={(e) => playDetail('blocked')}/>
                    </div>
                </div>
            </div>
            <Puntplayer text='Punt By' socket={socket} statsdata={statsdata} gamedata={gamedata} playerdata={playerdata}/>
            <RushPunt socket={socket} statsdata={statsdata} gamedata={gamedata} playerdata={playerdata}/>
        </>
    )
}

export default Punt
