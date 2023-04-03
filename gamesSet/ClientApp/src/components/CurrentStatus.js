import { useState, useEffect } from 'react';
import { useSearchParams } from "react-router-dom";
import { HubConnectionBuilder }  from '@microsoft/signalr';

export const SessionStatus = {
    created: 1,
    activeGame: 2,
    finished: 3,
    cancelled: 4
}


function getOpponent(playerNames, playerName) {
    let opponentName;
    if (playerNames[0] === playerName) {
        opponentName = playerNames[1];
    }
    else {
        opponentName = playerNames[0];
    }
    return opponentName;
}

export function CurrentStatus({ status, winnerName, userOfNextMove, currentPlayerName, playerNames }) {
    let statusString;
    let isPlayerSpectator = !playerNames.some(e => e === currentPlayerName);
    let opponentName = ''
    if (winnerName !== '') {
        if (!isPlayerSpectator) {
            opponentName = getOpponent(playerNames, currentPlayerName);
        }
        else {
            opponentName = getOpponent(playerNames, winnerName);
        }

    }
    
    if (status === SessionStatus.created) {
        statusString = 'Waiting for any other player to connect...';
    }
    else {
        if (status === SessionStatus.finished) {
            statusString = 'Game is ended. '
            if (currentPlayerName == winnerName) {
                statusString = statusString + 'You win, congrats! ';
            }
            else {
                if (playerNames.some(e => e === currentPlayerName)) {
                    statusString = statusString + 'You lose. '
                }
                else {
                    statusString = statusString + 'Winner: ' + winnerName+'. ';
                }
                
            }
            statusString = statusString + 'Opponent was ' + opponentName;
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
        {isPlayerSpectator &&
            <div>
                You are in spectating mode
            </div>
        }
        {currentPlayerName &&
            <div>Current player is {currentPlayerName}</div>
        }
        <div className="status">{statusString}</div>
    </div>
}