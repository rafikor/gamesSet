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

namespace gamesSet.Controllers
{
    public class GameSessionsController : Controller
    {
        private readonly gamesSetContext _context;
        private readonly ILogger<GameSessionsController> _logger;

        public GameSessionsController(gamesSetContext context, ILogger<GameSessionsController> logger)
        {
            _context = context;
            _logger = logger;
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
            await _context.SaveChangesAsync();
        }

        // POST: api/GameSessions
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpGet]
        public IActionResult CreateSessionByUser(string userName="", int gameId=0)
        {
            var gameSession = new GameSession();

            gameSession.UserCreator = userName;
            gameSession.status = SessionStatus.created;
            gameSession.creationTime = DateTime.Now;

            var gameParams = new Dictionary<string, object>
            {
                { "gameId", gameId }
            };

            gameSession.GameParams = JsonConvert.SerializeObject(gameParams);
            AddGameSession(gameSession);

            //TODO: remove from here
            string gameAddress = gameId switch
            {
                0 =>"tictactoe",
                1 => "labyrinth",
                _ =>"error"
            };

            return Redirect($"/{gameAddress}?sessionid={gameSession.Id}&playerName={userName}");
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
