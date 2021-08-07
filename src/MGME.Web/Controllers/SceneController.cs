using System.Threading.Tasks;

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

using MGME.Core.DTOs;
using MGME.Core.DTOs.Scene;
using MGME.Core.Interfaces.Services;

namespace MGME.Web.Controllers
{
    [Authorize(Roles = "GameMaster,Admin")]
    public class SceneController : BaseAPIController
    {
        private readonly ISceneService _sceneService;

        public SceneController(ISceneService sceneService)
        {
            _sceneService = sceneService;
        }

        [HttpPost("Add")]
        public async Task <IActionResult> AddScene(AddSceneDTO newScene)
        {
            BaseServiceResponse response = await _sceneService.AddScene(newScene);

            if (response.Success)
            {
                return Ok(response);
            }

            return BadRequest(response);
        }

        [HttpPut("Resolve")]
        public async Task <IActionResult> ResolveScene(ResolveSceneDTO sceneToResolve)
        {
            BaseServiceResponse response = await _sceneService.ResolveScene(sceneToResolve);

            if (response.Success)
            {
                return Ok(response);
            }

            return NotFound(response);
        }
    }
}