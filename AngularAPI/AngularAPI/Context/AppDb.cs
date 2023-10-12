using AngularAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace AngularAPI.Context
{
    public class AppDb : DbContext
    {
        public AppDb(DbContextOptions<AppDb>options):base(options) 
        {
            
                    
        }

        public DbSet<User> Users { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>().ToTable("users");   
        }
    }
}
