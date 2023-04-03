using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using gamesSet.Data;
using gamesSet.Models;
using Newtonsoft.Json;
using Microsoft.AspNetCore.SignalR;
using gamesSet.Hubs;
using static System.Collections.Specialized.BitVector32;

namespace gamesSet.Controllers
{
    public class GameSessionsController : Controller
    {
        private readonly gamesSetContext _context;
        private readonly ILogger<GameSessionsController> _logger;
        private readonly IHubContext<GameHub> _hubContext;
        private readonly IServiceProvider _sp;

        public GameSessionsController(gamesSetContext context, ILogger<GameSessionsController> logger, IHubContext<GameHub> hubContext, IServiceProvider sp)
        {
            _context = context;
            _logger = logger;
            _hubContext = hubContext;
            _sp = sp;
        }

        private async Task AddGameSession(GameSession gameSession)
        {
          if (_context.GameSession == null)
          {
              throw new Exception("Entity set 'gamesSetContext.GameSession'  is null.");
          }
            _context.GameSession.Add(gameSession);
            _context.SaveChanges();
        }

        [HttpGet]
        public IActionResult CreateSessionByUser(string userName="", int gameId=0)
        {
            var gameSession = new GameSession();

            gameSession.UserCreator = userName;
            gameSession.Status = SessionStatus.created;
            gameSession.CreationTime = DateTime.UtcNow;

            var gameParams = new Dictionary<string, object>
            {
                { "gameId", gameId }
            };

            switch(gameId)//TODO: not good
            {
                case 0: 
                    TicTacToe.InitGameSpecificParam(gameParams, gameSession);
                    break;
                case 1:
                    Reversi.InitGameSpecificParam(gameParams, gameSession);
                    break;
                default:
                    throw new Exception("Not implemented");
            }

            gameSession.GameParams = JsonConvert.SerializeObject(gameParams);
            gameSession.GameId = gameId;
            gameSession.NextMoveForUser = "";

            AddGameSession(gameSession);

            //TODO: remove from here
            string gameAddress = gameId switch
            {
                0 =>"Tictactoe",
                1 => "Reversi",
                _ =>"error"
            };

            return Redirect($"/{gameAddress}?gameSessionId={gameSession.Id}&playerName={userName}");
        }

        private Dictionary<string, string> prepareDataForCreatedSessionToSend(GameSession session)
        {
            var dataForGame = new Dictionary<string, string>();

            string gameName = "";
            switch (session.GameId)//TODO: refactor
            {
                case 0:
                    gameName = "TicTacToe";
                    break;
                case 1:
                    gameName = "Reversi";
                    break;
                default:
                    throw new Exception("Not implemented");
            }

            dataForGame["gameName"] = gameName;
            dataForGame["creator"] = session.UserCreator;
            dataForGame["gameId"] = session.GameId.ToString();
            dataForGame["secondUser"] = session.SecondUser;

            return dataForGame;
        }

        public Dictionary<int, Dictionary<string, string>> GetDataForSpecifiedGameSessions(SessionStatus status)
        {
            var newSessions = _context.GameSession.Where(x => x.Status == status);

            var dataToSend = new Dictionary<int, Dictionary<string, string>>();
            var tempUtil = new UtilitityDb(_sp);
            var tempUtilLogic = new UtilityLogic();
            foreach (var session in newSessions)
            {
                tempUtil.CheckExpiredWaitingSessionAndCancel(session);
                tempUtil.CheckIsExpiredActiveSessionMoveAndCancel(session, tempUtilLogic);
                    if (session.Status == SessionStatus.cancelled)
                {
                    continue;
                }
                var dataForGame = prepareDataForCreatedSessionToSend(session);
                dataToSend[session.Id] = dataForGame;
            }
            return dataToSend;
        }

        [HttpPost]
        public Dictionary<int, Dictionary<string, string>> GetWaitingGameSessions()
        {
            var dataToSend = GetDataForSpecifiedGameSessions(SessionStatus.created);
            return dataToSend;
        }

        [HttpPost]
        public Dictionary<int, Dictionary<string, string>> GetActiveGameSessions()
        {
            var dataToSend = GetDataForSpecifiedGameSessions(SessionStatus.activeGame);
            return dataToSend;
        }

    }
}
