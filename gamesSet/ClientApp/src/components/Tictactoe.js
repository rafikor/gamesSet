import { useState, useEffect } from 'react';
import { useSearchParams } from "react-router-dom";
import { HubConnectionBuilder } from '@microsoft/signalr';

import { CurrentStatus , Timer} from './CurrentStatus';

const styleButton = {
    background: "lightblue",
    border: "2px solid darkblue",
    fontSize: "30px",
    fontWeight: "800",
    cursor: "pointer",
    outline: "none",
};

const style = {
    border: "4px solid darkblue",
    borderRadius: "10px",
    width: "250px",
    height: "250px",
    margin: "0 auto",
    display: "grid",
    gridTemplate: "repeat(3, 1fr) / repeat(3, 1fr)",
};



function Square({ value, onSquareClick, disabled }) {
    return (
        <button className="square" style={styleButton} onClick={onSquareClick} disabled={ disabled}>
            {value}
        </button>
    );
}

function Board({ squares, sendMove, disabled }) {
    function handleClick(i) {
        sendMove(i);
    }

    return (
             <div style={ style}>
                <Square value={squares[0]} onSquareClick={() => handleClick(0)} disabled={disabled} />
                <Square value={squares[1]} onSquareClick={() => handleClick(1)} disabled={disabled} />
                <Square value={squares[2]} onSquareClick={() => handleClick(2)} disabled={disabled} />
                <Square value={squares[3]} onSquareClick={() => handleClick(3)} disabled={disabled} />
                <Square value={squares[4]} onSquareClick={() => handleClick(4)} disabled={disabled} />
                <Square value={squares[5]} onSquareClick={() => handleClick(5)} disabled={disabled} />
                <Square value={squares[6]} onSquareClick={() => handleClick(6)} disabled={disabled} />
                <Square value={squares[7]} onSquareClick={() => handleClick(7)} disabled={disabled} />
                <Square value={squares[8]} onSquareClick={() => handleClick(8)} disabled={disabled} />
            </div>
    );
}

export function Tictactoe() {
    const [searchParams, setSearchParams] = useSearchParams(window.location.search);
    const [userName, setUserName] = useState(searchParams.get("playerName"));
    const [playerNames, setPlayerNames] = useState([]);
    const [sessionId, setSessionId] = useState(searchParams.get("gameSessionId"));
    const [canMove, setCanMove] = useState(false);
    const [userOfNextMove, setUserOfNextMove] = useState("");
    const [status, setStatus] = useState(-1);
    const [winnerName, setWinnerName] = useState("");
    const [connection, setConnection] = useState(null);
    const [creationSessionTime, setCreationSessionTime] = useState(null);

    const [playerWithO, setPlayerWithO] = useState("");

    const [boardValues, setBoardValues] = useState([Array(9).fill(null)]);

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
            console.log('Xs ');
            let newStatus = session["Status"];
            let userMove = session['NextMoveForUser'];

            let date = new Date(new Date(session['CreationTime']));
            const milliseconds = Date.UTC(
                date.getFullYear(),
                date.getMonth(),
                date.getDate(),
                date.getHours(),
                date.getMinutes(),
                date.getSeconds(),
            );
            const localTime = new Date(milliseconds);

            setCreationSessionTime(localTime);
            setStatus(newStatus);
            var stateJsonParsed = JSON.parse(session["GameState"]);
            console.log('Xs2 ');
            console.log('Xs3 ');
            setUserOfNextMove(userMove);
            setCanMove(userMove == inputName && newStatus==2);
            setWinnerName(localWinnerName);
            console.log('Xs5 ');
            let gameParams = JSON.parse(session["GameParams"]);

            setPlayerWithO(gameParams["playerWithO"]);

            playerNames.push(session["UserCreator"]);
            playerNames.push(session["SecondUser"]);
            setPlayerNames(playerNames)

            let newBoard = boardValues.slice();
            for (let i = 0; i < stateJsonParsed['Xs'].length; i++) {
                newBoard[stateJsonParsed['Xs'][i]] = 'X';
            }
            for (let i = 0; i < stateJsonParsed['Os'].length; i++) {
                newBoard[stateJsonParsed['Os'][i]] = 'O';
            }
            setBoardValues(newBoard);
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

    const sendMove = async (move) => {
        try {
            await connection.send('ReceiveMove', userName, sessionId, move);
            console.log('Send move ' + move);
        }
        catch (e) {
            console.log(e);
        }
    }

    let whoIsWho = ''
    if (playerNames[0] === userName || playerNames[1] === userName) {
        if (playerWithO === userName) {
            whoIsWho = 'Your are O';
        }
        else {
            whoIsWho = 'Your are X';
        }
    }
    else {
        let opponent = '';
        if (playerWithO == playerNames[0]) {
            opponent = playerNames[1];
        }
        else {
            opponent = playerNames[0];
        }
        whoIsWho = playerWithO + ' moves by O; ' + (!opponent ? 'other player ' : opponent) + ' moves by X';
    }
    //creationSessionTime && console.log(creationSessionTime);
    //let creationSessionTimeObj = creationSessionTime ? new Date(creationSessionTime):null;
    //creationSessionTimeObj && console.log(creationSessionTimeObj.getTime());
    return (
        <div className="game">
            {creationSessionTime &&
                <Timer deadlineDate={new Date(creationSessionTime.getTime() + 2 * 60000)}
                    textWhenTimerIsNotExpired='Time to expiration of session' TextWhenTimeIsExpired='Session is expired' />
            }
            <div className="game-board">
                <CurrentStatus status={status} winnerName={winnerName}
                    userOfNextMove={userOfNextMove} currentPlayerName={userName} playerNames={playerNames} />
                <div>{whoIsWho}</div>
                <Board squares={boardValues}
                    sendMove={sendMove} disabled={!canMove}/>
            </div>
            
        </div>
    );
}