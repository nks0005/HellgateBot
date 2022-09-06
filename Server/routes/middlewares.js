const { BattleLog } = require('../models/index.js');


// 데이터 베이스에 존재하는지 여부 확인
exports.isDatabaseIn = async(req, res, next) => {
    let retBattle = await BattleLog.findOne({ where: { battleId: req.body.battleId } });
    if (retBattle == null) {
        req.id = req.body.battleId;
        next();
    }
}