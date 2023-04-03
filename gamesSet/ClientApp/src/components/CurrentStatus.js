import { useState, useEffect } from 'react';
import { useSearchParams } from "react-router-dom";
import { HubConnectionBuilder }  from '@microsoft/signalr';

export const SessionStatus = {
    created: 1,
    activeGame: 2,
    finished: 3,
    cancelled: 4
}

export function CurrentStatus({ status, winnerName, userOfNextMove, currentPlayerName, playerNames }) {
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
                    statusString = 'Winner: ' + winnerName + ' (opponent ' + opponentName + ' thought too long)';
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