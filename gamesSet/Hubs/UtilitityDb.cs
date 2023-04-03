using gamesSet.Data;
using gamesSet.Models;

namespace gamesSet.Hubs
{
    public class UtilitityDb
    {
        private IServiceProvider _sp;
        public UtilitityDb(IServiceProvider sp)
        {
            _sp= sp;
        }
        public void CheckExpiredWaitingSession(GameSession session)
        {
            if (session.Status == SessionStatus.created && (DateTime.Now - session.CreationTime).TotalMinutes > 5)
            {
                session.Status = SessionStatus.cancelled;
                UpdateSession(session);
            }
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
