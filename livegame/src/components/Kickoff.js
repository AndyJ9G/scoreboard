import { useEffect, useState } from 'react';
import Button from './Button';
import Player from './Player';
import Yard from './Yard';

const Kickoff = ({ socket, statsdata, gamedata, playerdata }) => {
    const [kickteam, setKickteam] = useState('');
    const [kicker, setKicker] = useState('');
    const [kicktype, setKicktype] = useState('kickoff');
    const [kickresult, setKickresult] = useState('returned');
    const [returned, setReturned] = useState('');
    const [returnedteam, setReturnedteam] = useState('');
    const [from, setFrom] = useState('35');
    const [fromteam, setFromteam] = useState('');
    const [los, setLos] = useState('');
    const [losteam, setLosteam] = useState('');

    // on render
    useEffect(() => {
        setKickteam(statsdata.kickteam);
        setKicker(statsdata.kicker);
        setKicktype(statsdata.kicktype);
        setKickresult(statsdata.kickresult);
        setReturned(statsdata.returned);
        setReturnedteam(statsdata.returnedteam);
        setFrom(statsdata.from);
        setFromteam(statsdata.fromteam);
        setLos(statsdata.los);
        setLosteam(statsdata.losteam);
    }, [statsdata]);

    // enter
    function enter() {
        socket.emit('playGUIupdate', { item: 'enter', value: 'clicked' });
    }

    function toggleReturnedteam(){
        var team = '';
        if(returnedteam === 'team1'){
            team = 'team2';
        }else{
            team = 'team1';
        }
        setReturnedteam(team);
        socket.emit('playGUIupdate', { item: 'returnedteam', value: team });
    }

    function toggleLosteam(){
        var team = '';
        if(losteam === 'team1'){
            team = 'team2';
        }else{
            team = 'team1';
        }
        setLosteam(team);
        socket.emit('playGUIupdate', { item: 'losteam', value: team });
    }

    function onClickKicktype(value){
        setKicktype(value);
        socket.emit('playGUIupdate', { item: 'kicktype', value: value });
    }

    function onChangeKicker(value){
        setKicker(value);
        socket.emit('playGUIupdate', { item: 'kicker', value: value });
    }

    function onClickKickresult(value){
        setKickresult(value);
        socket.emit('playGUIupdate', { item: 'kickresult', value: value });
        // set LOS
        if(value === 'touchback'){
            socket.emit('playGUIupdate', { item: 'los', value: '0' });
        }
    }

    function onChangeReturned(value){
        setReturned(value);
        socket.emit('playGUIupdate', { item: 'returned', value: value });
    }

    function onChangeFrom(value){
        setFrom(value);
        socket.emit('playGUIupdate', { item: 'from', value: value });
    }

    function onChangeLos(value){
        setLos(value);
        socket.emit('playGUIupdate', { item: 'los', value: value });
    }

    return (
        <>
            <div className='container' id='kickoff'>
                <div className="row border">
                    <div className="d-block bg-info text-white col-sm-12 mb-2">Kickoff</div>
                    <div className="w-100"></div>
                    <div className="col-sm-2 mb-2">
                        <Button buttonclass={kicktype === 'kickoff' ? 'danger' : 'outline-danger'} text='Kick Off' onClick={(e) => onClickKicktype('kickoff')}/>
                    </div>
                    <div className="col-sm-2 mb-2">
                        <Button buttonclass={kicktype === 'onside' ? 'warning' : 'outline-warning'} text='Onside Kick' onClick={(e) => onClickKicktype('onside')}/>
                    </div>
                    <div className="col-sm-2 mb-2"></div>
                    <div className="col-sm-6 mb-2">
                        <Player text='Kicker' team={kickteam} value={kicker} gamedata={gamedata} playerdata={playerdata} onChange={(e) => onChangeKicker(e.target.value)}/>
                    </div>
                </div>
            </div>

            <div className='container' id='kickoffreturn'>
                <div className="row border">
                    <div className="d-block bg-info text-white col-sm-12 mb-2">Kickoff Return</div>
                    <div className="w-100"></div>
                    <div className="col-sm-2 mb-2">
                        <Button buttonclass={kickresult === 'returned' ? 'success' : 'outline-success'} text='Returned' onClick={(e) => onClickKickresult('returned')}/>
                    </div>
                    <div className="col-sm-2 mb-2">
                        <Button buttonclass={kickresult === 'faircatch' ? 'primary' : 'outline-primary'} text='Faircatch' onClick={(e) => onClickKickresult('faircatch')}/>
                    </div>
                    <div className="col-sm-2 mb-2">
                        <Button buttonclass={kickresult === 'touchback' ? 'secondary' : 'outline-secondary'} text='Touchback' onClick={(e) => onClickKickresult('touchback')}/>
                    </div>
                    <div className="col-sm-2 mb-2">
                        <Button buttonclass={kickresult === 'outofbounds' ? 'warning' : 'outline-warning'} text='Out Of Bounds' onClick={(e) => onClickKickresult('outofbounds')}/>
                    </div>
                </div>
            </div>

            <div className='container' id='kickoffresult'>
                <div className="row border">
                    {(() => {
                        switch (kicktype){
                            case 'onside':
                                switch (kickresult) {
                                    case 'faircatch':
                                        return <>
                                            <div className="d-block bg-primary text-white col-sm-12 mb-2">Faircatch Result</div>
                                            <div className="w-100"></div>
                                            <div className="col-sm-6 mb-2">
                                                <Player text='Faircatch' team={returnedteam} value={returned} gamedata={gamedata} playerdata={playerdata} onChange={(e) => onChangeReturned(e.target.value)} onClick={toggleReturnedteam}/>
                                            </div>
                                            <div className="col-sm-4 mb-2">
                                                <Yard id='from' text='From' yard={from} team={fromteam} gamedata={gamedata} onChange={(e) => onChangeFrom(e.target.value)} />
                                            </div>

                                            <div className="w-100"></div>
                                            <div className="col-sm-6 mb-2"></div>
                                            <div className="col-sm-4 mb-2">
                                                <Yard id='kickto' text='Kick To' yard={los} team={losteam} gamedata={gamedata} onChange={(e) => onChangeLos(e.target.value)} onClick={toggleLosteam}/>
                                            </div>
                                            <div className="w-100"></div>
                                        </>
                                        
                                    case 'touchback':
                                        return <>
                                            <div className="d-block bg-secondary text-white col-sm-12 mb-2">Touchback Result</div>
                                            <div className="w-100"></div>
                                            <div className="col-sm-6 mb-2">
                                                <Player text='Touchback' team={returnedteam} value={returned} gamedata={gamedata} playerdata={playerdata} onChange={(e) => onChangeReturned(e.target.value)} onClick={toggleReturnedteam}/>
                                            </div>
                                            <div className="col-sm-4 mb-2">
                                                <Yard id='from' text='From' yard={from} team={fromteam} gamedata={gamedata} onChange={(e) => onChangeFrom(e.target.value)} />
                                            </div>

                                            <div className="w-100"></div>
                                            <div className="col-sm-6 mb-2"></div>
                                            <div className="col-sm-4 mb-2">
                                                <Yard id='kickto' text='Kick To' yard={los} team={losteam} gamedata={gamedata} disabled={true} onChange={(e) => onChangeLos(e.target.value)} />
                                            </div>
                                            <div className="col-sm-2 mb-2"></div>
                                            <div className="w-100"></div>
                                        </>
                                    case 'outofbounds':
                                        return <>
                                            <div className="d-block bg-warning text-white col-sm-12 mb-2">Out Of Bounds Result</div>
                                            <div className="w-100"></div>
                                            <div className="col-sm-6 mb-2"></div>
                                            <div className="col-sm-4 mb-2">
                                                <Yard id='from' text='From' yard={from} team={fromteam} gamedata={gamedata} onChange={(e) => onChangeFrom(e.target.value)} />
                                            </div>

                                            <div className="w-100"></div>
                                            <div className="col-sm-6 mb-2"></div>
                                            <div className="col-sm-4 mb-2">
                                                <Yard id='kickto' text='Kick To' yard={los} team={losteam} gamedata={gamedata} onChange={(e) => onChangeLos(e.target.value)} onClick={toggleLosteam}/>
                                            </div>
                                            <div className="w-100"></div>
                                        </>
                                    default:
                                        return <>
                                            <div className="d-block bg-success text-white col-sm-12 mb-2">Returned Result</div>
                                            <div className="w-100"></div>
                                            <div className="col-sm-6 mb-2">
                                                <Player text='Catched' team={returnedteam} value={returned} gamedata={gamedata} playerdata={playerdata} onChange={(e) => onChangeReturned(e.target.value)} onClick={toggleReturnedteam}/>
                                            </div>
                                            <div className="col-sm-4 mb-2">
                                                <Yard id='from' text='From' yard={from} team={fromteam} gamedata={gamedata} onChange={(e) => onChangeFrom(e.target.value)} />
                                            </div>

                                            <div className="w-100"></div>
                                            <div className="col-sm-6 mb-2"></div>
                                            <div className="col-sm-4 mb-2">
                                                <Yard id='kickto' text='Kick To' yard={los} team={losteam} gamedata={gamedata} onChange={(e) => onChangeLos(e.target.value)} onClick={toggleLosteam}/>
                                            </div>
                                            <div className="w-100"></div>
                                        </>
                                }
                            default:
                                switch (kickresult) {
                                    case 'faircatch':
                                        return <>
                                            <div className="d-block bg-primary text-white col-sm-12 mb-2">Faircatch Result</div>
                                            <div className="w-100"></div>
                                            <div className="col-sm-6 mb-2">
                                                <Player text='Faircatch' team={returnedteam} value={returned} gamedata={gamedata} playerdata={playerdata} onChange={(e) => onChangeReturned(e.target.value)}/>
                                            </div>
                                            <div className="col-sm-4 mb-2">
                                                <Yard id='from' text='From' yard={from} team={fromteam} gamedata={gamedata} onChange={(e) => onChangeFrom(e.target.value)} />
                                            </div>

                                            <div className="w-100"></div>
                                            <div className="col-sm-6 mb-2"></div>
                                            <div className="col-sm-4 mb-2">
                                                <Yard id='kickto' text='Kick To' yard={los} team={losteam} gamedata={gamedata} onChange={(e) => onChangeLos(e.target.value)} onClick={toggleLosteam}/>
                                            </div>
                                            <div className="w-100"></div>
                                        </>
                                        
                                    case 'touchback':
                                        return <>
                                            <div className="d-block bg-secondary text-white col-sm-12 mb-2">Touchback Result</div>
                                            <div className="w-100"></div>
                                            <div className="col-sm-6 mb-2">
                                                <Player text='Touchback' team={returnedteam} value={returned} gamedata={gamedata} playerdata={playerdata} onChange={(e) => onChangeReturned(e.target.value)}/>
                                            </div>
                                            <div className="col-sm-4 mb-2">
                                                <Yard id='from' text='From' yard={from} team={fromteam} gamedata={gamedata} onChange={(e) => onChangeFrom(e.target.value)} />
                                            </div>

                                            <div className="w-100"></div>
                                            <div className="col-sm-6 mb-2"></div>
                                            <div className="col-sm-4 mb-2">
                                                <Yard id='kickto' text='Kick To' yard={los} team={losteam} gamedata={gamedata} disabled={true} onChange={(e) => onChangeLos(e.target.value)} />
                                            </div>
                                            <div className="w-100"></div>
                                        </>
                                    case 'outofbounds':
                                        return <>
                                            <div className="d-block bg-warning text-white col-sm-12 mb-2">Out Of Bounds Result</div>
                                            <div className="w-100"></div>
                                            <div className="col-sm-6 mb-2"></div>
                                            <div className="col-sm-4 mb-2">
                                                <Yard id='from' text='From' yard={from} team={fromteam} gamedata={gamedata} onChange={(e) => onChangeFrom(e.target.value)} />
                                            </div>

                                            <div className="w-100"></div>
                                            <div className="col-sm-6 mb-2"></div>
                                            <div className="col-sm-4 mb-2">
                                                <Yard id='kickto' text='Kick To' yard={los} team={losteam} gamedata={gamedata} onChange={(e) => onChangeLos(e.target.value)} onClick={toggleLosteam}/>
                                            </div>
                                            <div className="w-100"></div>
                                        </>
                                    default:
                                        return <>
                                            <div className="d-block bg-success text-white col-sm-12 mb-2">Returned Result</div>
                                            <div className="w-100"></div>
                                            <div className="col-sm-6 mb-2">
                                                <Player text='Catched' team={returnedteam} value={returned} gamedata={gamedata} playerdata={playerdata} onChange={(e) => onChangeReturned(e.target.value)}/>
                                            </div>
                                            <div className="col-sm-4 mb-2">
                                                <Yard id='from' text='From' yard={from} team={fromteam} gamedata={gamedata} onChange={(e) => onChangeFrom(e.target.value)} />
                                            </div>

                                            <div className="w-100"></div>
                                            <div className="col-sm-6 mb-2"></div>
                                            <div className="col-sm-4 mb-2">
                                                <Yard id='kickto' text='Kick To' yard={los} team={losteam} gamedata={gamedata} onChange={(e) => onChangeLos(e.target.value)} onClick={toggleLosteam}/>
                                            </div>
                                            <div className="w-100"></div>
                                        </>
                                }
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

export default Kickoff
