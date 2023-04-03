import { useState, useEffect } from 'react';
import { useSearchParams } from "react-router-dom";
import { HubConnectionBuilder } from '@microsoft/signalr';

import { CurrentStatus, Timer, SessionStatus, getOpponent, utcStringTimeToLocalTime } from './CurrentStatus';

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

const sendMoveFunc = async (connection, userName, sessionId, move) => {
    try {
        await connection.send('ReceiveMove', userName, sessionId, move);
    }
    catch (e) {
        console.log(e);
    }
}

function getWhoIsWhoTicTacToe(playerNames, userName, status, playerWithO) {
    let ifUserInPlayerList = playerNames[0] === userName || playerNames[1] === userName;
    let whoIsWho = '';
    if (ifUserInPlayerList) {
        if (playerWithO === userName) {
            whoIsWho = 'your are O';
        }
        else {
            whoIsWho = 'your are X';
        }
        if (status !== SessionStatus.finished && status !== SessionStatus.created) {
            let opponentAddition = getOpponent(playerNames, userName);
            whoIsWho = opponentAddition + ' is opponent, ' + whoIsWho;
        }
    }
    else {
        let opponent = getOpponent(playerNames, playerWithO);
        whoIsWho = playerWithO + ' moves by O; ' + (!opponent ? 'other player ' : opponent) + ' moves by X';
    }
    return whoIsWho;
}

export function Tictactoe({ connection, userName, sessionId,
    playerNames, gameState, gameParams, status, canMove }) {
    
    const [playerWithO, setPlayerWithO] = useState("");
    const [boardValues, setBoardValues] = useState([Array(9).fill(null)]);

    useEffect(() => {
        setPlayerWithO(gameParams["playerWithO"]);

        let newBoard = boardValues.slice();
        for (let i = 0; i < gameState['Xs'].length; i++) {
            newBoard[gameState['Xs'][i]] = 'X';
        }
        for (let i = 0; i < gameState['Os'].length; i++) {
            newBoard[gameState['Os'][i]] = 'O';
        }
        setBoardValues(newBoard);
    }, [gameState]);

    const sendMove = async (move) => {
        sendMoveFunc(connection, userName, sessionId, move);
    }

    let whoIsWho = getWhoIsWhoTicTacToe(playerNames, userName, status, playerWithO);

    return (
        <div className="game">
            <div className="game-board">
                <div>{whoIsWho}</div>
                <Board squares={boardValues}
                    sendMove={sendMove} disabled={!canMove}/>
            </div>
        </div>
    );
}