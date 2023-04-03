import { useState, useEffect } from 'react';
import { useSearchParams } from "react-router-dom";
import { HubConnectionBuilder } from '@microsoft/signalr';

import { CurrentStatus, Timer, SessionStatus, utcStringTimeToLocalTime } from './CurrentStatus';

export function Game({SpecificGame }) {
    const [searchParams, setSearchParams] = useSearchParams(window.location.search);
    const [userName, setUserName] = useState(searchParams.get("playerName"));
    const [playerNames, setPlayerNames] = useState([]);
    const [sessionId, setSessionId] = useState(searchParams.get("gameSessionId"));
    const [canMove, setCanMove] = useState(false);
    const [userOfNextMove, setUserOfNextMove] = useState("");
    const [status, setStatus] = useState(-1);
    const [winnerName, setWinnerName] = useState("");
    const [connection, setConnection] = useState(null);

    const [deadlineTime, setDeadlineTime] = useState(null);
    const [messageBeforeDeadline, setMessageBeforeDeadline] = useState("");
    const [messageAfterDeadline, setMessageAfterDeadline] = useState("");
    const [gameState, setGameState] = useState(null);
    const [gameParams, setGameParams] = useState(null);

    useEffect(() => {
        let inputName = userName;
        if (!inputName) {
            inputName = window.prompt('Please enter your name (nick)\n(Without name, you will be a spectator)');
        }
        setUserName(inputName);
        const newConnection = new HubConnectionBuilder()
            .withUrl("/GameHub?userName=" + inputName + "&gameSessionId=" + sessionId).build();

        newConnection.on("ReceiveState", function (sessionJson) {
            let session = JSON.parse(sessionJson);
            let localWinnerName = session["WinnerName"];
            let newStatus = session["Status"];
            let userMove = session['NextMoveForUser'];

            setStatus(newStatus);

            if (newStatus == SessionStatus.created) {
                let localTime = utcStringTimeToLocalTime(session['CreationTime']);
                let timeoutSeconds = session['ExpirationSessionSeconds'];
                setDeadlineTime(new Date(localTime.getTime() + timeoutSeconds * 1000));
                setMessageBeforeDeadline('Time to expiration of session');
                setMessageAfterDeadline('Session is expired and is not playable');
            }
            else {
                if (newStatus == SessionStatus.activeGame) {
                    let localTime = utcStringTimeToLocalTime(session['LastMoveTime']);
                    let timeoutSeconds = session['ExpirationMoveSeconds'];
                    setDeadlineTime(new Date(localTime.getTime() + timeoutSeconds * 1000));
                    setMessageBeforeDeadline('Time to expiration of move');
                    setMessageAfterDeadline('Time for move is expired, game is over');
                }
                else {
                    setDeadlineTime(null);
                }
            }

            setUserOfNextMove(userMove);
            setCanMove(userMove == inputName && newStatus == SessionStatus.activeGame);
            setWinnerName(localWinnerName);

            let newPlayerNames = [];
            newPlayerNames.push(session["UserCreator"]);
            newPlayerNames.push(session["SecondUser"]);
            setPlayerNames(newPlayerNames)

            var gameState = JSON.parse(session["GameState"]);
            setGameState(gameState);
            let gameParams = JSON.parse(session["GameParams"]);
            setGameParams(gameParams);
        });

        newConnection.start({ withCredentials: false }).then(function () {
            console.log('connected');
        }).catch(function (err) {
            return console.error(err.toString());
        });

        setConnection(newConnection);

        return () => {
            newConnection.stop();
        };
    }, []);

    return (
        <div>
            <CurrentStatus status={status} winnerName={winnerName}
                userOfNextMove={userOfNextMove} currentPlayerName={userName}
                playerNames={playerNames} />
            {deadlineTime &&
                <Timer deadlineDate={deadlineTime}
                textWhenTimerIsNotExpired={messageBeforeDeadline}
                textWhenTimeIsExpired={messageAfterDeadline} />
            }
            {connection && gameState && 
                < SpecificGame connection={connection} userName={userName}
                    sessionId={sessionId} playerNames={playerNames}
                    gameState={gameState} gameParams={gameParams}
                    status={status} canMove={canMove} />
            }
        </div>
        )
}