using gamesSet.Models;
using Microsoft.Data.SqlClient;

namespace gamesSet.Repositories
{
    public class GameSessionRepository
    {
        string connectionString;

        public GameSessionRepository(string connectionString)
        {
            this.connectionString = connectionString;
        }

        public GameSession GetGameSession(string sessionId)
        {
            var query = $"SELECT * FROM GameSession WHERE Id =@sessionId";
            var gameSession = new GameSession();

            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                try
                {
                    using (SqlCommand command = new SqlCommand(query, connection))
                    {
                        connection.Open();
                        command.Parameters.Add("@sessionId", System.Data.SqlDbType.NVarChar);
                        command.Parameters["@sessionId"].Value = sessionId;
                        using (SqlDataReader reader = command.ExecuteReader())
                        {
                            reader.Read();
                            gameSession.Id = Convert.ToInt32(reader["Id"]);
                            gameSession.UserCreator = (string)reader["UserCreator"];
                            gameSession.SecondUser = (string)reader["SecondUser"];
                            gameSession.GameParams = (string)reader["GameParams"];
                            gameSession.GameState = (string)reader["GameState"];
                            gameSession.WinnerName = (string)reader["WinnerName"];
                            gameSession.Status = (SessionStatus)reader["Status"];
                            gameSession.CreationTime = Convert.ToDateTime(reader["CreationTime"]);
                        }
                    }

                    return gameSession;
                }
                catch (Exception ex)
                {
                    throw;
                }
                finally
                {
                    connection.Close();
                }
            }
        }
        public void UpdateGameSessionStateStatusWinner(GameSession gameSession)
        {
            var query = $"UPDATE GameSession SET GameState=@GameState, Status=@Status, WinnerName=@WinnerName  WHERE Id =@sessionId";

            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                try
                {
                    using (SqlCommand command = new SqlCommand(query, connection))
                    {
                        connection.Open();
                        command.Parameters.Add("@GameState", System.Data.SqlDbType.NVarChar);
                        command.Parameters["@GameState"].Value = gameSession.GameState;
                        command.Parameters.Add("@Status", System.Data.SqlDbType.NVarChar);
                        command.Parameters["@Status"].Value = (int)gameSession.Status;
                        command.Parameters.Add("@WinnerName", System.Data.SqlDbType.NVarChar);
                        command.Parameters["@WinnerName"].Value = gameSession.GameState;
                        command.Parameters.Add("@sessionId", System.Data.SqlDbType.Int);
                        command.Parameters["@sessionId"].Value = gameSession.Id;

                        command.ExecuteNonQuery();
                    }

                    return;
                }
                catch (Exception ex)
                {
                    throw;
                }
                finally
                {
                    connection.Close();
                }
            }
        }

        public void UpdateGameSessionUsernamesStatusState(GameSession gameSession)
        {
            var query = $"UPDATE GameSession SET UserCreator=@UserCreator, SecondUser=@SecondUser, Status=@Status, GameState=@GameState WHERE Id =@sessionId";
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                try
                {
                    using (SqlCommand command = new SqlCommand(query, connection))
                    {
                        connection.Open();
                        command.Parameters.Add("@UserCreator", System.Data.SqlDbType.NVarChar);
                        command.Parameters["@UserCreator"].Value = gameSession.UserCreator;
                        command.Parameters.Add("@SecondUser", System.Data.SqlDbType.NVarChar);
                        command.Parameters["@SecondUser"].Value = gameSession.SecondUser;
                        command.Parameters.Add("@Status", System.Data.SqlDbType.NVarChar);
                        command.Parameters["@Status"].Value = (int)gameSession.Status;
                        command.Parameters.Add("@GameState", System.Data.SqlDbType.NVarChar);
                        command.Parameters["@GameState"].Value = gameSession.GameState;
                        command.Parameters.Add("@sessionId", System.Data.SqlDbType.Int);
                        command.Parameters["@sessionId"].Value = gameSession.Id;


                        command.ExecuteNonQuery();
                    }

                    return;
                }
                catch (Exception ex)
                {
                    throw;
                }
                finally
                {
                    connection.Close();
                }
            }
        }
    }
}
