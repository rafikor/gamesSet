import React, { useState, useEffect } from 'react';

import './Reversi.css';

export function Reversi() {
    const [board, setBoard] = useState(Array(8).fill(Array(8).fill(null)));
    const [player, setPlayer] = useState('black');
    const [winner, setWinner] = useState('');

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

    function handleClick(row, col,board, setBoard, setWinner) {
        if (board[row][col] !== null) {
            return;
        }

        let flippedCells = [];
        // Check in all 8 directions from the clicked cell for any opponent pieces
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];
        for (const dir of directions) {
            let r = row + dir[0];
            let c = col + dir[1];
            let tempFlippedCells = [];
            // Check if the adjacent cell is an opponent piece
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

        //move is invalid
        if (flippedCells.length === 0) {
            return;
        }

        //Update the board
        const newBoard = board.map((rowArray, r) =>
            rowArray.map((cell, c) =>
                (r === row && c === col) || flippedCells.some(cell => cell[0] === r && cell[1] === c)
                    ? player
                    : cell
            )
        );
        setBoard(newBoard);
        setPlayer(player === 'black' ? 'white' : 'black');

        //search winner
        const flattenedBoard = newBoard.flat();
        const numEmptyCells = flattenedBoard.filter(cell => cell === null).length;
        const numWhiteCells = flattenedBoard.filter(cell => cell === 'white').length;
        const numBlackCells = flattenedBoard.filter(cell => cell === 'black').length;
        let winner = null;
        if (numEmptyCells === 0 || numWhiteCells === 0 || numBlackCells === 0) {
            //If there are no empty cells or one color has no pieces, the game is over
            if (numWhiteCells === numBlackCells) {
                winner = 'tie';
            } else {
                winner = numWhiteCells > numBlackCells ? 'white' : 'black';
            }
        }
        setWinner(winner);
    }

    return (
        <div>
            <div className="game-board">
                {board.map((row, rowIndex) => (
                    <div key={rowIndex} className="row">
                        {row.map((cell, colIndex) => (
                            <div
                                key={colIndex}
                                className={`cell ${cell}-piece`}
                                onClick={() => handleClick(rowIndex, colIndex, board, setBoard, setWinner)}
                            />
                        ))}
                    </div>
                ))}
            </div>
            <div className="status">
                {winner ? (
                    winner === 'tie' ? (
                        <p>It's a tie!</p>
                    ) : (
                        <p>{winner === 'black' ? 'Black' : 'White'} wins!</p>
                    )
                ) : (
                        <p>{player === 'black' ? 'Black' : 'White'}'s turn</p>
                )}
            </div>
        </div>
    );
}