using gamesSet.Models;
using gamesSet.Utils;
using Microsoft.AspNetCore.SignalR;
using Newtonsoft.Json;

namespace gamesSet.Games
{
    public static class TicTacToe
    {
        private static UtilityLogic utilityLogic = new UtilityLogic();
        public static void processMove(GameSession gameSession, string userName, int move)
        {
            var stateJson = gameSession.GameState;
            var state = JsonConvert.DeserializeObject<TicTacToeState>(stateJson);
            if (userName == gameSession.UserCreator)
            {
                state.Os.Add(move);
            }
            else
            {
                state.Xs.Add(move);
            }
            gameSession.GameState = JsonConvert.SerializeObject(state);

            gameSession.NextMoveForUser = utilityLogic.GetNamesOfOtherUsers(gameSession, userName)[0];

            string winner = checkWinner(state);
            if (winner == "O")
            {
                gameSession.Status = SessionStatus.finished;
                gameSession.WinnerName = gameSession.UserCreator;
            }
            else
            {
                if (winner == "X")
                {
                    gameSession.Status = SessionStatus.finished;
                    gameSession.WinnerName = gameSession.SecondUser;
                }
            }
        }

        private static string checkWinner(TicTacToeState state)
        {
            var lines = new List<List<int>>() {

                new List<int>(){ 0, 1, 2 },

                new List<int>(){ 3, 4, 5 },

                new List<int>(){ 6, 7, 8 },

                new List<int>(){ 0, 3, 6 },

                new List<int>(){ 1, 4, 7 },

                new List<int>(){ 2, 5, 8 },

                new List<int>(){ 0, 4, 8 },

                new List<int>(){ 2, 4, 6 },
            };
            for (int i = 0; i < lines.Count; i++)
            {
                if (state.Os.Contains(lines[i][0]) && state.Os.Contains(lines[i][1]) && state.Os.Contains(lines[i][2]))
                {
                    return "O";
                }
                if (state.Xs.Contains(lines[i][0]) && state.Xs.Contains(lines[i][1]) && state.Xs.Contains(lines[i][2]))
                {
                    return "X";
                }
            }
            return "";
        }
        public static void InitGameSpecificParam(Dictionary<string, object> gameParams, GameSession gameSession)
        {
            gameParams["playerWithO"] = gameSession.UserCreator;

            var state = new TicTacToeState();

            var gameState = JsonConvert.SerializeObject(state);
            gameSession.GameState = gameState;
        }
    }
}
