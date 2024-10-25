const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./reviews.js");
const mongoose_fuzzy_searching = require('mongoose-fuzzy-searching');
const { required } = require("joi");

const listingSchema = new Schema({
    title: {
      type: String,
      required: true,
    },
    description: String,
    image: {
      url: String,
      filename: String,
    },
    price: Number,
    location: String,
    country: String,
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    geometry: {

      type: {
          type : String,
          enum : ['Point'],
          
      },

      coordinates: {
          type : [Number],       
      }
  },

    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    category : {
      type:String,
      required:true,
      enum:['Trending','Rooms','Iconic Cities','Mountains','Amazing Pools','Camping','Play','Boats','Domes']
    }
});

listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

listingSchema.plugin(mongoose_fuzzy_searching, { fields: ['title', 'location', 'country'] });

const listing = mongoose.model("listing", listingSchema);
module.exports = listing;
