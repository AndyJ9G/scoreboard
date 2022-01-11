import { useEffect, useState } from 'react';
import Button from './Button';
import Player from './Player';
import Yard from './Yard';
import { toast } from 'react-toastify';

const Rush = ({ socket, statsdata, gamedata, playerdata }) => {
    const [offense, setOffense] = useState('');
    const [rushresult, setRushresult] = useState('tackle');
    const [defense, setDefense] = useState('');
    const [los, setLos] = useState('');
    const [losteam, setLosteam] = useState('');
    const [tackler1, setTackler1] = useState('');
    const [tackler2, setTackler2] = useState('');
    const [tackler3, setTackler3] = useState('');
    // fumble
    const [recovered, setRecovered] = useState();
    const [recoveredteam, setRecoveredteam] = useState('');
    const [forced, setForced] = useState('');
    const [fumble, setFumble] = useState('');
    const [fumbleteam, setFumbleteam] = useState('');
    // lateral
    const [lateral, setLateral] = useState('');
    const [lateralfrom, setLateralfrom] = useState('');
    const [lateralfromteam, setLateralfromteam] = useState('');
    // runplay for disabled button
    const [runplay, setRunplay] = useState('handoff');

    // on render
    useEffect(() => {
        setOffense(statsdata.offense);
        setRushresult(statsdata.rushresult);
        setDefense(statsdata.defense);
        setLos(statsdata.los);
        setLosteam(statsdata.losteam);
        setTackler1(statsdata.tackler1);
        setTackler2(statsdata.tackler2);
        setTackler3(statsdata.tackler3);
        setRecovered(statsdata.recovered);
        setRecoveredteam(statsdata.recoveredteam);
        setForced(statsdata.forced);
        setFumble(statsdata.fumble);
        setFumbleteam(statsdata.fumbleteam);
        setLateral(statsdata.lateral);
        setLateralfrom(statsdata.lateralfrom);
        setLateralfromteam(statsdata.lateralfromteam);
        setRunplay(statsdata.runplay);
    }, [statsdata]);

    // enter
    function enter() {
        socket.emit('playGUIupdate', { item: 'enter', value: 'clicked' });
        toast.success('Run saved', {autoClose: 1000, theme: 'dark'});
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

    function toggleRecoveredteam(){
        var team = '';
        if(recoveredteam === 'team1'){
            team = 'team2';
        }else{
            team = 'team1';
        }
        setRecoveredteam(team);
        socket.emit('playGUIupdate', { item: 'recoveredteam', value: team });
    }

    function toggleFumbleteam(){
        var team = '';
        if(fumbleteam === 'team1'){
            team = 'team2';
        }else{
            team = 'team1';
        }
        setFumbleteam(team);
        socket.emit('playGUIupdate', { item: 'fumbleteam', value: team });
    }

    function toggleLateralfromteam(){
        var team = '';
        if(lateralfromteam === 'team1'){
            team = 'team2';
        }else{
            team = 'team1';
        }
        setLateralfromteam(team);
        socket.emit('playGUIupdate', { item: 'lateralfromteam', value: team });
    }

    function onClickRushresult(value){
        setRushresult(value);
        socket.emit('playGUIupdate', { item: 'rushresult', value: value });
    }

    function onChangeLos(value){
        setLos(value);
        socket.emit('playGUIupdate', { item: 'los', value: value });
    }

    function onChangeForced(value){
        setForced(value);
        socket.emit('playGUIupdate', { item: 'forced', value: value });
    }

    function onChangeFumble(value){
        setFumble(value);
        socket.emit('playGUIupdate', { item: 'fumble', value: value });
    }

    function onChangeRecovered(value){
        setRecovered(value);
        socket.emit('playGUIupdate', { item: 'recovered', value: value });
    }

    function onChangeTackler1(value){
        setTackler1(value);
        socket.emit('playGUIupdate', { item: 'tackler1', value: value });
    }
    function onChangeTackler2(value){
        setTackler2(value);
        socket.emit('playGUIupdate', { item: 'tackler2', value: value });
    }
    function onChangeTackler3(value){
        setTackler3(value);
        socket.emit('playGUIupdate', { item: 'tackler3', value: value });
    }

    function onChangeLateral(value){
        setLateralfrom(value);
        socket.emit('playGUIupdate', { item: 'lateral', value: value });
    }
    function onChangeLateralfrom(value){
        setLateralfrom(value);
        socket.emit('playGUIupdate', { item: 'lateralfrom', value: value });
    }

    return (
        <>
            <div className='container' id='rush'>
                <div className="row border">
                    {(() => {
                        switch (statsdata.actualplay) {
                            case 'fumble':
                                return<div className="d-block bg-warning text-white col-sm-12 mb-2">Fumble Return</div>
                            case 'lateral':
                                return<div className="d-block bg-dark text-white col-sm-12 mb-2">Lateral Return</div>
                            case 'intercepted':
                                return<div className="d-block bg-danger text-white col-sm-12 mb-2">Interception Return</div>
                            case 'kickreturn':
                                return<div className="d-block bg-info text-white col-sm-12 mb-2">Return</div>
                            case 'puntreturn':
                                return<div className="d-block bg-secondary text-white col-sm-12 mb-2">Punt Return</div>
                            case 'patreturn':
                                return<div className="d-block bg-primary text-white col-sm-12 mb-2">Return</div>
                            case 'patkickreturn':
                                return<div className="d-block bg-primary text-white col-sm-12 mb-2">Return</div>
                            default:
                                return<>
                                    {(() => {
                                        switch (runplay) {
                                            case 'handoff':
                                                return<div className="d-block bg-success text-white col-sm-12 mb-2">Handoff</div>
                                            case 'pitch':
                                                return<div className="d-block bg-success text-white col-sm-12 mb-2">Pitch</div>
                                            case 'option':
                                                return<div className="d-block bg-success text-white col-sm-12 mb-2">Option</div>
                                            case 'draw':
                                                return<div className="d-block bg-primary text-white col-sm-12 mb-2">Draw</div>
                                            case 'reverse':
                                                return<div className="d-block bg-secondary text-white col-sm-12 mb-2">Reverse</div>
                                            case 'keeper':
                                                return<div className="d-block bg-warning text-white col-sm-12 mb-2">Keeper</div>
                                            case 'scramble':
                                                return<div className="d-block bg-warning text-white col-sm-12 mb-2">Scramble</div>
                                            case 'sack':
                                                return<div className="d-block bg-danger text-white col-sm-12 mb-2">Sack</div>
                                            case 'kneeldown':
                                                return<div className="d-block bg-dark text-white col-sm-12 mb-2">Kneeldown</div>
                                            default:
                                                return null
                                        }
                                    })()}
                                </>
                        }
                    })()}
                    <div className="w-100"></div>
                    <div className="col-sm-8 mb-2"></div>
                    <div className="col-sm-2 mb-2">
                        <Button buttonclass={rushresult === 'safety' ? 'danger' : 'outline-danger'} text='Safety' onClick={(e) => onClickRushresult('safety')}/>
                    </div>
                    <div className="col-sm-2 mb-2">
                        <Button buttonclass={rushresult === 'touchdown' ? 'success' : runplay === 'sack' || runplay === 'kneeldown' ? 'outline-light' : 'outline-success'} text='Touchdown' disabled={runplay === 'sack' || runplay === 'kneeldown' ? true : false} onClick={(e) => onClickRushresult('touchdown')}/>
                    </div>

                    <div className="w-100"></div>

                    <div className="col-sm-2 mb-2">
                        <Button buttonclass={rushresult === 'tackle' ? 'primary' : runplay === 'kneeldown' ? 'outline-light' : 'outline-primary'} text='Tackle' disabled={runplay === 'kneeldown' && true} onClick={(e) => onClickRushresult('tackle')}/>
                    </div>
                    <div className="col-sm-2 mb-2">
                        <Button buttonclass={rushresult === 'notackle' ? 'secondary' : runplay === 'sack' ? 'outline-light' : 'outline-secondary'} text='No Tackle' disabled={runplay === 'sack' && true} onClick={(e) => onClickRushresult('notackle')}/>
                    </div>
                    <div className="col-sm-2 mb-2">
                        <Button buttonclass={rushresult === 'outofbounds' ? 'secondary' : runplay === 'sack' || runplay === 'kneeldown' ? 'outline-light' : 'outline-secondary'} text='Out Of Bounds' disabled={runplay === 'sack' || runplay === 'kneeldown' ? true: false} onClick={(e) => onClickRushresult('outofbounds')}/>
                    </div>
                    <div className="col-sm-2 mb-2">
                        <Button buttonclass={rushresult === 'fumble' ? 'warning' : runplay === 'kneeldown' ? 'outline-light' : 'outline-warning'} text='Fumble' disabled={runplay === 'kneeldown' && true} onClick={(e) => onClickRushresult('fumble')}/>
                    </div>
                    <div className="col-sm-2 mb-2">
                        <Button buttonclass={rushresult === 'lateral' ? 'dark' : runplay === 'sack' || runplay === 'kneeldown' ? 'outline-light' : 'outline-dark'} text='Lateral' disabled={runplay === 'sack' || runplay === 'kneeldown' ? true: false} onClick={(e) => onClickRushresult('lateral')}/>
                    </div>
                    <div className="col-sm-2 mb-2">
                        <Button buttonclass={rushresult === 'touchback' ? 'dark' : 'outline-light'} text='Touchback' disabled={true} onClick={(e) => onClickRushresult('touchback')}/>
                    </div>

                    <div className="w-100"></div>

                    {(() => {
                        switch (rushresult) {
                            case 'notackle':
                            case 'outofbounds':
                                return <>
                                    <div className="col-sm-6 mb-2"></div>

                                    <div className="col-sm-4 mb-2">
                                        <Yard id='ballon' text='Ball On' yard={los} team={losteam} gamedata={gamedata} onChange={(e) => onChangeLos(e.target.value)} onClick={toggleLosteam}/>
                                    </div>
                                </>
                                
                            case 'fumble':
                                return <>
                                    <div className="col-sm-6 mb-2">
                                        <Player text='Forced' team={defense} value={forced} gamedata={gamedata} playerdata={playerdata} onChange={(e) => onChangeForced(e.target.value)}/>
                                    </div>

                                    <div className="col-sm-4 mb-2">
                                        <Yard id='fumbledat' text='Fumbled At' yard={fumble} team={fumbleteam} gamedata={gamedata} onChange={(e) => onChangeFumble(e.target.value)} onClick={toggleFumbleteam}/>
                                    </div>

                                    <div className="w-100"></div>

                                    <div className="col-sm-6 mb-2">
                                        <Player text='Recovered' team={recoveredteam} value={recovered} gamedata={gamedata} playerdata={playerdata} onChange={(e) => onChangeRecovered(e.target.value)} onClick={toggleRecoveredteam}/>
                                    </div>

                                    <div className="w-100"></div>

                                    <div className="col-sm-6 mb-2">
                                        <Player text='Tackler' team={defense} value={tackler1} gamedata={gamedata} playerdata={playerdata} onChange={(e) => onChangeTackler1(e.target.value)}/>
                                    </div>

                                    <div className="col-sm-4 mb-2">
                                        <Yard id='recovered' text='Recovered On' yard={los} team={losteam} gamedata={gamedata} onChange={(e) => onChangeLos(e.target.value)} onClick={toggleLosteam}/>
                                    </div>
                                </>

                            case 'safety':
                                return <>
                                    <div className="col-sm-6 mb-2">
                                        <Player text='Tackler 1' team={defense} value={tackler1} gamedata={gamedata} playerdata={playerdata} onChange={(e) => onChangeTackler1(e.target.value)}/>
                                    </div>

                                    <div className="w-100"></div>

                                    <div className="col-sm-6 mb-2">
                                        <Player text='Tackler 2' team={defense} value={tackler2} gamedata={gamedata} playerdata={playerdata} onChange={(e) => onChangeTackler2(e.target.value)}/>
                                    </div>

                                    <div className="w-100"></div>

                                    <div className="col-sm-6 mb-2">
                                        <Player text='Tackler 3' team={defense} value={tackler3} gamedata={gamedata} playerdata={playerdata} onChange={(e) => onChangeTackler3(e.target.value)}/>
                                    </div>

                                    <div className="col-sm-4 mb-2">
                                        <Yard id='ballon' text='Ball On' yard={los} team={offense} gamedata={gamedata} disabled={true} onChange={(e) => onChangeLos(e.target.value)} />
                                    </div>
                                </>

                            case 'lateral':
                                return <>
                                    <div className="col-sm-6 mb-2">
                                        <Player text='Lateral To' team={offense} value={lateral} gamedata={gamedata} playerdata={playerdata} onChange={(e) => onChangeLateral(e.target.value)}/>
                                    </div>

                                    <div className="col-sm-4 mb-2">
                                        <Yard text='From' yard={lateralfrom} team={lateralfromteam} gamedata={gamedata} onChange={(e) => onChangeLateralfrom(e.target.value)} onClick={toggleLateralfromteam} />
                                    </div>

                                    <div className="w-100"></div>

                                    <div className="col-sm-6 mb-2"></div>

                                    <div className="col-sm-4 mb-2">
                                        <Yard text='Ball On' yard={los} team={losteam} gamedata={gamedata} onChange={(e) => onChangeLos(e.target.value)} onClick={toggleLosteam}/>
                                    </div>

                                </>

                            case 'touchdown':
                                return <>
                                    <div className="col-sm-6 mb-2"></div>

                                    <div className="col-sm-4 mb-2">
                                        <Yard id='ballon' text='Ball On' yard={los} team={defense} gamedata={gamedata} disabled={true} onChange={(e) => onChangeLos(e.target.value)} />
                                    </div>
                                </>

                            default:
                                return <>
                                    <div className="col-sm-6 mb-2">
                                        <Player text='Tackler 1' team={defense} value={tackler1} gamedata={gamedata} playerdata={playerdata} onChange={(e) => onChangeTackler1(e.target.value)}/>
                                    </div>

                                    <div className="w-100"></div>

                                    <div className="col-sm-6 mb-2">
                                        <Player text='Tackler 2' team={defense} value={tackler2} gamedata={gamedata} playerdata={playerdata} onChange={(e) => onChangeTackler2(e.target.value)}/>
                                    </div>

                                    <div className="w-100"></div>

                                    <div className="col-sm-6 mb-2">
                                        <Player text='Tackler 3' team={defense} value={tackler3} gamedata={gamedata} playerdata={playerdata} onChange={(e) => onChangeTackler3(e.target.value)}/>
                                    </div>

                                    <div className="col-sm-4 mb-2">
                                        <Yard id='ballon' text='Ball On' yard={los} team={losteam} gamedata={gamedata} onChange={(e) => onChangeLos(e.target.value)} onClick={toggleLosteam}/>
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

export default Rush
