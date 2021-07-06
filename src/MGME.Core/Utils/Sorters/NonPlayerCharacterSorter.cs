using System;
using System.Linq;
using System.Linq.Expressions;
using System.Collections.Generic;

using MGME.Core.Entities;
using MGME.Core.Constants;

namespace MGME.Core.Utils.Sorters
{
    public class NonPlayerCharacterSorter : EntitySorter<NonPlayerCharacter>
    {
        public Tuple<IEnumerable<Expression<Func<NonPlayerCharacter, object>>>, SortOrder> DetermineSorting(string sortingParameter)
        {
            return base.DetermineSorting(sortingParameter, _nonPlayerCharacterSortingOptions);
        }

        private Dictionary<string, List<Expression<Func<NonPlayerCharacter, object>>>> _nonPlayerCharacterSortingOptions = new()
        {
            {
                "name", new()
                {
                    nonPlayerCharacter => nonPlayerCharacter.Name
                }
            },
            {
                "character", new()
                {
                    nonPlayerCharacter => nonPlayerCharacter.PlayerCharacter.Name,
                    nonPlayerCharacter => nonPlayerCharacter.PlayerCharacter.Id
                }
            },
            {
                "adventure", new()
                {
                    nonPlayerCharacter => nonPlayerCharacter.Adventures.Count,
                    nonPlayerCharacter => nonPlayerCharacter.Adventures.FirstOrDefault().Title,
                    nonPlayerCharacter => nonPlayerCharacter.Adventures.FirstOrDefault().Id
                }
            }
        };
    }
}