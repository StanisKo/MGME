using System;
using System.Linq;
using System.Threading.Tasks;
using System.Linq.Expressions;
using System.Collections.Generic;

using Microsoft.EntityFrameworkCore;

using MGME.Core.DTOs;
using MGME.Core.Entities;
using MGME.Core.Constants;
using MGME.Core.Utils;
using MGME.Core.Interfaces.Repositories;

namespace MGME.Infra.Data.Repositories
{
    public class EntityRepository<TEntity> : IEntityRepository<TEntity> where TEntity: BaseEntity, new()
    {
        private readonly ApplicationDbContext _database;

        public EntityRepository(ApplicationDbContext database)
        {
            _database = database;
        }

        public async Task <TEntity> GetEntityAsync(
            int? id = null,
            bool tracking = false,
            Expression<Func<TEntity, bool>> predicate = null,
            IEnumerable<string> include = null)
        {
            IQueryable<TEntity> query = _database.Set<TEntity>();

            if (!tracking)
            {
                query = query.AsNoTracking();
            }

            if (include != null)
            {
                for (int i = 0; i < include.Count(); i++)
                {
                    query = query.Include(include.ElementAt(i));
                }
            }

            // If we query only on primary key
            if (predicate == null && id != null)
            {
                return await query.SingleOrDefaultAsync(entity => entity.Id == id);
            }

            // If we query on primary key and also want to filter
            if (predicate != null && id != null)
            {
                query = query.Where(predicate);

                return await query.SingleOrDefaultAsync(entity => entity.Id == id);
            }

            // If we query only on filter avoiding primary key
            return await query.FirstOrDefaultAsync(predicate);
        }

        public async Task <TEntityDTO> GetEntityAsync<TEntityDTO>(
            int? id = null,
            bool tracking = false,
            Expression<Func<TEntity, bool>> predicate = null,
            IEnumerable<string> include = null,
            Expression<Func<TEntity, TEntityDTO>> select = null) where TEntityDTO : BaseEntityDTO
        {
            IQueryable<TEntity> query = _database.Set<TEntity>();

            if (!tracking)
            {
                query = query.AsNoTracking();
            }

            if (include != null)
            {
                for (int i = 0; i < include.Count(); i++)
                {
                    query = query.Include(include.ElementAt(i));
                }
            }

            // If we query only on primary key
            if (predicate == null && id != null)
            {
                return await query.Select(select).SingleOrDefaultAsync(entity => entity.Id == id);
            }

            // If we query on primary key and also want to filter
            if (predicate != null && id != null)
            {
                query = query.Where(predicate);

                return await query.Select(select).SingleOrDefaultAsync(entity => entity.Id == id);
            }

            // If we query only on filter avoiding primary key
            return await query.Where(predicate).Select(select).FirstOrDefaultAsync();
        }

        public async Task<List<TEntity>> GetEntititesAsync(
            bool tracking = false,
            Expression<Func<TEntity, bool>> predicate = null,
            IEnumerable<string> include = null,
            Tuple<IEnumerable<Expression<Func<TEntity, object>>>, SortOrder> orderBy = null,
            int? page = null)
        {
            IQueryable<TEntity> query = _database.Set<TEntity>();

            if (!tracking)
            {
                query = query.AsNoTracking();
            }

            if (include != null)
            {
                for (int i = 0; i < include.Count(); i++)
                {
                    query = query.Include(include.ElementAt(i));
                }
            }

            if (predicate != null)
            {
                query = query.Where(predicate);
            }

            if (orderBy != null)
            {
                (IEnumerable<Expression<Func<TEntity, object>>> fields, SortOrder order) = orderBy;

                query = order == SortOrder.ASCENDING
                    ? query.OrderBy(fields.First())
                    : query.OrderByDescending(fields.First());

                for (int i = 0; i < fields.Skip(1).Count(); i++)
                {
                    query = order == (int)SortOrder.ASCENDING
                        ? (query as IOrderedQueryable<TEntity>).ThenBy(fields.ElementAt(i))
                        : (query as IOrderedQueryable<TEntity>).ThenByDescending(fields.ElementAt(i));
                }
            }

            if (page != null)
            {
                query = query.Skip(((int)page - 1) * DataAccessHelpers.PAGINATE_BY).Take(DataAccessHelpers.PAGINATE_BY);
            }

            return await query.ToListAsync();
        }

        public async Task <List<TEntityDTO>> GetEntititesAsync<TEntityDTO>(
            bool tracking = false,
            Expression<Func<TEntity, bool>> predicate = null,
            IEnumerable<string> include = null,
            Tuple<IEnumerable<Expression<Func<TEntity, object>>>, SortOrder> orderBy = null,
            int? page = null,
            Expression<Func<TEntity, TEntityDTO>> select = null) where TEntityDTO: BaseEntityDTO
        {
            IQueryable<TEntity> query = _database.Set<TEntity>();

            if (!tracking)
            {
                query = query.AsNoTracking();
            }

            if (include != null)
            {
                for (int i = 0; i < include.Count(); i++)
                {
                    query = query.Include(include.ElementAt(i));
                }
            }

            if (predicate != null)
            {
                query = query.Where(predicate);
            }

            if (orderBy != null)
            {
                (IEnumerable<Expression<Func<TEntity, object>>> fields, SortOrder order) = orderBy;

                query = order == SortOrder.ASCENDING
                    ? query.OrderBy(fields.First())
                    : query.OrderByDescending(fields.First());

                for (int i = 0; i < fields.Skip(1).Count(); i++)
                {
                    query = order == (int)SortOrder.ASCENDING
                        ? (query as IOrderedQueryable<TEntity>).ThenBy(fields.ElementAt(i))
                        : (query as IOrderedQueryable<TEntity>).ThenByDescending(fields.ElementAt(i));
                }
            }

            if (page != null)
            {
                query = query.Skip(((int)page - 1) * DataAccessHelpers.PAGINATE_BY).Take(DataAccessHelpers.PAGINATE_BY);
            }

            return await query.Select(select).ToListAsync();
        }

        public async Task AddEntityAsync(TEntity entity)
        {
            await _database.Set<TEntity>().AddAsync(entity);

            await _database.SaveChangesAsync();
        }

        public async Task AddEntitiesAsync(IEnumerable<TEntity> entites)
        {
            await _database.Set<TEntity>().AddRangeAsync(entites);

            await _database.SaveChangesAsync();
        }

        public async Task UpdateEntityAsync(TEntity entity, IEnumerable<string> updatedProperties)
        {
            _database.Entry(entity).State = EntityState.Unchanged;

            foreach (string property in updatedProperties)
            {
                _database.Entry(entity).Property(property).IsModified = true;
            }

            await _database.SaveChangesAsync();
        }

        public async Task UpdateEntitiesAsync(IEnumerable<TEntity> entities, IEnumerable<string> updatedProperties)
        {
            foreach (TEntity entity in entities)
            {
                _database.Set<TEntity>().Attach(entity);

                foreach (string property in updatedProperties)
                {
                    _database.Entry(entity).Property(property).IsModified = true;
                }
            }

            await _database.SaveChangesAsync();
        }

        public async Task LinkEntityAsync(TEntity entity, BaseEntity linkedEntity, string linkedCollection)
        {
            _database.Entry(entity).State = EntityState.Unchanged;

            _database.Entry(linkedEntity).State = EntityState.Unchanged;

            _database.Entry(entity).Collection(linkedCollection).IsModified = true;

            await _database.SaveChangesAsync();
        }

        public async Task DeleteEntityAsync(TEntity entity)
        {
            _database.Set<TEntity>().Remove(entity);

            await _database.SaveChangesAsync();
        }

        public async Task DeleteEntitiesAsync(IEnumerable<TEntity> entities)
        {
            _database.Set<TEntity>().RemoveRange(entities);

            await _database.SaveChangesAsync();
        }

        public async Task DeleteEntitiesAsync(IEnumerable<int> ids)
        {
            /*
            We create a list of anonymous types to remove
            in order to avoid querying for objects we want to remove
            */
            IEnumerable<TEntity> entities = ids.Select(id => new TEntity { Id = id });

            Console.WriteLine(entities.First() == null);

            _database.Set<TEntity>().RemoveRange(entities);

            await _database.SaveChangesAsync();
        }

        public async Task <int> GetEntitiesCount()
        {
            return await _database.Set<TEntity>().CountAsync();
        }
    }
}
