using gamesSet.Models;
using gamesSet.Repositories;
using Microsoft.AspNetCore.SignalR;
using Newtonsoft.Json;

namespace gamesSet.Hubs
{
    public class TicTacToeHub : Hub
    {
        GameSessionRepository gameSessionRepository;

        public TicTacToeHub(IConfiguration configuration)
        {
            var connectionString = configuration.GetConnectionString("gamesSetContext");
            gameSessionRepository = new GameSessionRepository(connectionString);
        }

        public override Task OnConnectedAsync()
        {
            var httpContext = Context.GetHttpContext();
            var userName = httpContext.Request.Query["userName"][0];
            var sessionId = httpContext.Request.Query["gameSessionId"][0];

            GameSession session = gameSessionRepository.GetGameSession(sessionId);

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

                        var state = JsonConvert.DeserializeObject<TicTacToeState>(session.GameState);
                        state.NextMoveForUser = userName;
                        session.GameState = JsonConvert.SerializeObject(state);
                    }
                    else
                    {
                        return new Task(() => { });//TODO: no third connection
                    }
                }

                gameSessionRepository.UpdateGameSessionUsernamesStatusState(session);
            }
               
            Groups.AddToGroupAsync(Context.ConnectionId, GetUserDefGroupName(userName, sessionId));

            SendState(userName, sessionId, session.GameState);
            if (session.Status == SessionStatus.activeGame)
            {
                SendState(GetNamesOfOtherUsers(session, userName)[0], sessionId, session.GameState);
            }

            return base.OnConnectedAsync();
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
            await Clients.Group(GetUserDefGroupName(userName, sessionId)).SendAsync("ReceiveCanMove", jsonToSend);
        }

        public async Task SendState(string userName, string sessionId, string state)
        {
         //   var gameSession = gameSessionRepository.GetGameSession(sessionId);
         //   var state = gameSession.GameState;
            //state["O"] = new List<int>() {1,3 };
            //state["S"] = new List<int>() { 2, 5 };
            //state["NextMoveForUser"] = "userName";
            //var jsonToSend = JsonConvert.SerializeObject(state);
            await Clients.Group(GetUserDefGroupName(userName, sessionId)).SendAsync("ReceiveState", state);
        }

        public async Task ReceiveMove(string userName, string sessionId, int move)
        {
            var gameSession = gameSessionRepository.GetGameSession(sessionId);

            var stateJson = gameSession.GameState;
            var state = JsonConvert.DeserializeObject<TicTacToeState>(stateJson);
            if(userName == gameSession.UserCreator)
            {
                state.Os.Add(move);
            }
            else
            {
                state.Xs.Add(move);
            }
            state.NextMoveForUser = GetNamesOfOtherUsers(gameSession, userName)[0];

            gameSession.GameState = JsonConvert.SerializeObject(state);

            gameSessionRepository.UpdateGameSessionStateStatusWinner(gameSession);

            SendState(userName, sessionId, gameSession.GameState);
            /*var jsonToSend = JsonConvert.SerializeObject(canMove);
            await Clients.Group(GetUserDefGroupName(userName, sessionId)).SendAsync("ReceiveCanMove", jsonToSend);*/
        }
    }
}
