const BallPosition = ({ play, gamedata }) => {

    // return component
    return (
        <span className={play.ballposition < 20 && play.defense === play.ballpositionteam ?
            "badge bg-red text-light supersmall" :
            "badge bg-light text-dark supersmall" } >
            {play.ballpositionteam === 'team1' ? gamedata.team1 : gamedata.team2} {play.ballposition} yardline
        </span>
    )
}

export default BallPosition