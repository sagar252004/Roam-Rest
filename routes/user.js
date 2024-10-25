const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const {saveRedirectUrl} = require("../middleware.js");
const usercontroller = require("../controllers/users.js");
const Listing = require("../models/listing.js");

router.route("/signup")
    .get(usercontroller.renderSignUpForm)
    .post(wrapAsync(usercontroller.signup))
      

router.route("/login")
    .get(usercontroller.renderLoginForm)
    .post(
        saveRedirectUrl,
        passport.authenticate("local",{
            failureRedirect:"/login",
            failureFlash:true,
        }),
        usercontroller.login
    );

router.get("/logout",usercontroller.logout);
router.get("/listings/logout",usercontroller.logout);

module.exports = router;