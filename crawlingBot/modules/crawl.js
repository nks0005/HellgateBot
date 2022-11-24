const axios = require('axios');
const jsonItems = require('./items.json');

const { User, Gear, BattleLog, LoseTeam, WinTeam } = require('../models');

const sleep = async(ms) => {
    return new Promise(resolve => { setTimeout(resolve, ms) });
};

const array2count = (array) => {
    return parseInt(Object.keys(array).length);
}

const filterItem = (item) => {
    let filterItem = ``;
    let start = item.indexOf('_') + 1;
    let end = item.lastIndexOf('@');

    if (end == -1)
        filterItem = item.substring(start);
    else
        filterItem = item.substring(start, end);

    return filterItem;
}

const findItemIndex = (itemName) => {
    let tmpItemName = 'T8_' + itemName;

    for (const item of jsonItems) {
        if (tmpItemName == item['UniqueName']) {
            let ret = item['Index'];

            if (ret == NaN) return 'undefined'
            return ret;
        }
    }
}

const Type2Index = (Type) => {
    if (Type == null) return Type;

    Type = Type['Type'];

    const item = filterItem(`${Type}`);
    const index = parseInt(findItemIndex(`${item}`));

    if (index == NaN) return null;

    return index;
}

class Crawl {
    constructor() {
        this.minIp = 1100;
        this.maxIp = 1450;


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


    async processDb(battle, team, WinFlag, matchType) {
        const winFlag = WinFlag;
        // console.log(battle);
        //console.dir(team, { depth: 3 });

        try {

            // == 트랜젝션 시작 ==
            // = BattleLog 처리 =
            let retBattlelog;

            // 기존 Battle Log에 존재하는지 확인
            {
                const { battleId } = battle;
                retBattlelog = await BattleLog.findOne({
                    where: {
                        battleId: battleId
                    }
                });

                // 존재하다면
                if (retBattlelog != null) {
                    // check LoseTeam
                    let checkLoseTeam = await LoseTeam.findOne({
                        where: {
                            battleId: battleId
                        }
                    });

                    if (checkLoseTeam != null) {
                        return -1;
                    }
                } else {
                    // Battle Log에 새로운 데이터 생성
                    const { battleId, startTime, totalFame, totalKills, matchType } = battle;
                    retBattlelog = await BattleLog.create({
                        battleId: battleId,
                        startTime: startTime,
                        totalFame: totalFame,
                        totalKills: totalKills,
                        matchType: matchType
                    });
                }
            }

            //console.log(ret.id, ret.battleId);

            const { battleId, startTime, totalFame, totalKills, matchType } = battle;
            const teamKeys = Object.keys(team);
            for (var i = 0; i < teamKeys.length; i++) {
                const teamKey = teamKeys[i];
                let { ip } = team[teamKey];
                const { userId, name, guild, ally } = team[teamKey]['user'];
                let { mainHand, offHand, head, armor, shoes, cape } = team[teamKey]['equip'];


                //console.log(userId, name, guild, ally);
                //console.log(mainHand, offHand, head, armor, shoes, cape);

                // = User 처리 =
                // check User.
                let checkUser = await User.findOne({
                    where: { userId: userId }
                });

                if (checkUser == null) {
                    // create
                    try {
                        checkUser = await User.create({
                            userId: userId,
                            name: name,
                            guild: guild,
                            ally: ally,
                        });
                    } catch (err) {
                        checkUser = await User.findOne({
                            where: { userId: userId }
                        });
                    }
                }

                //console.log(checkUser.id);
                if (mainHand == undefined) {
                    mainHand = 0;
                    //console.log(`battleId : ${battleId}  name : ${name}`)
                }
                if (offHand == undefined) offHand = null;
                if (head == undefined) head = null;
                if (armor == undefined) armor = null;
                if (shoes == undefined) shoes = null;
                if (cape == undefined) cape = null;

                // = process Gear =
                let checkGear = await Gear.findOne({
                    where: {
                        mainHand: mainHand,
                        offHand: offHand,
                        head: head,
                        armor: armor,
                        shoes: shoes,
                        cape: cape
                    }
                });
                if (checkGear == null) {
                    // create
                    checkGear = await Gear.create({
                        mainHand: mainHand,
                        offHand: offHand,
                        head: head,
                        armor: armor,
                        shoes: shoes,
                        cape: cape
                    });
                }

                //console.log(checkGear.id);

                if (ip == null || ip == undefined) ip = 0;

                // = Team 처리 =
                if (winFlag) {
                    // victory
                    await WinTeam.create({
                        battleId: battleId,
                        userId: checkUser.id,
                        equipId: checkGear.id,
                        ip: ip
                    });
                } else {
                    // defeat
                    await LoseTeam.create({
                        battleId: battleId,
                        userId: checkUser.id,
                        equipId: checkGear.id,
                        ip: ip
                    });
                }

            }

        } catch (err) {
            console.error(err);
        } finally {

        }


    }


    async getDataFromUrl(url) {
        let res;
        try {
            res = await axios(url);
        } catch (err) {
            //console.log(`${url}로 부터 데이터를 정상적으로 얻지 못했습니다. 5초 뒤 다시 시도합니다.`);
            await sleep(5000);
            return await this.getDataFromUrl(url);
        }
        if (res.status != 200 || res.data == null) {
            //console.log(`${url}로 부터 데이터를 정상적으로 얻지 못했습니다. 10초 뒤 다시 시도합니다.`);

            await sleep(10000);
            return await this.getDataFromUrl(url);
        }

        return res.data;
    }

    async processUsersToTeam(users, team, battleId) {
        let tmpTeam = {};

        const userKeys = Object.keys(users);
        for (var i = 0; i < userKeys.length; i++) {
            let userKey = userKeys[i];

            let idCheck = false;
            const teamKeys = Object.keys(team);
            for (var j = 0; j < teamKeys.length; j++) {
                let teamKey = teamKeys[j];

                //console.log(userKey, teamKey);
                if (userKey == teamKey) {
                    idCheck = true;
                    break;
                }
            }
            if (idCheck == false) continue;

            // console.log(users[userKey]);
            // User 정보 생성
            let tmpUser = {
                userId: users[userKey].userId,
                name: users[userKey].name,
                guild: users[userKey].guildName,
                ally: users[userKey].allianceName
            };

            // Equip 정보 생성
            let tmpEquip = {
                mainHand: users[userKey].mainHand,
                offHand: users[userKey].offHand != undefined ? users[userKey].offHand : null,
                head: users[userKey].head,
                armor: users[userKey].armor,
                shoes: users[userKey].shoes,
                cape: users[userKey].cape
            };

            tmpTeam[userKey] = {
                user: tmpUser,
                equip: tmpEquip,

                ip: users[userKey].avgIp,
                battleId: battleId
            };
        }

        return tmpTeam;
    }

    async processEquipItems(Users, groupMember) {
        let tmpUsers = Users;
        let tmpGroupMember = groupMember;

        let { Id, Equipment, AverageItemPower, SupportHealingDone } = tmpGroupMember;
        Id = `${Id}`;
        //console.dir(groupMember, { depth: 3 });

        if (Id == undefined)
            return tmpUsers;

        if (tmpUsers[Id] == undefined) {
            tmpUsers[Id] = {};
        }


        if (AverageItemPower != 0 && AverageItemPower != NaN && AverageItemPower != undefined) {
            if (!('avgIp' in tmpUsers[Id]))
                tmpUsers[Id]['avgIp'] = parseInt(AverageItemPower);
        }

        if (SupportHealingDone != 0 && SupportHealingDone != NaN && SupportHealingDone != undefined) {
            try {
                if (!('heal' in tmpUsers[Id]))
                    tmpUsers[Id]['heal'] = parseInt(SupportHealingDone);
            } catch (err) {
                console.log('에러 발생');
                console.log(tmpUsers[Id]);
            }
        }

        // add Equipments

        const { MainHand, OffHand, Head, Armor, Shoes, Cape } = Equipment;

        if (MainHand != null) {
            tmpUsers[Id]['mainHand'] = Type2Index(MainHand);
        }

        if (OffHand != null) {
            tmpUsers[Id]['offHand'] = Type2Index(OffHand);
        }

        if (Head != null) {
            tmpUsers[Id]['head'] = Type2Index(Head);
        }

        if (Armor != null) {
            tmpUsers[Id]['armor'] = Type2Index(Armor);
        }

        if (Shoes != null) {
            tmpUsers[Id]['shoes'] = Type2Index(Shoes);
        }

        if (Cape != null) {
            tmpUsers[Id]['cape'] = Type2Index(Cape);
        }

        return tmpUsers;
    }

    async processHellgate(id, totalKills, players) {
        // process user
        let Users = {};

        //console.log(players);

        const keys = Object.keys(players);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            //console.log(`key : ${key}, value : ${players[key]}`);
            const { name, guildName, allianceName, id, killFame, kills, deaths } = players[key];

            /*
            console.log(`
            name : ${name}
            guildName : ${guildName}
            allianceName : ${allianceName}
            id : ${id}`);
			*/

            const user = {
                name: name,
                guildName: guildName,
                allianceName: allianceName,
                userId: id
            };

            Users[user.userId] = user;

            //console.log(user.name, user.guildName, user.allianceName, user.battleId);
        }

        /*
        console.log(Object.keys(Users), Object.keys(Users).length);
        for (var i = 0, key = Object.keys(Users); i < Object.keys(Users).length; i++) {
            console.log(Users[key[i]]);
        }
        */

        // 이벤트 기록들을 불러온다.
        const urlEvent = `https://gameinfo.albiononline.com/api/gameinfo/events/battle/${id}?offset=0&limit=${totalKills}`;
        const events = await this.getDataFromUrl(urlEvent);
        //console.log(events);

        // A팀 B팀 할당
        let teamA = { count: 0 };
        let teamB = { count: 0 };

        // 최종 승리팀, 패배팀 할당
        let victory = {};
        let defeat = {};

        let battleId = 0;

        let checkgroupMember = false;

        // KillArea : 'OPEN_WORLD'
        // groupMemberCount : 4
        for (const event of events) {
            const { groupMemberCount, KillArea, BattleId, Killer, Victim, Participants, GroupMembers } = event;


            if (KillArea != 'OPEN_WORLD') return { victory: null, defeat: null, ret: -1 };
            if (groupMemberCount == 5 || groupMemberCount == 10) checkgroupMember = true;

            battleId = BattleId;

            // Init. teamA
            //console.log(Object.keys(teamA).length);
            if (Object.keys(teamA).length === 1) {
                // insert Group Members.
                for (const groupMember of GroupMembers) {
                    const { Id, Name } = groupMember;

                    if (!(Id in teamA))
                        teamA[Id] = Name;
                    //console.log(Users);
                }
                // Users에서 teamA가 아니라면 teamB이다. teamA의 여집합 = teamB
                {
                    const keys = Object.keys(Users);
                    for (var i = 0; i < keys.length; i++) {
                        var key = keys[i];

                        if (!(key in teamA)) {
                            teamB[key] = Users[key].name;
                        }
                    }
                }
            }

            // Loop
            for (const groupMember of GroupMembers) {
                Users = await this.processEquipItems(Users, groupMember);
            }

            // killer
            {
                Users = await this.processEquipItems(Users, Killer);
                const { AverageItemPower } = Killer;
                if (AverageItemPower != 0 && (AverageItemPower < this.minIp || AverageItemPower > this.maxIp))
                    return { victory: null, defeat: null, ret: -1 };
            }

            // Victim
            {
                Users = await this.processEquipItems(Users, Victim);

                // avg가 0일 경우 버그성 사망.
                const { AverageItemPower } = Victim;
                if (AverageItemPower != 0) {
                    if (Victim.Id in teamB)
                        teamB.count = teamB.count + 1;
                    else teamA.count = teamA.count + 1;
                }
                if (AverageItemPower != 0 && (AverageItemPower < this.minIp || AverageItemPower > this.maxIp))
                    return { victory: null, defeat: null, ret: -1 };
            }

            // part
            {
                for (const part of Participants) {

                    const { AverageItemPower } = part;
                    if (AverageItemPower != 0 && (AverageItemPower < this.minIp || AverageItemPower > this.maxIp))
                        return { victory: null, defeat: null, ret: -1 };

                    Users = await this.processEquipItems(Users, part);
                }
            }

        }

        // 힐 유저 체크 ( 2명 이상 )
        let checkHealer = 0;
        const userKey = Object.keys(Users);
        for (var i = 0; i < userKey.length; i++) {
            var key = userKey[i];
            if ('heal' in Users[key])
                checkHealer++;
        }
        //console.dir(Users, { depth: 3 });
        if (checkHealer < 1) return { victory: null, defeat: null, ret: -1 };

        //console.log(Users);


        /*
        console.log(`https://albionbattles.com/battles/${battleId}
        count : ${Object.keys(players).length}
        `);
        */

        // Winner : teamA
        //console.log(`teamA count : ${teamA.count} | ${Object.keys(teamA).length}, teamB count : ${teamB.count} | ${Object.keys(teamB).length}`);
        if (teamB.count == (Object.keys(teamB).length - 1)) {
            delete teamB.count;
            delete teamA.count;

            //console.log('Winner : teamA');
            //console.dir(teamA, { depth: 3 });
            ///console.dir(teamB, { depth: 3 });
            //console.dir(Users, { depth: 3 });

            victory = await this.processUsersToTeam(Users, teamA, battleId);
            defeat = await this.processUsersToTeam(Users, teamB, battleId);
        } else {
            delete teamB.count;
            delete teamA.count;

            //console.log('Winner : teamB');
            //console.dir(teamA, { depth: 3 });
            //console.dir(teamB, { depth: 3 });
            //console.dir(Users, { depth: 3 });

            victory = await this.processUsersToTeam(Users, teamB, battleId);
            defeat = await this.processUsersToTeam(Users, teamA, battleId);
        }

        //console.dir(victory, { depth: 3 });
        //console.dir(defeat, { depth: 3 });


        //console.log(checkgroupMember);
        if (checkgroupMember == false) {
            return { victory: null, defeat: null, ret: -1 };
        }
        return { victory: victory, defeat: defeat, ret: 0 };
    }



    async processKillboard(recentKillboard) {
        const { totalKills, totalFame, id, startTime, players } = recentKillboard;

        const totalPlayers = array2count(players);

        /*
        console.log(`
        totalKills: $ { totalKills }
        totalFame: $ { totalFame }
        battleId: $ { id }
        startTime: $ { startTime }
        players count: $ { array2count(players) }
        `);
        */

        let teamVictory = {};
        let teamDefeat = {};
        let find = false;
        let matchType = 0;

        // == test 1
        // is 5v5 hellgate?
        if (totalPlayers == 10 && totalKills >= 5 && totalKills < 10) {
            // its 5v5 hellgate.
            let { victory, defeat, ret } = await this.processHellgate(id, totalKills, players);

            if (ret == 0) {
                teamVictory = victory;
                teamDefeat = defeat;
                find = true;
                matchType = 5;
            }
        }

        // is 10v10 hellgate?
        if (totalPlayers == 20 && totalKills >= 10 && totalKills < 20) {
            let { victory, defeat, ret } = await this.processHellgate(id, totalKills, players);

            if (ret == 0) {
                teamVictory = victory;
                teamDefeat = defeat;
                find = true;
                matchType = 10;
            }
        }

        if (find == false)
            return;

        /*
        console.log(`---------------`);
        console.log(`승리팀`);
        console.dir(teamVictory, { depth: 3 });
        console.log(`패배팀`);
        console.dir(teamDefeat, { depth: 3 });
        console.log(`---------------`);
        */
        // 날짜, 총페임 추가
        let battleLog = { battleId: id, startTime: startTime, totalKills: totalKills, totalFame: totalFame, matchType: matchType }

        // DB에 데이터를 넣어야 한다.
        await this.processDb(battleLog, teamVictory, true, matchType);
        await this.processDb(battleLog, teamDefeat, false, matchType);

        console.log(id);
    }

    async main(i) {
        const index = i;
        try {
            let urlKillboard = `https://gameinfo.albiononline.com/api/gameinfo/battles?offset=${index==0?0:index*50}&limit=50&sort=recent`;
            //console.log(index);
            let recentKillboards = await this.getDataFromUrl(urlKillboard);

            for (const recentKillboard of recentKillboards) {
                await this.processKillboard(recentKillboard);
            }
        } catch (err) {
            console.error(err);
        }
    }

    async start(start, end) {
        // 1. api로 부터 데이터를 얻어온다.
        for (var i = start; i < end; i++) { // 최대 0 ~ 10000 = 0 ~ 200
            await this.main(i);
        }
    }
}


module.exports = Crawl;