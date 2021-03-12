using System.Threading.Tasks;

using MGME.Core.Entities;

namespace MGME.Core.Interfaces.Repositories
{
    public interface IAuthRepository
    {
        Task RegisterUserAsync(User user);

        Task <bool> CheckIfUserExistsAsync(string input, string property);

        Task <User> RetrieveUserByNameAsync(string name);
    }
}