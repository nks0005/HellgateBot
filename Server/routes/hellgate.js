var express = require('express');
var router = express.Router();

const { isDatabaseIn, updateDatabaseKillboard, downloadKillboard } = require('./middlewares.js');


router.get('/DOUBLE', async function(req, res, next) {
    req.crystal = 0;
    req.type = 0;

    downloadKillboard(req, res, next);
});

router.get('/FIVE', async function(req, res, next) {
    req.crystal = 0;
    req.type = 1;

    downloadKillboard(req, res, next);
});

router.get('/TEN', async function(req, res, next) {
    req.crystal = 0;
    req.type = 2;

    downloadKillboard(req, res, next);
});



router.post('/DOUBLE', isDatabaseIn, async function(req, res, next) {
    req.crystal = 0;
    req.type = 0;
    res.render('index', { title: req.id });
    updateDatabaseKillboard(req, res, next);
});

router.post('/FIVE', isDatabaseIn, async function(req, res, next) {
    req.crystal = 0;
    req.type = 1;
    res.render('index', { title: req.id });
    updateDatabaseKillboard(req, res, next);
});

router.post('/TEN', isDatabaseIn, async function(req, res, next) {
    req.crystal = 0;
    req.type = 2;
    res.render('index', { title: req.id });
    updateDatabaseKillboard(req, res, next);
});

module.exports = router;