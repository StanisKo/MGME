using System.Threading.Tasks;
using System.Collections.Generic;

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.ModelBinding;

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

        [HttpGet]
        public async Task <IActionResult> GetAllScenes([FromQuery, BindRequired] int adventureId, int? selectedPage)
        {
            PaginatedDataServiceResponse<IEnumerable<GetSceneListDTO>> response = await _sceneService.GetAllScenes(
                adventureId,
                selectedPage
            );

            if (response.Success)
            {
                return Ok(response);
            }

            return BadRequest(response);
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