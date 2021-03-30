using System;
using System.Threading.Tasks;
using System.Linq.Expressions;
using System.Collections.Generic;

using MGME.Core.DTOs;
using MGME.Core.Entities;

namespace MGME.Core.Interfaces.Repositories
{
    public interface IEntityRepository<TEntity> where TEntity: BaseEntity
    {
        Task <TEntity> GetEntityAsync(
            int? id = null,
            bool tracking = false,
            Expression<Func<TEntity, bool>> predicate = null,
            Expression<Func<TEntity, object>>[] entitiesToInclude = null);

        // For when we need to select only some columns
        Task <TEntityDTO> GetEntityAsync<TEntityDTO>(
            int? id = null,
            bool tracking = false,
            Expression<Func<TEntity, bool>> predicate = null,
            Expression<Func<TEntity, object>>[] entitiesToInclude = null,
            Expression<Func<TEntity, TEntityDTO>> columnsToSelect = null) where TEntityDTO: BaseEntityDTO;

        Task <List<TEntity>> GetEntititesAsync(
            bool tracking = false,
            Expression<Func<TEntity, bool>> predicate = null,
            Expression<Func<TEntity, object>>[] entitiesToInclude = null,
            Tuple<Expression<Func<TEntity, object>>[], int> fieldsToOrderBy = null);

        // For when we need to select only some columns
        Task <List<TEntityDTO>> GetEntititesAsync<TEntityDTO>(
            bool tracking = false,
            Expression<Func<TEntity, bool>> predicate = null,
            Expression<Func<TEntity, object>>[] entitiesToInclude = null,
            Tuple<Expression<Func<TEntity, object>>[], int> fieldsToOrderBy = null,
            Expression<Func<TEntity, TEntityDTO>> columnsToSelect = null) where TEntityDTO: BaseEntityDTO;

        Task AddEntityAsync(TEntity entity);

        // Updates only specified fields
        Task UpdateEntityAsync(TEntity entity, IEnumerable<string> updatedProperties);

        Task UpdateEntitiesAsync(List<TEntity> entities, IEnumerable<string> updatedProperties);

        // Used to update many-to-many relationship between entity and linkedEntity
        Task LinkEntityAsync(TEntity entity, BaseEntity linkedEntity, string linkedCollection);

        Task DeleteEntityAsync(TEntity entity);

        Task DeleteEntitiesAsync(List<TEntity> entities);
    }
}