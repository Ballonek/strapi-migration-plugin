'use strict';

module.exports = {
  async getSettings(_ctx) {
    const contents = await strapi.db.query('plugin::migration-plugin.migrations-content').findMany();

    let result = {};
    if (contents.length === 0) {
      result.contentTypes = [];
    }
    result.contentTypes = contents[0].types.contentTypes;
    result.destinationURL = contents[0].types.destinationURL;
    return result;
  },
  async toggleSettingsForContentType(ctx) {
    const { id } = ctx.params;
    const { body } = ctx.request;

    const contents = await strapi.db.query('plugin::migration-plugin.migrations-content').findMany();

    await strapi.db.query('plugin::migration-plugin.migrations-content').update({
      where: { id: contents[0].id },
      data: {
        ...contents[0],
        types: {
          ...contents[0].types,
          contentTypes: contents[0].types.contentTypes.map((type) => {
            if (type.id === id) {
              return { ...type, migrationAllowed: body.migrationAllowed };
            }
            return type;
          }),
        },
      },
    });

    const newContents = await strapi.db.query('plugin::migration-plugin.migrations-content').findMany();

    return { contentTypes: newContents[0].types.contentTypes };
  },
  async postUrl(ctx) {
    const { body } = ctx.request;
    const contents = await strapi.db.query('plugin::migration-plugin.migrations-content').findMany();

    const content = contents[0];

    const newContents = await strapi.db.query('plugin::migration-plugin.migrations-content').update({
      where: { id: content.id },
      data: {
        types: { ...content.types, destinationURL: body.destinationURL },
      },
    });

    return newContents.types;
  },
  async isMigrationEnabled(ctx) {
    const { slug } = ctx.params;
    const contents = await strapi.db.query('plugin::migration-plugin.migrations-content').findMany();

    const { contentTypes } = contents[0]?.types;

    if (!contentTypes || contentTypes.length === 0 || !slug) {
      return { isMigrationEnabled: false };
    }
    const slugContentType = contentTypes.find((cType) => cType.uid === slug);

    return { isMigrationEnabled: !!slugContentType?.migrationAllowed };
  },
};
