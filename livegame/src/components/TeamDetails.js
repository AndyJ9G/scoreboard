import { useEffect, useState } from 'react';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import Button from './Button';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserSlash } from '@fortawesome/free-solid-svg-icons';

const TeamDetails = ({ socket, selectedGame, selectedTeam, gamedetails, playerchanged, setPlayerchanged }) => {
    const [teamdetails, setTeamdetails] = useState({
        team_name: '',
        name: '',
        color: '',
        logo: ''
    });
    const [players, setPlayers] = useState([{
        name: '',
        position: '',
        number: '',
        image: ''
    }]);
    const [duplicatePlayer, setDuplicatePlayer] = useState([]);

    useEffect(() => {
        if(selectedTeam === 'home'){
            try{
                // set team details
                setTeamdetails(gamedetails.team1details);
                // set player array
                setPlayers(gamedetails.team1details.players);
            }catch{
                // gamedetails nbot available
            }
        }else if(selectedTeam === 'guest'){
            try{
                // set team details
                setTeamdetails(gamedetails.team2details);
                // set player array
                setPlayers(gamedetails.team2details.players);
            }catch{
                // gamedetails nbot available
            }
        }
    }, [socket,selectedTeam,gamedetails]);

    // change player
    const onChangePlayer = (index, field, e) => {
        let newPlayers = [...players];
        newPlayers[index][field] = e.target.value;
        setPlayers(newPlayers);
        checkDuplicatePlayer(newPlayers);

        setPlayerchanged(true);
    }

    // check duplicate player
    const checkDuplicatePlayer = (playerlist) => {
        // check if the player name is unique
        // create array of names
        const names = playerlist.map(({name}) => name);
        // function to find duplicate values and place into array
        let findDuplicates = arr => arr.filter((item, index) => arr.indexOf(item) !== index); 
        // put duplicate values in array
        setDuplicatePlayer(findDuplicates(names));
    }

    // add player
    const onAddPlayer = () => {
        let newPlayers = [...players, {
            name: '',
            position: '',
            number: '',
            image: ''
        }];
        setPlayers(newPlayers);
        checkDuplicatePlayer(newPlayers);

        setPlayerchanged(true);
    }

    // delete player
    const onDeletePlayer = (index) => {
        let newPlayers = [...players];
        newPlayers.splice(index, 1);
        setPlayers(newPlayers);
        checkDuplicatePlayer(newPlayers);

        setPlayerchanged(true);
    }

    // save changes
    const onSaveChanges = () => {
        if(duplicatePlayer.length > 0){
            toast.warning(`Player Names must be UNIQUE, please change marked names`, {autoClose: 5000, theme: 'dark'});
        }else{
            // send save player array with json file name
            socket.emit('savePlayerDetailsGame', {
                message: 'Client sending new teamdetails',
                gamejson: selectedGame,
                team: selectedTeam,
                players: players
            });
            setPlayerchanged(false);
        }
    }
    // cancel changes
    const onCancelChanges = () => {
        if(selectedTeam === 'home'){
            try{
                // set team details
                setTeamdetails(gamedetails.team1details);
                // set player array
                setPlayers(gamedetails.team1details.players);
            }catch{
                // gamedetails not available
            }
        }else if(selectedTeam === 'guest'){
            try{
                // set team details
                setTeamdetails(gamedetails.team2details);
                // set player array
                setPlayers(gamedetails.team2details.players);
            }catch{
                // gamedetails not available
            }
        }
        setPlayerchanged(false);
    }

    return(
        <>
            {1===1 &&
            <>
                <ListGroup className="list-group list-group-flush">
                {playerchanged &&
                    <ListGroupItem key='savebutton'>
                        <div className="row">
                            <div className="col-sm-6">
                                <Button buttonclass={'success'} text={'Save'} onClick={onSaveChanges}/>
                            </div>
                            <div className="col-sm-6">
                                <Button buttonclass={'secondary'} text={'Cancel'} onClick={onCancelChanges}/>
                            </div>
                        </div>
                    </ListGroupItem>
                }
                </ListGroup>
                <div className='teamsOverflow'>
                    <ListGroup className="list-group list-group-flush">
                        {teamdetails &&
                            <>
                            <ListGroupItem key='teamheader' className="bg-light">
                                <div className="row">
                                    <div className="col-sm-4">
                                        <span className="text-dark small">Team Name:</span>
                                    </div>
                                    <div className="col-sm-3">
                                        <span className="text-dark small">Name:</span>
                                    </div>
                                    <div className="col-sm-3">
                                        <span className="text-dark small">Color:</span>
                                    </div>
                                    <div className="col-sm-2">
                                        <span className="text-dark small">Logo:</span>
                                    </div>
                                </div>
                            </ListGroupItem>

                            <ListGroupItem key='teamdetails'>
                                <div className="row">
                                    <div className="col-sm-4">
                                        <span type="text" name='team_name' className="form-control font-weight-bold">{teamdetails.team_name}</span>
                                        <p className='supersmall text-info'>{selectedTeam}</p>
                                    </div>
                                    <div className="col-sm-3">
                                        <span type="text" name='name'className="form-control font-weight">{teamdetails.name}</span>
                                    </div>
                                    <div className="col-sm-1">
                                        <span type="text" name='color' className="form-control" style={{ backgroundColor: teamdetails.color, color: teamdetails.color }}>.</span>
                                    </div>
                                    <div className="col-sm-2">
                                        <span type="text" name='color' className="form-control font-weight text-dark">{teamdetails.color}</span>
                                    </div>
                                    <div className="col-sm-2">
                                        <img src={`/${teamdetails.logo}`} style={{maxWidth:'40px'}} alt=''/>
                                    </div>
                                </div>
                            </ListGroupItem>

                            <ListGroupItem key='playerheader' className="bg-light">
                                <div className="row">
                                    <div className="col-sm-3">
                                        <span className="text-dark small">Position:</span>
                                    </div>
                                    <div className="col-sm-4">
                                        <span className="text-dark small">Name:</span>
                                    </div>
                                    <div className="col-sm-2">
                                        <span className="text-dark small">Number:</span>
                                    </div>
                                    <div className="col-sm-2">
                                        <span className="text-dark small">Image:</span>
                                    </div>
                                    <div className="col-sm-1">
                                        <span className="text-dark small">Delete</span>
                                    </div>
                                </div>
                            </ListGroupItem>
                            {players && players.length > 0 && players.map((player,index) =>
                                <ListGroupItem key={selectedTeam+index}>
                                    <div className="row">
                                        <div className="col-sm-3">
                                            <input type="text" name='position' value={player.position} className="form-control font-weight" onChange={(e) => onChangePlayer(index, 'position', e)}/>
                                        </div>
                                        <div className="col-sm-4">
                                            {duplicatePlayer.includes(player.name) ? 
                                            <input type="text" name='playername' value={player.name} className="form-control font-weight-bold bg-danger" onChange={(e) => onChangePlayer(index, 'name', e)}/>
                                            :
                                            <input type="text" name='playername' value={player.name} className="form-control font-weight-bold" onChange={(e) => onChangePlayer(index, 'name', e)}/>
                                            }
                                        </div>
                                        <div className="col-sm-2">
                                            <input type="text" name='number' value={player.number} className="form-control font-weight" onChange={(e) => onChangePlayer(index, 'number', e)}/>
                                        </div>
                                        <div className="col-sm-2">
                                            {player.image !== '' ?
                                                <img src={player.image} style={{maxWidth:'40px'}} alt=''/>
                                            :   <img src={teamdetails.logo} style={{maxWidth:'40px'}} alt=''/>
                                            }
                                        </div>
                                        <div className="col-sm-1">
                                            <FontAwesomeIcon icon={faUserSlash} className='faIcon' onClick={() => onDeletePlayer(index)}></FontAwesomeIcon>
                                        </div>
                                    </div>
                                </ListGroupItem>
                            )}
                            <ListGroupItem key='addbutton'>
                                <div className="row">
                                    <div className="col-sm-12">
                                        <Button buttonclass={'primary'} text={'Add'} onClick={onAddPlayer}/>
                                    </div>
                                </div>
                            </ListGroupItem>
                            </>
                        }
                    </ListGroup>
                </div>
            </>
            }
        </>
    );
}

export default TeamDetails
