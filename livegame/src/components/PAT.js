import { useEffect, useState } from 'react';
import Button from './Button';
import Patplayer from './Patplayer';
import RushPAT from './RushPAT';

const PAT = ({ socket, statsdata, gamedata, playerdata }) => {
    const [pat, setPat] = useState('kick');

    // on render
    useEffect(() => {
        setPat(statsdata.pat);
    }, [statsdata]);

    // playDetail
    function playDetail(detail) {
        setPat(detail);
        socket.emit('playGUIupdate', { item: 'pat', value: detail });
        // result to good
        socket.emit('playGUIupdate', { item: 'patresult', value: 'good' });
    }

    return (
        <>
            <div className='container' id='pat'>
                <div className="row border">
                    <div className="d-block bg-primary text-white col-sm-12 mb-2">PAT</div>
                    <div className="w-100"></div>

                    <div className="col-sm-2 mb-2">
                        <Button buttonclass={pat === 'patkick' ? 'primary' : 'outline-primary'} text='Kick' onClick={(e) => playDetail('patkick')}/>
                    </div>
                    <div className="col-sm-2 mb-2">
                        <Button buttonclass={pat === 'patrush' ? 'success' : 'outline-success'} text='Rush' onClick={(e) => playDetail('patrush')}/>
                    </div>
                    <div className="col-sm-2 mb-2">
                        <Button buttonclass={pat === 'patpass' ? 'secondary' : 'outline-secondary'} text='Pass' onClick={(e) => playDetail('patpass')}/>
                    </div>
                </div>
            </div>
            <Patplayer socket={socket} statsdata={statsdata} gamedata={gamedata} playerdata={playerdata}/>
            <RushPAT socket={socket} statsdata={statsdata} gamedata={gamedata} playerdata={playerdata}/>
        </>
    )
}

export default PAT
