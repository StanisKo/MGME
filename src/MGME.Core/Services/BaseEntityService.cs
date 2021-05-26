using System;
using System.Reflection;
using System.Security.Claims;
using System.Collections.Generic;

using Microsoft.AspNetCore.Http;

namespace MGME.Core.Services
{
    public class BaseEntityService
    {
        protected readonly IHttpContextAccessor _httpContextAccessor;

        public BaseEntityService(IHttpContextAccessor httpContextAcessor)
        {
            _httpContextAccessor = httpContextAcessor;
        }

        protected int GetUserIdFromHttpContext()
        {
            return int.Parse(
                _httpContextAccessor.HttpContext.User.FindFirstValue(
                    ClaimTypes.NameIdentifier
                )
            );
        }

        protected string GetUserRoleFromHttpContext()
        {
            return _httpContextAccessor.HttpContext.User.FindFirstValue(
                    ClaimTypes.Role
            );
        }

        protected (TEntity, List<string>) UpdateVariableNumberOfFields<TEntity>(TEntity updateTarget, object updateSource)
        {
            /*
            We avoid explicitly updating fields, since models can grow in the future and
            at some point we might want to let front end update variable number of fields
            */
            Type typeOfTarget = updateTarget.GetType();

            PropertyInfo[] updatedProperties = updateSource.GetType().GetProperties();

            List<string> propertiesToUpdate = new List<string>();

            foreach (PropertyInfo updatedProperty in updatedProperties)
            {
                if (updatedProperty.GetValue(updateSource) == null || updatedProperty.Name == "Id")
                {
                    continue;
                }

                PropertyInfo propertyToUpdate = typeOfTarget.GetProperty(updatedProperty.Name);

                propertyToUpdate.SetValue(
                    updateTarget,
                    updatedProperty.GetValue(updateSource)
                );

                propertiesToUpdate.Add(updatedProperty.Name);
            }

            return (updateTarget, propertiesToUpdate);
        }
    }
}