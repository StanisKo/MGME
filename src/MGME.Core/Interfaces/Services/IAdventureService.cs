using System.Threading.Tasks;

using MGME.Core.DTOs;
using MGME.Core.DTOs.Adventure;

namespace MGME.Core.Interfaces.Services
{
    public interface IAdventureService
    {
        Task <BaseServiceResponse> AddAdventure(AddAdventureDTO newAdventure);
    }
}