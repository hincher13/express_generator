const express = require('express');
const Favorite = require('../models/campsite');
const authenticate = require('../authenticate');
const cors = require('cors');

const favoriteRouter = express.Router();

favoriteRouter.route('/')

favoriteRouter.route('/:campsiteId')

module.exports = favoriteRouter;