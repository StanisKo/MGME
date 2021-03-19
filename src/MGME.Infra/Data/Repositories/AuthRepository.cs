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

        public async Task RegisterUserAsync(User user)
        {
            _database.Users.Add(user);

            await _database.SaveChangesAsync();
        }

        public async Task <bool> CheckIfUserExistsAsync(string input, string property)
        {
            return await _database.Users.AnyAsync(
                user => (property == nameof(User.Name) ? user.Name : user.Email).ToLower() == input.ToLower()
            );
        }

        public async Task <User> RetrieveUserByNameAsync(string name)
        {
            return await _database.Users.FirstOrDefaultAsync(
                user => user.Name.ToLower() == name.ToLower()
            );
        }
    }
}