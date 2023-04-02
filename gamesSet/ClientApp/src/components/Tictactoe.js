import { useState } from 'react';
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


function Square({ value, onSquareClick }) {
    return (
        <button className="square" style={ styleButton} onClick={onSquareClick}>
            {value}
        </button>
    );
}

function Board({ xIsNext, squares, onPlay, sendMove }) {
    function handleClick(i) {
        if (calculateWinner(squares) || squares[i]) {
            return;
        }
        sendMove(i);
        const nextSquares = squares.slice();
        if (xIsNext) {
            nextSquares[i] = 'X';
        } else {
            nextSquares[i] = 'O';
        }
        onPlay(nextSquares);
    }

    const winner = calculateWinner(squares);
    let status;
    if (winner) {
        status = 'Winner: ' + winner;
    } else {
        status = 'Next player: ' + (xIsNext ? 'X' : 'O');
    }

    return (
        <>
        <div className="status">{status}</div>
        <div style={ style}>
                <Square value={squares[0]} onSquareClick={() => handleClick(0)} />
                <Square value={squares[1]} onSquareClick={() => handleClick(1)} />
                <Square value={squares[2]} onSquareClick={() => handleClick(2)} />
                <Square value={squares[3]} onSquareClick={() => handleClick(3)} />
                <Square value={squares[4]} onSquareClick={() => handleClick(4)} />
                <Square value={squares[5]} onSquareClick={() => handleClick(5)} />
                <Square value={squares[6]} onSquareClick={() => handleClick(6)} />
                <Square value={squares[7]} onSquareClick={() => handleClick(7)} />
                <Square value={squares[8]} onSquareClick={() => handleClick(8)} />
            </div>
        </>
    );
}

export function Tictactoe() {
    const [searchParams, setSearchParams] = useSearchParams(window.location.search);
    const [userName, setUserName] = useState(searchParams.get("playerName"));
    const [sessionId, setSessionId] = useState(searchParams.get("gameSessionId"));
    const [canMove, setCanMove] = useState(false);

    //var connection = new HubConnectionBuilder().withUrl("/TicTacToeHub?userName=" + userName + "&sessionId=" + sessionId).build();
    var connection = new HubConnectionBuilder().withUrl("/TicTacToeHub?userName=" + userName + "&gameSessionId=" + sessionId).build();

    connection.start({ withCredentials: false }).then(function () {
        console.log('connected');
    }).catch(function (err) {
        return console.error(err.toString());
    });

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

    connection.on("ReceiveState", function (stateJson) {
        var stateJsonParsed = JSON.parse(stateJson);
        let userMove = stateJsonParsed['nextMoveForUser'];
        setCanMove(userMove === userName);
        console.log(stateJsonParsed);
    });


    const [history, setHistory] = useState([Array(9).fill(null)]);
    const [currentMove, setCurrentMove] = useState(0);
    const xIsNext = currentMove % 2 === 0;
    const currentSquares = history[currentMove];

    function handlePlay(nextSquares) {
        const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
        setHistory(nextHistory);
        setCurrentMove(nextHistory.length - 1);
    }

    function jumpTo(nextMove) {
        setCurrentMove(nextMove);
    }

    const moves = history.map((squares, move) => {
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
    });

    return (
        <div className="game">
            <div className="game-board">
                <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} sendMove={sendMove} />
            </div>
            <div className="game-info">
                <ol>{moves}</ol>
            </div>
        </div>
    );
}

function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return squares[a];
        }
    }
    return null;
}