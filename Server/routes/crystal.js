var express = require('express');
var router = express.Router();

const { isDatabaseIn, updateDatabaseKillboard, downloadKillboard } = require('./middlewares.js');


router.get('/FIVE', async function(req, res, next) {
    req.crystal = 1;
    req.type = 2;

    downloadKillboard(req, res, next);
});

router.get('/TWENTY', async function(req, res, next) {
    req.crystal = 1;
    req.type = 3;

    downloadKillboard(req, res, next);
});




router.post('/FIVE', isDatabaseIn, async function(req, res, next) {
    req.crystal = 1;
    req.type = 2;
    res.render('index', { title: req.id });
    updateDatabaseKillboard(req, res, next);
});

router.post('/TWENTY', isDatabaseIn, async function(req, res, next) {
    req.crystal = 1;
    req.type = 3;
    res.render('index', { title: req.id });
    updateDatabaseKillboard(req, res, next);
});

module.exports = router;