import { useEffect, useState } from 'react';
import Player from './Player';

const Patplayer = ({ socket, statsdata, gamedata, playerdata }) => {
    const [receiver, setReceiver] = useState('');
    const [passer, setPasser] = useState('');
    const [rusher, setRusher] = useState('');
    const [kicker, setKicker] = useState('');
    const [offense, setOffense] = useState('');

    // on render
    useEffect(() => {
        setReceiver(statsdata.receiver);
        setPasser(statsdata.passer);
        setRusher(statsdata.rusher);
        setKicker(statsdata.kicker);
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

    function onChangeRusher(value){
        setRusher(value);
        socket.emit('playGUIupdate', { item: 'rusher', value: value });
    }

    function onChangeKicker(value){
        setKicker(value);
        socket.emit('playGUIupdate', { item: 'kicker', value: value });
    }

    return (
        <>
            <div className='container' id='patplayer'>
                <div className="row border">
                    {(() => {
                        switch (statsdata.pat) {
                            case 'patkick':
                                return <>
                                    <div className="col-sm-6 mb-2">
                                        <Player text='Kicker' value={kicker} team={offense} gamedata={gamedata} playerdata={playerdata} onChange={(e) => onChangeKicker(e.target.value)}/>
                                    </div>
                                </>
                            case 'patrush':
                                return <>
                                    <div className="col-sm-6 mb-2">
                                        <Player text='Rusher' value={rusher} team={offense} gamedata={gamedata} playerdata={playerdata} onChange={(e) => onChangeRusher(e.target.value)}/>
                                    </div>
                                </>
                            case 'patpass':
                                return <>
                                    <div className="col-sm-6 mb-2">
                                        <Player text='Receiver' value={receiver} team={offense} gamedata={gamedata} playerdata={playerdata} onChange={(e) => onChangeReceiver(e.target.value)}/>
                                    </div>
                                    <div className="col-sm-6 mb-2">
                                        <Player text='Passer' value={passer} team={offense} gamedata={gamedata} playerdata={playerdata} onChange={(e) => onChangePasser(e.target.value)}/>
                                    </div>
                                </>
                            default:
                                return null
                        }
                    })()}
                </div>
            </div>
        </>
    )
}

export default Patplayer
