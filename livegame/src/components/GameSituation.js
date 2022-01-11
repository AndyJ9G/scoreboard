import { useEffect, useState } from 'react';
import Teamlogo from './Teamlogo';
import Button from './Button';
import { toast } from 'react-toastify';

const GameSituation = ({ socket, statsdata, gamedata, showDrive }) => {
    const [editvalues, setEditvalues] = useState(true);
    const [period, setPeriod] = useState('');
    const [drive, setDrive] = useState('');
    const [down, setDown] = useState('');
    const [distance, setDistance] = useState('');
    const [downlos, setDownlos] = useState('');
    const [downlosteam, setDownlosteam] = useState('');
    const [ballposition, setBallposition] = useState('');
    const [ballpositionteam, setBallpositionteam] = useState('');
    const [possession, setPossession] = useState('');

    useEffect(() => {
        setPeriod(statsdata.period);
        setDrive(statsdata.drive);
        setDown(statsdata.down);
        setDistance(statsdata.distance);
        setDownlos(statsdata.downlos);
        setDownlosteam(statsdata.downlosteam);
        setBallposition(statsdata.ballposition);
        setBallpositionteam(statsdata.ballpositionteam);
        setPossession(statsdata.possession);
    }, [statsdata]);

    function editSituation(){
        // flip value
        setEditvalues(!editvalues);
    }

    function toggleDownlosteam(){
        var team = '';
        if(downlosteam === 'team1'){
            team = 'team2';
        }else{
            team = 'team1';
        }
        socket.emit('playGUIupdate', { item: 'downlosteam', value: team });
    }

    function togglePossession(){
        var team = '';
        if(possession === 'team1'){
            team = 'team2';
        }else{
            team = 'team1';
        }
        socket.emit('playGUIupdate', { item: 'possession', value: team });
    }

    function onChangeDown(value){
        // check if the Down is not a number between 1 and 4
        if(!value.match(/\b([1-4])\b/)){
            toast.error(value+' is not a DOWN number', {autoClose: 1000, theme: 'dark'});
        }else{
            setDown(value);
            socket.emit('playGUIupdate', { item: 'down', value: value });
        }
    }

    function onChangeDistance(value){
        // check if the Distance is not a number between 0 and 100
        if(!value.match(/\b(0?[0-9]|[1-9][0-9]|100)\b/)){
            toast.error(value+' is not a DISTANCE number', {autoClose: 1000, theme: 'dark'});
        }else{
            setDistance(value);
            socket.emit('playGUIupdate', { item: 'distance', value: value });
        }
    }

    function onChangeDownlos(value){
        // check if the LOS is not a number between 0 and 50
        if(!value.match(/\b(0?[0-9]|[1-4][0-9]|50)\b/)){
            toast.error(value+' is not a LOS number', {autoClose: 1000, theme: 'dark'});
        }else{
            setDownlos(value);
            socket.emit('playGUIupdate', { item: 'downlos', value: value });
        }
    }

    return(
        <>
            <div className='container border'>
                <div className='row'>
                    <div className="col-sm-1 text-right">
                        <label className="small">Possession:</label>
                    </div>
                    <div className="col-sm-1 mb-2">
                        <Button buttonclass={editvalues ? 'outline-light btn-logo' : 'outline-info btn-logo'} text={<Teamlogo addclassname='teamlogosmall' src={possession === 'team1' ? gamedata.logo1 : possession === 'team2' ? gamedata.logo2 : 'no-logo.png'}/>} disabled={editvalues} onClick={togglePossession}/>
                    </div>
                    <div className="col-sm-1 text-right">
                        <label className="small">Down:</label>
                    </div>
                    <div className="col-sm-1 mb-2">
                        <input type="text" value={down} className="form-control font-weight-bold" disabled={editvalues} onChange={(e) => onChangeDown(e.target.value)}/>
                    </div>
                    <div className="col-sm-1 text-right">
                        <label className="small">Distance:</label>
                    </div>
                    <div className="col-sm-1 mb-2">
                        <input type="text" value={distance} className="form-control font-weight-bold" disabled={editvalues} onChange={(e) => onChangeDistance(e.target.value)}/>
                    </div>
                    <div className="col-sm-1 text-right">
                        <label className="small">LOS:</label>
                    </div>
                    <div className="col-sm-1 mb-2">
                        <input type="text" value={downlos} className="form-control font-weight-bold" disabled={editvalues} onChange={(e) => onChangeDownlos(e.target.value)}/>
                    </div>
                    <div className="col-sm-1 mb-2">
                        <Button buttonclass={editvalues ? 'outline-light btn-logo' : 'outline-info btn-logo'} text={<Teamlogo addclassname='teamlogosmall' src={downlosteam === 'team1' ? gamedata.logo1 : gamedata.logo2}/>} disabled={editvalues} onClick={toggleDownlosteam}/>
                    </div>
                    <div className="col-sm-1 mb-2"></div>
                    <div className="col-sm-2 mb-2">
                        <Button buttonclass={editvalues ? 'dark' : 'success'} text={editvalues ? 'Edit' : 'Save'} onClick={editSituation}/>
                    </div>

                    {showDrive &&
                        <>
                            <div className="w-100"></div>

                            <div className="col-sm-1 text-right">
                                <label className="small">Period:</label>
                            </div>
                            <div className="col-sm-1 text-right">
                                <span className="form-control font-weight-bold bg-light">{period}</span>
                            </div>
                            <div className="col-sm-1 text-right">
                                <label className="small">Drive:</label>
                            </div>
                            <div className="col-sm-1 text-right">
                                <span className="form-control font-weight-bold bg-light">{drive}</span>
                            </div>
                            <div className="col-sm-1 text-right">
                                <label className="small">Ball:</label>
                            </div>
                            <div className="col-sm-1 text-right">
                                <span className="form-control font-weight-bold bg-light">{ballposition}</span>
                            </div>
                            <div className="col-sm-1 mb-2">
                                <Teamlogo src={ballpositionteam === 'team1' ? gamedata.logo1 : gamedata.logo2}/>
                            </div>
                        </>
                    }
                </div>
            </div>
        </>
    );
}

export default GameSituation
