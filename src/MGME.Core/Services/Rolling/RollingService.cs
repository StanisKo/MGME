using System;

using MGME.Core.Interfaces.Services;

namespace MGME.Core.Services.RollingService
{
    public class RollingService : IRollingService
    {
        private static Random _random = new Random();

        public int RollD10() => _random.Next(1, 11);

        public int Roll1D100() => _random.Next(1, 101);
    }
}