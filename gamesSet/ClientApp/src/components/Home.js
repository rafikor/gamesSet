import { StrictMode, Fragment, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

import { BrowserRouter, useNavigate } from 'react-router-dom';
import '../custom.css';


//const rootElement = document.getElementById('app');
//const root = createRoot(rootElement);

function InputUser() {
    return (
        <input type="text" placeholder="Your name" id="playername" />);
}

function alertUserNeedName() {
    alert('You must input your name (nick)');
}

function CreateGameSessionControl({ id, gameName }) {

//    let navigate = useNavigate();

    function onClickCreateSession() {
        console.log('t')
        let userName = document.getElementById('playername').value;
        if (!userName) {
            alertUserNeedName();
        }
        else {
            let url = '/GameSessions/CreateSessionByUser?userName=' + userName + '&gameId=' + id;
            //navigate(url);
            window.location.href = url;
        }
    }
    return (<li key={id}>
        <button id={id} onClick={onClickCreateSession}>
            Create session for {gameName}
        </button>
    </li>);
}


function GamesListToCreateSession({ games }) {

    return (<ul>
        {games.map(({ gameName }, id) => (
            <CreateGameSessionControl id={id} gameName={gameName} />
        ))}
    </ul>)
}


function SessionsToPlayList({ sessions }) {

    let keys = Object.entries(sessions);

    return (<ul>
        {
            keys.map((key) => (
                // Prints "greeting Hello" followed by "name John"
                <li key={key[0]}>
                    <button
                        id={key[0] + '_b'}
                        onClick={() => {
                            let userName = document.getElementById('playername').value;
                            if (!userName) {
                                alertUserNeedName();
                            }
                            else {
                                window.location.href = "/" + key[1]["gameName"] + "?gameSessionId=" + key[0] + "&playerName=" + userName;
                            }
                        }}
                    >Connect to session #{key[0]} for {key[1]["gameName"]} created by {key[1]["creator"]}
                        
                    </button>
                </li>
            ))}
        
    </ul>)
}


export function Home() {

    const [activeSessions, setActiveSessions] = useState(new Map());
    
    useEffect(() => {
        
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        };
        const response = fetch('GameSessions/GetWaitingGameSessions', requestOptions)
             .then(response => response.json())
            .then(data => {
                setActiveSessions(data);
            });
           
    }, []);

    return (
        <div>
            <InputUser />
            <GamesListToCreateSession games={[{ gameName: "Tick-Tack-Toe" }, { gameName: "Reversi" }]} />
            <SessionsToPlayList sessions={activeSessions} />
        </div>
    );
}