import { StrictMode, Fragment } from 'react';
import { createRoot } from 'react-dom/client';

import { BrowserRouter } from 'react-router-dom';
import './custom.css';


const rootElement = document.getElementById('app');
const root = createRoot(rootElement);

const PlayerName = () => {
    return <input type="text" id="playername" placeholder="Input your name..."></input>
}

const GamesListToCreateSession = ({ games }) => {
    return (<ul>
        {games.map(({gameName},id) => (
            <li key={id }>
                <button id={id}>Create session for {gameName}</button>
        </li>
        ))}
    </ul>)
}

const SessionsToPlayList = ({ sessions }) => {
    return (<ul>
        {sessions.map(({ sessionId, gameName }, id) => (
            <li key={id}>
                <button id={id}>Connect to session #{sessionId} for {gameName}</button>
            </li>
        ))}
    </ul>)
}

root.render(
    <Fragment>
        <PlayerName />
        <GamesListToCreateSession games={[{ gameName: "Tick-Tack-Toe" }, { gameName: "Labyrinth" }]} />
        <SessionsToPlayList sessions={[{ gameName: "Tick-Tack-Toe" , sessionId:2}, { gameName: "Labyrinth", sessionId:4 }]} />
    </Fragment>
);
