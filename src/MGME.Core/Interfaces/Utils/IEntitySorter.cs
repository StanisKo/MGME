using System;
using System.Linq.Expressions;
using System.Collections.Generic;

using MGME.Core.Entities;

namespace MGME.Core.Interfaces.Utils
{
    public interface IEntitySorter
    {
        Tuple <IEnumerable<Expression<Func<BaseEntity, object>>>, int> ParseSortingParameter(string sorting);
    }
}