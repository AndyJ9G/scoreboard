import { useEffect, useState } from 'react';
import { Dropdown, DropdownButton, ListGroup, ListGroupItem } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFootballBall } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import Button from './Button';
import Teamlogo from './Teamlogo';
import TeamDetails from './TeamDetails';

const GameDetails = ({ socket, selectedGame, setSelectedGame }) => {
    const [gamedetails, setGamedetails] = useState({
        season: '',
        gamename: '',
        gametype: '',
        city: '',
        stadium: '',
        date: '',
        starttime: '',
        team1: '',
        logo1: '',
        team2: '',
        logo2: ''
    });
    const [teams, setTeams] = useState([{
        team_name: '',
        json: '',
        logo: ''
    }]);
    const [games, setGames] = useState([{
        gamename: '',
        json: ''
    }]);
    const [changed, setChanged] = useState(false);
    const [duplicateGame, setDuplicateGame] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState('');
    const [playerchanged, setPlayerchanged] = useState(false);

    useEffect(() => {
        // request team list
        socket.emit('getTeamList', { message: 'Client requesting teamlist' });
        // receive team list
        socket.on('sendFullTeamList', (teams) => {
            // set team list
            setTeams(teams);
        });
        // request game list
        socket.emit('getGameList', { message: 'Client requesting gamelist' });
        // receive game list
        socket.on('sendFullGameList', (games) => {
            // set game list
            setGames(games);
            setDuplicateGame(games.map(({gamename}) => gamename));

            if(games.length > 0){
                // set first game as active
                setSelectedGame(games[0].json);
                // request game details
                socket.emit('getGameDetails', { message: 'Client requesting gamedetails', gamejson: games[0].json });
            }
        });
        // receive game details
        socket.on('sendGameDetails', (gamedetails) => {
            // set game details
            setGamedetails(gamedetails);
        });
    }, [socket,setSelectedGame]);

    // show game
    function onClickGame(id){
        // set game id = json file name
        setSelectedGame(id);
        // request game details
        socket.emit('getGameDetails', { message: 'Client requesting gamedetails', gamejson: id });

        setChanged(false);
    }

    // select teams
    const onChooseTeam = (team, name) => {
        let newGamedetails = {...gamedetails};
        // get team details
        let teamdetails = teams.filter(team => team.team_name === name);
        // get team logo
        let teamlogo = teams.filter(team => team.team_name === name).map(filteredteam => filteredteam.logo);
        // get team json file
        let teamjsonfile = teams.filter(team => team.team_name === name).map(filteredteam => filteredteam.json);
        // check team to set
        if(team === 'home'){
            newGamedetails.team1 = name;
            newGamedetails.logo1 = teamlogo[0];
            newGamedetails.team1json = teamjsonfile[0];
            newGamedetails.team1details = teamdetails[0];
        }else{
            newGamedetails.team2 = name;
            newGamedetails.logo2 = teamlogo[0];
            newGamedetails.team2json = teamjsonfile[0];
            newGamedetails.team2details = teamdetails[0];
        }
        setGamedetails(newGamedetails);

        setChanged(true);
    }

    // change values
    const onChangeValues = (index, e) => {
        let newGamedetails = {...gamedetails};
        newGamedetails[index] = e.target.value;
        setGamedetails(newGamedetails);

        setChanged(true);
    }

    // save
    const onSave = () => {
        // check game selected is new game
        if(selectedGame === 'newGame'){
            // regex for new game name used as json file name
            const regex = new RegExp('^[0-9a-zA-Z -._]+$');

            // check if game name is already available
            if(duplicateGame.includes(gamedetails.gamename)){
                toast.warning(`Game Name: ${gamedetails.gamename} already available, please use UNIQUE name`, {autoClose: 5000, theme: 'dark'});
            }else if(!regex.test(gamedetails.gamename)){
                toast.warning(`Game Name: ${gamedetails.gamename} is NOT a valid new name, use only Alphanumeric`, {autoClose: 5000, theme: 'dark'});
            }else{
                // name is valid
                // check if both teams are selected
                if(gamedetails.team1 !== '' && gamedetails.team2 !== ''){
                    // send add gamedetails with json file name
                    socket.emit('addNewGame', {
                        message: 'Client sending new game to add with gamedetails',
                        gamedetails: gamedetails
                    });
                    // request game list
                    socket.emit('getGameList', { message: 'Client requesting gamelist' });
                    setChanged(false);
                }else{
                    toast.warning(`Please select both teams`, {autoClose: 5000, theme: 'dark'});
                }
            }
        }else{
            // check if both teams are selected
            if(gamedetails.team1 !== '' && gamedetails.team2 !== ''){
                // send save gamedetails with json file name
                socket.emit('saveGameDetails', {
                    message: 'Client sending new gamedetails',
                    gamejson: selectedGame,
                    gamedetails: gamedetails
                });
                // request game list
                socket.emit('getGameList', { message: 'Client requesting gamelist' });
                setChanged(false);
            }else{
                toast.warning(`Please select both teams`, {autoClose: 5000, theme: 'dark'});
            }
        }
    }
    // cancel changes
    const onCancel = () => {
        // check game selected is not game team
        if(selectedGame === 'newGame' || selectedGame === ''){
            if(games.length > 0){
                // set first game as active
                setSelectedGame(games[0].json);
                // request game details
                socket.emit('getGameDetails', { message: 'Client requesting gamedetails', gamejson: games[0].json });
            }
        }else{
            // request game details
            socket.emit('getGameDetails', { message: 'Client requesting gamedetails', gamejson: selectedGame });
        }

        setChanged(false);
    }

    // new game
    const onNewGame = () => {
        setGamedetails({
            season: '',
            gamename: '',
            gametype: '',
            city: '',
            stadium: '',
            date: '',
            starttime: '',
            team1: '',
            logo1: '',
            team2: '',
            logo2: ''
        });
        setSelectedGame('newGame');
        setSelectedTeam('');
        setChanged(true);
    }

    // game delete clicked
    const onGameDelete = (index) => {
        if(window.confirm('Are you sure you wish to delete this game?')){
            // delete game
            socket.emit('deleteGame', { message: 'Client requesting game delete', gamejson: index });

            // request new game list
            socket.emit('getGameList', { message: 'Client requesting gamelist' });
            // receive game list
            socket.on('sendFullGameList', (games) => {
                // set game list
                setGames(games);
                if(games.length > 0){
                    // set first game as active
                    setSelectedGame(games[0].json);
                    // request game details
                    socket.emit('getGameDetails', { message: 'Client requesting gamedetails', gamejson: games[0].json });
                }
            });
        }
    }

    // Team image clicked
    const onTeamImageClick = (team) => {
        // check if players changed without saving
        if(playerchanged){
            // cancel changes and load again
            onCancel();
            setPlayerchanged(false);
        }
        setSelectedTeam(team);
    }

    // Load Players clicked
    const onLoadPlayers = (team, name) => {
        // check if players changed without saving
        if(playerchanged){
            // cancel changes and load again
            onCancel();
            setPlayerchanged(false);
        }
        let newGamedetails = {...gamedetails};
        // get team details
        let teamdetails = teams.filter(teamfilter => teamfilter.team_name === name);
        // check team to set
        if(team === 'home'){
            newGamedetails.team1details = teamdetails[0];
        }else{
            newGamedetails.team2details = teamdetails[0];
        }
        setGamedetails(newGamedetails);
        setSelectedTeam(team);

        setChanged(true);
    }

    return(
        <>
            <div className='container'>
                <div className="row border">
                    <div className="col-sm-4 border">
                        <ListGroup className="list-group list-group-flush">
                            <ListGroupItem key='addgamebutton'>
                                <div className="row">
                                    <div className="col-sm-12">
                                        <Button buttonclass={'primary'} text={'Create New Game'} onClick={onNewGame}/>
                                    </div>
                                </div>
                            </ListGroupItem>
                        </ListGroup>
                        <div className='teamsOverflow'>
                            <ListGroup className="list-group list-group-flush">
                                <ListGroupItem key='gameoverview' className="bg-light">                                           
                                    <div className='row'>
                                        <div className='col-sm-9'>
                                            <span className="text-dark small">Game Name:</span>
                                        </div>
                                        <div className='col-sm-3'>
                                            <span className="text-dark small">Delete</span>
                                        </div>
                                    </div>
                                </ListGroupItem>
                                {games.length > 0 && games.map(game => (
                                    <ListGroupItem key={game.json} action onClick={(e) => onClickGame(game.json)}>
                                        <div className='row'>
                                            <div className='col-sm-10'>
                                                <span className="text-dark small">{selectedGame === game.json ? <b>{game.gamename}</b> : game.gamename}</span>
                                                <p className='supersmall text-info'>{game.json}</p>
                                            </div>
                                            <div className='col-sm-2'>
                                                <FontAwesomeIcon icon={faFootballBall} className='faIcon' onClick={(e) => onGameDelete(game.json)}></FontAwesomeIcon>
                                            </div>
                                        </div>
                                        {game.logo1 !== '' && game.logo2 !== '' ?
                                            <div className='row'>
                                                <div className='col-sm-5'>
                                                    <Teamlogo src={game.logo1} alt='' style={{maxWidth:'30px'}}/> - <Teamlogo src={game.logo2} alt='' style={{maxWidth:'30px'}}/>
                                                </div>
                                            </div>
                                        : <></> }
                                    </ListGroupItem>
                                ))}
                            </ListGroup>
                        </div>
                    </div>

                    <div className="col-sm-8 border">
                    {selectedGame !== '' &&
                    <>
                        <ListGroup className="list-group list-group-flush">
                        {changed &&
                            <ListGroupItem key='savebutton'>
                                <div className="row">
                                    <div className="col-sm-6">
                                        <Button buttonclass={'success'} text={'Save'} onClick={onSave}/>
                                    </div>
                                    <div className="col-sm-6">
                                        <Button buttonclass={'secondary'} text={'Cancel'} onClick={onCancel}/>
                                    </div>
                                </div>
                            </ListGroupItem>
                        }
                        </ListGroup>
                        <div className="row">
                            <div className="col-sm-2 text-right">
                                <label className="small">Season:</label>
                            </div>
                            <div className="col-sm-3 mb-2">
                                <input type="text" value={gamedetails.season} className="form-control font-weight-bold" onChange={(e) => onChangeValues('season', e)}/>
                            </div>
                            <div className="col-sm-4 text-right">
                                <label className="small">Game Type:</label>
                            </div>
                            <div className="col-sm-3 mb-2">
                                <input type="text" value={gamedetails.gametype} className="form-control font-weight-bold" onChange={(e) => onChangeValues('gametype', e)}/>
                            </div>

                            <div className="w-100"></div>


                            <div className="col-sm-2 text-right">
                                <label className="small">Game Name:</label>
                            </div>
                            <div className="col-sm-10 mb-2">
                                <input type="text" value={gamedetails.gamename} className="form-control font-weight-bold" onChange={(e) => onChangeValues('gamename', e)}/>
                                <p className='supersmall text-info'>{selectedGame}</p>
                            </div>

                            <div className="w-100"></div>

                            <div className="col-sm-2 text-right">
                                <label className="small">City:</label>
                            </div>
                            <div className="col-sm-3 mb-2">
                                <input type="text" value={gamedetails.city} className="form-control font-weight-bold" onChange={(e) => onChangeValues('city', e)}/>
                            </div>
                            <div className="col-sm-4 text-right">
                                <label className="small">Stadium:</label>
                            </div>
                            <div className="col-sm-3 mb-2">
                                <input type="text" value={gamedetails.stadium} className="form-control font-weight-bold" onChange={(e) => onChangeValues('stadium', e)}/>
                            </div>

                            <div className="w-100"></div>

                            <div className="col-sm-2 text-right">
                                <label className="small">Date:</label>
                            </div>
                            <div className="col-sm-3 mb-2">
                                <input type="text" value={gamedetails.date} className="form-control font-weight-bold" onChange={(e) => onChangeValues('date', e)}/>
                            </div>
                            <div className="col-sm-4 text-right">
                                <label className="small">Start Time:</label>
                            </div>
                            <div className="col-sm-3 mb-2">
                                <input type="text" value={gamedetails.starttime} className="form-control font-weight-bold" onChange={(e) => onChangeValues('starttime', e)}/>
                            </div>

                            <div className="w-100"></div>

                            <div className="col-sm-2 text-right">
                                <label className="small">Home Team:</label>
                            </div>
                            <div className="col-sm-3 mb-2">
                                <span className="form-control font-weight-bold bg-light">{gamedetails.team1 ? gamedetails.team1 : 'not selected'}</span>
                            </div>

                            <div className="col-sm-2 mb-2">
                                {gamedetails.team1 !== '' &&
                                    <Teamlogo src={teams.filter(team => team.team_name === gamedetails.team1).map(filteredteam => filteredteam.logo)} alt='' onClick={() => onTeamImageClick('home')}/>
                                }
                            </div>

                            <div className="col-sm-2 mb-2">
                                {gamedetails.team1 !== '' &&
                                    <Button buttonclass={'primary'} text={'Load Players'} onClick={() => onLoadPlayers('home',gamedetails.team1)}/>
                                }
                            </div>

                            <div className="col-sm-3 mb-2">
                                <DropdownButton id='dropdown-home-team' variant='success' title='Choose Home Team' size='sm'>
                                    {teams.length > 0 && teams.map(team => (
                                        <Dropdown.Item key={team.team_name} onClick={() => onChooseTeam('home', team.team_name)}>{team.team_name}</Dropdown.Item>
                                    ))}
                                </DropdownButton>
                            </div>

                            <div className="w-100"></div>

                            <div className="col-sm-2 text-right">
                                <label className="small">Guest Team:</label>
                            </div>
                            <div className="col-sm-3 mb-2">
                                <span className="form-control font-weight-bold bg-light">{gamedetails.team1 ? gamedetails.team1 : 'not selected'}</span>
                            </div>

                            <div className="col-sm-2 mb-2">
                                {gamedetails.team2 !== '' &&
                                    <Teamlogo src={teams.filter(team => team.team_name === gamedetails.team2).map(filteredteam => filteredteam.logo)} alt='' onClick={() => onTeamImageClick('guest')}/>
                                }
                            </div>

                            <div className="col-sm-2 mb-2">
                                {gamedetails.team2 !== '' &&
                                    <Button buttonclass={'primary'} text={'Load Players'} onClick={() => onLoadPlayers('guest',gamedetails.team2)}/>
                                }
                            </div>

                            <div className="col-sm-3 mb-2">
                                <DropdownButton id='dropdown-home-team' variant='secondary' title='Choose Guest Team' size='sm'>
                                    {teams.length > 0 && teams.map(team => (
                                        <Dropdown.Item key={team.team_name} onClick={() => onChooseTeam('guest', team.team_name)}>{team.team_name}</Dropdown.Item>
                                    ))}
                                </DropdownButton>
                            </div>
                        </div>
                    </>
                    }

                    {selectedTeam !== '' &&
                        <TeamDetails socket={socket} selectedGame={selectedGame} selectedTeam={selectedTeam} gamedetails={gamedetails} playerchanged={playerchanged} setPlayerchanged={setPlayerchanged}/>
                    }

                    </div>
                </div>
            </div>
        </>
    );
}

export default GameDetails
