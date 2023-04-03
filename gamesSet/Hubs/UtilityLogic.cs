using gamesSet.Models;

namespace gamesSet.Hubs
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
                    throw new Exception("User is not from this game");
                }
            }
        }
    }
}
