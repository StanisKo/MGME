using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

using MGME.Core.DTOs;
using MGME.Core.Interfaces.Services;


namespace MGME.Web.Controllers
{
    [Authorize(Roles = "GameMaster,Admin")]
    public class RandomEventController : BaseAPIController
    {
        private readonly IRandomEventService _randomEventService;

        public RandomEventController(IRandomEventService randomEventService)
        {
            _randomEventService = randomEventService;
        }

        [HttpGet]
        public DataServiceResponse<string> GenerateRandomEvent()
        {
            return new DataServiceResponse<string>()
            {
                Data = _randomEventService.GenerateRandomEvent(),
                Success = true,
            };
        }
    }
}