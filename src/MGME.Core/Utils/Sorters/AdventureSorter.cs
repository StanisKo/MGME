using System;
using System.Linq;
using System.Linq.Expressions;
using System.Collections.Generic;

using MGME.Core.Entities;
using MGME.Core.Constants;

namespace MGME.Core.Utils.Sorters
{
    public class AdventureSorter : EntitySorter<Adventure>
    {
        public Tuple<IEnumerable<Expression<Func<Adventure, object>>>, SortOrder> DetermineSorting(string sortingParameter)
        {
            return base.DetermineSorting(sortingParameter, _adventureSortingOptions);
        }

        private Dictionary<string, List<Expression<Func<Adventure, object>>>> _adventureSortingOptions = new()
        {
            {
                "title", new()
                {
                    adventure => adventure.Title
                }
            },
            {
                "thread", new()
                {
                    adventure => adventure.Threads.Count,
                    adventure => adventure.Threads.FirstOrDefault().Name,
                    adventure => adventure.Threads.FirstOrDefault().Id
                }
            },
            {
                "created", new()
                {
                    adventure => adventure.CreatedAt
                }
            },
            {
                "character", new()
                {
                    adventure => adventure.PlayerCharacters.Count,
                    adventure => adventure.PlayerCharacters.FirstOrDefault().Name,
                    adventure => adventure.PlayerCharacters.FirstOrDefault().Id
                }
            },
            {
                "npc", new()
                {
                    adventure => adventure.NonPlayerCharacters.Count,
                    adventure => adventure.NonPlayerCharacters.FirstOrDefault().Name,
                    adventure => adventure.NonPlayerCharacters.FirstOrDefault().Id
                }
            },
            {
                "scene", new()
                {
                    adventure => adventure.Scenes.Count,
                    adventure => adventure.Title
                }
            }
        };
    }
}