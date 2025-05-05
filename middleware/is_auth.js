module.exports = (req, res, next) => {
    // console.log(req.cookies._prod_isLoggedIn, req.cookies._prod_isLoggedIn == undefined);
  // console.log(!req.session.prodToken && !req.user?.remember_token);
  
  // console.log(req.cookies._globwal_isLoggedIn, req.cookies._globwal_isLoggedIn == undefined);

    if (req.cookies._fitness_isLoggedIn === undefined) {
        // console.log("User not logged in, redirecting to login");
        return res.redirect("/");
        // return next();
    } else {
        return next();
    }
};