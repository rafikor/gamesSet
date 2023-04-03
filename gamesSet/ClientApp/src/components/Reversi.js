import React, { useState, useEffect } from 'react';

import './Reversi.css';

import { sendMoveFunc, SessionStatus, getOpponent } from './Utils';

function getWhoIsWhoReversi(playerNames, userName, status, playerWithWhite) {
    let whoIsWho = ''
    let ifUserInPlayerList = playerNames[0] === userName || playerNames[1] === userName;
    if (ifUserInPlayerList) {
        if (playerWithWhite === userName) {
            whoIsWho = 'your discs are white';
        }
        else {
            whoIsWho = 'your discs are black';
        }
        if (status !== SessionStatus.finished && status !== SessionStatus.created) {
            let opponentAddition = getOpponent(playerNames, userName);
            whoIsWho = opponentAddition + ' is opponent, ' + whoIsWho;
        }
    }
    else {
        let opponent = getOpponent(playerNames, playerWithWhite);
        whoIsWho = playerWithWhite + ' has white discs; ' + (!opponent ? 'other player ' : opponent) + ' has black discs';
    }
    return whoIsWho;
}

export function Reversi({ connection, userName, sessionId,
    playerNames, gameState, gameParams, status, canMove }) {
    const [board, setBoard] = useState(Array(8).fill(Array(8).fill(null)));
    const [player, setPlayer] = useState('black');
    const [additionalMessage, setAdditionalMessage] = useState('');
    const [playerWithWhite, setPlayerWithWhite] = useState("");

    useEffect(() => {
        setPlayerWithWhite(gameParams["playerWithWhites"]);
        if (gameParams["playerWithWhites"] === userName) {
            setPlayer('white');
        }
        else {
            setPlayer('black');
        }
        const newBoard = board.map((rowArray, row) =>
            rowArray.map((cell, col) => {
                let color = null;
                let colorCode = gameState['Board'][row][col];
                if (colorCode === 1) {
                    color = 'white';
                }
                if (colorCode === 2) {
                    color = 'black';
                }
                return color;
            })
        );
        setBoard(newBoard);
    }, [gameState]);

    const sendMove = async (row, col) => {
        var move = row * 8 + col;
        sendMoveFunc(connection, userName, sessionId, move);
    }

    function tryMove(board, row, col, player) {
        if (board[row][col] !== null) {
            return [];
        }

        let flippedCells = [];
        //Check in all 8 directions from the clicked cell for any opponent pieces
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];
        for (const dir of directions) {
            let r = row + dir[0];
            let c = col + dir[1];
            let tempFlippedCells = [];
            //Check if the adjacent cell is an opponent piece
            while (
                r >= 0 && r < 8 &&
                c >= 0 && c < 8 &&
                board[r][c] !== null &&
                board[r][c] !== player
            ) {
                tempFlippedCells.push([r, c]);
                r += dir[0];
                c += dir[1];
            }
            //If are opponent pieces in this direction that can be flipped
            if (
                r >= 0 && r < 8 &&
                c >= 0 && c < 8 &&
                board[r][c] === player
            ) {
                flippedCells.push(...tempFlippedCells);
            }
        }
        return flippedCells;
    }

    function handleClick(row, col, board) {
        //here some check are presented which are copies of checks at server. 
        //This is done in order to not overload server
        if (!canMove) {
            return;
        }
        if (board[row][col] !== null) {
            return;
        }

        let flippedCells = tryMove(board, row, col, player);

        //move is invalid
        if (flippedCells.length === 0) {
            return;
        }

        sendMove(row, col);
    }

    let disabledAddition = '';
    if (!canMove) {
        disabledAddition = '-gray';
    }

    let whoIsWho = getWhoIsWhoReversi(playerNames, userName, status, playerWithWhite);

    return (
        <div className="game">
            <div>{whoIsWho}</div>
            <div>{additionalMessage}</div>
            <div className="game-board">
                {board.map((row, rowIndex) => (
                    <div key={rowIndex} className="row">
                        {row.map((cell, colIndex) => (
                            <div
                                key={colIndex}
                                className={`cell ${cell + disabledAddition}-piece`}
                                onClick={() => handleClick(rowIndex, colIndex, board)}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}