using Microsoft.Identity.Client;

namespace gamesSet.Models
{
    public class ReversiState
    {
        public ReversiColors[,] Board { get; set; } = new ReversiColors[8,8];
        public string AdditionalMessage = "";
        public ReversiState()
        {
            for (int i = 0; i < Board.GetLength(0); i++)
            {
                for (int j = 0; j < Board.GetLength(1); j++)
                {
                    Board[i, j]= ReversiColors.Free;
                }
            }
            Board[3,3] = ReversiColors.White;
            Board[4,4] = ReversiColors.White;
            Board[3, 4] = ReversiColors.Black;
            Board[4, 3] = ReversiColors.Black;
        }
    }

    public enum ReversiColors { Free, White, Black};
}
