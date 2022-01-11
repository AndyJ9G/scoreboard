import { useState } from 'react';

const Field = ({ socket }) => {
    const [team1left, setTeam1left] = useState(true);

    // defined yard positions
    const left = 40;
    const right = 450;
    // mid = (right-left) / 2 + left
    const mid = 245;
    const yard = 4.1;

    // flip sides
    function flipSide(){
        setTeam1left(!team1left);
    }

    // calculate yardline
    const getYardline = (side, yardline, compensate = 0) => {
        // check side
        if(side === 'left'){
            let yardposition = (yardline * yard) + left + compensate;
            return (Math.round(yardposition));
        }else{
            let yardposition = 450 - (yardline * yard) + compensate;
            return (Math.round(yardposition));
        }
    }

    return(
        <>
            <div>
                <img className='fieldimage' src='american_football_field.png' alt=''/>
                <img className='fieldlogoleft' src='fursty-razorbacks.png' alt=''/>
                <img className='fieldlogoright' src='cologne-crocodiles.png' alt=''/>
                <canvas className='fieldlos' style={{left: `${getYardline('left',0, 4)}px`}} id='los'/>
                <canvas className='fieldfirstdown' id='firstdown'/>
                <img className='fieldball' style={{left: `${getYardline('right',0)}px`}} src='ball-border.png' alt=''/>
                <img className='fieldarrowright' src='arrow_right.png' alt=''/>
                <img className='fieldarrowleft' src='arrow_left.png' alt=''/>
            </div>
        </>
    );
}

export default Field
