import { useEffect, useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const SpeechCommands = () => {
    const [message, setMessage]= useState('');
    const commands = [
        {
            command: 'reset',
            callback: () => resetTranscript()
        },
        {
            command: 'shut up',
            callback: () => setMessage('Sorry I\'m quiet now')
        },
        {
            command: 'Hello',
            callback: () => setMessage('Hi there')
        }
    ]
    const {
        transcript,
        interimTranscript,
        finalTranscript,
        resetTranscript,
        listening,
    } = useSpeechRecognition({commands});

    useEffect(() => {
        if(finalTranscript !== ''){
            console.log('Got final result:',finalTranscript);
        }
    }, [interimTranscript, finalTranscript]);

    if(!SpeechRecognition.browserSupportsSpeechRecognition()){
        console.log('Your browser does not support speech recognition');
    }

    const listenContinuosly = () => {
        SpeechRecognition.startListening({
            continuous: true,
            language: 'en-GB',
        });
    }

    // return component
    return (
        <div>
            <div>
                <span>Listening: {' '}{listening ? 'on' : 'off'}</span>
            </div>

            <div>
                <button type='button' onClick={resetTranscript}>Reset</button>
                <button type='button' onClick={listenContinuosly}>Listen</button>
                <button type='button' onClick={SpeechRecognition.stopListening}>Stop</button>
            </div>

            <div>
                {message}
            </div>
            <div>
                <span>{transcript}</span>
            </div>

        </div>
    )
}

export default SpeechCommands
