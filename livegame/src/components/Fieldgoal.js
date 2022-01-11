import { useEffect, useState } from 'react';
import Button from './Button';
import Kickplayer from './Kickplayer';
import RushFieldgoal from './RushFieldgoal';

const Fieldgoal = ({ socket, statsdata, gamedata, playerdata }) => {
    const [fieldgoal, setFieldgoal] = useState('good');

    // on render
    useEffect(() => {
        setFieldgoal(statsdata.fieldgoal);
    }, [statsdata]);

    // playDetail
    function playDetail(detail) {
        setFieldgoal(detail);
        socket.emit('playGUIupdate', { item: 'fieldgoal', value: detail });
        if(detail === 'short' || detail === 'blocked'){
            // result to returned
            socket.emit('playGUIupdate', { item: 'fieldgoalresult', value: 'returned' });
        }
    }

    return (
        <>
            <div className='container' id='fieldgoal'>
                <div className="row border">
                    <div className="d-block bg-primary text-white col-sm-12 mb-2">Field Goal</div>
                    <div className="w-100"></div>

                    <div className="col-sm-2 mb-2">
                        <Button buttonclass={fieldgoal === 'good' ? 'success' : 'outline-success'} text='Good' onClick={(e) => playDetail('good')}/>
                    </div>
                    <div className="col-sm-2 mb-2">
                        <Button buttonclass={fieldgoal === 'wideleft' ? 'warning' : 'outline-warning'} text='Wide Left' onClick={(e) => playDetail('wideleft')}/>
                    </div>
                    <div className="col-sm-2 mb-2">
                        <Button buttonclass={fieldgoal === 'wideright' ? 'warning' : 'outline-warning'} text='Wide Right' onClick={(e) => playDetail('wideright')}/>
                    </div>
                    <div className="col-sm-2 mb-2">
                        <Button buttonclass={fieldgoal === 'short' ? 'primary' : 'outline-primary'} text='Short' onClick={(e) => playDetail('short')}/>
                    </div>
                    <div className="col-sm-2 mb-2">
                        <Button buttonclass={fieldgoal === 'blocked' ? 'danger' : 'outline-danger'} text='Blocked' onClick={(e) => playDetail('blocked')}/>
                    </div>
                </div>
            </div>
            <Kickplayer text='Field Goal' socket={socket} statsdata={statsdata} gamedata={gamedata} playerdata={playerdata}/>
            <RushFieldgoal socket={socket} statsdata={statsdata} gamedata={gamedata} playerdata={playerdata}/>
        </>
    )
}

export default Fieldgoal
