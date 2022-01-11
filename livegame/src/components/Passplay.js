import { useEffect, useState } from 'react';
import Button from './Button';
import RushPass from './RushPass';
import Passplayer from './Passplayer';

const Passplay = ({ socket, statsdata, gamedata, playerdata }) => {
    const [passplay, setPassplay] = useState('complete');

    // on render
    useEffect(() => {
        setPassplay(statsdata.passplay);
    }, [statsdata]);

    // playDetail
    function playDetail(detail) {
        setPassplay(detail);
        socket.emit('playGUIupdate', { item: 'passplay', value: detail });
        if(detail === 'complete'){
            // result to tackle
            socket.emit('playGUIupdate', { item: 'passresult', value: 'tackle' });
        }else{
            // result to notackle
            socket.emit('playGUIupdate', { item: 'passresult', value: 'notackle' });
        }
    }

    return (
        <>
            <div className='container' id='passplay'>
                <div className="row border">
                    <div className="d-block bg-success text-white col-sm-12 mb-2">Pass</div>
                    <div className="w-100"></div>

                    <div className="col-sm-2 mb-2">
                        <Button buttonclass={passplay === 'complete' ? 'success' : 'outline-success'} text='Complete' onClick={(e) => playDetail('complete')}/>
                    </div>
                    <div className="col-sm-2 mb-2">
                        <Button buttonclass={passplay === 'intercepted' ? 'danger' : 'outline-danger'} text='Intercepted' onClick={(e) => playDetail('intercepted')}/>
                    </div>
                    <div className="col-sm-2 mb-2">
                        <Button buttonclass={passplay === 'brokenup' ? 'warning' : 'outline-warning'} text='Broken Up' onClick={(e) => playDetail('brokenup')}/>
                    </div>
                    <div className="col-sm-2 mb-2">
                        <Button buttonclass={passplay === 'incomplete' ? 'primary' : 'outline-primary'} text='Incomplete' onClick={(e) => playDetail('incomplete')}/>
                    </div>
                    <div className="col-sm-2 mb-2">
                        <Button buttonclass={passplay === 'thrownaway' ? 'primary' : 'outline-primary'} text='Thrown Away' onClick={(e) => playDetail('thrownaway')}/>
                    </div>

                    <div className="w-100"></div>

                    <div className="col-sm-2 mb-2">
                        <Button buttonclass={passplay === 'uncatchable' ? 'secondary' : 'outline-secondary'} text='Uncatchable' onClick={(e) => playDetail('uncatchable')}/>
                    </div>
                    <div className="col-sm-2 mb-2">
                        <Button buttonclass={passplay === 'dropped' ? 'secondary' : 'outline-secondary'} text='Dropped' onClick={(e) => playDetail('dropped')}/>
                    </div>
                    <div className="col-sm-2 mb-2">
                        <Button buttonclass={passplay === 'spiked' ? 'dark' : 'outline-dark'} text='Spiked' onClick={(e) => playDetail('spiked')}/>
                    </div>
                </div>
            </div>
            <Passplayer socket={socket} statsdata={statsdata} gamedata={gamedata} playerdata={playerdata}/>
            <RushPass socket={socket} statsdata={statsdata} gamedata={gamedata} playerdata={playerdata}/>
        </>
    )
}

export default Passplay
