using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace gamesSet.Models
{
    public class GameSession
    {
        [Key]
        public int Id { get; set; }
        public string UserCreator { get; set; } = "";
        public string SecondUser { get; set; } = "";
        public string GameParams { get; set; } = "";

        public int GameId { get; set; }= 0;
        public string GameState { get; set; } = "";
        public string WinnerName { get; set; } = "";

        //[Column(TypeName = "DateTime2")]
        public DateTime CreationTime { get; set; }
        public DateTime LastMoveTime { get; set; }
        public SessionStatus Status { get; set; }

        public string NextMoveForUser { get; set; } = "";
    }

    public enum SessionStatus {created=1, activeGame,finished,cancelled};
}
