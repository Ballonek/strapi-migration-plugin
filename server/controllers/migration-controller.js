'use strict';
const axios = require('axios');
const { updateOrCreate } = require('../helpers/migrationHelpers');
const { getFullPopulateObject } = require('../helpers/populateHelpers');

const getMigrationDestinationURL = async () => {
  const settings = await strapi.db.query('plugin::migration-plugin.migrations-content').findMany();

  return settings[0]?.types?.destinationURL || '';
};

module.exports = {
  async migrate(ctx) {
    const { slug, id } = ctx.params;
    const { populate } = getFullPopulateObject(slug);
    const content = await strapi.entityService.findOne(slug, id, {
      populate: { ...populate },
    });
    const { email } = ctx.state.user;
    const destinationURL = await getMigrationDestinationURL();

    const { data } = await axios.post(
      `${destinationURL}/migration-plugin/${slug}/${id}`,
      { user: { email }, content },
      // TODO: create Authorization logic
      {
        headers: {
          Authorization:
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjU4NTE5MjA1LCJleHAiOjE2NjExMTEyMDV9.QEXuE-xqWb4RS-JDVAQjhIPdo3TezMrThAJv1jXJnW8',
        },
      }
    );

    return data;
  },
  processMigration(ctx) {
    // TODO: create backup logic
    const { slug, id } = ctx.params;
    const { content, user } = ctx.request.body;

    return updateOrCreate(null, slug, content);
  },
};
