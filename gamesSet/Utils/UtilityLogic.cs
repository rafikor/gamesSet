using gamesSet.Models;

namespace gamesSet.Utils
{
    public class UtilityLogic
    {
        public List<string> GetNamesOfOtherUsers(GameSession session, string currentUserName)
        {
            var result = new List<string>();
            if (session.UserCreator == currentUserName)
            {
                result.Add(session.SecondUser);
                return result;
            }
            else
            {
                if (session.SecondUser == currentUserName)
                {
                    result.Add(session.UserCreator);
                    return result;
                }
                else
                {
                    return result;//User is not from this game. This is spectator
                }
            }
        }
    }
}
