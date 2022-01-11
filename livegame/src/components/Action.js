import { useEffect, useState } from 'react';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faEdit } from '@fortawesome/free-solid-svg-icons';
import Teamlogo from './Teamlogo';
import Drive from './Drive';
import DownDistance from './DownDistance';
import BallPosition from './BallPosition';

const Action = ({ socket }) => {
    const [playarray, setPlayarray] = useState([]);
    const [gamedata, setGamedata] = useState({});

    useEffect(() => {
        socket.emit('requestLiveGameData', { message: 'Client requesting liveGameData' });
        socket.on('sendLiveGameData', (gameData) => {
            setGamedata(gameData);
            setPlayarray(gameData.plays);
        });
    }, [socket]);

    function onClickDelete(id){
        if(window.confirm('Are you sure you wish to delete this play?')){
            // delete play
            socket.emit('deletePlay', { message: 'Client requesting play delete', play: id });
        }
    }

    function onClickEdit(id){
        // edit play
        socket.emit('editPlay', { message: 'Client requesting play edit mode', play: id });
    }

    return(
        <>
            <div className='container border'>
                <div className='row'>
                    <div className="col-sm-12">
                        <div className='playsOverflow'>
                            <ListGroup className="list-group list-group-flush">
                                {playarray.sort((b,a) => a.actionid - b.actionid).map(play =>
                                    <ListGroupItem key={play.actionid}>
                                        <div className='row'>
                                            <div className="col-sm-11">
                                                <div className="d-flex w-100 justify-content-between mb-0">
                                                    <h6 className="mb-0">
                                                        {(() => {
                                                            switch (play.action) {
                                                                case 'Cointoss':
                                                                case 'Halftime':
                                                                case 'Game Finished':
                                                                    return <>
                                                                        <Teamlogo addclassname='teamlogosupersmall' src='ball.png'/>
                                                                    </>
                                                                case 'Cointoss Winner':
                                                                case 'Cointoss Decision':
                                                                    switch (play.winner) {
                                                                        case 'team1':
                                                                            return <>
                                                                                <Teamlogo addclassname='teamlogosupersmall' src={gamedata.logo1}/>
                                                                            </>
                                                                        case 'team2':
                                                                            return <>
                                                                                <Teamlogo addclassname='teamlogosupersmall' src={gamedata.logo2}/>
                                                                            </>
                                                                        default :
                                                                            return null
                                                                    }
                                                                case 'Cointoss Defer Decision':
                                                                    switch (play.winner) {
                                                                        case 'team1':
                                                                            return <>
                                                                                <Teamlogo addclassname='teamlogosupersmall' src={gamedata.logo2}/>
                                                                            </>
                                                                        case 'team2':
                                                                            return <>
                                                                                <Teamlogo addclassname='teamlogosupersmall' src={gamedata.logo1}/>
                                                                            </>
                                                                        default :
                                                                            return null
                                                                    }
                                                                case 'Kickoff':
                                                                    return <>
                                                                    {(() => {
                                                                    switch (play.kickteam) {
                                                                        case 'team1':
                                                                            return <>
                                                                                <Teamlogo addclassname='teamlogosupersmall' src={gamedata.logo2}/>
                                                                            </>
                                                                        case 'team2':
                                                                            return <>
                                                                                <Teamlogo addclassname='teamlogosupersmall' src={gamedata.logo1}/>
                                                                            </>
                                                                        default :
                                                                            return null
                                                                    }
                                                                    })()}
                                                                    <BallPosition play={play} gamedata={gamedata}/>
                                                                    </>
                                                                case 'Kickoff after Halftime':
                                                                    switch (play.kickteam) {
                                                                        case 'team1':
                                                                            return <>
                                                                                <Teamlogo addclassname='teamlogosupersmall' src={gamedata.logo2}/>
                                                                            </>
                                                                        case 'team2':
                                                                            return <>
                                                                                <Teamlogo addclassname='teamlogosupersmall' src={gamedata.logo1}/>
                                                                            </>
                                                                        default :
                                                                            return null
                                                                    }
                                                                case 'End of Period':
                                                                    switch (play.offense) {
                                                                        case 'team1':
                                                                            return <>
                                                                                <Teamlogo addclassname='teamlogosupersmall' src={gamedata.logo1}/>
                                                                            </>
                                                                        case 'team2':
                                                                            return <>
                                                                                <Teamlogo addclassname='teamlogosupersmall' src={gamedata.logo2}/>
                                                                            </>
                                                                        default :
                                                                            return null
                                                                    }
                                                                default:
                                                                    return <>
                                                                    {(() => {
                                                                        switch (play.offense) {
                                                                            case 'team1':
                                                                                return <>
                                                                                    <Teamlogo addclassname='teamlogosupersmall' src={gamedata.logo1}/>
                                                                                </>
                                                                            case 'team2':
                                                                                return <>
                                                                                    <Teamlogo addclassname='teamlogosupersmall' src={gamedata.logo2}/>
                                                                                </>
                                                                            default:
                                                                                return <>
                                                                                </>
                                                                        }
                                                                    })()}
                                                                    {typeof play.drive !== 'undefined' && play.drive > 0 ? <Drive play={play}/> : ''}
                                                                    {typeof play.down !== 'undefined' && play.down > 0 ? <DownDistance play={play}/> : ''}
                                                                    {typeof play.down !== 'undefined' && play.down > 0 ? <BallPosition play={play} gamedata={gamedata}/> : ''}
                                                                    </>
                                                            }
                                                        })()}
                                                    </h6>
                                                    <h6 className="mb-0">
                                                    {(() => {
                                                            switch (play.score) {
                                                                case 'Touchdown':
                                                                case 'Safety':
                                                                    return <>
                                                                        <span className="badge bg-success text-light supersmall">{play.score}: {play.action}, {play.yardsGained} yards</span>
                                                                    </>
                                                                case 'PAT Kick':
                                                                case 'PAT Run':
                                                                case 'PAT Pass':
                                                                    return <>
                                                                        <span className="badge bg-success text-light supersmall">{play.score}: {play.patresult}</span>
                                                                    </>
                                                                case 'Fieldgoal':
                                                                    return <>
                                                                        <span className="badge bg-success text-light supersmall">{play.score}: {play.yardsFieldgoal} yards</span>
                                                                    </>
                                                                default:
                                                                    switch (play.action) {
                                                                        case 'Run':
                                                                        case 'Pass':
                                                                        case 'Fieldgoal':
                                                                            return <>
                                                                                <span className="badge bg-primary text-light supersmall">{play.action}: {play.yardsGained ? play.yardsGained : '0'} yards</span>
                                                                            </>
                                                                        case 'Punt':
                                                                            return <>
                                                                                <span className="badge bg-dark text-light supersmall">{play.action}: {play.yardsPunt} yards</span>
                                                                            </>
                                                                        case 'Kickoff':
                                                                            return <>
                                                                                <span className="badge bg-dark text-light supersmall">{play.action}: {play.yardsKick} yards</span>
                                                                            </>
                                                                        case 'Kickoff after Halftime':
                                                                            return <>
                                                                                <span className="badge bg-dark text-light supersmall">{play.action}</span>
                                                                            </>
                                                                        case 'Kickoff Return':
                                                                        case 'Fumble Return':
                                                                        case 'Lateral':
                                                                        case 'Interception Return':
                                                                        case 'Fieldgoal Return':
                                                                        case 'Punt Return':
                                                                        case 'PAT Return':
                                                                        case 'PAT Kick Return':
                                                                            return <>
                                                                                <span className="badge bg-secondary text-light supersmall">{play.action}: {play.yardsGained} yards</span>
                                                                            </>
                                                                        case 'PAT':
                                                                            return <>
                                                                                <span className="badge bg-info text-light supersmall">{play.action}: {play.yardsGained} yards</span>
                                                                            </>
                                                                        case 'Penalty':
                                                                            return <>
                                                                                <span className="badge bg-warning text-light supersmall">{play.action}: {play.penaltyYards} yards</span>
                                                                            </>
                                                                        default:
                                                                            return <>
                                                                                <span className="badge bg-light text-dark supersmall">{play.action}</span>
                                                                            </>
                                                                    }
                                                            }
                                                        })()}
                                                    </h6>
                                                </div>
                                                <div className="d-flex w-100 justify-content-between mb-0">
                                                    <p className='supersmall mb-0'>{play.playtext}</p>
                                                </div>
                                            </div>
                                            <div className="col-sm-1">
                                                {play.actionid !== 1 &&
                                                    <div className="row">
                                                        <div className="col-sm-6">
                                                            <FontAwesomeIcon icon={faEdit} className='faIcon' onClick={(e) => onClickEdit(play.actionid)}></FontAwesomeIcon>
                                                        </div>
                                                        <div className="col-sm-6">
                                                            <FontAwesomeIcon icon={faTrashAlt} className='faIcon' onClick={(e) => onClickDelete(play.actionid)}></FontAwesomeIcon>
                                                        </div>
                                                    </div>
                                                }
                                            </div>
                                        </div>
                                    </ListGroupItem>
                                )}
                            </ListGroup>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Action
