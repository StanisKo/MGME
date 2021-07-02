using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace MGME.Core.DTOs
{
    public class EntitiesToDelete
    {
        public IEnumerable<int> Ids { get; set; }
    }
}