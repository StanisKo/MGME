using System;
using System.Linq;
using System.Linq.Expressions;
using System.Collections.Generic;

using MGME.Core.Entities;
using MGME.Core.Constants;

namespace MGME.Core.Utils.Sorters
{
    public class SceneSorter : EntitySorter<Scene>

    {
        public Tuple<IEnumerable<Expression<Func<Scene, object>>>, SortOrder> DetermineSorting(string sortingParameter)
        {
            return base.DetermineSorting(sortingParameter, _sceneSortingOptions);
        }

        private readonly Dictionary<string, List<Expression<Func<Scene, object>>>> _sceneSortingOptions = new()
        {
            {
                "created", new()
                {
                    scene => scene.CreatedAt
                }
            }
        };
    }
}