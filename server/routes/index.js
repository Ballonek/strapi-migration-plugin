module.exports = [
  {
    method: "GET",
    path: "/get-settings",
    handler: "settingsController.getSettings",
    config: {
      policies: ["admin::isAuthenticatedAdmin"],
    },
  },
  {
    method: "PUT",
    path: "/toggle-settings/:id",
    handler: "settingsController.toggleSettingsForContentType",
    config: {
      policies: ["admin::isAuthenticatedAdmin"],
    },
  },
  {
    method: "POST",
    path: "/post-url/",
    handler: "settingsController.postUrl",
    config: {
      policies: ["admin::isAuthenticatedAdmin"],
    },
  },
];
