import { useEffect, useState } from 'react';
import Button from './Button';
import Player from './Player';
import Yard from './Yard';
import Penaltytype from './Penaltytype';
import { toast } from 'react-toastify';

const RushPenalty = ({ socket, statsdata, gamedata, playerdata }) => {
    const [penalty, setPenalty] = useState('penalty');
    const [penaltyresult, setPenaltyresult] = useState('repeatdown');
    const [penaltyon, setPenaltyon] = useState('');
    const [penaltyonteam, setPenaltyonteam] = useState('');
    const [enforced, setEnforced] = useState('');
    const [enforcedteam, setEnforcedteam] = useState('');
    const [penaltytype, setPenaltytype] = useState('');

    const [los, setLos] = useState('');
    const [losteam, setLosteam] = useState('');

    // on render
    useEffect(() => {
        setPenalty(statsdata.penalty);
        setPenaltyresult(statsdata.penaltyresult);
        setPenaltyon(statsdata.penaltyon);
        setPenaltyonteam(statsdata.penaltyonteam);
        setEnforced(statsdata.enforced);
        setEnforcedteam(statsdata.enforcedteam);
        setPenaltytype(statsdata.penaltytype);

        setLos(statsdata.los);
        setLosteam(statsdata.losteam);
    }, [statsdata]);

    // enter
    function enter() {
        socket.emit('playGUIupdate', { item: 'enter', value: 'clicked' });
        toast.success('Penalty saved', {autoClose: 1000, theme: 'dark'});
    }

    function togglePenaltyonteam(){
        var team = '';
        if(penaltyonteam === 'team1'){
            team = 'team2';
        }else{
            team = 'team1';
        }
        setPenaltyonteam(team);
        socket.emit('playGUIupdate', { item: 'penaltyonteam', value: team });
    }

    function toggleEnforcedteam(){
        var team = '';
        if(enforcedteam === 'team1'){
            team = 'team2';
        }else{
            team = 'team1';
        }
        setEnforcedteam(team);
        socket.emit('playGUIupdate', { item: 'enforcedteam', value: team });
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

    function onClickPenaltyresult(value){
        setPenaltyresult(value);
        socket.emit('playGUIupdate', { item: 'penaltyresult', value: value });
        // set los
        if(value === 'offsetting'){
            socket.emit('playGUIupdate', { item: 'los', value: los });
        }
    }

    function onChangeLos(value){
        setLos(value);
        socket.emit('playGUIupdate', { item: 'los', value: value });
    }

    function onChangePenaltyon(value){
        setPenaltyon(value);
        socket.emit('playGUIupdate', { item: 'penaltyon', value: value });
    }

    function onChangeEnforced(value){
        setEnforced(value);
        socket.emit('playGUIupdate', { item: 'enforced', value: value });
    }

    function onChangePenaltytype(value){
        setPenaltytype(value);
        socket.emit('playGUIupdate', { item: 'penaltytype', value: value });
    }

    return (
        <>
            <div className='container' id='rushpenalty'>
                <div className="row border">
                    {(() => {
                        switch (penalty) {
                            case 'penalty':
                                return<>
                                    <div className="d-block bg-warning text-white col-sm-12 mb-2">Penalty Result</div>

                                    <div className="w-100"></div>

                                    <div className="col-sm-2 mb-2">
                                        <Button buttonclass={penaltyresult === 'changedown' ? 'primary' : 'outline-primary'} text='Change Down' onClick={(e) => onClickPenaltyresult('changedown')}/>
                                    </div>
                                    <div className="col-sm-2 mb-2">
                                        <Button buttonclass={penaltyresult === 'repeatdown' ? 'secondary' : 'outline-secondary'} text='Repeat Down' onClick={(e) => onClickPenaltyresult('repeatdown')}/>
                                    </div>
                                    <div className="col-sm-2 mb-2">
                                        <Button buttonclass={penaltyresult === 'firstdown' ? 'success' : 'outline-success'} text='First Down' onClick={(e) => onClickPenaltyresult('firstdown')}/>
                                    </div>
                                    <div className="col-sm-2 mb-2">
                                        <Button buttonclass={penaltyresult === 'offsetting' ? 'dark' : 'outline-dark'} text='Offsetting' onClick={(e) => onClickPenaltyresult('offsetting')}/>
                                    </div>

                                    <div className="w-100"></div>
                                </>
                            case 'nullifyplay':
                                return<>
                                    <div className="d-block bg-danger text-white col-sm-12 mb-2">Nullify Last Penalty</div>

                                    <div className="w-100"></div>

                                    <div className="col-sm-2 mb-2">
                                        <Button buttonclass={penaltyresult === 'changedown' ? 'primary' : 'outline-light'} text='Change Down' disabled={true} onClick={(e) => onClickPenaltyresult('changedown')}/>
                                    </div>
                                    <div className="col-sm-2 mb-2">
                                        <Button buttonclass={penaltyresult === 'repeatdown' ? 'secondary' : 'outline-secondary'} text='Repeat Down' onClick={(e) => onClickPenaltyresult('repeatdown')}/>
                                    </div>
                                    <div className="col-sm-2 mb-2">
                                        <Button buttonclass={penaltyresult === 'firstdown' ? 'success' : 'outline-success'} text='First Down' onClick={(e) => onClickPenaltyresult('firstdown')}/>
                                    </div>
                                    <div className="col-sm-2 mb-2">
                                        <Button buttonclass={penaltyresult === 'offsetting' ? 'dark' : 'outline-dark'} text='Offsetting' onClick={(e) => onClickPenaltyresult('offsetting')}/>
                                    </div>

                                    <div className="w-100"></div>
                                </>
                             case 'decline':
                                return<>
                                    <div className="d-block bg-secondary text-white col-sm-12 mb-2">Decline Penalty</div>

                                    <div className="w-100"></div>

                                    <div className="col-sm-2 mb-2">
                                        <Button buttonclass='outline-light' text='Change Down' disabled={true} onClick={(e) => onClickPenaltyresult('changedown')}/>
                                    </div>
                                    <div className="col-sm-2 mb-2">
                                        <Button buttonclass='outline-light' text='Repeat Down' disabled={true} onClick={(e) => onClickPenaltyresult('repeatdown')}/>
                                    </div>
                                    <div className="col-sm-2 mb-2">
                                        <Button buttonclass='outline-light' text='First Down' disabled={true} onClick={(e) => onClickPenaltyresult('firstdown')}/>
                                    </div>
                                    <div className="col-sm-2 mb-2">
                                        <Button buttonclass='outline-light' text='Offsetting' disabled={true} onClick={(e) => onClickPenaltyresult('offsetting')}/>
                                    </div>

                                    <div className="w-100"></div>
                                </>
                            default:
                                return null
                        }
                    })()}

                    {(() => {
                        switch (penalty) {
                            case 'nullifyplay':
                            case 'penalty':
                                switch (penaltyresult) {
                                    case 'changedown':
                                    case 'repeatdown':
                                    case 'firstdown':
                                        return <>
                                            <div className="col-sm-6 mb-2">
                                                <Player text='Penalty On' team={penaltyonteam} value={penaltyon} gamedata={gamedata} playerdata={playerdata} onChange={(e) => onChangePenaltyon(e.target.value)} onClick={togglePenaltyonteam}/>
                                            </div>

                                            <div className="col-sm-4 mb-2">
                                                <Yard text='Enforced From' yard={enforced} team={enforcedteam} gamedata={gamedata} onChange={(e) => onChangeEnforced(e.target.value)} onClick={toggleEnforcedteam}/>
                                            </div>

                                            <div className="w-100"></div>

                                            <div className="col-sm-6 mb-2">
                                                <Penaltytype text='Penalty Type' value={penaltytype} gamedata={gamedata} playerdata={playerdata} onChange={(e) => onChangePenaltytype(e.target.value)}/>
                                            </div>

                                            <div className="col-sm-4 mb-2">
                                                <Yard text='Ball On' yard={los} team={losteam} gamedata={gamedata} onChange={(e) => onChangeLos(e.target.value)} onClick={toggleLosteam}/>
                                            </div>
                                        </>

                                    case 'offsetting':
                                        return <>
                                            <div className="col-sm-6 mb-2">
                                                <Player text='Penalty On' team={penaltyonteam} value={penaltyon} gamedata={gamedata} playerdata={playerdata} onChange={(e) => onChangePenaltyon(e.target.value)} onClick={togglePenaltyonteam}/>
                                            </div>

                                            <div className="col-sm-4 mb-2">
                                                <Yard text='Enforced From' yard={enforced} team={enforcedteam} disabled={true} gamedata={gamedata} onChange={(e) => onChangeEnforced(e.target.value)} />
                                            </div>

                                            <div className="w-100"></div>

                                            <div className="col-sm-6 mb-2">
                                                <Penaltytype text='Penalty Type' value={penaltytype} gamedata={gamedata} playerdata={playerdata} onChange={(e) => onChangePenaltytype(e.target.value)}/>
                                            </div>

                                            <div className="col-sm-4 mb-2">
                                                <Yard text='Ball On' yard={los} team={losteam} disabled={true} gamedata={gamedata} onChange={(e) => onChangeLos(e.target.value)} />
                                            </div>
                                        </>
                                            
                                    default:
                                        return null
                                }
                            
                            case 'decline':
                                return <>
                                    <div className="col-sm-6 mb-2"></div>

                                    <div className="col-sm-4 mb-2">
                                        <Yard text='Ball On' yard={los} team={losteam} gamedata={gamedata} onChange={(e) => onChangeLos(e.target.value)} onClick={toggleLosteam}/>
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

export default RushPenalty
