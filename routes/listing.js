const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");

const multer = require('multer');
const { storage } = require("../cloudConflig.js");
const upload = multer({ storage });

// Route to display all listings
router
   .route("/")
   .get(wrapAsync(listingController.index))
   .post(
      isLoggedIn,
      validateListing,
      upload.single("listing[image]"),
      wrapAsync(listingController.createListing)
   );

// Route for search functionality
router
   .route("/search")
   .get(wrapAsync(listingController.searchDestination));


// Route to render new listing form
router.get("/new", isLoggedIn, listingController.renderNewForm);

// Filter route - Wrap filterListing with wrapAsync
router.route("/filter/:Ltype")
   .get(wrapAsync(listingController.filterListing));  // Wrapping filterListing with wrapAsync

// Routes to show, update, and delete a listing by ID
router
   .route("/:id")
   .get(wrapAsync(listingController.showListing))
   .put(
      isLoggedIn,
      isOwner,
      upload.single("listing[image]"),
      validateListing,
      wrapAsync(listingController.updateListing)
   )
   .delete(
      isLoggedIn,
      isOwner,
      wrapAsync(listingController.deleteListing)
   );

// Route to render the edit form for a listing
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

module.exports = router;
