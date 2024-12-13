exports.get404 = (req, res, next) => {
  const isAuthenticated = req.session.isLoggedIn;
  console.log(isAuthenticated);
  
  res.status(404).render('404', { pageTitle: 'Page Not Found', path: '/404', isAuthenticated });
};
