using System.Threading.Tasks;

using Microsoft.EntityFrameworkCore;

using MGME.Core.Entities;
using MGME.Core.Interfaces.Repositories;

namespace MGME.Infra.Data.Repositories
{
    public class AuthRepository : IAuthRepository
    {
        private readonly ApplicationDbContext _database;

        public AuthRepository(ApplicationDbContext database)
        {
            _database = database;
        }

        public async Task <bool> CheckIfUserExistsAsync(string input, string property)
        {
            return await _database.Users.AnyAsync(
                user => (property == nameof(User.Name) ? user.Name : user.Email).ToLower() == input.ToLower()
            );
        }
    }
}