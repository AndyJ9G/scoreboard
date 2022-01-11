import { useEffect, useState, forwardRef } from 'react';
import MaterialTable from 'material-table';
import AddBox from "@material-ui/icons/AddBox";
import ArrowDownward from "@material-ui/icons/ArrowDownward";
import Check from "@material-ui/icons/Check";
import ChevronLeft from "@material-ui/icons/ChevronLeft";
import ChevronRight from "@material-ui/icons/ChevronRight";
import Clear from "@material-ui/icons/Clear";
import DeleteOutline from "@material-ui/icons/DeleteOutline";
import Edit from "@material-ui/icons/Edit";
import FilterList from "@material-ui/icons/FilterList";
import FirstPage from "@material-ui/icons/FirstPage";
import LastPage from "@material-ui/icons/LastPage";
import Remove from "@material-ui/icons/Remove";
import SaveAlt from "@material-ui/icons/SaveAlt";
import Search from "@material-ui/icons/Search";
import ViewColumn from "@material-ui/icons/ViewColumn";

const GameStats = ({ socket }) => {
    const [gamedata, setGamedata] = useState({});
    const [playerTeam1Stats, setPlayerTeam1Stats] = useState([{}]);
    const [playerTeam2Stats, setPlayerTeam2Stats] = useState([{}]);
    const [teamOverviewStats, setTeamOverviewStats] = useState([{}]);

    useEffect(() => {
        socket.emit('requestLiveGameData', { message: 'Client requesting liveGameData' });
        socket.on('sendLiveGameData', (gameData) => {setGamedata(gameData)});
        socket.emit('requestTableStats', { message: 'Client requesting tableStats' });
        socket.on('sendTableStats', (tableData) => {
            setPlayerTeam1Stats(tableData.playerTeam1Stats);
            setPlayerTeam2Stats(tableData.playerTeam2Stats);
            setTeamOverviewStats(tableData.teamOverviewStats);
        });
    }, [socket]);


    // table icons
    const tableIcons = {
        Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
        Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
        Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
        Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
        DetailPanel: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
        Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
        Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
        Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
        FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
        LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
        NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
        PreviousPage: forwardRef((props, ref) => <ChevronLeft {...props} ref={ref} />),
        ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
        Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
        SortArrow: forwardRef((props, ref) => <ArrowDownward {...props} ref={ref} />),
        ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
        ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />),
    };

    // table options
    const tableOptions = {
        exportButton: true,
        paging: false,
        headerStyle: {
            backgroundColor: 'brown',
            color: 'white',
            fontSize: 10,
            padding: '2px',
            spacing: '2px',
            whiteSpace: 'nowrap'
        },
        rowStyle: {
            fontSize: 10
        },
        borderSpacing: '20px 4px'
    };

    // table columns players offense
    const teamPlayersOffenseTableColumns = [
        {title: 'Name (#)', field: 'playername', cellStyle: {whiteSpace: 'nowrap', padding: '2px', textAlign: 'left', border: 'dotted 1px lightgrey'}, headerStyle: {backgroundColor: 'green', border: 'dotted 1px lightgrey'} },
        {title: 'Run', field: 'run', cellStyle: {backgroundColor: 'lightyellow', padding: '2px', borderSpacing: '10px', textAlign: 'center', border: 'dotted 1px lightgrey'}, headerStyle: {backgroundColor: 'orange', border: 'dotted 1px lightgrey'} },
        {title: 'Yrd', field: 'runyards', cellStyle: {backgroundColor: 'lightyellow', padding: '2px', textAlign: 'center', border: 'dotted 1px lightgrey'}, headerStyle: {backgroundColor: 'orange', border: 'dotted 1px lightgrey'} },
        {title: 'Ave', field: 'runyardsaverage', cellStyle: {backgroundColor: 'lightyellow', padding: '2px', textAlign: 'center', border: 'dotted 1px lightgrey'}, headerStyle: {backgroundColor: 'orange', border: 'dotted 1px lightgrey'} },
        {title: 'Long', field: 'longestrun', cellStyle: {backgroundColor: 'lightyellow', padding: '2px', textAlign: 'center', border: 'dotted 1px lightgrey'}, headerStyle: {backgroundColor: 'orange', border: 'dotted 1px lightgrey'} },
        {title: 'TD', field: 'touchdownrun', cellStyle: {backgroundColor: 'lightyellow', padding: '2px', textAlign: 'center', border: 'dotted 1px lightgrey'}, headerStyle: {backgroundColor: 'orange', border: 'dotted 1px lightgrey'} },
        {title: 'Fum', field: 'fumbled', cellStyle: {backgroundColor: 'lightyellow', padding: '2px', textAlign: 'center', border: 'dotted 1px lightgrey'}, headerStyle: {backgroundColor: 'orange', border: 'dotted 1px lightgrey'} },

        {title: 'Rec', field: 'catched', cellStyle: {backgroundColor: 'lightblue', padding: '2px', textAlign: 'center', border: 'dotted 1px lightgrey'}, headerStyle: {backgroundColor: 'blue', border: 'dotted 1px lightgrey'} },
        {title: 'Drop', field: 'droppedpass', cellStyle: {backgroundColor: 'lightblue', padding: '2px', textAlign: 'center', border: 'dotted 1px lightgrey'}, headerStyle: {backgroundColor: 'blue', border: 'dotted 1px lightgrey'} },
        {title: 'Yrd', field: 'receivingyards', cellStyle: {backgroundColor: 'lightblue', padding: '2px', textAlign: 'center', border: 'dotted 1px lightgrey'}, headerStyle: {backgroundColor: 'blue', border: 'dotted 1px lightgrey'} },
        {title: 'Ave', field: 'receivingyardsaverage', cellStyle: {backgroundColor: 'lightblue', padding: '2px', textAlign: 'center', border: 'dotted 1px lightgrey'}, headerStyle: {backgroundColor: 'blue', border: 'dotted 1px lightgrey'} },
        {title: 'Long', field: 'longestcatch', cellStyle: {backgroundColor: 'lightblue', padding: '2px', textAlign: 'center', border: 'dotted 1px lightgrey'}, headerStyle: {backgroundColor: 'blue', border: 'dotted 1px lightgrey'} },
        {title: 'TD', field: 'touchdowncatch', cellStyle: {backgroundColor: 'lightblue', padding: '2px', textAlign: 'center', border: 'dotted 1px lightgrey'}, headerStyle: {backgroundColor: 'blue', border: 'dotted 1px lightgrey'} },

        {title: 'Pass', field: 'pass', cellStyle: {padding: '2px', textAlign: 'center', border: 'dotted 1px lightgrey'}, headerStyle: {backgroundColor: 'brown', border: 'dotted 1px lightgrey'} },
        {title: 'Comp', field: 'completionrate', cellStyle: {padding: '2px', textAlign: 'center', border: 'dotted 1px lightgrey'}, headerStyle: {backgroundColor: 'brown', border: 'dotted 1px lightgrey'} },
        {title: 'Yrd', field: 'passingyards', cellStyle: {padding: '2px', textAlign: 'center', border: 'dotted 1px lightgrey'}, headerStyle: {backgroundColor: 'brown', border: 'dotted 1px lightgrey'} },
        {title: 'Ave', field: 'passingyardsaverage', cellStyle: {padding: '2px', textAlign: 'center', border: 'dotted 1px lightgrey'}, headerStyle: {backgroundColor: 'brown', border: 'dotted 1px lightgrey'} },
        {title: 'Long', field: 'longestpass', cellStyle: {padding: '2px', textAlign: 'center', border: 'dotted 1px lightgrey'}, headerStyle: {backgroundColor: 'brown', border: 'dotted 1px lightgrey'} },
        {title: 'TD', field: 'touchdownpass', cellStyle: {padding: '2px', textAlign: 'center', border: 'dotted 1px lightgrey'}, headerStyle: {backgroundColor: 'brown', border: 'dotted 1px lightgrey'} },
        {title: 'Int', field: 'interception', cellStyle: {padding: '2px', textAlign: 'center', border: 'dotted 1px lightgrey'}, headerStyle: {backgroundColor: 'brown', border: 'dotted 1px lightgrey'} },
    ];

    // table columns players defense
    const teamPlayersDefenseTableColumns = [
        {title: 'Name (#)', field: 'playername', cellStyle: {whiteSpace: 'nowrap', padding: '2px', textAlign: 'left', border: 'dotted 1px lightgrey'}, headerStyle: {backgroundColor: 'green', border: 'dotted 1px lightgrey'} },

        {title: 'Tackle', field: 'tackle', cellStyle: {backgroundColor: 'lightyellow', padding: '2px', textAlign: 'left', border: 'dotted 1px lightgrey'}, headerStyle: {backgroundColor: 'orange', border: 'dotted 1px lightgrey'} },
        {title: 'Tackle for Loss', field: 'tackleforloss', cellStyle: {backgroundColor: 'lightyellow', padding: '2px', textAlign: 'left', border: 'dotted 1px lightgrey'}, headerStyle: {backgroundColor: 'orange', border: 'dotted 1px lightgrey'} },
        {title: 'Assist', field: 'tackleassist', cellStyle: {backgroundColor: 'lightyellow', padding: '2px', textAlign: 'left', border: 'dotted 1px lightgrey'}, headerStyle: {backgroundColor: 'orange', border: 'dotted 1px lightgrey'} },
        {title: 'Assist for Loss', field: 'tackleassistforloss', cellStyle: {backgroundColor: 'lightyellow', padding: '2px', textAlign: 'left', border: 'dotted 1px lightgrey'}, headerStyle: {backgroundColor: 'orange', border: 'dotted 1px lightgrey'} },
        {title: 'Sack', field: 'sack', cellStyle: {padding: '2px', textAlign: 'left', border: 'dotted 1px lightgrey'}, headerStyle: {backgroundColor: 'brown', border: 'dotted 1px lightgrey'} },
        {title: 'Int', field: 'intercepted', cellStyle: {padding: '2px', textAlign: 'left', border: 'dotted 1px lightgrey'}, headerStyle: {backgroundColor: 'brown', border: 'dotted 1px lightgrey'} },
        {title: 'Forced Fumble', field: 'forcedfumble', cellStyle: {padding: '2px', textAlign: 'left', border: 'dotted 1px lightgrey'}, headerStyle: {backgroundColor: 'brown', border: 'dotted 1px lightgrey'} },
    ];

    // table columns team
    const teamTableColumns = [
        {title: 'Category', field: 'name', cellStyle: {padding: '2px', whiteSpace: 'nowrap', border: 'dotted 1px lightgrey'}, headerStyle: {backgroundColor: 'green', border: 'dotted 1px lightgrey'} },
        {title: gamedata.team1, field: 'team1', cellStyle: {padding: '2px', whiteSpace: 'nowrap', border: 'dotted 1px lightgrey'}, headerStyle: {backgroundColor: 'red', border: 'dotted 1px lightgrey'} },
        {title: gamedata.team2, field: 'team2', cellStyle: {padding: '2px', whiteSpace: 'nowrap', border: 'dotted 1px lightgrey'}, headerStyle: {backgroundColor: 'orange', border: 'dotted 1px lightgrey'} }
    ];

    // table columns plays
    const playsTableColumns = [
        {title: 'ID', field: 'actionid', cellStyle: {padding: '2px', whiteSpace: 'nowrap', border: 'dotted 1px lightgrey'}, headerStyle: {backgroundColor: 'grey', border: 'dotted 1px lightgrey'} },
        {title: 'Per', field: 'period', cellStyle: {padding: '2px', whiteSpace: 'nowrap', border: 'dotted 1px lightgrey'}, headerStyle: {backgroundColor: 'darkgreen', border: 'dotted 1px lightgrey'} },
        {title: 'Dr', field: 'drive', cellStyle: {padding: '2px', whiteSpace: 'nowrap', border: 'dotted 1px lightgrey'}, headerStyle: {backgroundColor: 'orange', border: 'dotted 1px lightgrey'} },
        {title: 'Dw', field: 'down', cellStyle: {padding: '2px', whiteSpace: 'nowrap', border: 'dotted 1px lightgrey'}, headerStyle: {backgroundColor: 'brown', border: 'dotted 1px lightgrey'} },
        {title: 'Ds', field: 'distance', cellStyle: {padding: '2px', whiteSpace: 'nowrap', border: 'dotted 1px lightgrey'}, headerStyle: {backgroundColor: 'brown', border: 'dotted 1px lightgrey'} },
        {title: 'Action', field: 'action', cellStyle: {padding: '2px', whiteSpace: 'nowrap', border: 'dotted 1px lightgrey'}, headerStyle: {backgroundColor: 'blue', border: 'dotted 1px lightgrey'} },
        {title: 'T', field: 'offense', render: rowData => <img src={rowData.offense === 'team1' ? gamedata.logo1 : rowData.offense === 'team2' ? gamedata.logo2 : 'ball.png'} style={{ width: '20px'}} />, cellStyle: {padding: '2px', whiteSpace: 'nowrap', border: 'dotted 1px lightgrey'}, headerStyle: {backgroundColor: 'red', border: 'dotted 1px lightgrey'} },
        {title: 'Score', field: 'score', cellStyle: {padding: '2px', whiteSpace: 'nowrap', border: 'dotted 1px lightgrey'}, headerStyle: {backgroundColor: 'green', border: 'dotted 1px lightgrey'} },
        {title: 'Play', field: 'playtext', cellStyle: {padding: '2px', whiteSpace: 'nowrap', border: 'dotted 1px lightgrey'}, headerStyle: {backgroundColor: 'lightblue', border: 'dotted 1px lightgrey'} }
    ];

    return(
        <>
            <MaterialTable icons={tableIcons} columns={teamPlayersOffenseTableColumns} options={tableOptions} data={playerTeam1Stats} title={`${gamedata.team1} Offense Players`}/>
            <MaterialTable icons={tableIcons} columns={teamPlayersDefenseTableColumns} options={tableOptions} data={playerTeam1Stats} title={`${gamedata.team1} Defense Players`}/>

            <MaterialTable icons={tableIcons} columns={teamPlayersOffenseTableColumns} options={tableOptions} data={playerTeam2Stats} title={`${gamedata.team2} Offense Players`}/>
            <MaterialTable icons={tableIcons} columns={teamPlayersDefenseTableColumns} options={tableOptions} data={playerTeam2Stats} title={`${gamedata.team2} Defense Players`}/>

            <MaterialTable icons={tableIcons} columns={teamTableColumns} options={tableOptions} data={teamOverviewStats} title={`Team Comparison`}/>

            <MaterialTable icons={tableIcons} columns={playsTableColumns} options={tableOptions} data={gamedata.plays} title={`Plays`}/>
        </>
    );
}

export default GameStats
