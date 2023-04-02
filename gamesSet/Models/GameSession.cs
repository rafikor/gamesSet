using System.ComponentModel.DataAnnotations;

namespace gamesSet.Models
{
    public class GameSession
    {
        [Key]
        public int Id { get; set; }
        public string UserCreator { get; set; } = "";
        public string SecondUser { get; set; } = "";
        public string GameParams { get; set; } = "";
        public string GameState { get; set; } = "";
        public string WinnerName { get; set; } = "";
        public SessionStatus status;
        public DateTime creationTime;
    }

    public enum SessionStatus {created, activeGame,finished,cancelled};
}
