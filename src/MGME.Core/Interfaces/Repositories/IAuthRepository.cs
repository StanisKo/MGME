using System.Threading.Tasks;

using MGME.Core.Entities;

namespace MGME.Core.Interfaces.Repositories
{
    public interface IAuthRepository
    {
        Task <bool> CheckIfUserExistsAsync(string input, string property);
    }
}