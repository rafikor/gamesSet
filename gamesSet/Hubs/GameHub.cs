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

            bool isSpectator = false;

            util.CheckExpiredWaitingSession(session);
            //userName=="null" - no name, it is spectator
            if (userName != "null" && session.Status == SessionStatus.created)
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
                            session.LastMoveTime = DateTime.UtcNow;
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
            else
            {
                if (session.UserCreator != userName && session.SecondUser != userName)
                {
                    isSpectator= true;
                }
            }

            if (isSpectator)
            {
                Groups.AddToGroupAsync(Context.ConnectionId, GetSessionGroupNameForSpectator(sessionIdString));
                SendStateToSpectators(session);
            }
            else
            {
                Groups.AddToGroupAsync(Context.ConnectionId, GetUserDefGroupName(userName, sessionIdString));
                SendStateToActiveUser(userName, session);
                if (session.Status == SessionStatus.activeGame)
                {
                    SendStateToActiveUser(utilLogic.GetNamesOfOtherUsers(session, userName)[0], session);
                }
                SendStateToSpectators(session);
            }


            return base.OnConnectedAsync();
        }

        private string GetUserDefGroupName(string userName, string sessionId)
        {
            return "userName_" + userName + "_sessionId_" + sessionId;
        }

        private string GetSessionGroupNameForSpectator(string sessionId)
        {
            return "sessionId_" + sessionId;
        }

        public async Task SendStateToActiveUser(string userName, GameSession session)
        {
            string groupName = GetUserDefGroupName(userName, session.Id.ToString());
            await SendStateToGivenGroup(session, groupName);
        }
        public async Task SendStateToSpectators(GameSession session)
        {
            string groupName = GetSessionGroupNameForSpectator(session.Id.ToString());
            await SendStateToGivenGroup(session, groupName);
        }
        private async Task SendStateToGivenGroup(GameSession session, string groupName)
        {
            var jsonToSend = JsonConvert.SerializeObject(session);
            await _context.Clients.Group(groupName).SendAsync("ReceiveState", jsonToSend);
        }

        public async Task ReceiveMove(string userName, string sessionIdString, int move)
        {
            int sessionId = Convert.ToInt32(sessionIdString);
            var gameSession = util.FindSession(sessionId);
            if (gameSession.Status == SessionStatus.activeGame)
            {

                if ((DateTime.UtcNow - gameSession.LastMoveTime).TotalMinutes > 2)//TODO
                {
                    gameSession.Status = SessionStatus.cancelled;
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
                            Reversi.processMove(gameSession, userName, move);
                            break;
                        default:
                            throw new Exception("Not implemented");
                    }
                    
                    gameSession.LastMoveTime = DateTime.UtcNow;

                }
                util.UpdateSession(gameSession);

                SendStateToActiveUser(gameSession.UserCreator, gameSession);
                SendStateToActiveUser(gameSession.SecondUser, gameSession);
                SendStateToSpectators(gameSession);
            }
        }

    }
}
