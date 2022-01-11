import { useEffect, useState } from 'react';
import Button from './Button';
import Player from './Player';
import Yard from './Yard';
import { toast } from 'react-toastify';

const RushFieldgoal = ({ socket, statsdata, gamedata, playerdata }) => {
    const [fieldgoal, setFieldgoal] = useState('good');
    const [fieldgoalresult, setFieldgoalresult] = useState('returned');
    const [defense, setDefense] = useState('');
    const [los, setLos] = useState('');
    const [losteam, setLosteam] = useState('');
    const [fieldgoalrecovered, setFieldgoalrecovered] = useState();
    const [fieldgoalrecoveredteam, setFieldgoalrecoveredteam] = useState('');
    const [recoveredto, setRecoveredto] = useState();
    const [recoveredtoteam, setRecoveredtoteam] = useState('');
    const [blockedby, setBlockedby] = useState('');
    const [returnedby, setReturnedby] = useState();
    const [returnedbyteam, setReturnedbyteam] = useState('');

    // on render
    useEffect(() => {
        setFieldgoal(statsdata.fieldgoal);
        setFieldgoalresult(statsdata.fieldgoalresult);
        setDefense(statsdata.defense);
        setLos(statsdata.los);
        setLosteam(statsdata.losteam);
        setFieldgoalrecovered(statsdata.fieldgoalrecovered);
        setFieldgoalrecoveredteam(statsdata.fieldgoalrecoveredteam);
        setRecoveredto(statsdata.recoveredto);
        setRecoveredtoteam(statsdata.recoveredtoteam);
        setBlockedby(statsdata.blockedby);
        setReturnedby(statsdata.returnedby);
        setReturnedbyteam(statsdata.returnedbyteam);
    }, [statsdata]);

    // enter
    function enter() {
        socket.emit('playGUIupdate', { item: 'enter', value: 'clicked' });
        toast.success('Field Goal saved', {autoClose: 1000, theme: 'dark'});
    }

    function toggleFieldgoalrecoveredteam(){
        var team = '';
        if(fieldgoalrecoveredteam === 'team1'){
            team = 'team2';
        }else{
            team = 'team1';
        }
        setFieldgoalrecoveredteam(team);
        socket.emit('playGUIupdate', { item: 'fieldgoalrecoveredteam', value: team });
    }

    function toggleRecoveredtoteam(){
        var team = '';
        if(recoveredtoteam === 'team1'){
            team = 'team2';
        }else{
            team = 'team1';
        }
        setRecoveredtoteam(team);
        socket.emit('playGUIupdate', { item: 'recoveredtoteam', value: team });
    }

    function onClickFieldgoalresult(value){
        setFieldgoalresult(value);
        socket.emit('playGUIupdate', { item: 'fieldgoalresult', value: value });
        // check touchback
        if(value === 'touchback'){
            socket.emit('playGUIupdate', { item: 'recoveredto', value: '0' });
        }
    }

    function onChangeLos(value){
        setLos(value);
        socket.emit('playGUIupdate', { item: 'los', value: value });
    }

    function onChangeFieldgoalrecovered(value){
        setFieldgoalrecovered(value);
        socket.emit('playGUIupdate', { item: 'fieldgoalrecovered', value: value });
    }

    function onChangeBlockedby(value){
        setBlockedby(value);
        socket.emit('playGUIupdate', { item: 'blockedby', value: value });
    }

    function onChangeRecoveredto(value){
        setRecoveredto(value);
        socket.emit('playGUIupdate', { item: 'recoveredto', value: value });
    }

    function onChangeReturnedby(value){
        setReturnedby(value);
        socket.emit('playGUIupdate', { item: 'returnedby', value: value });
    }

    return (
        <>
            <div className='container' id='rushfieldgoal'>
                <div className="row border">
                    {(() => {
                        switch (fieldgoal) {
                            case 'good':
                                return<div className="d-block bg-success text-white col-sm-12 mb-2">Good</div>
                            case 'wideleft':
                                return<div className="d-block bg-warning text-white col-sm-12 mb-2">Wide Left</div>
                            case 'wideright':
                                return<div className="d-block bg-warning text-white col-sm-12 mb-2">Wide Right</div>
                            case 'short':
                                return<div className="d-block bg-primary text-white col-sm-12 mb-2">Short</div>
                            case 'blocked':
                                return<div className="d-block bg-danger text-white col-sm-12 mb-2">Blocked</div>
                            default:
                                return null
                        }
                    })()}
                    <div className="w-100"></div>

                    {(() => {
                        switch (fieldgoal) {
                            case 'short':
                                return <>
                                    <div className="col-sm-2 mb-2">
                                        <Button buttonclass={fieldgoalresult === 'returned' ? 'primary' : 'outline-primary'} text='Returned' onClick={(e) => onClickFieldgoalresult('returned')}/>
                                    </div>
                                    <div className="col-sm-2 mb-2">
                                        <Button buttonclass={fieldgoalresult === 'downed' ? 'secondary' : 'outline-secondary'} text='Downed' onClick={(e) => onClickFieldgoalresult('downed')}/>
                                    </div>

                                    <div className="w-100"></div>

                                    <div className="col-sm-6 mb-2">
                                        <Player text={fieldgoalresult === 'returned' ? 'Recovered' : 'Downed'} team={returnedbyteam} value={returnedby} gamedata={gamedata} playerdata={playerdata} onChange={(e) => onChangeReturnedby(e.target.value)}/>
                                    </div>

                                    <div className="col-sm-4 mb-2">
                                        <Yard id='ballon' text='Kick from' yard={los} team={losteam} disabled={true} gamedata={gamedata} onChange={(e) => onChangeLos(e.target.value)} />
                                    </div>

                                    <div className="w-100"></div>

                                    <div className="col-sm-6 mb-2"></div>

                                    <div className="col-sm-4 mb-2">
                                        <Yard id='recoveredto' text='Recovered At' yard={recoveredto} team={recoveredtoteam} gamedata={gamedata} onChange={(e) => onChangeRecoveredto(e.target.value)} onClick={toggleRecoveredtoteam}/>
                                    </div>
                                </>
                            case 'blocked':
                                return <>
                                    <div className="col-sm-2 mb-2">
                                        <Button buttonclass={fieldgoalresult === 'returned' ? 'primary' : 'outline-primary'} text='Returned' onClick={(e) => onClickFieldgoalresult('returned')}/>
                                    </div>
                                    <div className="col-sm-2 mb-2">
                                        <Button buttonclass={fieldgoalresult === 'downed' ? 'secondary' : 'outline-secondary'} text='Downed' onClick={(e) => onClickFieldgoalresult('downed')}/>
                                    </div>
                                    <div className="col-sm-2 mb-2">
                                        <Button buttonclass={fieldgoalresult === 'faircatch' ? 'secondary' : 'outline-secondary'} text='Faircatch' onClick={(e) => onClickFieldgoalresult('faircatch')}/>
                                    </div>
                                    <div className="col-sm-2 mb-2">
                                        <Button buttonclass={fieldgoalresult === 'touchback' ? 'warning' : 'outline-warning'} text='Touchback' onClick={(e) => onClickFieldgoalresult('touchback')}/>
                                    </div>
                                    <div className="col-sm-2 mb-2">
                                        <Button buttonclass={fieldgoalresult === 'outofbounds' ? 'dark' : 'outline-dark'} text='Out Of Bounds' onClick={(e) => onClickFieldgoalresult('outofbounds')}/>
                                    </div>

                                    <div className="w-100"></div>
                                    {(() => {
                                        switch (fieldgoalresult) {
                                            case 'returned':
                                            case 'downed':
                                            case 'faircatch':
                                                return <>
                                                    <div className="col-sm-6 mb-2">
                                                        <Player text='Blocked' team={defense} value={blockedby} gamedata={gamedata} playerdata={playerdata} onChange={(e) => onChangeBlockedby(e.target.value)}/>
                                                    </div>

                                                    <div className="col-sm-4 mb-2">
                                                        <Yard id='ballon' text='Kick from' yard={los} team={losteam} disabled={true} gamedata={gamedata} onChange={(e) => onChangeLos(e.target.value)} />
                                                    </div>

                                                    <div className="w-100"></div>

                                                    <div className="col-sm-6 mb-2">
                                                        <Player text='Recovered' team={fieldgoalrecoveredteam} value={fieldgoalrecovered} gamedata={gamedata} playerdata={playerdata} onChange={(e) => onChangeFieldgoalrecovered(e.target.value)} onClick={toggleFieldgoalrecoveredteam}/>
                                                    </div>

                                                    <div className="col-sm-4 mb-2">
                                                        <Yard id='recoveredto' text='Recovered At' yard={recoveredto} team={recoveredtoteam} gamedata={gamedata} onChange={(e) => onChangeRecoveredto(e.target.value)} onClick={toggleRecoveredtoteam}/>
                                                    </div>
                                                </>
                                                
                                            case 'touchback':
                                                return <>
                                                    <div className="col-sm-6 mb-2">
                                                        <Player text='Blocked' team={defense} value={blockedby} gamedata={gamedata} playerdata={playerdata} onChange={(e) => onChangeBlockedby(e.target.value)}/>
                                                    </div>

                                                    <div className="col-sm-4 mb-2">
                                                        <Yard id='ballon' text='Kick from' yard={los} team={losteam} disabled={true} gamedata={gamedata} onChange={(e) => onChangeLos(e.target.value)} />
                                                    </div>

                                                    <div className="w-100"></div>

                                                    <div className="col-sm-6 mb-2">
                                                        <Player text='Recovered' team={fieldgoalrecoveredteam} value={fieldgoalrecovered} gamedata={gamedata} playerdata={playerdata} onChange={(e) => onChangeFieldgoalrecovered(e.target.value)} onClick={toggleFieldgoalrecoveredteam}/>
                                                    </div>

                                                    <div className="col-sm-4 mb-2">
                                                        <Yard id='recoveredto' text='Recovered At' yard={recoveredto} team={recoveredtoteam} disabled={true} gamedata={gamedata} onChange={(e) => onChangeRecoveredto(e.target.value)} />
                                                    </div>
                                                </>

                                            case 'outofbounds':
                                                return <>
                                                    <div className="col-sm-6 mb-2">
                                                        <Player text='Blocked' team={defense} value={blockedby} gamedata={gamedata} playerdata={playerdata} onChange={(e) => onChangeBlockedby(e.target.value)}/>
                                                    </div>

                                                    <div className="col-sm-4 mb-2">
                                                        <Yard id='ballon' text='Kick from' yard={los} team={losteam} disabled={true} gamedata={gamedata} onChange={(e) => onChangeLos(e.target.value)} />
                                                    </div>

                                                    <div className="w-100"></div>

                                                    <div className="col-sm-6 mb-2"></div>

                                                    <div className="col-sm-4 mb-2">
                                                        <Yard id='recoveredto' text='Recovered At' yard={recoveredto} team={recoveredtoteam} gamedata={gamedata} onChange={(e) => onChangeRecoveredto(e.target.value)} onClick={toggleRecoveredtoteam}/>
                                                    </div>
                                                </>
                                            default:
                                                return <>
                                                    <div className="w-100"></div>

                                                    <div className="col-sm-6 mb-2"></div>

                                                    <div className="col-sm-4 mb-2">
                                                        <Yard id='ballon' text='Kick from' yard={los} team={losteam} disabled={true} gamedata={gamedata} onChange={(e) => onChangeLos(e.target.value)} />
                                                    </div>
                                                </>
                                        }
                                    })()}
                                </>
                            default:
                                return <>
                                    <div className="w-100"></div>

                                    <div className="col-sm-6 mb-2"></div>

                                    <div className="col-sm-4 mb-2">
                                        <Yard id='ballon' text='Kick from' yard={los} team={losteam} disabled={true} gamedata={gamedata} onChange={(e) => onChangeLos(e.target.value)} />
                                    </div>
                                </>
                        }
                    })()}

                    <div className="w-100"></div>

                    <div className="col-sm-8 mb-2"></div>
                    <div className="col-sm-4 mb-2">
                        <Button buttonclass='success' text='Enter' onClick={enter}/>
                    </div>
                </div>
            </div>
        </>
    )
}

export default RushFieldgoal
