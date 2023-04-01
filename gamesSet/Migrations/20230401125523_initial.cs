﻿using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace gamesSet.Migrations
{
    /// <inheritdoc />
    public partial class initial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "GameSession",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserCreator = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SecondUser = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    GameParams = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    WinnerName = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GameSession", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "GameSession");
        }
    }
}
