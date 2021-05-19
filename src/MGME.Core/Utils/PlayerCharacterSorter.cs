using System;
using System.Linq;
using System.Linq.Expressions;
using System.Collections.Generic;

using MGME.Core.Entities;
using MGME.Core.Constants;

namespace MGME.Core.Utils
{
    /*
    We don't parse string to Entity's property, but create mapper of string to lambda[], since
    we want to sort on multiple columns, based on one parameter
    */

    public class PlayerCharacterSorter : EntitySorter<PlayerCharacter>
    {
        public Tuple<IEnumerable<Expression<Func<PlayerCharacter, object>>>, SortOrder> DetermineSorting(string sortingParameter)
        {
            return base.DetermineSorting(sortingParameter, _playerCharacterSortingOptions);
        }

        private Dictionary<string, List<Expression<Func<PlayerCharacter, object>>>> _playerCharacterSortingOptions = new()
        {
            {
                "name", new()
                {
                    playerCharacter => playerCharacter.Name
                }
            },
            {
                "adventure", new()
                {
                    playerCharacter => playerCharacter.Adventures.Count,
                    playerCharacter => playerCharacter.Adventures.FirstOrDefault().Title,
                    playerCharacter => playerCharacter.Adventures.FirstOrDefault().Id
                }
            },
            {
                "npc", new()
                {
                    playerCharacter => playerCharacter.NonPlayerCharacters.Count,
                    playerCharacter => playerCharacter.NonPlayerCharacters.FirstOrDefault().Name,
                    playerCharacter => playerCharacter.NonPlayerCharacters.FirstOrDefault().Id
                }
            }
        };
    }
}