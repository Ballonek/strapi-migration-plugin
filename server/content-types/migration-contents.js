module.exports = {
  info: {
    tableName: "migrations-content",
    singularName: "migrations-content", // kebab-case mandatory
    pluralName: "migrations-content", // kebab-case mandatory
    displayName: "Migration contents",
    description: "A regular content-type",
    kind: "collectionType",
  },
  options: {
    draftAndPublish: false,
  },
  pluginOptions: {
    "content-manager": {
      visible: true,
    },
    "content-type-builder": {
      visible: false,
    },
  },
  attributes: {
    types: { type: "json" },
  },
};
