using System;

using MGME.Core.Interfaces.Services;

namespace MGME.Core.Services.RollingService
{
    /*
    We don't make it static to make it avialable via DI and make use of interfaces
    But register it as Singleton, so only one instance is created
    */
    public class RollingService : IRollingService
    {
        private Random _random = new Random();

        public int RollD10() => _random.Next(1, 11);

        public int Roll1D100() => _random.Next(1, 101);
    }
}