using System.Threading.Tasks;
using System.Collections.Generic;

using Microsoft.AspNetCore.Mvc;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.ModelBinding;

using MGME.Core.DTOs;
using MGME.Core.DTOs.NonPlayerCharacter;
using MGME.Core.Interfaces.Services;

namespace MGME.Web.Controllers
{
    [Authorize(Roles = "GameMaster,Admin")]
    public class NonPlayerCharacterController : BaseAPIController
    {
        private readonly INonPlayerCharacterService _nonPlayerCharacterService;

        public NonPlayerCharacterController(INonPlayerCharacterService nonPlayerCharacterService)
        {
            _nonPlayerCharacterService = nonPlayerCharacterService;
        }

        [HttpPost("Add")]
        public async Task <IActionResult> AddNonPlayerCharacter(AddNonPlayerCharacterDTO newNonPlayerCharacter)
        {
            BaseServiceResponse response = await _nonPlayerCharacterService.AddNonPlayerCharacter(newNonPlayerCharacter);

            if (response.Success)
            {
                return Ok(response);
            }

            return BadRequest(response);
        }
    }
}