const Listing = require("./models/listing");
const Review = require("./models/reviews");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema,reviewSchema} = require("./schema.js");


module.exports.isLoggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()){
        // redirect url save
        req.session.redirectUrl = req.originalUrl;
        req.flash("error","You must be logged in to creating!");
        return res.redirect("/login");
    }
    next();
}

module.exports.saveRedirectUrl = (req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner = async (req,res,next)=>{
    let {id} = req.params;
    console.log(id);
    let listing = await Listing.findById(id);
    if(!listing.owner._id.equals(res.locals.currUser._id)){
        req.flash("error","You're not the owner of this listing");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

module.exports.validateListing = (req,res,next) =>{
    let {error} = listingSchema.validate(req.body);
        if(error){
            let errMsg = error.details.map((el)=> el.message).join(",");
            throw new ExpressError(400, errMsg);
        }else{
            next();
        }
};

module.exports.validateReview = (req,res,next) =>{
    let {error} = reviewSchema.validate(req.body);
        if(error){
            let errMsg = error.details.map((el)=> el.message).join(",");
            throw new ExpressError(400,errMsg);
        }else{
            next();
        }
};

module.exports.isReviewAuthor = async (req, res, next) => {
    let { id, reviewId } = req.params; 
    // console.log("this is review id" ,reviewId);
    let review = await Review.findById(reviewId);

    // Check if review exists
    if (!review) {
        req.flash("error", "Review not found");
        return res.redirect(`/listings/${id}`);
    }
    // console.log("this is author", review.author);
    // console.log("this is currUser", res.locals.currUser._id);

    // Check if the user is the author of the review
    if (!review.author.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not the author of this review");
        return res.redirect(`/listings/${id}`);
    }
    
    next(); // User is the author, proceed to the controller
};

// module.exports.validateObjectId(req, res, next)=>{
//     if (!isValidObjectId(req.params.id)) {
//         return res.status(400).send('Invalid ID');
//     }
//     next();
// };
