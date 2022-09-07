const { BattleLog, EventLog, PlayerLog, sequelize } = require('../models/index.js');
const axios = require('axios');
const Util = require('../modules/util.js').modules;


async function createPlayerLog(json, eventId, killType, Playerlogs, transaction) {
    const { Name, Id, GuildName, AllianceName, DamageDone, SupportHealingDone, AverageItemPower, Equipment: { MainHand, OffHand, Head, Armor, Shoes, Cape, Potion } } = json;

    await Playerlogs.create({
        userName: Name,
        userId: Id,
        guildName: GuildName,
        allianceName: AllianceName,
        killType: killType,
        damage: DamageDone,
        heal: SupportHealingDone,
        avgIp: AverageItemPower,
        mainHand: Util.Type2Index(MainHand),
        offHand: Util.Type2Index(OffHand),
        head: Util.Type2Index(Head),
        armor: Util.Type2Index(Armor),
        shoes: Util.Type2Index(Shoes),
        cape: Util.Type2Index(Cape),
        eventId: eventId
    }, { transaction });
}

/**
 * 데이터 베이스에 존재하는지 여부 확인
 *
 *
 * @return {req}
 *  - id : battleId 값
 *  - totalKills : 총 킬수
 *  - totalPlayers : 총 인원 수
 *  - logTime : 발생 시간
 * */

exports.isDatabaseIn = async(req, res, next) => {
    try {
        let retBattle = await BattleLog.findOne({ where: { battleId: req.body.battleId } });
        if (retBattle == null) {

            req.id = req.body.battleId;
            req.totalKills = req.body.totalKills;
            req.totalPlayers = req.body.totalPlayers;
            req.logTime = req.body.logTime;

            next();
        }
    } catch (err) {
        console.error(err);
    }
}

/**
 * 데이터 베이스에 킬보드 기록을 넣는 미들웨어
 *
 * @req.crystal
 * @req.type
 */
exports.updateDatabaseKillboard = async(req, res, next) => {
    const { id, totalKills, totalPlayers, logTime, crystal, type } = req;
    let transaction;

    try {
        transaction = await sequelize.transaction();

        // Insert BattleLog
        await BattleLog.create({
            battleId: id,
            totalKills: totalKills,
            totalPlayers: totalPlayers,
            logTime: logTime,
            crystal: crystal,
            type: type,
        }, { transaction });

        // Insert EventLog
        const eventlogs = await axios.get(`https://gameinfo.albiononline.com/api/gameinfo/events/battle/${id}?offset=0&limit=${totalKills}`);
        for (const eventlog of eventlogs.data) {
            const { EventId, GroupMembers, Killer, Victim, Participants } = eventlog;

            await EventLog.create({
                eventId: EventId,
                memberCount: Util.array2count(GroupMembers),
                battleId: id
            }, { transaction });

            // Insert PlayerLog

            // Killer 0
            await createPlayerLog(Killer, EventId, Util.getKillType().Killer, PlayerLog, transaction);

            await createPlayerLog(Victim, EventId, Util.getKillType().Victim, PlayerLog, transaction);

            for (const support of Participants) {
                await createPlayerLog(support, EventId, Util.getKillType().Support, PlayerLog, transaction);
            }

        }

        // commit
        await transaction.commit();


    } catch (err) {
        console.error(err);
        if (transaction) await transaction.rollback();
    }
}

/**
 * SELECT. 사용자가 요청한 데이터를 넘겨준다.
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.downloadKillboard = async(req, res, next) => {
    const { crystal, type } = req;

    try {
        const ret = await BattleLog.findOne({
            include: [{
                model: EventLog,
                include: [{
                    model: PlayerLog
                }]
            }],

            where: { send: 0, crystal: crystal, type: type }
        });

        if (ret) {
            res.status(201).send(ret);

            await BattleLog.update({
                send: 1
            }, { where: { battleId: ret['battleId'] } });

        } else {
            res.status(202).send('Nothing');
        }

    } catch (err) {
        console.error(err);
        next('error');
    }
}