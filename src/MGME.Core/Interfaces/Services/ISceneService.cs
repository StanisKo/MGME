using System.Threading.Tasks;

using MGME.Core.DTOs;

namespace MGME.Core.Interfaces.Services
{
    public interface ISceneService
    {
        Task <BaseServiceResponse> AddScene();
    }
}