import { useEffect, useState } from 'react';
import Teamlogo from './Teamlogo';

const GameScore = ({ socket, gamedata, setGamedata }) => {
    const [conf, setConf] = useState({
        quarters: 4
    });
    const [period, setPeriod] = useState('');
    const [possession, setPossession] = useState('');

    useEffect(() => {
        socket.emit('requestConfig', { message: 'Client requesting config' });
        socket.on('sendConfig', (config) => {
            setConf(config);
        });
        socket.emit('requestGuiData', { message: 'Client requesting guiData' });
        socket.on('sendGUIdata', (guiData) => {
            setPeriod(guiData.period);
            setPossession(guiData.possession);
        });
        socket.emit('requestLiveGameData', { message: 'Client requesting liveGameData' });
        socket.on('sendLiveGameData', (gameData) => {setGamedata(gameData)});
    }, [socket,setGamedata]);

    const getPeriodContent = (conf) => {
        let content = [];
        for (let y = 1; y <= conf.quarters; y++){
            if(period === y){
                content.push(
                    <th scope='col' key={y} className='table-primary'><b>{y}</b></th>
                );
            }else{
                content.push(
                    <th scope='col' key={y}>{y}</th>
                );
            }
        }
        return content;
    }

    const getPeriodTeamScore = (conf, team) => {
        let content = [];
        for (let i = 1; i <= conf.quarters; i++){
            if(possession === team && period === i){
                content.push(
                    <td className='table-success' key={i}>
                        {gamedata.teamStats &&
                            gamedata.teamStats[team] &&
                                gamedata.teamStats[team].team &&
                                    gamedata.teamStats[team].team[i] &&
                                        gamedata.teamStats[team].team[i].points ? gamedata.teamStats[team].team[i].points : 0
                        }
                    </td>
                );
            }else{
                content.push(
                    <td key={i}>
                        {gamedata.teamStats &&
                            gamedata.teamStats[team] &&
                                gamedata.teamStats[team].team &&
                                    gamedata.teamStats[team].team[i] &&
                                        gamedata.teamStats[team].team[i].points ? gamedata.teamStats[team].team[i].points : 0
                        }
                    </td>
                );
            }
        }
        content.push(
            <td className='table-secondary' key='final'>
                {gamedata.teamStats &&
                    gamedata.teamStats[team] &&
                        gamedata.teamStats[team].team &&
                            gamedata.teamStats[team].team[0] &&
                                gamedata.teamStats[team].team[0].points ? gamedata.teamStats[team].team[0].points : 0
                }
            </td>
        );
        return content;
    }

    return(
        <>
            <div className='row'>
                <table className="table table-bordered table-sm">
                    <thead>
                        <tr>
                            <th scope='col' className='table-light'>Period</th>
                            {getPeriodContent(conf)}
                            <th scope='col' className='table-dark'>F</th>
                        </tr>
                    </thead>

                    <tbody>
                        <tr>
                            <th scope='row' className='table-light'>
                                {possession === 'team1' && <Teamlogo addclassname='teamlogosupersmall' src='ball.png'/>}
                                <Teamlogo src={gamedata.logo1} addclassname='teamlogosupersmall'/>
                            </th>
                            {getPeriodTeamScore(conf, 'team1')}
                        </tr>
                        <tr>
                            <th scope='row' className='table-light'>
                                {possession === 'team2' && <Teamlogo addclassname='teamlogosupersmall' src='ball.png'/>}
                                <Teamlogo src={gamedata.logo2} addclassname='teamlogosupersmall'/>
                            </th>
                            {getPeriodTeamScore(conf, 'team2')}
                        </tr>
                    </tbody>
                </table>
            </div>
        </>
    );
}

export default GameScore
