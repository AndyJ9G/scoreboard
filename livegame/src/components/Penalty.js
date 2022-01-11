import { useEffect, useState } from 'react';
import Button from './Button';
import RushPenalty from './RushPenalty';

const Penalty = ({ socket, statsdata, gamedata, playerdata }) => {
    const [penalty, setPenalty] = useState('penalty');

    // on render
    useEffect(() => {
        setPenalty(statsdata.penalty);
    }, [statsdata]);

    // playDetail
    function playDetail(detail) {
        setPenalty(detail);
        socket.emit('playGUIupdate', { item: 'penalty', value: detail });
        // set repeat down
        socket.emit('playGUIupdate', { item: 'penaltyresult', value: 'repeatdown' });
    }

    return (
        <>
            <div className='container' id='punt'>
                <div className="row border">
                    <div className="d-block bg-warning text-white col-sm-12 mb-2">Penalty</div>
                    <div className="w-100"></div>

                    <div className="col-sm-3 mb-2">
                        <Button buttonclass={penalty === 'nullifyplay' ? 'danger' : 'outline-danger'} text='Nullify Last Play' onClick={(e) => playDetail('nullifyplay')}/>
                    </div>
                    <div className="col-sm-2 mb-2">
                        <Button buttonclass={penalty === 'penalty' ? 'warning' : 'outline-warning'} text='Penalty' onClick={(e) => playDetail('penalty')}/>
                    </div>
                    <div className="col-sm-2 mb-2">
                        <Button buttonclass={penalty === 'decline' ? 'secondary' : 'outline-secondary'} text='Decline' onClick={(e) => playDetail('decline')}/>
                    </div>
                </div>
            </div>
            <RushPenalty socket={socket} statsdata={statsdata} gamedata={gamedata} playerdata={playerdata}/>
        </>
    )
}

export default Penalty
