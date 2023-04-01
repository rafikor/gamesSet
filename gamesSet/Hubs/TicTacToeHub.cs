using Microsoft.AspNetCore.SignalR;
using Newtonsoft.Json;

namespace gamesSet.Hubs
{
    public class TicTacToeHub : Hub
    {
        public TicTacToeHub(IConfiguration configuration)
        {
            var connectionString = configuration.GetConnectionString("gamesSetContext");
        }

        public override Task OnConnectedAsync()
        {
            var httpContext = Context.GetHttpContext();
            var resultToReturn = base.OnConnectedAsync();
            var userName = httpContext.Request.Query["userName"][0];
            var sessionId = httpContext.Request.Query["gameSessionId"][0];
            Groups.AddToGroupAsync(Context.ConnectionId, GetUserDefGroupName(userName, sessionId));
            return resultToReturn;
        }

        private string GetUserDefGroupName(string userName, string sessionId)
        {
            return "userName_" + userName + "_sessionId_" + sessionId;
        }

        public async Task SendCanMove(string userName, string sessionId, bool canMove)
        {
            var jsonToSend = JsonConvert.SerializeObject(canMove);
            await Clients.Group(GetUserDefGroupName(userName, sessionId)).SendAsync("ReceiveCanMove", jsonToSend);
        }

        public async Task SendState(string userName, string sessionId)
        {
            var state = new Dictionary<string, object>();
            state["O"] = new List<int>() {1,3 };
            state["S"] = new List<int>() { 2, 5 };
            state["nextMoveForUser"] = "userName";
            var jsonToSend = JsonConvert.SerializeObject(state);
            await Clients.Group(GetUserDefGroupName(userName, sessionId)).SendAsync("ReceiveState", jsonToSend);
        }

        public async Task ReceiveMove(string userName, string sessionId, int move)
        {
            var t = move;
            SendState(userName, sessionId);
            /*var jsonToSend = JsonConvert.SerializeObject(canMove);
            await Clients.Group(GetUserDefGroupName(userName, sessionId)).SendAsync("ReceiveCanMove", jsonToSend);*/
        }
    }
}
