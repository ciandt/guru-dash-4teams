'use strict';

const _ = require("lodash");

/**
 * An asynchronous bootstrap function that runs before
 * your application gets started.
 *
 * This gives you an opportunity to set up your data model,
 * run jobs, or perform some special logic.
 *
 * See more details here: https://strapi.io/documentation/developer-docs/latest/setup-deployment-guides/configurations.html#bootstrap
 */

module.exports = async () => {
  await createAdminUserIfNeeded(strapi);
  await updatePermissions(strapi);
  await createApiUserIfNeeded(strapi);
};

async function createAdminUserIfNeeded(strapi) {
  // Inicializa Admin caso ainda não esteja criado.
  const params = {
    username: 'admin',
    password: 'techmetrics',
    firstname:'Admin',
    lastname: 'Admin',
    email: 'admin@techmetrics.ciandt',
    blocked: false,
    isActive: true,
  };
  const admins = await strapi.query('user', 'admin').find();

  if (admins.length === 0) {
    try {
      let verifyRole = await strapi.query('role', 'admin').findOne({ code: 'strapi-super-admin' });
      if (!verifyRole) {
        verifyRole = await strapi.query('role', 'admin').create({
          name: 'Super Admin',
          code: 'strapi-super-admin',
          description: 'Super Admins can access and manage all features and settings.',
        });
      }
      params.roles = [verifyRole.id];
      params.password = await strapi.admin.services.auth.hashPassword(params.password);
      await strapi.query('user', 'admin').create({ ...params });
    } catch (error) {
      strapi.log.error(`Couldn't create Admin account during bootstrap: `, error);
    }
  }
}

async function updatePermissions(strapi) {
  const service = await strapi.plugins["users-permissions"].services.userspermissions;
  const plugins = await service.getPlugins("en");

  const roles = await service.getRoles();

  const getRole = async (type) => {
    const {id} = _.find(roles, x => x.type === type);
    return service.getRole(id, plugins);
  }

  const authRole = await getRole("authenticated");
  authRole.permissions.application.controllers.datasources.find.enabled = true;
  authRole.permissions.application.controllers['custom-metrics'].find.enabled = true;
  await service.updateRole(authRole.id, authRole);
}


async function createApiUserIfNeeded(strapi) {
  const userService = await strapi.plugins["users-permissions"].services.user;
  const users = await userService.fetchAll();

  if (users.length === 0) {
    console.info('creating user');

    userService.add({
      username: 'api',
      email: 'api@techmetrics.ciandt',
      password: 'techmetrics',
      blocked: false,
      confirmed: true,
      provider: 'local', //provider
      created_by: 1, //user admin id
      updated_by: 1, //user admin id
      role: 1 //role id,
    });
  }
}
