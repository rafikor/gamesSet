import { StrictMode, Fragment } from 'react';
import { createRoot } from 'react-dom/client';

import { BrowserRouter, useNavigate } from 'react-router-dom';
import '../custom.css';


//const rootElement = document.getElementById('app');
//const root = createRoot(rootElement);

function InputUser() {
    return (
        <input type="text" placeholder="Your name" id="playername" />);
}

function CreateGameSessionControl({ id, gameName }) {

//    let navigate = useNavigate();

    function onClickCreateSession() {
        console.log('t')
        let userName = document.getElementById('playername').value;
        console.log(userName);
        let url = '/GameSessions/CreateSessionByUser?userName=' + userName + '&gameId=' + id;
        //navigate(url);
        window.location.href = url;
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
    return (<ul>
        {sessions.map(({ sessionId, gameName }, id) => (
            <li key={id}>
                <button id={id}>Connect to session #{sessionId} for {gameName}</button>
            </li>
        ))}
    </ul>)
}


export function Home() {
    return (
        <div>
            <InputUser />
            <GamesListToCreateSession games={[{ gameName: "Tick-Tack-Toe" }, { gameName: "Labyrinth" }]} />
            <SessionsToPlayList sessions={[{ gameName: "Tick-Tack-Toe", sessionId: 2 }, { gameName: "Labyrinth", sessionId: 4 }]} />
        </div>
    );
}