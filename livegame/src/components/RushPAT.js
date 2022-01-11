import { useEffect, useState } from 'react';
import Button from './Button';
import Player from './Player';
import Yard from './Yard';
import { toast } from 'react-toastify';

const RushPAT = ({ socket, statsdata, gamedata, playerdata }) => {
    const [pat, setPat] = useState('kick');
    const [patresult, setPatresult] = useState('good');
    const [defense, setDefense] = useState('');
    const [los, setLos] = useState('');
    const [losteam, setLosteam] = useState('');
    const [blockedby, setBlockedby] = useState('');
    const [recovered, setRecovered] = useState();
    const [recoveredteam, setRecoveredteam] = useState('');
    const [forced, setForced] = useState('');
    const [tackler1, setTackler1] = useState('');
    const [interceptedby, setInterceptedby] = useState('');

    // on render
    useEffect(() => {
        setPat(statsdata.pat);
        setPatresult(statsdata.patresult);
        setDefense(statsdata.defense);
        setLos(statsdata.los);
        setLosteam(statsdata.losteam);
        setBlockedby(statsdata.blockedby);
        setRecovered(statsdata.recovered);
        setRecoveredteam(statsdata.recoveredteam);
        setForced(statsdata.forced);
        setTackler1(statsdata.tackler1);
        setInterceptedby(statsdata.interceptedby);
    }, [statsdata]);

    // enter
    function enter() {
        socket.emit('playGUIupdate', { item: 'enter', value: 'clicked' });
        toast.success('PAT saved', {autoClose: 1000, theme: 'dark'});
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

    function onClickPatresult(value){
        setPatresult(value);
        socket.emit('playGUIupdate', { item: 'patresult', value: value });
    }

    function onChangeLos(value){
        setLos(value);
        socket.emit('playGUIupdate', { item: 'los', value: value });
    }

    function onChangeBlockedby(value){
        setBlockedby(value);
        socket.emit('playGUIupdate', { item: 'blockedby', value: value });
    }

    function onChangeRecovered(value){
        setRecovered(value);
        socket.emit('playGUIupdate', { item: 'recovered', value: value });
    }

    function onChangeForced(value){
        setForced(value);
        socket.emit('playGUIupdate', { item: 'forced', value: value });
    }

    function onChangeTackler1(value){
        setTackler1(value);
        socket.emit('playGUIupdate', { item: 'tackler1', value: value });
    }

    function onChangeInterceptedby(value){
        setInterceptedby(value);
        socket.emit('playGUIupdate', { item: 'interceptedby', value: value });
    }

    return (
        <>
            <div className='container' id='rushpat'>
                <div className="row border">

                    {(() => {
                        switch (pat) {
                            case 'patkick':
                                return <>
                                    <div className="d-block bg-primary text-white col-sm-12 mb-2">PAT Kick Result</div>
                                    <div className="w-100"></div>

                                    <div className="col-sm-2 mb-2">
                                        <Button buttonclass={patresult === 'good' ? 'success' : 'outline-success'} text='Good' onClick={(e) => onClickPatresult('good')}/>
                                    </div>
                                    <div className="col-sm-2 mb-2">
                                        <Button buttonclass={patresult === 'nogood' ? 'secondary' : 'outline-secondary'} text='No Good' onClick={(e) => onClickPatresult('nogood')}/>
                                    </div>
                                    <div className="col-sm-2 mb-2">
                                        <Button buttonclass={patresult === 'blocked' ? 'primary' : 'outline-primary'} text='Blocked' onClick={(e) => onClickPatresult('blocked')}/>
                                    </div>
                                    <div className="col-sm-2 mb-2">
                                        <Button buttonclass='outline-light' disabled={true} text='Fumble' onClick={(e) => onClickPatresult('fumble')}/>
                                    </div>
                                    <div className="col-sm-2 mb-2">
                                        <Button buttonclass='outline-light' disabled={true} text='Intercepted' onClick={(e) => onClickPatresult('intercepted')}/>
                                    </div>

                                    <div className="w-100"></div>
                                    {(() => {
                                        switch (patresult) {
                                            case 'blocked':
                                                return <>
                                                    <div className="col-sm-6 mb-2">
                                                        <Player text='Blocked' team={defense} value={blockedby} gamedata={gamedata} playerdata={playerdata} onChange={(e) => onChangeBlockedby(e.target.value)}/>
                                                    </div>
                                                    <div className="w-100"></div>
                                                    <div className="col-sm-6 mb-2">
                                                        <Player text='Recovered' team={recoveredteam} value={recovered} gamedata={gamedata} playerdata={playerdata} onChange={(e) => onChangeRecovered(e.target.value)} onClick={toggleRecoveredteam}/>
                                                    </div>
                                                </>
                                            default:
                                                return <>
                                                    <div className="col-sm-6 mb-2"></div>
                                                </>
                                        }
                                    })()}
                                </>
                            case 'patrush':
                                return <>
                                    <div className="d-block bg-success text-white col-sm-12 mb-2">PAT Rush Result</div>
                                    <div className="w-100"></div>

                                    <div className="col-sm-2 mb-2">
                                        <Button buttonclass={patresult === 'good' ? 'success' : 'outline-success'} text='Good' onClick={(e) => onClickPatresult('good')}/>
                                    </div>
                                    <div className="col-sm-2 mb-2">
                                        <Button buttonclass={patresult === 'nogood' ? 'secondary' : 'outline-secondary'} text='No Good' onClick={(e) => onClickPatresult('nogood')}/>
                                    </div>
                                    <div className="col-sm-2 mb-2">
                                        <Button buttonclass='outline-light' text='Blocked' disabled={true} onClick={(e) => onClickPatresult('blocked')}/>
                                    </div>
                                    <div className="col-sm-2 mb-2">
                                        <Button buttonclass={patresult === 'fumble' ? 'warning' : 'outline-warning'} text='Fumble' onClick={(e) => onClickPatresult('fumble')}/>
                                    </div>
                                    <div className="col-sm-2 mb-2">
                                        <Button buttonclass='outline-light' disabled={true} text='Intercepted' onClick={(e) => onClickPatresult('intercepted')}/>
                                    </div>

                                    <div className="w-100"></div>
                                    {(() => {
                                        switch (patresult) {
                                            case 'fumble':
                                                return <>
                                                    <div className="col-sm-6 mb-2">
                                                        <Player text='Forced' team={defense} value={forced} gamedata={gamedata} playerdata={playerdata} onChange={(e) => onChangeForced(e.target.value)}/>
                                                    </div>
                                                    <div className="w-100"></div>
                                                    <div className="col-sm-6 mb-2">
                                                        <Player text='Recovered' team={recoveredteam} value={recovered} gamedata={gamedata} playerdata={playerdata} onChange={(e) => onChangeRecovered(e.target.value)} onClick={toggleRecoveredteam}/>
                                                    </div>
                                                    <div className="w-100"></div>
                                                    <div className="col-sm-6 mb-2">
                                                        <Player text='Tackler' team={defense} value={tackler1} gamedata={gamedata} playerdata={playerdata} onChange={(e) => onChangeTackler1(e.target.value)}/>
                                                    </div>
                                                </>
                                            default:
                                                return <>
                                                    <div className="col-sm-6 mb-2"></div>
                                                </>
                                        }
                                    })()}
                                </>
                            case 'patpass':
                                return <>
                                    <div className="d-block bg-secondary text-white col-sm-12 mb-2">PAT Pass Result</div>
                                    <div className="w-100"></div>
                                    <div className="col-sm-2 mb-2">
                                        <Button buttonclass={patresult === 'good' ? 'success' : 'outline-success'} text='Good' onClick={(e) => onClickPatresult('good')}/>
                                    </div>
                                    <div className="col-sm-2 mb-2">
                                        <Button buttonclass={patresult === 'nogood' ? 'secondary' : 'outline-secondary'} text='No Good' onClick={(e) => onClickPatresult('nogood')}/>
                                    </div>
                                    <div className="col-sm-2 mb-2">
                                        <Button buttonclass='outline-light' text='Blocked' disabled={true} onClick={(e) => onClickPatresult('blocked')}/>
                                    </div>
                                    <div className="col-sm-2 mb-2">
                                        <Button buttonclass={patresult === 'fumble' ? 'warning' : 'outline-warning'} text='Fumble' onClick={(e) => onClickPatresult('fumble')}/>
                                    </div>
                                    <div className="col-sm-2 mb-2">
                                        <Button buttonclass={patresult === 'intercepted' ? 'danger' : 'outline-danger'} text='Intercepted' onClick={(e) => onClickPatresult('intercepted')}/>
                                    </div>

                                    <div className="w-100"></div>
                                    {(() => {
                                        switch (patresult) {
                                            case 'fumble':
                                                return <>
                                                    <div className="col-sm-6 mb-2">
                                                        <Player text='Forced' team={defense} value={forced} gamedata={gamedata} playerdata={playerdata} onChange={(e) => onChangeForced(e.target.value)}/>
                                                    </div>
                                                    <div className="w-100"></div>
                                                    <div className="col-sm-6 mb-2">
                                                        <Player text='Recovered' team={recoveredteam} value={recovered} gamedata={gamedata} playerdata={playerdata} onChange={(e) => onChangeRecovered(e.target.value)} onClick={toggleRecoveredteam}/>
                                                    </div>
                                                    <div className="w-100"></div>
                                                    <div className="col-sm-6 mb-2">
                                                        <Player text='Tackler' team={defense} value={tackler1} gamedata={gamedata} playerdata={playerdata} onChange={(e) => onChangeTackler1(e.target.value)}/>
                                                    </div>
                                                </>
                                            case 'intercepted':
                                                return <>
                                                    <div className="col-sm-6 mb-2">
                                                        <Player text='Intercepted' team={defense} value={interceptedby} gamedata={gamedata} playerdata={playerdata} onChange={(e) => onChangeInterceptedby(e.target.value)}/>
                                                    </div>
                                                </>
                                            default:
                                                return <>
                                                    <div className="col-sm-6 mb-2"></div>
                                                </>
                                        }
                                    })()}
                                </>
                            
                            default:
                                return <>
                                </>
                        }
                    })()}
                    <div className="col-sm-4 mb-2">
                        <Yard text='Ball On' yard={los} team={losteam} gamedata={gamedata} onChange={(e) => onChangeLos(e.target.value)} />
                    </div>

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

export default RushPAT
