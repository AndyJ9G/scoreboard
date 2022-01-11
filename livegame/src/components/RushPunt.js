import { useEffect, useState } from 'react';
import Button from './Button';
import Player from './Player';
import Yard from './Yard';
import { toast } from 'react-toastify';

const RushPunt = ({ socket, statsdata, gamedata, playerdata }) => {
    const [puntresult, setPuntresult] = useState('puntgood');
    const [defense, setDefense] = useState('');
    const [los, setLos] = useState('');
    const [losteam, setLosteam] = useState('');
    const [puntrecovered, setPuntrecovered] = useState();
    const [puntrecoveredteam, setPuntrecoveredteam] = useState('');
    const [returnedby, setReturnedby] = useState('');
    const [puntto, setPuntto] = useState('');
    const [punttoteam, setPunttoteam] = useState('');
    const [punt, setPunt] = useState('returned');
    const [blockedby, setBlockedby] = useState('');

    // on render
    useEffect(() => {
        setPuntresult(statsdata.puntresult);
        setDefense(statsdata.defense);
        setLos(statsdata.los);
        setLosteam(statsdata.losteam);
        setPuntrecovered(statsdata.puntrecovered);
        setPuntrecoveredteam(statsdata.puntrecoveredteam);
        setReturnedby(statsdata.returnedby);
        setPuntto(statsdata.puntto);
        setPunttoteam(statsdata.punttoteam);
        setPunt(statsdata.punt);
        setBlockedby(statsdata.blockedby);
    }, [statsdata]);

    // enter
    function enter() {
        socket.emit('playGUIupdate', { item: 'enter', value: 'clicked' });
        toast.success('Punt saved', {autoClose: 1000, theme: 'dark'});
    }

    function togglePunttoteam(){
        var team = '';
        if(punttoteam === 'team1'){
            team = 'team2';
        }else{
            team = 'team1';
        }
        setPunttoteam(team);
        socket.emit('playGUIupdate', { item: 'punttoteam', value: team });
    }

    function togglePuntrecoveredteam(){
        var team = '';
        if(puntrecoveredteam === 'team1'){
            team = 'team2';
        }else{
            team = 'team1';
        }
        setPuntrecoveredteam(team);
        socket.emit('playGUIupdate', { item: 'puntrecoveredteam', value: team });
    }

    function onClickPuntresult(value){
        setPuntresult(value);
        socket.emit('playGUIupdate', { item: 'puntresult', value: value });
        // check touchback
        if(value === 'touchback'){
            socket.emit('playGUIupdate', { item: 'puntto', value: '0' });
        }
    }

    function onChangeLos(value){
        setLos(value);
        socket.emit('playGUIupdate', { item: 'los', value: value });
    }

    function onChangeReturnedby(value){
        setReturnedby(value);
        socket.emit('playGUIupdate', { item: 'returnedby', value: value });
    }

    function onChangePuntto(value){
        setPuntto(value);
        socket.emit('playGUIupdate', { item: 'puntto', value: value });
    }

    function onChangePuntrecovered(value){
        setPuntrecovered(value);
        socket.emit('playGUIupdate', { item: 'puntrecovered', value: value });
    }

    function onChangeBlockedby(value){
        setBlockedby(value);
        socket.emit('playGUIupdate', { item: 'blockedby', value: value });
    }

    return (
        <>
            <div className='container' id='rushpunt'>
                <div className="row border">
                    {(() => {
                        switch (punt) {
                            case 'puntgood':
                                return<div className="d-block bg-success text-white col-sm-12 mb-2">Punt Good</div>
                            case 'blocked':
                                return<div className="d-block bg-danger text-white col-sm-12 mb-2">Blocked</div>
                            default:
                                return null
                        }
                    })()}
                    <div className="w-100"></div>

                    <div className="col-sm-2 mb-2">
                        <Button buttonclass={puntresult === 'returned' ? 'primary' : 'outline-primary'} text='Returned' onClick={(e) => onClickPuntresult('returned')}/>
                    </div>
                    <div className="col-sm-2 mb-2">
                        <Button buttonclass={puntresult === 'downed' ? 'secondary' : 'outline-secondary'} text='Downed' onClick={(e) => onClickPuntresult('downed')}/>
                    </div>
                    <div className="col-sm-2 mb-2">
                        <Button buttonclass={puntresult === 'faircatch' ? 'secondary' : 'outline-secondary'} text='Faircatch' onClick={(e) => onClickPuntresult('faircatch')}/>
                    </div>
                    <div className="col-sm-2 mb-2">
                        <Button buttonclass={puntresult === 'touchback' ? 'warning' : 'outline-secondary'} text='Touchback' onClick={(e) => onClickPuntresult('touchback')}/>
                    </div>
                    <div className="col-sm-2 mb-2">
                        <Button buttonclass={puntresult === 'outofbounds' ? 'dark' : 'outline-dark'} text='Out Of Bounds' onClick={(e) => onClickPuntresult('outofbounds')}/>
                    </div>

                    <div className="w-100"></div>

                    {(() => {
                        switch (punt) {
                            case 'puntgood':
                                switch (puntresult) {
                                    case 'returned':
                                        return <>
                                            <div className="col-sm-6 mb-2">
                                                <Player text='Returned' team={defense} value={returnedby} gamedata={gamedata} playerdata={playerdata} onChange={(e) => onChangeReturnedby(e.target.value)}/>
                                            </div>

                                            <div className="col-sm-4 mb-2">
                                                <Yard id='from' text='From' yard={los} team={losteam} disabled={true} gamedata={gamedata} onChange={(e) => onChangeLos(e.target.value)} />
                                            </div>

                                            <div className="w-100"></div>

                                            <div className="col-sm-6 mb-2"></div>

                                            <div className="col-sm-4 mb-2">
                                                <Yard id='puntto' text='Punt To' yard={puntto} team={punttoteam} gamedata={gamedata} onChange={(e) => onChangePuntto(e.target.value)} onClick={togglePunttoteam}/>
                                            </div>
                                        </>
                                        
                                    case 'downed':
                                        return <>
                                            <div className="col-sm-6 mb-2">
                                                <Player text='Downed' team={defense} value={returnedby} gamedata={gamedata} playerdata={playerdata} onChange={(e) => onChangeReturnedby(e.target.value)}/>
                                            </div>

                                            <div className="col-sm-4 mb-2">
                                                <Yard id='from' text='From' yard={los} team={losteam} disabled={true} gamedata={gamedata} onChange={(e) => onChangeLos(e.target.value)} />
                                            </div>

                                            <div className="w-100"></div>

                                            <div className="col-sm-6 mb-2"></div>

                                            <div className="col-sm-4 mb-2">
                                                <Yard id='puntto' text='Punt To' yard={puntto} team={punttoteam} gamedata={gamedata} onChange={(e) => onChangePuntto(e.target.value)} onClick={togglePunttoteam}/>
                                            </div>
                                        </>

                                    case 'faircatch':
                                        return <>
                                            <div className="col-sm-6 mb-2">
                                                <Player text='Faircatch' team={defense} value={returnedby} gamedata={gamedata} playerdata={playerdata} onChange={(e) => onChangeReturnedby(e.target.value)}/>
                                            </div>

                                            <div className="col-sm-4 mb-2">
                                                <Yard id='from' text='From' yard={los} team={losteam} disabled={true} gamedata={gamedata} onChange={(e) => onChangeLos(e.target.value)} />
                                            </div>

                                            <div className="w-100"></div>

                                            <div className="col-sm-6 mb-2"></div>

                                            <div className="col-sm-4 mb-2">
                                                <Yard id='puntto' text='Punt To' yard={puntto} team={punttoteam} gamedata={gamedata} onChange={(e) => onChangePuntto(e.target.value)} onClick={togglePunttoteam}/>
                                            </div>
                                        </>

                                    case 'touchback':
                                        return <>
                                            <div className="col-sm-6 mb-2">
                                                <Player text='Received' team={defense} value={returnedby} gamedata={gamedata} playerdata={playerdata} onChange={(e) => onChangeReturnedby(e.target.value)}/>
                                            </div>

                                            <div className="col-sm-4 mb-2">
                                                <Yard id='from' text='From' yard={los} team={losteam} disabled={true} gamedata={gamedata} onChange={(e) => onChangeLos(e.target.value)} />
                                            </div>

                                            <div className="w-100"></div>

                                            <div className="col-sm-6 mb-2"></div>

                                            <div className="col-sm-4 mb-2">
                                                <Yard id='puntto' text='Punt To' yard={puntto} team={punttoteam} disabled={true} gamedata={gamedata} onChange={(e) => onChangePuntto(e.target.value)} />
                                            </div>
                                        </>

                                    case 'outofbounds':
                                        return <>
                                            <div className="col-sm-6 mb-2"></div>

                                            <div className="col-sm-4 mb-2">
                                                <Yard id='from' text='From' yard={los} team={losteam} disabled={true} gamedata={gamedata} onChange={(e) => onChangeLos(e.target.value)} />
                                            </div>

                                            <div className="w-100"></div>

                                            <div className="col-sm-6 mb-2"></div>

                                            <div className="col-sm-4 mb-2">
                                                <Yard id='puntto' text='Punt To' yard={puntto} team={punttoteam} gamedata={gamedata} onChange={(e) => onChangePuntto(e.target.value)} onClick={togglePunttoteam}/>
                                            </div>
                                        </>
                                    default:
                                        return null
                                }                          
                            case 'blocked':
                                switch (puntresult) {
                                    case 'returned':
                                        return <>
                                            <div className="col-sm-4 mb-2">
                                                <Player text='Blocked' team={defense} value={blockedby} gamedata={gamedata} playerdata={playerdata} onChange={(e) => onChangeBlockedby(e.target.value)}/>
                                            </div>

                                            <div className="col-sm-2 mb-2"></div>

                                            <div className="col-sm-4 mb-2">
                                                <Yard id='from' text='From' yard={los} team={losteam} disabled={true} gamedata={gamedata} onChange={(e) => onChangeLos(e.target.value)} />
                                            </div>

                                            <div className="w-100"></div>

                                            <div className="col-sm-4 mb-2">
                                                <Player text='Recovered' team={puntrecoveredteam} value={puntrecovered} gamedata={gamedata} playerdata={playerdata} onChange={(e) => onChangePuntrecovered(e.target.value)}/>
                                            </div>
                                            <div className="col-sm-2 mb-2">
                                                <Button buttonclass='info' text='Toggle' onClick={togglePuntrecoveredteam} />
                                            </div>

                                            <div className="col-sm-4 mb-2">
                                                <Yard id='puntto' text='Punt To' yard={puntto} team={punttoteam} gamedata={gamedata} onChange={(e) => onChangePuntto(e.target.value)} />
                                            </div>
                                            <div className="col-sm-2 mb-2">
                                                <Button buttonclass='info' text='Toggle' onClick={togglePunttoteam} />
                                            </div>
                                        </>
                                        
                                    case 'downed':
                                        return <>
                                            <div className="col-sm-4 mb-2">
                                                <Player text='Blocked' team={defense} value={blockedby} gamedata={gamedata} playerdata={playerdata} onChange={(e) => onChangeBlockedby(e.target.value)}/>
                                            </div>

                                            <div className="col-sm-2 mb-2"></div>

                                            <div className="col-sm-4 mb-2">
                                                <Yard id='from' text='From' yard={los} team={losteam} disabled={true} gamedata={gamedata} onChange={(e) => onChangeLos(e.target.value)} />
                                            </div>

                                            <div className="w-100"></div>

                                            <div className="col-sm-4 mb-2">
                                                <Player text='Recovered' team={puntrecoveredteam} value={puntrecovered} gamedata={gamedata} playerdata={playerdata} onChange={(e) => onChangePuntrecovered(e.target.value)}/>
                                            </div>
                                            <div className="col-sm-2 mb-2">
                                                <Button buttonclass='info' text='Toggle' onClick={togglePuntrecoveredteam} />
                                            </div>

                                            <div className="col-sm-4 mb-2">
                                                <Yard id='puntto' text='Punt To' yard={puntto} team={punttoteam} gamedata={gamedata} onChange={(e) => onChangePuntto(e.target.value)} />
                                            </div>
                                            <div className="col-sm-2 mb-2">
                                                <Button buttonclass='info' text='Toggle' onClick={togglePunttoteam} />
                                            </div>
                                        </>

                                    case 'faircatch':
                                        return <>
                                            <div className="col-sm-4 mb-2">
                                                <Player text='Blocked' team={defense} value={blockedby} gamedata={gamedata} playerdata={playerdata} onChange={(e) => onChangeBlockedby(e.target.value)}/>
                                            </div>

                                            <div className="col-sm-2 mb-2"></div>

                                            <div className="col-sm-4 mb-2">
                                                <Yard id='from' text='From' yard={los} team={losteam} disabled={true} gamedata={gamedata} onChange={(e) => onChangeLos(e.target.value)} />
                                            </div>

                                            <div className="w-100"></div>

                                            <div className="col-sm-4 mb-2">
                                                <Player text='Recovered' team={puntrecoveredteam} value={puntrecovered} gamedata={gamedata} playerdata={playerdata} onChange={(e) => onChangePuntrecovered(e.target.value)}/>
                                            </div>
                                            <div className="col-sm-2 mb-2">
                                                <Button buttonclass='info' text='Toggle' onClick={togglePuntrecoveredteam} />
                                            </div>

                                            <div className="col-sm-4 mb-2">
                                                <Yard id='puntto' text='Punt To' yard={puntto} team={punttoteam} gamedata={gamedata} onChange={(e) => onChangePuntto(e.target.value)} />
                                            </div>
                                            <div className="col-sm-2 mb-2">
                                                <Button buttonclass='info' text='Toggle' onClick={togglePunttoteam} />
                                            </div>
                                        </>

                                    case 'touchback':
                                        return <>
                                            <div className="col-sm-4 mb-2">
                                                <Player text='Blocked' team={defense} value={blockedby} gamedata={gamedata} playerdata={playerdata} onChange={(e) => onChangeBlockedby(e.target.value)}/>
                                            </div>

                                            <div className="col-sm-2 mb-2"></div>

                                            <div className="col-sm-4 mb-2">
                                                <Yard id='from' text='From' yard={los} team={losteam} disabled={true} gamedata={gamedata} onChange={(e) => onChangeLos(e.target.value)} />
                                            </div>

                                            <div className="w-100"></div>

                                            <div className="col-sm-4 mb-2">
                                                <Player text='Recovered' team={puntrecoveredteam} value={puntrecovered} gamedata={gamedata} playerdata={playerdata} onChange={(e) => onChangePuntrecovered(e.target.value)}/>
                                            </div>
                                            <div className="col-sm-2 mb-2">
                                                <Button buttonclass='info' text='Toggle' onClick={togglePuntrecoveredteam} />
                                            </div>

                                            <div className="col-sm-4 mb-2">
                                                <Yard id='puntto' text='Punt To' yard={puntto} team={punttoteam} disabled={true} gamedata={gamedata} onChange={(e) => onChangePuntto(e.target.value)} />
                                            </div>
                                        </>

                                    case 'outofbounds':
                                        return <>
                                            <div className="col-sm-4 mb-2">
                                                <Player text='Blocked' team={defense} value={blockedby} gamedata={gamedata} playerdata={playerdata} onChange={(e) => onChangeBlockedby(e.target.value)}/>
                                            </div>

                                            <div className="col-sm-2 mb-2"></div>

                                            <div className="col-sm-4 mb-2">
                                                <Yard id='from' text='From' yard={los} team={losteam} disabled={true} gamedata={gamedata} onChange={(e) => onChangeLos(e.target.value)} />
                                            </div>

                                            <div className="w-100"></div>

                                            <div className="col-sm-4 mb-2">
                                                <Player text='Recovered' team={puntrecoveredteam} value={puntrecovered} gamedata={gamedata} playerdata={playerdata} onChange={(e) => onChangePuntrecovered(e.target.value)}/>
                                            </div>
                                            <div className="col-sm-2 mb-2">
                                                <Button buttonclass='info' text='Toggle' onClick={togglePuntrecoveredteam} />
                                            </div>

                                            <div className="col-sm-4 mb-2">
                                                <Yard id='puntto' text='Punt To' yard={puntto} team={punttoteam} gamedata={gamedata} onChange={(e) => onChangePuntto(e.target.value)} />
                                            </div>
                                            <div className="col-sm-2 mb-2">
                                                <Button buttonclass='info' text='Toggle' onClick={togglePunttoteam} />
                                            </div>
                                        </>
                                    default:
                                        return null
                                }
                            default:
                                return null 
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

export default RushPunt
