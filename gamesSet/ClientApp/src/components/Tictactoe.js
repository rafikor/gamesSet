import { useState, useEffect } from 'react';
import { useSearchParams } from "react-router-dom";
//import { signalR } from './signalr.js/jquery.signalR';
//import { signalR } from './microsoft-signalr/signalr';
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

function CurrentStatus({ status, winnerName, userOfNextMove, currentPlayerName }) {
    let statusString;
    if (status === SessionStatus.created) {
        statusString = 'Waiting for any other player to connect...';
    }
    else {
        if (status === SessionStatus.finished) {
            statusString = 'Game is ended. Winner: ' + winnerName;
        }
        else {
            if (status === SessionStatus.cancelled) {
                if (winnerName !== '') {
                    statusString = 'Winner: ' + winnerName + " (opponent thought too long)";
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

function Board({ xIsNext, squares, onPlay, sendMove, disabled }) {
    function handleClick(i) {
       /* if (calculateWinner(squares) || squares[i]) {
            return;
        }*/
        sendMove(i);
        /*const nextSquares = squares.slice();
        if (xIsNext) {
            nextSquares[i] = 'X';
        } else {
            nextSquares[i] = 'O';
        }
        onPlay(nextSquares);*/
        
    }

    //const winner = calculateWinner(squares);

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
    const [sessionId, setSessionId] = useState(searchParams.get("gameSessionId"));
    const [canMove, setCanMove] = useState(false);
    const [userOfNextMove, setUserOfNextMove] = useState("");
    const [status, setStatus] = useState(-1);
    const [winnerName, setWinnerName] = useState("");
    const [connection, setConnection] = useState(null);

    const [boardValues, setBoardValues] = useState([Array(9).fill(null)]);

    useEffect(() => {
        const newConnection = new HubConnectionBuilder()
            .withUrl("/TicTacToeHub?userName=" + userName + "&gameSessionId=" + sessionId).build();

        newConnection.on("ReceiveState", function (stateJson, localWinnerName, newStatus) {
            var stateJsonParsed = JSON.parse(stateJson);
            let userMove = stateJsonParsed['NextMoveForUser'];
            //console.log(userMove);
            //console.log(userName);
            //console.log('winnerName: ' + localWinnerName);
            //console.log('status: ' + newStatus);
            setStatus(newStatus);
            setUserOfNextMove(userMove);
            setCanMove(userMove == userName && newStatus==2);
            setWinnerName(localWinnerName);
            //console.log(stateJsonParsed);
            let newBoard = boardValues.slice();
            //console.log('stateJsonParsed[Xs];' + stateJsonParsed['Xs'].length)
            for (let i = 0; i < stateJsonParsed['Xs'].length; i++) {
                newBoard[stateJsonParsed['Xs'][i]] = 'X';
            }
            for (let i = 0; i < stateJsonParsed['Os'].length; i++) {
                newBoard[stateJsonParsed['Os'][i]] = 'O';
            }
            setBoardValues(newBoard);
            //console.log(newBoard);

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

    //var connection = new HubConnectionBuilder().withUrl("/TicTacToeHub?userName=" + userName + "&sessionId=" + sessionId).build();
    //var connection = new HubConnectionBuilder().withUrl("/TicTacToeHub?userName=" + userName + "&gameSessionId=" + sessionId).build();

    

    const sendMove = async (move) => {

        //if (connection) {
            try {
                await connection.send('ReceiveMove', userName, sessionId, move);
                console.log('Send move ' + move);
            }
            catch (e) {
                console.log(e);
            }
        /*}
        else {
            alert('No connection to server yet.');
        }*/
    }


    //const [history, setHistory] = useState([Array(9).fill(null)]);
    const [currentMove, setCurrentMove] = useState(0);
    const xIsNext = currentMove % 2 === 0;
    //const currentSquares = history[currentMove];

    /*function handlePlay(nextSquares) {
        const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
        setHistory(nextHistory);
        setCurrentMove(nextHistory.length - 1);
    }*/

    function jumpTo(nextMove) {
        setCurrentMove(nextMove);
    }

    /*const moves = history.map((squares, move) => {
        let description;
        if (move > 0) {
            description = 'Go to move #' + move;
        } else {
            description = 'Go to game start';
        }
        return (
            <li key={move}>
                <button onClick={() => jumpTo(move)}>{description}</button>
            </li>
        );
    });*/

    

    return (
        <div className="game">
            <div className="game-board">
                <CurrentStatus status={status} winnerName={winnerName}
                    userOfNextMove={userOfNextMove} currentPlayerName={userName} />
                <Board xIsNext={xIsNext} squares={boardValues}
                    onPlay={() => { }} sendMove={sendMove} disabled={!canMove}/>
            </div>
            
        </div>
    );
}