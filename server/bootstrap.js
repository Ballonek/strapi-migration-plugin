"use strict";
const { v4 } = require("uuid");

module.exports = async ({ strapi }) => {
  const data = await strapi.db
    .query("plugin::migration-plugin.migrations-content")
    .findMany();

  const contentTypes = [...strapi.db.metadata]
    .filter(([name]) => name.startsWith("api"))
    .map(([_name, { attributes, lifecycles, columnToAttribute, ...type }]) => ({
      ...type,
      id: v4(),
      migrationAllowed: false,
    }));

  if (data.length === 0) {
    await strapi.db
      .query("plugin::migration-plugin.migrations-content")
      .create({
        data: {
          types: JSON.stringify({
            contentTypes: contentTypes,
            destinationURL: "",
          }),
        },
      });
  }

  const originalContentTypes = data[0]?.types?.contentTypes;

  if (!originalContentTypes || originalContentTypes.length === 0) {
    return;
  }

  const newContentTypes = contentTypes.map((type) => {
    const origType = originalContentTypes.find((t) => t.uid === type.uid);
    if (!origType) {
      return type;
    }
    return origType;
  });
  await strapi.db.query("plugin::migration-plugin.migrations-content").update({
    where: { id: data[0].id },
    data: {
      types: JSON.stringify({
        contentTypes: newContentTypes,
        destinationURL: data[0]?.types?.destinationURL || "",
      }),
    },
  });
};
