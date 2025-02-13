module.exports = () => {
  const govukPrototypeKit = require('govuk-prototype-kit');
  const subRouter = govukPrototypeKit.requests.setupRouter();

  // Middleware to auto-prefix redirects
  subRouter.use((req, res, next) => {
    const originalRedirect = res.redirect;
    res.redirect = function (url) {
      if (url.startsWith('/')) {
        url = req.baseUrl + url;
      }
      return originalRedirect.call(this, url);
    };
    next();
  });

  // Make sure to use subRouter.post('/name-of-your-file') instead of router.post(...) so that the redirect middleware is applied

  subRouter.post('/question-1', (req, res) => {
    res.redirect('/question-2');
  });

  subRouter.post('/question-2', (req, res) => {
    res.redirect('/question-1');
  });

  return subRouter;
};