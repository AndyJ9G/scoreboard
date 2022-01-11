import { useEffect, useState } from 'react';
import Button from './Button';
import Rush from './Rush';
import Runplayer from './Runplayer';

const Runplay = ({ socket, statsdata, gamedata, playerdata }) => {
    const [runplay, setRunplay] = useState('handoff');

    // on render
    useEffect(() => {
        setRunplay(statsdata.runplay);
    }, [statsdata]);

    // playDetail
    function playDetail(detail) {
        setRunplay(detail);
        socket.emit('playGUIupdate', { item: 'runplay', value: detail });
        if(detail === 'kneeldown'){
            // result to notackle
            socket.emit('playGUIupdate', { item: 'rushresult', value: 'notackle' });
        }else{
            // result to tackle
            socket.emit('playGUIupdate', { item: 'rushresult', value: 'tackle' });
        }
    }

    return (
        <>
            <div className='container' id='runplay'>
                <div className="row border">
                    <div className="d-block bg-success text-white col-sm-12 mb-2">Run</div>
                    <div className="w-100"></div>

                    <div className="col-sm-2 mb-2">
                        <Button buttonclass={runplay === 'handoff' ? 'success' : 'outline-success'} text='Handoff' onClick={(e) => playDetail('handoff')}/>
                    </div>
                    <div className="col-sm-2 mb-2">
                        <Button buttonclass={runplay === 'pitch' ? 'success' : 'outline-success'} text='Pitch' onClick={(e) => playDetail('pitch')}/>
                    </div>
                    <div className="col-sm-2 mb-2">
                        <Button buttonclass={runplay === 'option' ? 'success' : 'outline-success'} text='Option' onClick={(e) => playDetail('option')}/>
                    </div>
                    <div className="col-sm-2 mb-2">
                        <Button buttonclass={runplay === 'draw' ? 'primary' : 'outline-primary'} text='Draw' onClick={(e) => playDetail('draw')}/>
                    </div>
                    <div className="col-sm-2 mb-2">
                        <Button buttonclass={runplay === 'reverse' ? 'secondary' : 'outline-secondary'} text='Reverse' onClick={(e) => playDetail('reverse')}/>
                    </div>

                    <div className="w-100"></div>

                    <div className="col-sm-2 mb-2">
                        <Button buttonclass={runplay === 'keeper' ? 'warning' : 'outline-warning'} text='Keeper' onClick={(e) => playDetail('keeper')}/>
                    </div>
                    <div className="col-sm-2 mb-2">
                        <Button buttonclass={runplay === 'scramble' ? 'warning' : 'outline-warning'} text='Scramble' onClick={(e) => playDetail('scramble')}/>
                    </div>
                    <div className="col-sm-2 mb-2">
                        <Button buttonclass={runplay === 'sack' ? 'danger' : 'outline-danger'} text='Sack' onClick={(e) => playDetail('sack')}/>
                    </div>
                    <div className="col-sm-2 mb-2">
                        <Button buttonclass={runplay === 'kneeldown' ? 'dark' : 'outline-dark'} text='Kneeldown' onClick={(e) => playDetail('kneeldown')}/>
                    </div>
                </div>
            </div>
            <Runplayer text='Rusher' socket={socket} statsdata={statsdata} gamedata={gamedata} playerdata={playerdata}/>
            <Rush socket={socket} statsdata={statsdata} gamedata={gamedata} playerdata={playerdata}/>
        </>
    )
}

export default Runplay
