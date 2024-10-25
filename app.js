// Load environment variables
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const mongoose_fuzzy_searching = require('mongoose-fuzzy-searching');

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// Connect to MongoDB
async function main() {
    mongoose.Promise = global.Promise;
    
    // Check if MONGO_URL is defined
    if (!process.env.MONGO_URL) {
        console.error("Error: MONGO_URL is not defined.");
        process.exit(1); // Exit the process if the URL is not set
    }
    
    console.log("MongoDB Connection URL:", process.env.MONGO_URL);
    return mongoose.connect(process.env.MONGO_URL, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
});
}

main().then(() => {
    console.log("Connected to DB in app.js");
}).catch((err) => {
    console.log("DB Connection Error:", err.message);
});

// Middleware and view settings
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

// Session configuration
const sessionOptions = {
    secret: process.env.SESSION_SECRET || 'defaultsecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
    }
};

app.set('trust proxy', 1); // Trust first proxy
app.use(session(sessionOptions));
app.use(flash());

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Locals middleware
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user; // Correctly assign current user
    next();
});

// Route handlers
app.use("/", userRouter);
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);

// Error handling
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page not found"));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("listings/error.ejs", { message });
});

// Start the server
app.listen(8080, () => {
    console.log("Server is listening on port 8080");
});
