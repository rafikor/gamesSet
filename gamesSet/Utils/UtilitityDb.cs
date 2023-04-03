using gamesSet.Data;
using gamesSet.Models;

namespace gamesSet.Utils
{
    public class UtilitityDb
    {
        private IServiceProvider _sp;
        public UtilitityDb(IServiceProvider sp)
        {
            _sp = sp;
        }
        public void CheckExpiredWaitingSessionAndCancel(GameSession session)
        {
            if (session.Status == SessionStatus.created && (DateTime.UtcNow - session.CreationTime).TotalMinutes > session.ExpirationSessionSeconds / 60)
            {
                session.Status = SessionStatus.cancelled;
                UpdateSession(session);
            }
        }

        public bool CheckIsExpiredActiveSessionMoveAndCancel(GameSession gameSession, UtilityLogic utilLogic)
        {
            if (gameSession.Status == SessionStatus.activeGame)
            {
                if ((DateTime.UtcNow - gameSession.LastMoveTime).TotalMinutes > gameSession.ExpirationMoveSeconds / 60)
                {
                    gameSession.Status = SessionStatus.cancelled;
                    gameSession.WinnerName = utilLogic.GetNamesOfOtherUsers(gameSession, gameSession.NextMoveForUser)[0];
                    UpdateSession(gameSession);
                    return true;
                }
            }
            return false;
        }

        public void UpdateSession(GameSession session)
        {
            using (var scope = _sp.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<gamesSetContext>();
                dbContext.GameSession.Update(session);
                dbContext.SaveChanges();
            }
        }

        public GameSession FindSession(int sessionId)
        {
            GameSession session;
            using (var scope = _sp.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<gamesSetContext>();
                session = dbContext.GameSession.Find(sessionId);
            }
            return session;
        }
    }
}
