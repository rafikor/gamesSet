using Microsoft.Identity.Client;

namespace gamesSet.Models
{
    public class ReversiState
    {
        public List<int> Whites { get; set; } = new List<int>();
        public List<int> Blacks { get; set; } = new List<int>();

    }
}
