import { useEffect, useState, useMemo } from 'react';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import Button from './Button';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserSlash, faUsersSlash } from '@fortawesome/free-solid-svg-icons';
import Gallery from 'react-grid-gallery';

const TeamList = ({ socket }) => {
    const emptyTeamdetails = useMemo(() => ({
        team_name: '',
        name: '',
        color: '',
        logo: ''
    }), []);
    const [teams, setTeams] = useState([{
        team_name: '',
        json: ''
    }]);
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
    const [logos, setLogos] = useState(['']);
    const [selectedTeam, setSelectedTeam] = useState('');
    const [changed, setChanged] = useState(false);

    const [images, setImages] = useState([{
        src: '',
        thumbnail: '',
        thumbnailWidth: 0,
        thumbnailHeight: 0
    }]);
    const [showGallery, setShowGallery] = useState(false);
    const [duplicatePlayer, setDuplicatePlayer] = useState([]);
    const [duplicateTeam, setDuplicateTeam] = useState([]);

    useEffect(() => {
        // request team list
        socket.emit('getTeamList', { message: 'Client requesting teamlist' });
        // receive team list
        socket.on('sendFullTeamList', (teams) => {
            // set team list
            setTeams(teams);
            setDuplicateTeam(teams.map(({team_name}) => team_name));
            // set first team as active
            if(teams.length > 0){
                // set first team as active
                setSelectedTeam(teams[0].json);
                // request team details
                socket.emit('getTeamDetails', { message: 'Client requesting teamdetails', teamjson: teams[0].json });
            }else{
                setTeamdetails(emptyTeamdetails)
                setSelectedTeam('');
            }
        });
        // receive team details
        socket.on('sendTeamDetails', (teamdetails) => {
            // set team details
            setTeamdetails(teamdetails);
            // set player array
            setPlayers(teamdetails.players);
        });
        // request team logos
        socket.emit('getTeamLogos', { message: 'Client requesting teamlogos' });
        // receive team logos
        socket.on('sendTeamLogos', (logos) => {
            // set team details
            setLogos(logos);
        });
    }, [socket,emptyTeamdetails]);

    // show team
    function onClickTeam(id){
        // set team id = json file name
        setSelectedTeam(id);
        // request team details
        socket.emit('getTeamDetails', { message: 'Client requesting teamdetails', teamjson: id });

        setChanged(false);
    }

    // change team
    const onChangeTeam = (index, e) => {
        let newTeamdetails = {...teamdetails};
        newTeamdetails[index] = e.target.value;
        setTeamdetails(newTeamdetails);

        setChanged(true);
    }

    // change player
    const onChangePlayer = (index, field, e) => {
        let newPlayers = [...players];
        newPlayers[index][field] = e.target.value;
        setPlayers(newPlayers);
        checkDuplicatePlayer(newPlayers);

        setChanged(true);
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

        setChanged(true);
    }

    // delete player
    const onDeletePlayer = (index) => {
        let newPlayers = [...players];
        newPlayers.splice(index, 1);
        setPlayers(newPlayers);
        checkDuplicatePlayer(newPlayers);

        setChanged(true);
    }

    // save changes
    const onSaveChanges = () => {
        // check team selected is new team
        if(selectedTeam === 'newTeam'){
            // regex for new team name used as json file name
            const regex = new RegExp('^[0-9a-zA-Z -]+$');

            // check if team name is already available
            if(duplicateTeam.includes(teamdetails.team_name)){
                toast.warning(`${teamdetails.team_name} already available, please use UNIQUE name`, {autoClose: 5000, theme: 'dark'});
            }else if(!regex.test(teamdetails.team_name)){
                toast.warning(`${teamdetails.team_name} is NOT a valid new name, use only Alphanumeric`, {autoClose: 5000, theme: 'dark'});
            }else{
                // name is valid
                // send add teamdetails with json file name
                socket.emit('addNewTeam', {
                    message: 'Client sending new team to add with teamdetails',
                    teamjson: selectedTeam,
                    teamdetails: teamdetails,
                    players: players
                });
                // request team list
                socket.emit('getTeamList', { message: 'Client requesting teamlist' });
                setChanged(false);
            }
        }else if(duplicatePlayer.length > 0){
            toast.warning(`Player Names must be UNIQUE, please change marked names`, {autoClose: 5000, theme: 'dark'});
        }else{
            // send save teamdetails with json file name
            socket.emit('saveTeamDetails', {
                message: 'Client sending new teamdetails',
                teamjson: selectedTeam,
                teamdetails: teamdetails
            });
            // send save player array with json file name
            socket.emit('savePlayerDetails', {
                message: 'Client sending new teamdetails',
                teamjson: selectedTeam,
                players: players
            });
            // request team list
            socket.emit('getTeamList', { message: 'Client requesting teamlist' });
            setChanged(false);
        }
    }
    // cancel changes
    const onCancelChanges = () => {
        // check team selected is not new team
        if(selectedTeam === 'newTeam' || selectedTeam === ''){
            // set first team as active
            if(teams.length > 0){
                // set first team as active
                setSelectedTeam(teams[0].json);
                // request team details
                socket.emit('getTeamDetails', { message: 'Client requesting teamdetails', teamjson: teams[0].json });
            }else{
                setTeamdetails(emptyTeamdetails)
                setSelectedTeam('');
            }
        }else{
            // request team details
            socket.emit('getTeamDetails', { message: 'Client requesting teamdetails', teamjson: selectedTeam });
        }

        setChanged(false);
    }

    // image clicked
    const onImgClick = () => {
        // create Gallery array
        let galleryImg = [];
        // loop through logos array
        // fill Gallery Array
        logos.forEach(imgname => {
            var imgObj = {};
            var img = new Image();
            img.src = imgname;
            imgObj.src = img.src;
            imgObj.thumbnail = img.src;
            imgObj.thumbnailWidth = img.width;
            imgObj.thumbnailHeight = img.height;
            imgObj.caption = imgname;
            galleryImg.push(imgObj);
        })
        setImages(galleryImg);
        setShowGallery(true);
    }

    // Gallery thumbnail clicked
    function onClickThumbnail(){
        let newTeamdetails = {...teamdetails};
        newTeamdetails.logo = this.props.item.caption;
        setTeamdetails(newTeamdetails);

        setChanged(true);
        toast.success(`${this.props.item.caption} selected`, {autoClose: 1000, theme: 'dark'});
        setShowGallery(false);
    }

    // team delete clicked
    const onTeamDelete = (index) => {
        if(window.confirm('Are you sure you wish to delete this team?')){
            // delete team
            socket.emit('deleteTeam', { message: 'Client requesting team delete', teamjson: index });

            // request new team list
            socket.emit('getTeamList', { message: 'Client requesting teamlist' });
            // receive team list
            socket.on('sendFullTeamList', (teams) => {
                // set team list
                setTeams(teams);
                // set first team as active
                if(teams.length > 0){
                    // set first team as active
                    setSelectedTeam(teams[0].json);
                    // request team details
                    socket.emit('getTeamDetails', { message: 'Client requesting teamdetails', teamjson: teams[0].json });
                }else{
                    setTeamdetails(emptyTeamdetails)
                    setSelectedTeam('');
                }
            });
        }
    }

    // add team
    const onTeamAdd = () => {
        setTeamdetails({
            team_name: '',
            name: '',
            color: '#000000',
            logo: 'no-logo.png'
        });
        setPlayers([{
            name: '',
            position: '',
            number: '',
            image: ''
        }]);
        setSelectedTeam('newTeam');
        setChanged(true);
    }

    return(
        <div className='container'>
            <div className="row border">
                <div className="col-sm-4 border">
                <ListGroup className="list-group list-group-flush">
                    <ListGroupItem key='addteambutton'>
                        <div className="row">
                            <div className="col-sm-12">
                                <Button buttonclass={'primary'} text={'Add Team'} onClick={onTeamAdd}/>
                            </div>
                        </div>
                    </ListGroupItem>
                </ListGroup>
                    <div className='teamsOverflow'>
                        <ListGroup className="list-group list-group-flush">
                            <ListGroupItem key='teamoverview' className="bg-light">                                           
                                <div className='row'>
                                    <div className='col-sm-9'>
                                        <span className="text-dark small">Team Name:</span>
                                    </div>
                                    <div className='col-sm-3'>
                                        <span className="text-dark small">Delete</span>
                                    </div>
                                </div>
                            </ListGroupItem>
                            {teams.map(team => (
                                <ListGroupItem key={team.json} action onClick={(e) => onClickTeam(team.json)}>                                           
                                    <div className='row'>
                                        <div className='col-sm-2'>
                                            <img src={team.logo} style={{maxWidth:'30px'}} alt=''/>
                                        </div>
                                        <div className='col-sm-8'>
                                            <span className="text-dark small">{selectedTeam === team.json ? <b>{team.team_name}</b> : team.team_name}</span>
                                            <p className='supersmall text-info'>{team.json}</p>
                                        </div>
                                        <div className='col-sm-2'>
                                            <FontAwesomeIcon icon={faUsersSlash} className='faIcon' onClick={(e) => onTeamDelete(team.json)}></FontAwesomeIcon>
                                        </div>
                                    </div>
                                </ListGroupItem>
                            ))}
                        </ListGroup>
                    </div>
                </div>

                <div className="col-sm-8 border">
                {selectedTeam !== '' &&
                <>
                    <ListGroup className="list-group list-group-flush">
                    {changed &&
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
                                            <input type="text" name='team_name' value={teamdetails.team_name} className="form-control font-weight-bold" onChange={(e) => onChangeTeam('team_name', e)}/>
                                            <p className='supersmall text-info'>{selectedTeam}</p>
                                        </div>
                                        <div className="col-sm-3">
                                            <input type="text" name='name' value={teamdetails.name} className="form-control font-weight" onChange={(e) => onChangeTeam('name', e)}/>
                                        </div>
                                        <div className="col-sm-1">
                                            <span type="text" name='color' className="form-control" style={{ backgroundColor: teamdetails.color, color: teamdetails.color }}>.</span>
                                        </div>
                                        <div className="col-sm-2">
                                            <input type="text" name='color' value={teamdetails.color} className="form-control font-weight text-dark" onChange={(e) => onChangeTeam('color', e)}/>
                                        </div>
                                        <div className="col-sm-2">
                                            <img src={teamdetails.logo} style={{maxWidth:'40px'}} alt='' onClick={() => onImgClick()}/>
                                        </div>
                                    </div>
                                </ListGroupItem>
                                </>
                            }


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
                            {players && players.map((player,index) =>
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
                        </ListGroup>
                    </div>
                </>
                }
                </div>
            </div>
            {showGallery &&
            <>
                <div className="row border">
                    <div className="col-sm-6">
                        <label>Choose image:</label>
                    </div>
                    <div className="col-sm-6">
                        <Button buttonclass={'secondary'} text={'Close'} onClick={() => setShowGallery(false)}/>
                    </div>
                </div>

                <div className="row border">
                    <div className="col-sm-12">
                        <div className='teamsOverflow'>
                            <Gallery images={images} onClickThumbnail={onClickThumbnail}/>
                        </div>
                    </div>
                </div>
            </>
            }
        </div>
    );
}

export default TeamList
