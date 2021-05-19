using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using MGME.Core.Entities;
using MGME.Core.Interfaces.Utils;

namespace MGME.Core.Utils
{
    /*
    We don't parse string to Entity's property, but create mapper of string to lambda[], since
    we want to sort on multiple columns, based on one parameter
    */
    public class EntitySorter : IEntitySorter
    {
        public Tuple<IEnumerable<Expression<Func<BaseEntity, object>>>, int> ParseSortingParameter(string sorting)
        {
            throw new NotImplementedException();
        }
    }
}