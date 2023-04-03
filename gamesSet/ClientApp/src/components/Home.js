import { useState, useEffect } from 'react';
import '../custom.css';


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

function SessionsToList({ sessions, title, isCheckUserName, getSessionButtonTitle }) {

    let keys = Object.entries(sessions);

    return (<ul> {title }:
        {keys.length === 0 &&
            <li>There are no sessions</li>
        }
        {
            keys.map((key) => (
                <li key={key[0]}>
                    <button
                        id={key[0] + '_b'}
                        onClick={() => {
                            let userName = document.getElementById('playername').value;
                            if (!userName && isCheckUserName) {
                                alertUserNeedName();
                            }
                            else {
                                window.location.href = "/" + key[1]["gameName"] + "?gameSessionId=" + key[0] + "&playerName=" + userName;
                            }
                        }}
                    >{getSessionButtonTitle(key[0], key[1]["gameName"], key[1]["creator"], key[1]["secondUser"]) }

                    </button>
                </li>
            ))}

    </ul>)
}

function getCreatedSessionButtonTitle(sessionId, gameName, creator,secondUser) {
    return 'Connect to session #' + sessionId + ' for ' + gameName + ' created by ' + creator;
}

function getActiveSessionButtonTitle(sessionId, gameName, creator, secondUser) {
    return 'Connect to session #' + sessionId + ' for ' + gameName + ' played by ' + creator + ' and ' + secondUser;
}

export function Home() {

    const [createdSessions, setCreatedSessions] = useState(new Map());
    const [activeSessions, setActiveSessions] = useState(new Map());
    
    useEffect(() => {
        
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        };
        const response = fetch('GameSessions/GetWaitingGameSessions', requestOptions)
             .then(response => response.json())
            .then(data => {
                setCreatedSessions(data);
            });

        const requestOptionsActive = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        };
        const responseActive = fetch('GameSessions/GetActiveGameSessions', requestOptionsActive)
            .then(responseActive => responseActive.json())
            .then(data => {
                setActiveSessions(data);
            });
           
    }, []);

    return (
        <div>
            <InputUser />
            <GamesListToCreateSession games={[{ gameName: "Tick-Tack-Toe" }, { gameName: "Reversi" }]} />
            <SessionsToList sessions={createdSessions} title='Created sessions (you can connect and play):'
                isCheckUserName={true} getSessionButtonTitle={getCreatedSessionButtonTitle} />
            <SessionsToList sessions={activeSessions} title='Actively played sessions (you can connect and watch):'
                isCheckUserName={false} getSessionButtonTitle={getActiveSessionButtonTitle} />
        </div>
    );
}