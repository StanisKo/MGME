using System.Threading.Tasks;
using System.Collections.Generic;

using Microsoft.AspNetCore.Mvc;

using Microsoft.AspNetCore.Authorization;

using MGME.Core.DTOs;
using MGME.Core.DTOs.PlayerCharacter;
using MGME.Core.Interfaces.Services;

namespace MGME.Web.Controllers
{
    [Authorize(Roles = "GameMaster,Admin")]
    public class PlayerCharacterController : BaseAPIController
    {
        private readonly IPlayerCharacterService _playerCharacterService;

        public PlayerCharacterController(IPlayerCharacterService playerCharacterService)
        {
            _playerCharacterService = playerCharacterService;
        }

        [HttpGet]
        public async Task <IActionResult> GetAllPlayerCharacters()
        {
            DataServiceResponse<List<GetPlayerCharacterListDTO>> response = await _playerCharacterService.GetAllPlayerCharacters();

            if (response.Success)
            {
                return Ok(response);
            }

            return NotFound(response);
        }

        

        [HttpPost("Add")]
        public async Task <IActionResult> AddPlayerCharacter(AddPlayerCharacterDTO newPlayerCharacter)
        {
            BaseServiceResponse response = await _playerCharacterService.AddPlayerCharacter(newPlayerCharacter);

            if (response.Success)
            {
                return Ok(response);
            }

            // Input params are missing or invalid
            return BadRequest(response);
        }
    }
}