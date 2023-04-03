﻿using System;
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

        // GET: api/GameSessions
//        [HttpGet]
        public async Task<ActionResult<IEnumerable<GameSession>>> GetGameSession()
        {
          if (_context.GameSession == null)
          {
              return NotFound();
          }
            return await _context.GameSession.ToListAsync();
        }

        // GET: api/GameSessions/5
        //[HttpGet("{id}")]
        public async Task<ActionResult<GameSession>> GetGameSession(int id)
        {
          if (_context.GameSession == null)
          {
              return NotFound();
          }
            var gameSession = await _context.GameSession.FindAsync(id);

            if (gameSession == null)
            {
                return NotFound();
            }

            return gameSession;
        }

        // PUT: api/GameSessions/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        //[HttpPut("{id}")]
        public async Task<IActionResult> PutGameSession(int id, GameSession gameSession)
        {
            if (id != gameSession.Id)
            {
                return BadRequest();
            }

            _context.Entry(gameSession).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!GameSessionExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
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

        // POST: api/GameSessions
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpGet]
        public IActionResult CreateSessionByUser(string userName="", int gameId=0)
        {
            var gameSession = new GameSession();

            gameSession.UserCreator = userName;
            gameSession.Status = SessionStatus.created;
            gameSession.CreationTime = DateTime.Now;

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
                0 =>"tictactoe",
                1 => "reversi",
                _ =>"error"
            };

            return Redirect($"/{gameAddress}?gameSessionId={gameSession.Id}&playerName={userName}");
        }

        [HttpPost]
        public Dictionary<int, Dictionary<string, string>> GetWaitingGameSessions()
        {
            var newSessions = _context.GameSession.Where(x=>x.Status == SessionStatus.created);

            var dataToSend = new Dictionary<int, Dictionary<string,string> > ();
            var tempUtil = new UtilitityDb(_sp);
            foreach (var session in newSessions)
            {
                tempUtil.CheckExpiredWaitingSession(session);
                if (session.Status == SessionStatus.cancelled)
                {
                    continue;
                }
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
                dataToSend[session.Id] = dataForGame;
            }
            return dataToSend;
        }

        // DELETE: api/GameSessions/5
        //[HttpDelete("{id}")]
        public async Task<IActionResult> DeleteGameSession(int id)
        {
            if (_context.GameSession == null)
            {
                return NotFound();
            }
            var gameSession = await _context.GameSession.FindAsync(id);
            if (gameSession == null)
            {
                return NotFound();
            }

            _context.GameSession.Remove(gameSession);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool GameSessionExists(int id)
        {
            return (_context.GameSession?.Any(e => e.Id == id)).GetValueOrDefault();
        }
    }
}
