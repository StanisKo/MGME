using System.Threading.Tasks;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

using Microsoft.AspNetCore.Mvc;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.ModelBinding;

using MGME.Core.Constants;
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

        [HttpGet]
        public async Task <IActionResult> GetAllNonPlayerCharacters(
            [
            BindRequired,
            Range((int)NonPlayerCharacterFilter.ALL, (int)NonPlayerCharacterFilter.AVAILABLE_FOR_PLAYER_CHARACTERS),
            FromQuery
            ] int filter,
            int? page
        )
        {
            PaginatedDataServiceResponse<IEnumerable<GetNonPlayerCharacterListDTO>> response = await _nonPlayerCharacterService.GetAllNonPlayerCharacters(
                filter, page
            );

            if (response.Success)
            {
                return Ok(response);
            }

            return BadRequest(response);
        }

        [HttpGet("{id}")]
        public async Task <IActionResult> GetNonPlayerCharacter(int id)
        {
            DataServiceResponse<GetNonPlayerCharacterDetailDTO> response = await _nonPlayerCharacterService.GetNonPlayerCharacter(id);

            if (response.Success)
            {
                return Ok(response);
            }

            return NotFound(response);
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

        [HttpPut("Update")]
        public async Task <IActionResult> UpdateNonPlayerCharacter(UpdateNonPlayerCharacterDTO updatedNonPlayerCharacter)
        {
            BaseServiceResponse response = await _nonPlayerCharacterService.UpdateNonPlayerCharacter(updatedNonPlayerCharacter);

            if (response.Success)
            {
                return Ok(response);
            }

            return NotFound(response);
        }

        [HttpDelete("Delete")]
        public async Task <IActionResult> DeleteNonPlayerCharacter([BindRequired, FromQuery] int id)
        {
            BaseServiceResponse response = await _nonPlayerCharacterService.DeleteNonPlayerCharacter(id);

            if (response.Success)
            {
                return Ok(response);
            }

            return NotFound(response);
        }
    }
}