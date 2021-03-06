using System;

using MGME.Core.Interfaces.Services;

namespace MGME.Core.Services.RollingService
{
    /*
    We don't make it static to make it available via DI and make use of interfaces
    But register it as Singleton, so only one instance is created
    */
    public class RollingService : IRollingService
    {
        private readonly Random _random = new();

        public int Roll1D10() => _random.Next(1, 11);

        public int Roll1D100() => _random.Next(1, 101);
    }
}