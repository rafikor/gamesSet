import { useState, useEffect } from 'react';
import { useSearchParams } from "react-router-dom";
import { HubConnectionBuilder }  from '@microsoft/signalr';

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

const SessionStatus = {
    created: 1,
    activeGame: 2,
    finished: 3,
    cancelled: 4
}

function CurrentStatus({ status, winnerName, userOfNextMove, currentPlayerName, playerNames }) {
    let statusString;
    let opponentName = ''
    if (winnerName !== '') {
        if (playerNames[0] === winnerName) {
            opponentName = playerNames[1];
        }
        else { 
            opponentName = playerNames[0];
        }
    }
    if (status === SessionStatus.created) {
        statusString = 'Waiting for any other player to connect...';
    }
    else {
        if (status === SessionStatus.finished) {
            statusString = 'Game is ended. Winner: ' + winnerName + '. Opponent was' + opponentName;
        }
        else {
            if (status === SessionStatus.cancelled) {
                if (winnerName !== '') {
                    statusString = 'Winner: ' + winnerName + ' (opponent ' + opponentName+ ' thought too long)';
                }
                else {
                    statusString = 'Session is expired'
                }
            }
            else {
                if (currentPlayerName === userOfNextMove) {
                    statusString = 'Now is your turn';
                }
                else {
                    statusString = 'Next player: ' + userOfNextMove;
                }
            }
        }
    }


    return <div>
            <div>Current player is {currentPlayerName}</div>
            <div className="status">{statusString}</div>
        </div>
}


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

    const [playerWithO, setPlayerWithO] = useState("");

    const [boardValues, setBoardValues] = useState([Array(9).fill(null)]);

    useEffect(() => {
        const newConnection = new HubConnectionBuilder()
            .withUrl("/TicTacToeHub?userName=" + userName + "&gameSessionId=" + sessionId).build();

        newConnection.on("ReceiveState", function (sessionJson) {
            let session = JSON.parse(sessionJson);
            let localWinnerName = session["WinnerName"];
            console.log('Xs ');
            let newStatus = session["Status"];
            let userMove = session['NextMoveForUser'];
            setStatus(newStatus);
            var stateJsonParsed = JSON.parse(session["GameState"]);
            console.log('Xs2 ');
            console.log('Xs3 ');
            setUserOfNextMove(userMove);
            setCanMove(userMove == userName && newStatus==2);
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
        whoIsWho = playerWithO + ' moves by O; ' + opponent + ' moves by X';
    }

    return (
        <div className="game">
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