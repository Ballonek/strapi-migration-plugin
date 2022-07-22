'use strict';
const { getFullPopulateObject } = require('../helpers/populateHelpers');

module.exports = {
  async migrate(ctx) {
    const { slug, id } = ctx.params;
    const { populate } = getFullPopulateObject(slug);
    const content = await strapi.entityService.findOne(slug, id, {
      populate: { ...populate },
    });

    // const { data } = await axios.post(
    //   process.env.PAGE_MIGRATE_DESTINATION_URL,
    //   { user: { email, name: `${firstname} ${lastname}` }, page },
    //   {
    //     headers: {
    //       Authorization: `Bearer ${process.env.PAGE_MIGRATE_DESTINATION_ACCESS_TOKEN}`,
    //     },
    //   }
    // );
  },
};
