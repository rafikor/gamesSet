using gamesSet.Models;
using gamesSet.Utils;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Newtonsoft.Json;
using System.Numerics;

namespace gamesSet.Games
{
    public static class Reversi
    {
        private static UtilityLogic utilityLogic = new UtilityLogic();
        public static void InitGameSpecificParam(Dictionary<string, object> gameParams, GameSession gameSession)
        {
            gameParams["playerWithWhites"] = gameSession.UserCreator;

            var state = new ReversiState();

            var gameState = JsonConvert.SerializeObject(state);
            gameSession.GameState = gameState;
        }
        public static List<List<int>> tryMove(ReversiState state, int row, int col, ReversiColors player)
        {
            var flippedCells = new List<List<int>>();
            if (state.Board[row, col] != ReversiColors.Free)
            {
                return flippedCells;
            }

            //Check in all 8 directions from the clicked cell for any opponent pieces
            var directions = new List<List<int>>() {
                new List<int>(){-1, -1 },
                new List<int>(){-1, 0 },
                new List<int>(){-1, 1 },
                new List<int>(){ 0, -1 },
                new List<int>(){0, 1 },
                new List<int>(){ 1, -1 },
                new List<int>(){1, 0 },
                new List<int>(){1, 1 }
            };
            foreach (var dir in directions)
            {
                var r = row + dir[0];
                var c = col + dir[1];
                var tempFlippedCells = new List<List<int>>(); ;
                //Check if the adjacent cell is an opponent piece
                while (
                    r >= 0 && r < 8 &&
                c >= 0 && c < 8 &&
                    state.Board[r, c] != ReversiColors.Free &&
                    state.Board[r, c] != player
                )
                {
                    tempFlippedCells.Add(new List<int>() { r, c });
                    r += dir[0];
                    c += dir[1];
                }
                //If are opponent pieces in this direction that can be flipped
                if (
                r >= 0 && r < 8 &&
                    c >= 0 && c < 8 &&
                    state.Board[r, c] == player
                )
                {
                    flippedCells.AddRange(tempFlippedCells);
                }
            }
            return flippedCells;
        }

        public static bool arePossibleMovesAvailable(ReversiState state, ReversiColors player)
        {
            for (int row = 0; row < state.Board.GetLength(0); row++)
            {
                for (int col = 0; col < state.Board.GetLength(1); col++)
                {
                    var newMoves = tryMove(state, row, col, player);
                    if (newMoves.Count != 0)
                    {
                        return true;
                    }
                }
            }
            return false;
        }

        public static int countBoardColorCells(ReversiColors[,] board, ReversiColors color)
        {
            int result = 0;
            for (int i = 0; i < board.GetLength(0); i++)
            {
                for (int j = 0; j < board.GetLength(1); j++)
                {
                    if (board[i, j] == color)
                    {
                        result++;
                    }
                }
            }
            return result;
        }

        public static void processMove(GameSession gameSession, string userName, int move)
        {
            var gameParams = JsonConvert.DeserializeObject<Dictionary<string, object>>(gameSession.GameParams);
            var playerWhites = (string)gameParams["playerWithWhites"];
            var playerBlacks = gameSession.UserCreator == playerWhites ? gameSession.SecondUser : gameSession.UserCreator;
            ReversiColors player = playerBlacks == userName ? ReversiColors.Black : ReversiColors.White;

            var stateJson = gameSession.GameState;
            var state = JsonConvert.DeserializeObject<ReversiState>(stateJson);
            int row = move / state.Board.GetLength(0);
            int col = move % state.Board.GetLength(0);
            if (state.Board[row, col] != ReversiColors.Free)
            {
                return;
            }

            var flippedCells = tryMove(state, row, col, player);

            //move is invalid
            if (flippedCells.Count == 0)
            {
                return;
            }

            //Update the board
            for (int i = 0; i < flippedCells.Count; i++)
            {
                var indexesToFlip = flippedCells[i];
                state.Board[indexesToFlip[0], indexesToFlip[1]] = player;
            }
            state.Board[row, col] = player;

            var oldPlayer = player;
            var oppositePlayer = player == ReversiColors.Black ? ReversiColors.White : ReversiColors.Black;
            var nextPlayer = oppositePlayer;

            var canContinue = true;
            if (!arePossibleMovesAvailable(state, oppositePlayer))
            {
                if (arePossibleMovesAvailable(state, oldPlayer))
                {
                    nextPlayer = oldPlayer;
                    state.AdditionalMessage = "Move goes to " + oldPlayer + " again, because " + oppositePlayer + "can't move";
                }
                else
                {
                    canContinue = false;
                    if (countBoardColorCells(state.Board, ReversiColors.Free) != 0)
                    {
                        state.AdditionalMessage = "No one player can move, end of the game";
                    }
                }
            }
            else
            {
                nextPlayer = oppositePlayer;
                if (state.AdditionalMessage != "")
                {
                    state.AdditionalMessage = "";
                }
            }

            if (nextPlayer == oppositePlayer)
            {
                gameSession.NextMoveForUser = nextPlayer == ReversiColors.White ? playerWhites : playerBlacks;
            }

            //search winner
            var numEmptyCells = countBoardColorCells(state.Board, ReversiColors.Free);
            var numWhiteCells = countBoardColorCells(state.Board, ReversiColors.White);
            var numBlackCells = countBoardColorCells(state.Board, ReversiColors.Black);
            var winner = "";
            if (numEmptyCells == 0 || numWhiteCells == 0 || numBlackCells == 0 || !canContinue)
            {
                //If there are no empty cells or one color has no pieces, the game is over
                if (numWhiteCells == numBlackCells)
                {
                    winner = "Draft";
                }
                else
                {
                    winner = numWhiteCells > numBlackCells ? playerWhites : playerBlacks;
                }

                gameSession.Status = SessionStatus.finished;
                gameSession.WinnerName = winner;
            }
            gameSession.GameState = JsonConvert.SerializeObject(state);
        }
    }
}
