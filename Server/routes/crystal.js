var express = require('express');
var router = express.Router();

const { isDatabaseIn } = require('./middlewares.js');

router.post('/FIVE', isDatabaseIn, async function(req, res, next) {
    res.render('index', { title: 'Express' });
});

router.post('/TWENTY', isDatabaseIn, async function(req, res, next) {
    res.render('index', { title: 'Express' });
});

module.exports = router;