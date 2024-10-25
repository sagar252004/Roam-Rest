const Listing = require("../models/listing.js");
const express = require("express");
const ExpressError = require("../utils/ExpressError.js");
const MAP_TOKEN = process.env.MAP_TOKEN;

const Review = require("../models/reviews.js");
const User = require("../models/user.js");

if (process.env.NODE_ENV != 'production') {
    require('dotenv').config();
}

const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

const FilterTypes = {
        'Trending': 'fire-flame-curved',
        'Rooms': 'building-user',
        'Iconic Cities': 'mountain-city',
        'Mountains': 'mountain-sun',
        'Amazing Pools': 'person-swimming',
        'Camping': 'campground',
        'Play': 'futbol',
        'Boats': 'sailboat',
        'Domes': 'landmark-dome'
};

module.exports.index = async (req,res)=>{
    const allListings = await Listing.find({});
    // console.log([allListings[0]]);
    return res.render("listings/index.ejs", {allListings,FilterTypes });
};

module.exports.renderNewForm = (req,res)=>{  
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id)
    
    .populate({
        path :"reviews",
        populate:{
            path: "author",
        },
    })
    .populate("owner");
    if(!listing){
        req.flash("error","Listing doesnot exist!");
        res.redirect("/listings");
    }
    //console.log(listing.geometry.coordinates);
    //console.log(MAP_TOKEN);
    
    return res.render("listings/show.ejs", {listing,mapToken});
};

module.exports.createListing = async (req,res,next,err)=>{
    // let { newListing } = req.body;
    
   
    let url = req.file.path;
    let filename = req.file.filename;
    let newListing = new Listing(req.body.listing);
    // console.log(req.body.listing);
    let mapBoxresponse = await geocodingClient.forwardGeocode({
        query: newListing.location,
        limit: 1
    }).send();

    const geometry = mapBoxresponse.body.features[0].geometry;
    newListing.owner = req.user._id;
    newListing.geometry = geometry;
    newListing.image = {url,filename};
    await newListing.save();
    
    req.flash("success","New Listing Created!");
    res.redirect("/listings");

    if(err)
        next(err);
};

module.exports.renderEditForm = async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing doesnot exist!");
        res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
     originalImageUrl=originalImageUrl.replace("/upload","/upload/,w_250")
     res.render("listings/edit.ejs",{listing,originalImageUrl});
};

module.exports.updateListing = async (req,res)=>{
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id,{...req.body.listing});
    let mapBoxresponse = await geocodingClient.forwardGeocode({
        query: listing.location,
        limit: 1
    }).send();

    // console.log(mapBoxresponse.body.features[0].geometry.coordinates);
    const geometry = mapBoxresponse.body.features[0].geometry;
    // console.log(geometry);

    listing.geometry = geometry;
    if(typeof req.file!=="undefined"){ 
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url,filename};
        await listing.save();
    }
    req.flash("success","Listing Updated!");
    res.redirect(`/listings/${id}`);
};
module.exports.deleteListing= async(req,res)=>{
    let {id} = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    req.flash("success", `${deletedListing.title} Listing is deleted!`);
    res.redirect("/listings");
};

module.exports.searchDestination = async (req, res,next) => {
        
    const query = req.query.searchQuery;
    const queryListings = await Listing.fuzzySearch({ query: query, exact:true } );


    if( queryListings.length == 0){
        req.flash("error", `Destination " ${query} " is not listed on NestAway! `);
        res.redirect("/listings")
    }

    res.render("listings/index.ejs", { allListings: queryListings,FilterTypes });


};

module.exports.filterListing = async (req, res, next) => {
    let { Ltype } = req.params;
     console.log(Ltype);

    if (!Ltype) {
        req.flash("error", "Filter type is not provided.");
        return res.redirect('/');
    }

    try {
        let filteredListings = await Listing.find({ category: Ltype });

        if (filteredListings.length === 0) {
            req.flash("info", "No listings found for the selected filter.");
        }

        res.render("listings/index.ejs", { allListings: filteredListings, FilterTypes });
    } catch (err) {
        next(err);
    }
};
