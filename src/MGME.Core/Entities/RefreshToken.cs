using System;

namespace MGME.Core.Entities
{
    public class RefreshToken : BaseEntity
    {
        public string Token { get; set; }

        public DateTime Expires { get; set; }
    }
}