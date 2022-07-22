class ObjectBuilder {
  _obj = {};
  get() {
    return this._obj;
  }
  extend(obj) {
    this._obj = { ...this._obj, ...obj };
  }
}

/**
 * Get a model.
 * @param {string} slug
 * @return {{attributes: {[k:string]: Attribute}}}
 */
const getModel = (slug) => {
  return strapi.db.metadata.get(slug);
};

/**
 * Get the attributes of a model.
 * @param {string} slug - Slug of the model.
 * @param {AttributeType} [filterType] - Only attributes matching the type will be kept.
 * @returns {Array<Attribute>}
 */
const getModelAttributes = (slug, filterType) => {
  const attributesObj = getModel(slug).attributes;
  const attributes = Object.keys(attributesObj).reduce((acc, key) => acc.concat({ ...attributesObj[key], name: key }), []);

  if (filterType) {
    return attributes.filter((attr) => attr.type === filterType);
  }

  return attributes;
};

/**
 * Indicate whether an attribute is a dynamic zone.
 * @param {Attribute} attribute
 * @returns {boolean}
 */
const isAttributeDynamicZone = (attribute) => {
  return attribute.components && Array.isArray(attribute.components);
};

const updateOrCreate = async (user, slug, data, idField = 'id') => {
  const relations = getModelAttributes(slug, 'relation');
  const processingRelations = relations.map(async (rel) => {
    data[rel.name] = await updateOrCreateRelation(user, rel, data[rel.name]);
  });
  await Promise.all(processingRelations);

  const whereBuilder = new ObjectBuilder();
  if (data[idField]) {
    whereBuilder.extend({ [idField]: data[idField] });
  }
  const where = whereBuilder.get();

  if (slug === 'api::page.page') {
    const originalPage = await strapi.db.query(slug).findOne({ where: { ...where } });
    if (!originalPage) {
      delete data.id;
      where[idField] = null;
    }
  }
  // Prevent strapi from throwing a unique constraint error on id field.
  if (idField !== 'id') {
    delete data.id;
  }

  let entry;
  if (!where[idField]) {
    entry = await strapi.db.query(slug).create({ data });
  } else {
    entry = await strapi.db.query(slug).update({ where, data });

    if (!entry) {
      entry = await strapi.db.query(slug).create({ data });
    }
  }

  return entry;
};

/**
 * Update or create a relation.
 * @param {Object} user
 * @param {Attribute} rel
 * @param {number | Object | Array<Object>} relData
 */
const updateOrCreateRelation = async (user, rel, relData) => {
  if (['createdBy', 'updatedBy'].includes(rel.name)) {
    return user?.id;
  } else if (isAttributeDynamicZone(rel)) {
    const processingComponents = (relData || []).map((componentDatum) =>
      updateOrCreate(user, componentDatum.__component, componentDatum)
    );
    let components = await Promise.all(processingComponents);
    components = components.map((component, i) => ({
      ...component,
      __component: relData[i].__component,
    }));
    return components;
  }
  // relData has to be checked since typeof null === "object".
  else if (relData && Array.isArray(relData)) {
    const entries = await Promise.all(relData.map((relDatum) => updateOrCreate(user, rel.target, relDatum)));
    return entries.map((entry) => entry.id);
  }
  // relData has to be checked since typeof null === "object".
  else if (relData && typeof relData === 'object') {
    const entry = await updateOrCreate(user, rel.target, relData);
    return entry?.id || null;
  }
};

module.exports = {
  updateOrCreate,
};
