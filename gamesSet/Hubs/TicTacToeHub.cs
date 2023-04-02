using gamesSet.Data;
using gamesSet.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Newtonsoft.Json;
using System.Linq;
using System.Numerics;

namespace gamesSet.Hubs
{
    public class TicTacToeHub : Hub
    {
        IHubContext<TicTacToeHub> _context;
        private IServiceProvider _sp;

        public TicTacToeHub(IHubContext<TicTacToeHub> context, IServiceProvider sp)
        {
            _context = context;
            _sp = sp;
        }

        public override Task OnConnectedAsync()
        {
            var httpContext = Context.GetHttpContext();
            var userName = httpContext.Request.Query["userName"][0];
            var sessionIdString = httpContext.Request.Query["gameSessionId"][0];
            var sessionId = Convert.ToInt32(sessionIdString);

            GameSession session = FindSession(sessionId);

            CheckExpiredWaitingSession(session);
            if (session.Status == SessionStatus.created)
            {

                //if this is not reconnect
                if (session.UserCreator != userName && session.SecondUser != userName)
                {
                    if (session.UserCreator == "")
                    {
                        session.UserCreator = userName;
                        session.Status = SessionStatus.created;
                    }
                    else
                    {
                        if (session.SecondUser == "")
                        {
                            session.SecondUser = userName;
                            session.Status = SessionStatus.activeGame;
                            session.LastMoveTime = DateTime.Now;

                            var state = JsonConvert.DeserializeObject<TicTacToeState>(session.GameState);
                            state.NextMoveForUser = userName;
                            session.GameState = JsonConvert.SerializeObject(state);
                        }
                        else
                        {
                            return new Task(() => { });//TODO: no third connection
                        }
                    }

                    UpdateSession(session);
                }
            }
               
            Groups.AddToGroupAsync(Context.ConnectionId, GetUserDefGroupName(userName, sessionIdString));

            SendState(userName, sessionIdString, session.GameState,
                    session.WinnerName, (int)session.Status);
            if (session.Status == SessionStatus.activeGame)
            {
                SendState(GetNamesOfOtherUsers(session, userName)[0], sessionIdString, session.GameState, 
                    session.WinnerName, (int)session.Status);
            }

            return base.OnConnectedAsync();
        }

        public void CheckExpiredWaitingSession(GameSession session)
        {
            if(session.Status == SessionStatus.created && (DateTime.Now - session.CreationTime).TotalMinutes > 5)
            {
                session.Status = SessionStatus.cancelled;
                UpdateSession(session);
            }
        }

        private void UpdateSession(GameSession session)
        {
            using (var scope = _sp.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<gamesSetContext>();
                dbContext.GameSession.Update(session);
                dbContext.SaveChanges();
            }
        }

        private GameSession FindSession(int sessionId)
        {
            GameSession session;
            using (var scope = _sp.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<gamesSetContext>();
                session = dbContext.GameSession.Find(sessionId);
            }
            return session;
        }

        private List<string> GetNamesOfOtherUsers(GameSession session, string currentUserName)
        {
            var result = new List<string>();
            if (session.UserCreator == currentUserName)
            {
                result.Add(session.SecondUser);
                return result;
            }
            else
            {
                if (session.SecondUser == currentUserName)
                {
                    result.Add(session.UserCreator);
                    return result;
                }
                else
                {
                    throw new Exception("User is not from this game");
                }
            }    
        }

        private string GetUserDefGroupName(string userName, string sessionId)
        {
            return "userName_" + userName + "_sessionId_" + sessionId;
        }

        public async Task SendCanMove(string userName, string sessionId, bool canMove)
        {
            var jsonToSend = JsonConvert.SerializeObject(canMove);
            await _context.Clients.Group(GetUserDefGroupName(userName, sessionId)).SendAsync("ReceiveCanMove", jsonToSend);
        }

        public async Task SendState(string userName, string sessionId, string state, string winnerName, int status)
        {
            //   var gameSession = gameSessionRepository.GetGameSession(sessionId);
            //   var state = gameSession.GameState;
            //state["O"] = new List<int>() {1,3 };
            //state["S"] = new List<int>() { 2, 5 };
            //state["NextMoveForUser"] = "userName";
            //var jsonToSend = JsonConvert.SerializeObject(state);
            GameSession f = new GameSession();
            await _context.Clients.Group(GetUserDefGroupName(userName, sessionId)).SendAsync("ReceiveState", state, winnerName, status);
        }

        public async Task ReceiveMove(string userName, string sessionIdString, int move)
        {
            int sessionId = Convert.ToInt32(sessionIdString);
            var gameSession = FindSession(sessionId);
            if (gameSession.Status == SessionStatus.activeGame)
            {

                if ((DateTime.Now - gameSession.LastMoveTime).TotalMinutes > 2)//TODO
                {
                    gameSession.Status = SessionStatus.finished;
                    gameSession.WinnerName = GetNamesOfOtherUsers(gameSession, userName)[0];
                    UpdateSession(gameSession);
                    return;
                }
                else
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
                    state.NextMoveForUser = GetNamesOfOtherUsers(gameSession, userName)[0];

                    gameSession.GameState = JsonConvert.SerializeObject(state);

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
                    gameSession.LastMoveTime = DateTime.Now;

                }
                UpdateSession(gameSession);

                SendState(gameSession.UserCreator, sessionIdString, gameSession.GameState,
                        gameSession.WinnerName, (int)gameSession.Status);
                SendState(gameSession.SecondUser, sessionIdString, gameSession.GameState,
                        gameSession.WinnerName, (int)gameSession.Status);
            }
        }

        private string checkWinner(TicTacToeState state)
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
    }
}
