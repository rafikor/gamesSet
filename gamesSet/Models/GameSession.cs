namespace gamesSet.Models
{
    public class GameSession
    {
        public int Id { get; set; }
        public string UserCreator { get; set; }
        public string SecondUser { get; set; }
        public string GameParams;
        public string WinnerName;
        public SessionStatus status;
        public DateTime creationTime;
    }

    public enum SessionStatus {created, activeGame,finished,cancelled};
}
