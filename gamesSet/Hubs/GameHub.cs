using gamesSet.Data;
using gamesSet.Models;
using Microsoft.AspNetCore.SignalR;
using Newtonsoft.Json;

namespace gamesSet.Hubs
{
    public class GameHub : Hub
    {
        private IHubContext<GameHub> _context;
        protected UtilitityDb util;
        protected UtilityLogic utilLogic = new UtilityLogic();

        public GameHub(IHubContext<GameHub> context, IServiceProvider sp)
        {
            _context = context;
            util = new UtilitityDb(sp);
        }

        public override Task OnConnectedAsync()
        {
            var httpContext = Context.GetHttpContext();
            var userName = httpContext.Request.Query["userName"][0];
            var sessionIdString = httpContext.Request.Query["gameSessionId"][0];
            var sessionId = Convert.ToInt32(sessionIdString);

            GameSession session = util.FindSession(sessionId);

            util.CheckExpiredWaitingSession(session);
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
                            session.NextMoveForUser = userName;

                            //var state = JsonConvert.DeserializeObject<TicTacToeState>(session.GameState);
                            //session.GameState = JsonConvert.SerializeObject(state);
                        }
                        else
                        {
                            return new Task(() => { });//TODO: no third connection
                        }
                    }

                    util.UpdateSession(session);
                }
            }
               
            Groups.AddToGroupAsync(Context.ConnectionId, GetUserDefGroupName(userName, sessionIdString));

            SendState(userName, session);
            if (session.Status == SessionStatus.activeGame)
            {
                SendState(utilLogic.GetNamesOfOtherUsers(session, userName)[0], session);
            }

            return base.OnConnectedAsync();
        }

        private string GetUserDefGroupName(string userName, string sessionId)
        {
            return "userName_" + userName + "_sessionId_" + sessionId;
        }

        public async Task SendState(string userName, GameSession session)
        {
            var jsonToSend = JsonConvert.SerializeObject(session);
            await _context.Clients.Group(GetUserDefGroupName(userName, session.Id.ToString())).SendAsync("ReceiveState", jsonToSend);
        }

        public async Task ReceiveMove(string userName, string sessionIdString, int move)
        {
            int sessionId = Convert.ToInt32(sessionIdString);
            var gameSession = util.FindSession(sessionId);
            if (gameSession.Status == SessionStatus.activeGame)
            {

                if ((DateTime.Now - gameSession.LastMoveTime).TotalMinutes > 2)//TODO
                {
                    gameSession.Status = SessionStatus.finished;
                    gameSession.WinnerName = utilLogic.GetNamesOfOtherUsers(gameSession, userName)[0];
                    util.UpdateSession(gameSession);
                    return;
                }
                else
                {
                    switch (gameSession.GameId)//TODO: refactor
                    {
                        case 0:
                            TicTacToe.processMove(gameSession, userName, move);
                            break;
                        case 1:
                            break;
                        default:
                            throw new Exception("Not implemented");
                    }
                    
                    gameSession.LastMoveTime = DateTime.Now;

                }
                util.UpdateSession(gameSession);

                SendState(gameSession.UserCreator, gameSession);
                SendState(gameSession.SecondUser, gameSession);
            }
        }

    }
}
