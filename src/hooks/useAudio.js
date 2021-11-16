import React, { useCallback, useState } from "react";

export function useAudio(filePath) {
    // Update ref.current value if handler changes.
    // This allows our effect below to always get latest handler ...
    // ... without us needing to pass it in effect deps array ...
    // ... and potentially cause effect to re-run every render.
    const [audio, setAudio] = useState(new Audio(filePath));
    const [currentTime, setCurrentTime] = useState(0);
    const [handler, setHandler] = useState(() => { });

    const play = () => {
        const times = [
            2.214631, 
            3.858411, 
            5.533, 
            7.085243, 
            9.057145, 
            10.954333, 
            12.726739, 
        ].forEach((time, i) => {
            setTimeout(() => {
                typeof handler === 'function' && handler()
            }, time * 1000);
        });
        audio.play();
    };
    
    const stop = useCallback(() => {
        audio.pause();
    }, [audio]);

    const track = useCallback(() => {
        console.log(audio.currentTime, 'track')
    }, [audio]);


    const PlayBtn = <button onClick={play}>play</button>
    const PauseBtn = <button onClick={stop}>pause</button>
    const TrackBtn = <button onClick={track}>track</button>

    return { audio, PlayBtn, PauseBtn, TrackBtn, setHandler};
}