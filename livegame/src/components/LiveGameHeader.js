import { useEffect, useState } from 'react';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import GameScore from './GameScore';
import Field from './Field';
import Teamlogo from './Teamlogo';
import { toast } from 'react-toastify';

const LiveGameHeader = ({ socket, selectedGame, setSelectedGame, showField }) => {
    const [gamedata, setGamedata] = useState({});
    const [period, setPeriod] = useState('');
    const [conf, setConf] = useState({});

    useEffect(() => {
        socket.emit('requestLiveGameData', { message: 'Client requesting liveGameData' });
        socket.on('sendLiveGameData', (gameData) => {setGamedata(gameData)});
        socket.emit('requestGuiData', { message: 'Client requesting guiData' });
        socket.on('sendGUIdata', (guiData) => {setPeriod(guiData.period)});
        socket.emit('requestConfig', { message: 'Client requesting config' });
        socket.on('sendConfig', (config) => {setConf(config)});
    }, [socket]);

    // next period
    const nextPeriod = () => {
        // check the period reached halftime
        if(period === conf.halftime){
            toast.warning(`The next Period should be Halftime. please choose Halftime Action`, {autoClose: 5000, theme: 'dark'});
        }else if(period === conf.quarters){
            toast.warning(`The next should be Game Finished. please choose the Action`, {autoClose: 5000, theme: 'dark'});
        }else{
            socket.emit('playGUIupdate', { item: 'changequarter', value: 'clicked' });
            socket.emit('playGUIupdate', { item: 'enter', value: 'clicked' });
            toast.success('Next Period', {autoClose: 1000, theme: 'dark'});
        }
    }
    // halftime
    const halftime = () => {
        // check the period reached game finish
        if(period === conf.quarters){
            toast.warning(`The next should be Game Finished. please choose the Action`, {autoClose: 5000, theme: 'dark'});
        }else{
            socket.emit('playGUIupdate', { item: 'halftime', value: 'clicked' });
            socket.emit('playGUIupdate', { item: 'enter', value: 'clicked' });
            toast.success('Halftime', {autoClose: 1000, theme: 'dark'});
        }
    }
    // game finished
    const gameFinished = () => {
        socket.emit('playGUIupdate', { item: 'gamefinished', value: 'clicked' });
        socket.emit('playGUIupdate', { item: 'enter', value: 'clicked' });
        toast.success('Game Finished', {autoClose: 1000, theme: 'dark'});
    }
    // timeout team1
    const timeoutteam1 = () => {
        socket.emit('playGUIupdate', { item: 'timeoutteam1', value: 'clicked' });
        toast.success(`Timeout ${gamedata.team1}`, {autoClose: 1000, theme: 'dark'});
    }
    // timeout team2
    const timeoutteam2 = () => {
        socket.emit('playGUIupdate', { item: 'timeoutteam2', value: 'clicked' });
        toast.success(`Timeout ${gamedata.team2}`, {autoClose: 1000, theme: 'dark'});
    }

    return(
        <>
            <div className='container border'>
                <div className='row'>
                    {selectedGame !== '' ?
                        <>
                        <div className="col-sm-3">
                            <GameScore socket={socket} gamedata={gamedata} setGamedata={setGamedata}/>
                        </div>
                        <div className="col-sm-2">
                            <DropdownButton id='dropdown-period-changes' variant='secondary' title='Period Changes' size='sm'>
                                <Dropdown.Item key='nextperiod' onClick={nextPeriod}>Set Next period</Dropdown.Item>
                                <Dropdown.Item key='halftime' onClick={halftime}>Set Halftime</Dropdown.Item>
                                <Dropdown.Item key='gameFinished' onClick={gameFinished}>Set Game Finished</Dropdown.Item>
                            </DropdownButton>
                            {1>1 &&
                            <DropdownButton id='dropdown-timeout' variant='info' title='Timeouts' size='sm'>
                                <Dropdown.Item key='timeoutteam1' onClick={timeoutteam1}><Teamlogo src={gamedata.logo1} addclassname='teamlogosupersmall'/> Add Timeout {gamedata.team1}</Dropdown.Item>
                                <Dropdown.Item key='timeoutteam2' onClick={timeoutteam2}><Teamlogo src={gamedata.logo2} addclassname='teamlogosupersmall'/> Add Timeout {gamedata.team2}</Dropdown.Item>
                            </DropdownButton>
                            }
                        </div>
                        <div className="col-sm-1">
                        </div>
                        {showField &&
                            <div className="col-sm-6"><Field socket={socket}/></div>
                        }
                        </>
                    :
                        <div className="col-sm-12"><p>Select one active game.</p></div>
                    }
                </div>
            </div>
        </>
    );
}

export default LiveGameHeader
