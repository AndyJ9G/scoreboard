import { useState, useEffect } from 'react';
import Timer from './Timer';
import { Navbar, Container, Nav, NavDropdown } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTools, faUsersCog, faNewspaper, faFootballBall, faFileExport, faLaptop, faTv, faPhotoVideo, faCalculator } from '@fortawesome/free-solid-svg-icons';

const Navigation = ({socket, showPlays, setShowPlays, showStats, setShowStats, selectedGame, setSelectedGame, showDrive, setShowDrive, showField, setShowField}) => {
    const [games, setGames] = useState([{
        gamename: '',
        json: ''
    }]);
    const [gamedata, setGamedata] = useState({});

    useEffect(() => {
        // request game list
        socket.emit('getGameList', { message: 'Client requesting gamelist' });
        // receive game list
        socket.on('sendFullGameList', (games) => {
            // set game list
            setGames(games);
        });
        // receive game data
        socket.on('sendLiveGameData', (gameData) => { setGamedata(gameData) });
    }, [socket]);

    // download game json
    const onExport = (id) => {
        const pom = document.createElement('a');
        pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(gamedata, null, 2)));
        pom.setAttribute('download', id);
        pom.click();
    }

    // calculate stats
    const onCalculate = (id) => {
        // calculate stats
        socket.emit('calculateStats', { message: 'Client requesting stats calculation', gamejson: id });
    }

    // select game
    const onChooseGame = (id) => {
        // set game id = json file name
        setSelectedGame(id);
        // declare live game
        socket.emit('runningLiveGame', { message: 'Client opening live game', gamejson: id });
        // request game details
        socket.emit('getGameDetails', { message: 'Client requesting gamedetails', gamejson: id });
        // request game data
        socket.emit('requestLiveGameData', { message: 'Client requesting liveGameData' });
    }

    // selectedNav event
    function selectedNav(selectedKey){
        if(selectedKey === '#home'){
            window.open('/', '_self');
        }else if(selectedKey === '#showField'){
            setShowField(!showField);
        }else if(selectedKey === '#showDrive'){
            setShowDrive(!showDrive);
        }else if(selectedKey === '#showPlays'){
            setShowPlays(!showPlays);
        }else if(selectedKey === '#showStats'){
            setShowStats(!showStats);
        }else if(selectedKey === '#export'){
            onExport(selectedGame);
        }else if(selectedKey === '#export'){
            onCalculate(selectedGame);
        }else{
            toast.info(`Selected ${selectedKey}`, {autoClose: 2000, theme: 'dark'});
        }
    }

    return (
        <Navbar bg="light" expand="lg" onSelect={(selectedKey) => selectedNav(selectedKey)}>
            <Container>
                <Navbar.Brand>GFL Football</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="me-auto">
                    <Nav.Link href="#home">Scoreboard <FontAwesomeIcon icon={faLaptop}></FontAwesomeIcon></Nav.Link>
                    <NavDropdown title={<span>Setup <FontAwesomeIcon icon={faTools}></FontAwesomeIcon></span>} id="basic-nav-dropdown">
                        <Nav.Link href="teamsetup">Team-Setup <FontAwesomeIcon icon={faUsersCog}></FontAwesomeIcon></Nav.Link>
                        <Nav.Link href="gamesetup">Game-Setup <FontAwesomeIcon icon={faNewspaper}></FontAwesomeIcon></Nav.Link>
                    </NavDropdown>
                    <Nav.Link href="livegame">Live-Game <FontAwesomeIcon icon={faTv}></FontAwesomeIcon></Nav.Link>
                    {window.location.pathname === '/livegame' && games.length > 0 &&
                        <NavDropdown title={<span>Game <FontAwesomeIcon icon={faFootballBall}></FontAwesomeIcon></span>} id="basic-nav-dropdown">
                            {games.map(game => (
                                    <NavDropdown.Item key={game.json} onClick={() => onChooseGame(game.json)} active={selectedGame === game.json && true}>{game.gamename} <FontAwesomeIcon icon={faFootballBall}></FontAwesomeIcon><p className='supersmall text-info'>{game.json}</p></NavDropdown.Item>
                            ))}
                        </NavDropdown>
                    }
                    {window.location.pathname === '/livegame' && selectedGame &&
                        <NavDropdown title={<span>Game-Controls <FontAwesomeIcon icon={faPhotoVideo}></FontAwesomeIcon></span>} id="basic-nav-dropdown">
                            <NavDropdown.Item href="#export">Export Game File <FontAwesomeIcon icon={faFileExport}></FontAwesomeIcon></NavDropdown.Item>
                            <NavDropdown.Item href="#stats">Calculate Stats <FontAwesomeIcon icon={faCalculator}></FontAwesomeIcon></NavDropdown.Item>
                            <NavDropdown.Item href="#showField"><input type="checkbox" name="showField" checked={showField}/> Show Field</NavDropdown.Item>
                            <NavDropdown.Item href="#showDrive"><input type="checkbox" name="showDrive" checked={showDrive}/> Show Drive</NavDropdown.Item>
                            <NavDropdown.Item href="#showPlays"><input type="checkbox" name="showPlays" checked={showPlays}/> Show Play List</NavDropdown.Item>
                            <NavDropdown.Item href="#showStats"><input type="checkbox" name="showStats" checked={showStats}/> Show Stats</NavDropdown.Item>
                        </NavDropdown>
                    }
                </Nav>
                </Navbar.Collapse>
                <Navbar.Collapse id="basic-navbar-nav justify-content-end">
                    <Navbar.Text>
                        <Timer socket={socket}/>
                        <p className='supersmall text-info'>{selectedGame}</p>
                    </Navbar.Text>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )
}

export default Navigation
