define(['require', 'dojo/Deferred'], (require, Deferred) => function (/* Object */ config, /* Object */ parent) {
  // summary:
  //		nsl is called to create to load the nls all for the app, or for a view.
  // config: Object
  //		The section of the config for this view or for the app.
  // parent: Object
  //		The parent of this view or the app itself, so that models from the parent will be
  //		available to the view.
  let path = config.nls;
  if (path) {
    const nlsDef = new Deferred();
    let requireSignal;
    try {
      let loadFile = path;
      const index = loadFile.indexOf('./');
      if (index >= 0) {
        loadFile = path.substring(index + 2);
      }
      requireSignal = require.on ? require.on('error', (error) => {
        if (nlsDef.isResolved() || nlsDef.isRejected()) {
          return;
        }
        if (error.info[0] && (error.info[0].indexOf(loadFile) >= 0)) {
          nlsDef.resolve(false);
          if (requireSignal) {
            requireSignal.remove();
          }
        }
      }) : null;

      if (path.indexOf('./') == 0) {
        path = `app/${path}`;
      }

      if (path.match(/^client\//) && window.clientBundle) {
        const parts = path.split('/').slice(1);
        const module = parts.reduce(
          (acc, part) => acc[part],
          window.clientBundle,
        );

        nlsDef.resolve(module);
        requireSignal.remove();
      } else {
        require([`dojo/i18n!${path}`], (nls) => {
          nlsDef.resolve(nls);
          requireSignal.remove();
        });
      }
    } catch (e) {
      nlsDef.reject(e);
      if (requireSignal) {
        requireSignal.remove();
      }
    }
    return nlsDef;
  }
  return false;
});
