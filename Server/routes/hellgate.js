var express = require('express');
var router = express.Router();

const { isDatabaseIn } = require('./middlewares.js');

router.get('/DOUBLE', async function(req, res, next) {

});


router.post('/DOUBLE', isDatabaseIn, async function(req, res, next) {
    console.log(req.id);



    res.render('index', { title: 'Express' });
});

router.post('/FIVE', isDatabaseIn, async function(req, res, next) {
    res.render('index', { title: 'Express' });
});

router.post('/TEN', isDatabaseIn, async function(req, res, next) {
    res.render('index', { title: 'Express' });
});

module.exports = router;