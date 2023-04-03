import React, { useState, useEffect } from 'react';
import { useSearchParams } from "react-router-dom";
import { HubConnectionBuilder } from '@microsoft/signalr';

import './Reversi.css';

import { CurrentStatus } from './Utils';

export function Reversi() {
    const [board, setBoard] = useState(Array(8).fill(Array(8).fill(null)));
    const [player, setPlayer] = useState('black');
    const [winner, setWinner] = useState('');
    const [additionalMessage, setAdditionalMessage] = useState('');

    const [searchParams, setSearchParams] = useSearchParams(window.location.search);
    const [userName, setUserName] = useState(searchParams.get("playerName"));
    const [playerNames, setPlayerNames] = useState([]);
    const [sessionId, setSessionId] = useState(searchParams.get("gameSessionId"));
    const [canMove, setCanMove] = useState(false);
    const [userOfNextMove, setUserOfNextMove] = useState("");
    const [status, setStatus] = useState(-1);
    const [winnerName, setWinnerName] = useState("");
    const [connection, setConnection] = useState(null);

    const [playerWithWhite, setPlayerWithWhite] = useState("");

    //const [boardValues, setBoardValues] = useState([Array(9).fill(null)]);


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
            var stateJsonParsed = JSON.parse(session["GameState"]);
            setAdditionalMessage(stateJsonParsed['AdditionalMessage'])

            setUserOfNextMove(userMove);
            setCanMove(userMove == inputName && newStatus == 2);
            setWinnerName(localWinnerName);
            console.log(localWinnerName);
            let gameParams = JSON.parse(session["GameParams"]);

            setPlayerWithWhite(gameParams["playerWithWhites"]);
            if (gameParams["playerWithWhites"] === inputName) {
                setPlayer('white');
            }
            else {
                setPlayer('black');
            }

            playerNames.push(session["UserCreator"]);
            playerNames.push(session["SecondUser"]);
            setPlayerNames(playerNames)

            const newBoard = board.map((rowArray, row) =>
                rowArray.map((cell, col) => {
                    let color = null;
                    let colorCode = stateJsonParsed['Board'][row][col];
                    if (colorCode === 1) {
                        color = 'white';
                        // console.log(color);
                    }
                    if (colorCode === 2) {
                        color = 'black';
                        // console.log(color);
                    }
                    return color;
                })
            );
            setBoard(newBoard);
            console.log(newBoard);
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

    const sendMove = async (row, col) => {
        try {
            var move = row * 8 + col;
            await connection.send('ReceiveMove', userName, sessionId, move);
            console.log('Send move ' + move);
        }
        catch (e) {
            console.log(e);
        }
    }

    let whoIsWho = ''
    if (playerNames[0] === userName || playerNames[1] === userName) {
        if (playerWithWhite === userName) {
            whoIsWho = 'Your discs are white';
        }
        else {
            whoIsWho = 'Your discs are black';
        }
    }
    else {
        let opponent = '';
        if (playerWithWhite == playerNames[0]) {
            opponent = playerNames[1];
        }
        else {
            opponent = playerNames[0];
        }
        whoIsWho = playerWithWhite + ' has white discs; ' + (!opponent ? 'other player ':opponent) + ' has black discs';
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

    board.map((row, rowIndex) => {
        row.map((cell, colIndex) => {
           console.log(rowIndex, colIndex, cell);
        });
    });

    let disabledAddition = '';
    if (!canMove) {
        disabledAddition = '-gray';
    }

    return (
        <div>
            <CurrentStatus status={status} winnerName={winnerName}
                userOfNextMove={userOfNextMove} currentPlayerName={userName} playerNames={playerNames} />
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