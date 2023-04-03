import { useState, useEffect } from 'react';

export const SessionStatus = {
    created: 1,
    activeGame: 2,
    finished: 3,
    cancelled: 4
}


export function getOpponent(playerNames, playerName) {
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
            if (currentPlayerName === winnerName) {
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

export function Timer({ deadlineDate, textWhenTimerIsNotExpired, textWhenTimeIsExpired}) {
    const [days, setDays] = useState(0);
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(0);
    const [seconds, setSeconds] = useState(0);
    const [expired, setExpired] = useState(false);

    const getTime = () => {
        const dateNow = new Date();
        const time = deadlineDate.getTime() - dateNow;
        if (time > 0) {
            setExpired(false);
        }
        else {
            setExpired(true);
        }

        setDays(Math.floor(time / (1000 * 60 * 60 * 24)));
        setHours(Math.floor((time / (1000 * 60 * 60)) % 24));
        setMinutes(Math.floor((time / 1000 / 60) % 60));
        setSeconds(Math.floor((time / 1000) % 60));
    };

    useEffect(() => {
        const interval = setInterval(() => getTime(), 1000);

        return () => clearInterval(interval);
    }, [deadlineDate]);

    return (
        <div>
            {!expired &&
                <div className="timer">
                    {textWhenTimerIsNotExpired}: {minutes}:{seconds}
                </div>
            }
            {expired &&
                <div className="timer" style={{ color: 'red' }}>
                    {textWhenTimeIsExpired}
                </div>
            }
            </div>
    );
};


export function utcStringTimeToLocalTime(stringTime) {
    let date = new Date(new Date(stringTime));
    const milliseconds = Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        date.getHours(),
        date.getMinutes(),
        date.getSeconds(),
    );
    const localTime = new Date(milliseconds);
    return localTime;
}

export const sendMoveFunc = async (connection, userName, sessionId, move) => {
    try {
        await connection.send('ReceiveMove', userName, sessionId, move);
    }
    catch (e) {
        console.log(e);
    }
}
