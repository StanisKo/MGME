using System.Threading.Tasks;

using MGME.Core.Entities;

namespace MGME.Core.Interfaces.Repositories
{
    public interface IAuthRepository
    {
        Task RegisterUserAsync(User user);

        Task <bool> CheckIfUserExistsAsync(string name);

        Task <User> RetrieveUserByNameAsync(string name);
    }
}