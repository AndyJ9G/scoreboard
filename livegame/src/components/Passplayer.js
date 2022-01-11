import { useEffect, useState } from 'react';
import Player from './Player';

const Passplayer = ({ socket, statsdata, gamedata, playerdata }) => {
    const [receiver, setReceiver] = useState('');
    const [passer, setPasser] = useState('');
    const [offense, setOffense] = useState('');

    // on render
    useEffect(() => {
        setReceiver(statsdata.receiver);
        setPasser(statsdata.passer);
        setOffense(statsdata.offense);
    }, [statsdata]);

    function onChangeReceiver(value){
        setReceiver(value);
        socket.emit('playGUIupdate', { item: 'receiver', value: value });
    }

    function onChangePasser(value){
        setPasser(value);
        socket.emit('playGUIupdate', { item: 'passer', value: value });
    }

    return (
        <>
            <div className='container' id='passplayer'>
                <div className="row border">
                    <div className="col-sm-6 mb-2">
                        {(() => {
                            switch (statsdata.passplay) {
                                case 'complete':
                                    return <Player text='Receiver' value={receiver} team={offense} gamedata={gamedata} playerdata={playerdata} onChange={(e) => onChangeReceiver(e.target.value)}/>
                                case 'intercepted':
                                case 'brokenup':
                                case 'incomplete':
                                case 'uncatchable':
                                case 'dropped':
                                    return <Player text='Intended' value={receiver} team={offense} gamedata={gamedata} playerdata={playerdata} onChange={(e) => onChangeReceiver(e.target.value)}/>
                                case 'thrownaway':
                                case 'spiked':
                                default:
                                    return null
                            }
                        })()}
                    </div>
                    <div className="col-sm-6 mb-2">
                        <Player text='Passer' value={passer} team={offense} gamedata={gamedata} playerdata={playerdata} onChange={(e) => onChangePasser(e.target.value)}/>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Passplayer
