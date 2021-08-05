using System.Threading.Tasks;

using MGME.Core.DTOs;
using MGME.Core.DTOs.Scene;

namespace MGME.Core.Interfaces.Services
{
    public interface ISceneService
    {
        Task <BaseServiceResponse> AddScene(AddSceneDTO newScene);

        Task <BaseServiceResponse> ResolveScene(ResolveSceneDTO sceneToResolve);
    }
}