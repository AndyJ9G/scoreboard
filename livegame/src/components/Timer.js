import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-solid-svg-icons';

const Timer = ({socket}) => {
    const [timer, setTimer] = useState('');

    useEffect(() => {
        // on load, get timer
        socket.on('sendTimer', data => {
            setTimer(data);
        });

        // on unload
        return() => socket.disconnect();
    }, [socket]);

    return (
        <>
            <FontAwesomeIcon icon={faClock}></FontAwesomeIcon> <time dateTime={timer}>{timer}</time>
        </>
    );
}

export default Timer;