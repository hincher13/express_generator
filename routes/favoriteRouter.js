const express = require('express');
const Favorite = require('../models/favorite');
const authenticate = require('../authenticate');
const cors = require('./cors');

const favoriteRouter = express.Router();

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser,(req, res, next) => {
    Favorite.find({ user:req.user._id})
    .populate('user')
    .populate('campsites')
    .then(favorites => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser,(req, res, next) => {
    Favorite.findOne({user: req.user._id})
    .then(favorite => {
        if(favorite) {
            req.body.forEach(campsiteToAdd => {
                if(!favorite.campsites.includes(campsiteToAdd._id)) {
                    favorite.push(campsiteToAdd);
                    favorite.save()

                };
            })
        } else {
            Favorite.create(req.body)
            //Can this be changes to just (req.body)?
        .then(favorite => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
        })
    .catch(err => next(err));

        }
    })
})
.put(cors.corsWithOptions, authenticate.verifyUser,)
.delete(cors.corsWithOptions, authenticate.verifyUser,)

favoriteRouter.route('/:campsiteId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors)
.post(cors.corsWithOptions, authenticate.verifyUser,)
.put(cors.corsWithOptions, authenticate.verifyUser,)
.delete(cors.corsWithOptions, authenticate.verifyUser,)

module.exports = favoriteRouter;