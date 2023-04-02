using Microsoft.Identity.Client;

namespace gamesSet.Models
{
    public class TicTacToeState
    {
        public List<int> Os { get; set; } = new List<int>();
        public List<int> Xs { get; set; } = new List<int>();

        public string NextMoveForUser { get; set; } = "";

    }
}
