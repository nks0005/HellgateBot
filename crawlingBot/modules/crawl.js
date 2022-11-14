const axios = require('axios');
const { ReactionUserManager } = require('discord.js');
const jsonItems = require('./items.json');

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

            return ret;
        }
    }
}

const Type2Index = (Type) => {
    if (Type == null) return Type;

    Type = Type['Type'];

    const item = filterItem(`${Type}`);
    const index = parseInt(findItemIndex(`${item}`));

    return index;
}

class Crawl {
    constructor() {

    }


    async getDataFromUrl(url) {
        const res = await axios(url);

        if (res.status != 200 || res.data == null) {
            console.log(`${url}로 부터 데이터를 정상적으로 얻지 못했습니다. 10초 뒤 다시 시도합니다.`);

            await sleep(10000);
            return this.getDataFromUrl(url);
        }

        return res.data;
    }

    async processEquipItems(Users, groupMember) {
        let tmpUsers = Users;
        let tmpGroupMember = groupMember;

        let { Id, Equipment, AverageItemPower } = tmpGroupMember;
        Id = `${Id}`;
        //console.dir(groupMember, { depth: 3 });

        if (Id == undefined)
            return tmpUsers;
        if (AverageItemPower != 0 && AverageItemPower != NaN && AverageItemPower != undefined) {
            if (!('avgIp' in tmpUsers[Id]))
                tmpUsers[Id]['avgIp'] = parseInt(AverageItemPower);
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
            tmpUsers[Id]['armor'] = Type2Index(Shoes);
        }

        if (Cape != null) {
            tmpUsers[Id]['Cape'] = Type2Index(Cape);
        }

        return tmpUsers;
    }

    async process55Hellgate(id, totalKills, players) {
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

        // KillArea : 'OPEN_WORLD'
        // groupMemberCount : 4
        for (const event of events) {
            const { groupMemberCount, KillArea, BattleId, Killer, Victim, Participants, GroupMembers } = event;

            if (KillArea != 'OPEN_WORLD') return;
            if (!(groupMemberCount == 5 || groupMemberCount == 10)) return;

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

                        if (!(key in teamA))
                            teamB[key] = Users[key].name;
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
            }

            // Victim
            {
                Users = await this.processEquipItems(Users, Victim);

                // avg가 0일 경우 버그성 사망.
                const { AverageItemPower } = Victim;
                if (AverageItemPower != 0)
                    teamB.count = teamB.count + 1;
            }

            // part
            {
                for (const part of Participants) {
                    Users = await this.processEquipItems(Users, part);
                }
            }

        }

        console.log(Users);
        console.dir(teamA, { deapth: 3 });
        console.dir(teamB, { deapth: 3 });
        console.log(`https://albionbattles.com/battles/${battleId}`);

        //console.log(Users);
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

        // == test 1
        // is 5v5 hellgate?
        if (totalPlayers == 10 && totalKills >= 5 && totalKills < 10) {
            // its 5v5 hellgate.
            await this.process55Hellgate(id, totalKills, players);

        }
    }

    async start() {
        // 1. api로 부터 데이터를 얻어온다.
        const urlKillboard = `
        https://gameinfo.albiononline.com/api/gameinfo/battles?offset=0&limit=50&sort=recent`;
        const recentKillboards = await this.getDataFromUrl(urlKillboard);

        for (const recentKillboard of recentKillboards) {
            await this.processKillboard(recentKillboard);
        }

    }
}

const crawl = new Crawl();

crawl.start();