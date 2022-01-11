import { useEffect, useState } from 'react';
import Button from './Button';
import Runplay from './Runplay';
import Passplay from './Passplay';
import Punt from './Punt';
import Fieldgoal from './Fieldgoal';
import PAT from './PAT';
import Penalty from './Penalty';

const Chooseplay = ({ socket, statsdata, gamedata, playerdata }) => {
    const [play, setPlay] = useState('run');

    // on render
    useEffect(() => {
        setPlay(statsdata.play);
    }, [statsdata]);

    // playDetail
    function playDetail(detail) {
        setPlay(detail);
        socket.emit('playGUIupdate', { item: 'play', value: detail });
    }

    return (
        <>
            <div className='container' id='chooseplay'>
                <div className="row border">
                    <div className="d-block bg-info text-white col-sm-12 mb-2">Choose Play</div>
                    <div className="w-100"></div>

                    <div className="col-sm-2 mb-2">
                        <Button buttonclass={play === 'run' ? 'success' : 'outline-success'} text='Run' onClick={(e) => playDetail('run')}/>
                    </div>
                    <div className="col-sm-2 mb-2">
                        <Button buttonclass={play === 'pass' ? 'success' : 'outline-success'} text='Pass' onClick={(e) => playDetail('pass')}/>
                    </div>
                    <div className="col-sm-2 mb-2">
                        <Button buttonclass={play === 'punt' ? 'secondary' : 'outline-secondary'} text='Punt' onClick={(e) => playDetail('punt')}/>
                    </div>
                    <div className="col-sm-2 mb-2">
                        <Button buttonclass={play === 'fieldgoal' ? 'primary' : 'outline-primary'} text='Field Goal' onClick={(e) => playDetail('fieldgoal')}/>
                    </div>
                    <div className="col-sm-2 mb-2">
                        <Button buttonclass={play === 'penalty' ? 'warning' : 'outline-warning'} text='Penalty' onClick={(e) => playDetail('penalty')}/>
                    </div>
                    <div className="col-sm-2 mb-2">
                        <Button buttonclass={play === 'badsnap' ? 'dark' : 'outline-dark'} text='Bad Snap' onClick={(e) => playDetail('badsnap')}/>
                    </div>

                    <div className="w-100"></div>

                    <div className="col-sm-2 mb-2">
                        <Button buttonclass={play === 'pat' ? 'primary' : 'outline-light'} disabled={true} text='PAT' onClick={(e) => playDetail('pat')}/>
                    </div>
                    <div className="col-sm-2 mb-2">
                        <Button buttonclass={play === 'kickoff' ? 'info' : 'outline-light'} disabled={true} text='Kick Off' onClick={(e) => playDetail('kickoff')}/>
                    </div>
                </div>
            </div>
            {(() => {
                switch (play) {
                    case 'run':
                        return <Runplay socket={socket} statsdata={statsdata} gamedata={gamedata} playerdata={playerdata}/>
                    case 'pass':
                        return <Passplay socket={socket} statsdata={statsdata} gamedata={gamedata} playerdata={playerdata}/>
                    case 'punt':
                        return <Punt socket={socket} statsdata={statsdata} gamedata={gamedata} playerdata={playerdata}/>
                    case 'fieldgoal':
                        return <Fieldgoal socket={socket} statsdata={statsdata} gamedata={gamedata} playerdata={playerdata}/>
                    case 'pat':
                        return <PAT socket={socket} statsdata={statsdata} gamedata={gamedata} playerdata={playerdata}/>
                    case 'penalty':
                        return <Penalty socket={socket} statsdata={statsdata} gamedata={gamedata} playerdata={playerdata}/>
                    default:
                        return null
                }
            })()}
        </>
    )
}

export default Chooseplay
