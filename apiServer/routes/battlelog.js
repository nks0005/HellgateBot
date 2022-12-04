let express = require('express');
let router = express.Router();

const { BattleLog, WinTeam, LoseTeam, User, Gear } = require('../models/index.js');

/**
 * ./battlelog
 *
 * ?sort=recent&offset=?&limit=?
 * > GET RECENT DATA - OFFSET ~ OFFSET + LIMIT
 *
 * /:id
 * > GET :id
 */

router.get('/battleid/:battleid', async function(req, res, next) {
    // get data by battleid

    let battleid = req.params.battleid;
    if (battleid == undefined) {
        res.render('index', { title: 'battleid = undefined' });
        return;
    }
    battleid = parseInt(battleid);
    if (isNaN(battleid)) {
        res.render('index', { title: 'battleid is NaN' });
        return;
    }

    console.log(battleid);
    const battleLog = await BattleLog.findOne({
        attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt', 'check', 'id'] },
        where: {
            battleId: battleid
        }
    });

    if (battleLog == null) {
        res.render('index', { title: 'battleLog is null' });
        return;
    }

    const { battleId, startTime, totalFame, totalKills, matchType } = battleLog;
    if (battleId == undefined ||
        startTime == undefined ||
        totalFame == undefined ||
        totalKills == undefined ||
        matchType == undefined) {
        res.render('index', { title: 'battleLog data is undefined' });
        return;
    }

    let winTeam = await WinTeam.findAll({
        attributes: ['ip'],
        include: [{
                model: User,
                attributes: ['name', 'guild', 'ally', 'win55', 'win1010', 'lose55', 'lose1010']
            },
            {
                model: Gear,
                attributes: ['mainHand', 'offHand', 'head', 'armor', 'shoes', 'cape']
            }
        ],
        where: {
            battleId: battleId
        }
    });

    if (winTeam == null) {
        res.render('index', { title: 'winTeam is null' });
        return;
    }

    let loseTeam = await LoseTeam.findAll({
        attributes: ['ip'],
        include: [{
                model: User,
                attributes: ['name', 'guild', 'ally', 'win55', 'win1010', 'lose55', 'lose1010']
            },
            {
                model: Gear,
                attributes: ['mainHand', 'offHand', 'head', 'armor', 'shoes', 'cape']
            }
        ],
        where: {
            battleId: battleId
        }
    });

    if (loseTeam == null) {
        res.render('index', { title: 'loseTeam is null' });
        return;
    }

    let result = {
        battleId,
        startTime,
        totalFame,
        totalKills,
        matchType,
        winTeam,
        loseTeam
    };


    res.json(result);

    //res.json(result);
});

router.get('/', async function(req, res, next) {
    // get querystring data.

    let { sort, offset, limit } = req.query;
    // check query string
    if (sort == undefined || offset == undefined || limit == undefined) {
        console.log('need to insert data query');
        res.render('index', { title: 'need to insert data query' });
        return;
    }

    offset = parseInt(offset);
    if (isNaN(offset)) {
        console.log('offset data is not Number');
        res.render('index', { title: 'offset data is not Number' });
        return;
    }

    limit = parseInt(limit);
    if (isNaN(limit)) {
        console.log('limit data is not Number');
        res.render('index', { title: 'limit data is not Number' });
        return;
    }

    console.log(`sort : ${sort}\noffset : ${offset}\nlimit : ${limit}`);

    if (sort == `recent`) {
        console.log('enter recent');


        // battleId에서 최신 20개

        const recentBattleLogs = await BattleLog.findAll({

            include: [{
                attributes: ['ip'],
                order: [
                    ['ip', 'DESC']
                ],
                model: WinTeam,
                include: [{
                    attributes: ['name'],
                    model: User
                }]
            }, {
                attributes: ['ip'],
                order: [
                    ['ip', 'DESC']
                ],
                model: LoseTeam,
                include: [{
                    attributes: ['name'],
                    model: User
                }]
            }],

            attributes: ['battleId', 'startTime', 'totalFame', 'totalKills', 'matchType'],
            where: {
                check: true
            },
            order: [
                ['battleId', 'DESC']
            ],
            offset,
            limit
        });

        //console.log(recentBattleLogs);
        res.json(recentBattleLogs);
    }

});

module.exports = router;