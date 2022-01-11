import { useEffect, useState } from 'react';
import Button from './Button';
import Player from './Player';
import Yard from './Yard';
import { toast } from 'react-toastify';

const RushPass = ({ socket, statsdata, gamedata, playerdata }) => {
    const [offense, setOffense] = useState('');
    const [passresult, setPassresult] = useState('tackle');
    const [defense, setDefense] = useState('');
    const [los, setLos] = useState('');
    const [losteam, setLosteam] = useState('');
    const [tackler1, setTackler1] = useState('');
    const [tackler2, setTackler2] = useState('');
    const [tackler3, setTackler3] = useState('');
    const [interceptedby, setInterceptedby] = useState('');
    const [brokenupby, setBrokenupby] = useState('');
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
    // passplay for disabled button
    const [passplay, setPassplay] = useState('complete');

    // on render
    useEffect(() => {
        setOffense(statsdata.offense);
        setPassresult(statsdata.passresult);
        setDefense(statsdata.defense);
        setLos(statsdata.los);
        setLosteam(statsdata.losteam);
        setTackler1(statsdata.tackler1);
        setTackler2(statsdata.tackler2);
        setTackler3(statsdata.tackler3);
        setInterceptedby(statsdata.interceptedby);
        setBrokenupby(statsdata.brokenupby);
        setRecovered(statsdata.recovered);
        setRecoveredteam(statsdata.recoveredteam);
        setForced(statsdata.forced);
        setFumble(statsdata.fumble);
        setFumbleteam(statsdata.fumbleteam);
        setLateral(statsdata.lateral);
        setLateralfrom(statsdata.lateralfrom);
        setLateralfromteam(statsdata.lateralfromteam);
        setPassplay(statsdata.passplay);
    }, [statsdata]);

    // enter
    function enter() {
        socket.emit('playGUIupdate', { item: 'enter', value: 'clicked' });
        toast.success('Pass saved', {autoClose: 1000, theme: 'dark'});
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

    function onClickPassresult(value){
        setPassresult(value);
        socket.emit('playGUIupdate', { item: 'passresult', value: value });
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

    function onChangeInterceptedby(value){
        setInterceptedby(value);
        socket.emit('playGUIupdate', { item: 'interceptedby', value: value });
    }

    function onChangeBrokenupby(value){
        setBrokenupby(value);
        socket.emit('playGUIupdate', { item: 'brokenupby', value: value });
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
            <div className='container' id='rushpass'>
                <div className="row border">
                    {(() => {
                        switch (passplay) {
                            case 'complete':
                                return<div className="d-block bg-success text-white col-sm-12 mb-2">Complete</div>
                            case 'intercepted':
                                return<div className="d-block bg-danger text-white col-sm-12 mb-2">Intercepted</div>
                            case 'brokenup':
                                return<div className="d-block bg-warning text-white col-sm-12 mb-2">Broken Up</div>
                            case 'incomplete':
                                return<div className="d-block bg-primary text-white col-sm-12 mb-2">Incomplete</div>
                            case 'thrownaway':
                                return<div className="d-block bg-primary text-white col-sm-12 mb-2">Thrown Away</div>
                            case 'uncatchable':
                                return<div className="d-block bg-secondary text-white col-sm-12 mb-2">Uncatchable</div>
                            case 'dropped':
                                return<div className="d-block bg-secondary text-white col-sm-12 mb-2">Dropped</div>
                            case 'spiked':
                                return<div className="d-block bg-dark text-white col-sm-12 mb-2">Spiked</div>
                            default:
                                return null
                        }
                    })()}
                    <div className="w-100"></div>
                    <div className="col-sm-8 mb-2"></div>
                    <div className="col-sm-2 mb-2">
                        <Button buttonclass={passresult === 'safety' ? 'danger' : passplay === 'complete' ? 'outline-danger' : passplay === 'thrownaway' ? 'outline-danger' : 'outline-light'} text='Safety' disabled={passplay === 'complete' ? '' : passplay === 'thrownaway' ? '' : true } onClick={(e) => onClickPassresult('safety')}/>
                    </div>
                    <div className="col-sm-2 mb-2">
                        <Button buttonclass={passresult === 'touchdown' ? 'success' : passplay === 'complete' ? 'outline-success' : 'outline-light'} text='Touchdown' disabled={passplay !== 'complete' && true} onClick={(e) => onClickPassresult('touchdown')}/>
                    </div>

                    <div className="w-100"></div>

                    <div className="col-sm-2 mb-2">
                        <Button buttonclass={passresult === 'tackle' ? 'primary' : passplay === 'complete' ? 'outline-primary' : 'outline-light'} text='Tackle' disabled={passplay !== 'complete' && true} onClick={(e) => onClickPassresult('tackle')}/>
                    </div>
                    <div className="col-sm-2 mb-2">
                        <Button buttonclass={passresult === 'notackle' ? 'secondary' : 'outline-secondary'} text='No Tackle' onClick={(e) => onClickPassresult('notackle')}/>
                    </div>
                    <div className="col-sm-2 mb-2">
                        <Button buttonclass={passresult === 'outofbounds' ? 'secondary' : passplay === 'complete' ? 'outline-secondary' : 'outline-light'} text='Out Of Bounds' disabled={passplay !== 'complete' && true} onClick={(e) => onClickPassresult('outofbounds')}/>
                    </div>
                    <div className="col-sm-2 mb-2">
                        <Button buttonclass={passresult === 'fumble' ? 'warning' : passplay === 'complete' ? 'outline-warning' : 'outline-light'} text='Fumble' disabled={passplay !== 'complete' && true} onClick={(e) => onClickPassresult('fumble')}/>
                    </div>
                    <div className="col-sm-2 mb-2">
                        <Button buttonclass={passresult === 'lateral' ? 'dark' : passplay === 'complete' ? 'outline-dark' : 'outline-light'} text='Lateral' disabled={passplay !== 'complete' && true} onClick={(e) => onClickPassresult('lateral')}/>
                    </div>
                    <div className="col-sm-2 mb-2">
                        <Button buttonclass={passresult === 'touchback' ? 'dark' : passplay === 'intercepted' ? 'outline-dark' : 'outline-light'} text='Touchback' disabled={passplay !== 'intercepted' && true} onClick={(e) => onClickPassresult('touchback')}/>
                    </div>

                    <div className="w-100"></div>

                    {(() => {
                        switch (passplay) {
                            case 'complete':
                                switch (passresult) {
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
                                                <Yard text='From' yard={lateralfrom} team={lateralfromteam} gamedata={gamedata} onChange={(e) => onChangeLateralfrom(e.target.value)} onClick={toggleLateralfromteam}/>
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
                                                <Yard id='ballon' text='Ball On' yard={los} team={defense} gamedata={gamedata} disabled onChange={(e) => onChangeLos(e.target.value)} />
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
                            case 'incomplete':
                            case 'uncatchable':
                            case 'dropped':
                            case 'spiked':
                                return <>
                                    <div className="col-sm-6 mb-2"></div>

                                    <div className="col-sm-4 mb-2">
                                        <Yard id='ballon' text='Ball On' yard={los} team={losteam} disabled={true} gamedata={gamedata} onChange={(e) => onChangeLos(e.target.value)} />
                                    </div>
                                </>
                            case 'thrownaway':
                                switch (passresult) {
                                    case 'notackle':
                                        return <>
                                            <div className="col-sm-6 mb-2"></div>

                                            <div className="col-sm-4 mb-2">
                                                <Yard id='ballon' text='Ball On' yard={los} team={losteam} disabled={true} gamedata={gamedata} onChange={(e) => onChangeLos(e.target.value)} />
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
                                    default:
                                        return null
                                }
                            case 'intercepted':
                                switch (passresult) {
                                    case 'notackle':
                                        return <>
                                            <div className="col-sm-6 mb-2">
                                                <Player text='Intercepted' team={defense} value={interceptedby} gamedata={gamedata} playerdata={playerdata} onChange={(e) => onChangeInterceptedby(e.target.value)}/>
                                            </div>

                                            <div className="col-sm-4 mb-2">
                                                <Yard id='ballon' text='Ball On' yard={los} team={losteam} gamedata={gamedata} onChange={(e) => onChangeLos(e.target.value)} onClick={toggleLosteam}/>
                                            </div>
                                        </>
                                        
                                    case 'touchback':
                                        return <>
                                            <div className="col-sm-6 mb-2">
                                                <Player text='Intercepted' team={defense} value={interceptedby} gamedata={gamedata} playerdata={playerdata} onChange={(e) => onChangeInterceptedby(e.target.value)}/>
                                            </div>

                                            <div className="col-sm-4 mb-2">
                                                <Yard id='ballon' text='Ball On' yard={los} team={losteam} disabled='true' gamedata={gamedata} onChange={(e) => onChangeLos(e.target.value)} />
                                            </div>
                                        </>
                                    default:
                                        return null
                                }
                            case 'brokenup':
                                return <>
                                    <div className="col-sm-6 mb-2">
                                        <Player text='Broken Up' team={defense} value={brokenupby} gamedata={gamedata} playerdata={playerdata} onChange={(e) => onChangeBrokenupby(e.target.value)}/>
                                    </div>

                                    <div className="col-sm-4 mb-2">
                                        <Yard id='ballon' text='Ball On' yard={los} team={losteam} disabled={true} gamedata={gamedata} onChange={(e) => onChangeLos(e.target.value)} />
                                    </div>
                                </>
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

export default RushPass
