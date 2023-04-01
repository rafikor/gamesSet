using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using gamesSet.Data;
using gamesSet.Hubs;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<gamesSetContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("gamesSetContext") ?? throw new InvalidOperationException("Connection string 'gamesSetContext' not found.")));

// Add services to the container.

builder.Services.AddControllersWithViews();
builder.Services.AddSignalR();
builder.Services.AddSingleton<TicTacToeHub>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();


app.MapControllerRoute(
    name: "default",
    pattern: "{controller=GameSessions}/{action=Index}/{id?}");

app.MapHub<TicTacToeHub>("/TicTacToeHub");

//app.MapFallbackToFile("index.html"); ;

app.Run();
