using System.Threading.Tasks;

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

using MGME.Core.DTOs;
using MGME.Core.DTOs.SceneItem;
using MGME.Core.Interfaces.Services;

namespace MGME.Web.Controllers
{
    [Authorize(Roles = "GameMaster,Admin")]
    public class SceneItemController : BaseAPIController
    {
        private readonly ISceneItemService _sceneItemService;

        public SceneItemController(ISceneItemService sceneItemService)
        {
            _sceneItemService = sceneItemService;
        }

        [HttpPost("Add")]
        public async Task <IActionResult> AddSceneItem(AddSceneItemDTO newSceneItem)
        {
            BaseServiceResponse response = await _sceneItemService.AddSceneItem(newSceneItem);

            if (response.Success)
            {
                return Ok(response);
            }

            return BadRequest(response);
        }

        [HttpPut("Update")]
        public async Task <IActionResult> UpdateSceneItem(UpdateSceneItemDTO updatedSceneItem)
        {
            BaseServiceResponse response = await _sceneItemService.UpdateSceneItem(updatedSceneItem);

            if (response.Success)
            {
                return Ok(response);
            }

            return NotFound(response);
        }
    }
}