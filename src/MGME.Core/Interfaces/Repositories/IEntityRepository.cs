using System;
using System.Threading.Tasks;
using System.Linq.Expressions;
using System.Collections.Generic;

using MGME.Core.DTOs;
using MGME.Core.Entities;
using MGME.Core.Constants;

namespace MGME.Core.Interfaces.Repositories
{
    public interface IEntityRepository<TEntity> where TEntity: BaseEntity, new()
    {
        Task <TEntity> GetEntityAsync(
            int? id = null,
            bool tracking = false,
            Expression<Func<TEntity, bool>> predicate = null,
            IEnumerable<string> include = null);

        // For when we need to select only some columns
        Task <TEntityDTO> GetEntityAsync<TEntityDTO>(
            int? id = null,
            bool tracking = false,
            Expression<Func<TEntity, bool>> predicate = null,
            IEnumerable<string> include = null,
            Expression<Func<TEntity, TEntityDTO>> select = null) where TEntityDTO: BaseEntityDTO;

        Task <List<TEntity>> GetEntititesAsync(
            bool tracking = false,
            Expression<Func<TEntity, bool>> predicate = null,
            IEnumerable<string> include = null,
            Tuple<IEnumerable<Expression<Func<TEntity, object>>>, SortOrder> orderBy = null,
            int? page = null);

        // For when we need to select only some columns
        Task <List<TEntityDTO>> GetEntititesAsync<TEntityDTO>(
            bool tracking = false,
            Expression<Func<TEntity, bool>> predicate = null,
            IEnumerable<string> include = null,
            Tuple<IEnumerable<Expression<Func<TEntity, object>>>, SortOrder> orderBy = null,
            int? page = null,
            Expression<Func<TEntity, TEntityDTO>> select = null) where TEntityDTO: BaseEntityDTO;

        Task AddEntityAsync(TEntity entity);

        Task AddEntitiesAsync(IEnumerable<TEntity> entities);

        // Updates only specified fields
        Task UpdateEntityAsync(TEntity entity, IEnumerable<string> updatedProperties);

        Task UpdateEntitiesAsync(IEnumerable<TEntity> entities, IEnumerable<string> updatedProperties);

        // Used to update many-to-many relationship between entity and linkedEntity
        Task LinkEntityAsync(TEntity entity, BaseEntity linkedEntity, string linkedCollection);

        Task DeleteEntityAsync(TEntity entity);

        Task DeleteEntitiesAsync(IEnumerable<TEntity> entities);

        Task DeleteEntitiesAsync(IEnumerable<int> ids);

        Task <int> GetEntitiesCount();
    }
}