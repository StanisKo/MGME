using System.Threading.Tasks;
using System.Collections.Generic;

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.ModelBinding;

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

        [HttpGet]
        public async Task <IActionResult> GetSceneItems([FromQuery, BindRequired] int sceneId)
        {
            DataServiceResponse<IEnumerable<GetSceneItemListDTO>> response = await _sceneItemService.GetSceneItems(
                sceneId
            );

            if (response.Success)
            {
                return Ok(response);
            }

            return BadRequest(response);
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