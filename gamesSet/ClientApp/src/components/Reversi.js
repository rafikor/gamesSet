import React, { useState, useEffect } from 'react';

import './Reversi.css';

export function Reversi() {
    const [board, setBoard] = useState(Array(8).fill(Array(8).fill(null)));
    const [player, setPlayer] = useState('black');

    useEffect(() => {
        const newBoard = board.map((rowArray, row) =>
            rowArray.map((cell, col) => {
                if (
                    (row === 3 && col === 3) ||
                    (row === 4 && col === 4)
                ) {
                    return 'white';
                } else if (
                    (row === 3 && col === 4) ||
                    (row === 4 && col === 3)
                ) {
                    return 'black';
                } else {
                    return null;
                }
            })
        );
        setBoard(newBoard);
    }, []);

    function handleClick(row, col) {
        if (board[row][col] !== null) {
            return;
        }

        let newBoard = board.map((rowArray) => [...rowArray]);

        const directions = [
            [0, 1],
            [0, -1],
            [1, 0],
            [-1, 0],
            [1, 1],
            [1, -1],
            [-1, 1],
            [-1, -1],
        ];

        let canFlip = false;

        directions.forEach((direction) => {
            const [dx, dy] = direction;
            let x = row + dx;
            let y = col + dy;
            let flippedCells = [];

            while (x >= 0 && x < 8 && y >= 0 && y < 8) {
                if (board[x][y] === null) {
                    break;
                }

                if (board[x][y] !== player) {
                    flippedCells.push([x, y]);
                } else {
                    if (flippedCells.length > 0) {
                        canFlip = true;
                        flippedCells.forEach(([x, y]) => {
                            newBoard[x][y] = player;
                        });
                    }
                    break;
                }

                x += dx;
                y += dy;
            }
        });

        if (canFlip) {
            newBoard[row][col] = player;
            setBoard(newBoard);
            setPlayer(player === 'black' ? 'white' : 'black');
        }
    }

    return (
        <div className="game-board">
            {board.map((row, rowIndex) => (
                <div key={rowIndex} className="row">
                    {row.map((cell, colIndex) => (
                        <div
                            key={colIndex}
                            className={`cell ${cell}-piece`}
                            onClick={() => handleClick(rowIndex, colIndex)}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}