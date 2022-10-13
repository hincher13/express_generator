const express = require("express");
const Favorite = require("../models/favorite");
const authenticate = require("../authenticate");
const cors = require("./cors");

const favoriteRouter = express.Router();

favoriteRouter.route("/")
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorite.find({ user: req.user._id })
            .populate("user")
            .populate("campsites")
            .then((favorites) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(favorites);
            })
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
            .then((favorite) => {
                if (favorite) {
                    req.body.forEach((campsiteToAdd) => {
                        if (!favorite.campsites.includes(campsiteToAdd._id)) {
                            favorite.campsites.push(campsiteToAdd);
                            favorite.save();
                        }
                    });
                return favorite
                } else {
                    return Favorite.create( {user: req.user._id, campsites: req.body} )
                }
            })
            .then((favorite) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(favorite);
            })
            .catch((err) => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /favorites');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOneAndDelete({user: req.user._id})
        .then((favorite) => {
            if (favorite) {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(favorite)
            } else {
                res.statusCode = 200;
                res.setHeader("Content-Type", "text/plain");
                res.end("You do not have any favorites to delete.")
            }
        })
        .catch((err) => next(err));
    });

favoriteRouter.route("/:campsiteId")
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end('GET operation not supported on /favorites/:campsiteId');
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({user: req.user._id})
        .then((favorite) => {
            if (favorite) {
                //I want to check if my favorites array has a campsite matching the route params
                if (!favorite.campsites.includes(req.params.campsiteId)) {
                //If does not exist, I want to add it
                    favorite.campsites.push(req.params.campsiteId)
                    favorite.save();
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(favorite)
                } else {
                //If campsite does exist, I want to respond with a message
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "text/plain");
                    res.end("That campsite is already in the list of favorites!" )
                }
            } else {
                //If favorite list does not exist, I want to create it 
                Favorite.create( {user: req.user._id, campsites: req.params.campsiteId} )
                .then(favorite => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(favorite)
                })
            }
        })
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /favorites/:campsiteId');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({user: req.user._id})
        .then((favorite) => {
            if (favorite) {
                let campsiteIndexToRemove = favorite.campsites.indexOf(req.params.campsiteId)

                if (campsiteIndexToRemove > -1) {
                    favorite.campsites.splice(campsiteIndexToRemove, 1);
                    favorite.save();
                }

                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(favorite)
                
            } else {
                res.statusCode = 200;
                res.setHeader("Content-Type", "text/plain");
                res.end("There are no favorites to delete!" )
            }
        })
    });

module.exports = favoriteRouter;
