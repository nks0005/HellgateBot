const { User, Gear, BattleLog, LoseTeam, WinTeam, Weapon1010, Weapon55, Comp55, Comps1010 } = require('../models');

class Statistics {
    constructor() {
        const { sequelize } = require('../models/index.js');
        this.sequelize = sequelize;

        // 데이터 베이스 동기화
        this.sequelize.sync({ force: false }).then(() => {
                console.log('데이터베이스 연결 성공');
            })
            .catch((err) => {
                console.error(err);
            });
    }

    async processTeam55(teams, winflag) {

        let teamGear = [];
        for (const team of teams) {
            const { userId, equipId } = team;

            //console.log(userId, equipId);

            const gear = await Gear.findOne({
                attributes: ['mainHand'],
                where: {
                    id: equipId
                }
            });

            //console.log(gear.mainHand);

            // weapon55 숫자를 채워야 함

            // check
            let checkWeapon55 = await Weapon55.findOne({
                where: {
                    mainHand: gear.mainHand
                }
            });

            if (checkWeapon55 == null) {
                // create
                checkWeapon55 = await Weapon55.create({
                    mainHand: gear.mainHand,
                    victory: 0,
                    defeat: 0
                });
            }

            // update 
            if (winflag) {
                await Weapon55.update({
                    victory: (checkWeapon55.victory + 1)
                }, { where: { id: checkWeapon55.id } });
            } else {
                await Weapon55.update({
                    defeat: (checkWeapon55.defeat + 1)
                }, { where: { id: checkWeapon55.id } });
            }

            // = User 처리 =
            // check User.
            let checkUser = await User.findOne({
                where: { id: userId }
            });



            // up count
            if (winflag) {
                await User.update({
                    win55: (checkUser.win55 + 1)
                }, { where: { id: checkUser.id } });
            } else {
                await User.update({
                    lose55: (checkUser.lose55 + 1)
                }, { where: { id: checkUser.id } });
            }


            teamGear.push(gear.mainHand);
        }

        teamGear.sort();
        if (teamGear.length != 5) return;

        // check
        let checkComps55 = await Comp55.findOne({
            where: {
                w1: teamGear[0],
                w2: teamGear[1],
                w3: teamGear[2],
                w4: teamGear[3],
                w5: teamGear[4],
            }
        });

        if (checkComps55 == null) {
            // create 
            checkComps55 = await Comp55.create({
                w1: teamGear[0],
                w2: teamGear[1],
                w3: teamGear[2],
                w4: teamGear[3],
                w5: teamGear[4],
                victory: 0,
                defeat: 0
            });
        }

        // update
        if (winflag) {
            await Comp55.update({
                victory: (checkComps55.victory + 1)
            }, { where: { id: checkComps55.id } });
        } else {
            await Comp55.update({
                defeat: (checkComps55.defeat + 1)
            }, { where: { id: checkComps55.id } });
        }
    }


    async processUpdate(battleId) {

        const victorys = await WinTeam.findAll({
            where: {
                battleId: battleId
            }
        });

        const defeats = await LoseTeam.findAll({
            where: {
                battleId: battleId
            }
        });

        await this.processTeam55(victorys, true);
        await this.processTeam55(defeats, false);

        await this

    }

    async processDone(battlelog) {
        const { id } = battlelog;

        console.log(id);

        await BattleLog.update({
            check: 1
        }, {
            where: {
                id: id
            }
        });


    }

    async start() {
        try {
            // BattleLog에서 check = 0인 데이터를 하나씩 읽어서 처리한다.

            const battlelogs = await BattleLog.findAll({
                attributes: ['id', 'battleId'],
                where: {
                    check: 0,
                    matchType: 5
                }
            });


            for (const battlelog of battlelogs) {
                console.log(battlelog.battleId);

                await this.processUpdate(battlelog.battleId);
                await this.processDone(battlelog);
            }


        } catch (err) {
            console.error(err);
        }

    }


}
module.exports = Statistics;