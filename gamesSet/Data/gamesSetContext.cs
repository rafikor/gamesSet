using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using gamesSet.Models;

namespace gamesSet.Data
{
    public class gamesSetContext : DbContext
    {
        public gamesSetContext (DbContextOptions<gamesSetContext> options)
            : base(options)
        {
        }

        public DbSet<gamesSet.Models.GameSession> GameSession { get; set; } = default!;
    }
}
