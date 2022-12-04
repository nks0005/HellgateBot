// zvz Meta Viewer

const axios = require('axios');
const crypto = require('crypto');
const jsonItems = require('./items.json');

const findIndex2Kr = (index) => {

    for (const item of jsonItems) {
        if (index == item['Index']) {
            let ret = item['LocalizedNames']['KO-KR'];
            ret = ret.replace('장로의 ', '');

            return ret;
        }
    }
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
class ZvzMetaViewer {
    constructor() {
        const shotCaller = [];
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

    async processLog2User(Log, Users) {
        let tmpUsers = Users;

        //console.log(Log);
        const { Equipment, Name, Id, GuildName, AllianceName } = Log;

        //console.log(Name, Id, GuildName, AllianceName);
        //console.log(Equipment.MainHand.Type);

        if (Equipment.MainHand != null)
            if (Id in Users) {
                Users[Id].mainHand = Type2Index(Equipment.MainHand);
                Users[Id].ally = AllianceName;
                Users[Id].userId = Id;
            }

        return tmpUsers;
    }

    printParty(party, users) {

        const fullPartyKeys = Object.keys(party);
        for (var j = 0; j < fullPartyKeys.length; j++) {
            console.log(`=== party ===`);
            const members = party[fullPartyKeys[j]];
            for (const member of members) {
                // console.log(member);
                console.log(users[member].name);
            }
        }
    }

    async processParty(party, groupMembers) {
        let tmpParty = party;

        let members = [];
        for (const group of groupMembers) {
            const { Id, GuildName, AllianceName } = group;
            members.push(Id);
        }

        //  console.log(members);

        let hash = 0;
        for (const member of members) {
            const hashMember = crypto.createHash('sha256').update(member).digest('hex');

            //console.log(parseInt(hashMember, 16));
            hash += parseInt(hashMember, 16);
        }
        hash = crypto.createHash('sha256').update(hash.toString(16)).digest('hex');

        tmpParty[hash] = members;
        return tmpParty;

    }

    async start(battleId, guild = null, ally = null) {
        const id = parseInt(battleId);

        const urlKillboard = `https://gameinfo.albiononline.com/api/gameinfo/battles/${id}`;

        const killboard = await this.getDataFromUrl(urlKillboard);

        const { totalKills, players } = killboard;
        let Users = {};

        let fullParty = {};
        let boomParty = {};

        const playerKeys = Object.keys(players);
        for (var i = 0; i < playerKeys.length; i++) {
            const playerKey = playerKeys[i];

            const { name, id, guildName, allianceName } = players[playerKey];

            if ((guild != null && guildName.toLowerCase() == guild.toLowerCase()) || (ally != null && allianceName.toLowerCase() == ally.toLowerCase())) {
                Users[id] = { name: name, guild: guildName, ally: allianceName };
            }
        }

        // console.dir(Users, { depth: 3 });

        // into Event
        const countKills = parseInt(totalKills);
        // console.log(countKills);
        for (var i = 0; i < ((countKills / 50) + 1); i++) {
            const urlEventLog = `https://gameinfo.albiononline.com/api/gameinfo/events/battle/${id}?offset=${i==0?0:i*50}&limit=50`
            const eventLogs = await this.getDataFromUrl(urlEventLog);

            // console.dir(eventLog, { depth: 3 });

            // make User Info
            for (const eventLog of eventLogs) {
                const { Killer, Victim, Participants, GroupMembers } = eventLog;

                // Killer
                Users = await this.processLog2User(Killer, Users);

                // Victim
                Users = await this.processLog2User(Victim, Users);

                // Part
                for (const part of Participants) {
                    Users = await this.processLog2User(part, Users);
                }

                // Group
                for (const group of GroupMembers) {
                    Users = await this.processLog2User(group, Users);
                }

                // make Party

                const { GuildName, AllianceName } = Killer;
                if ((guild != null && GuildName.toLowerCase() == guild.toLowerCase()) || (ally != null && AllianceName.toLowerCase() == ally.toLowerCase())) {
                    const groupMembersKeys = Object.keys(GroupMembers);
                    if (groupMembersKeys.length == 20) {
                        // fullParty
                        fullParty = await this.processParty(fullParty, GroupMembers);
                    } else if (groupMembersKeys.length < 10) {
                        boomParty = await this.processParty(boomParty, GroupMembers);
                    }
                }

            }
        }

        // console.dir(Users, { depth: 3 });
        //console.log('full party');
        //console.dir(fullParty, { depth: 3 });

        //console.log('boom party');
        //console.dir(boomParty, { depth: 3 });

        /*
        console.log(Object.keys(fullParty).length);
        console.log(Object.keys(boomParty).length);

        console.log(`=== full Party ===`);
        this.printParty(fullParty, Users);
        console.log(`=== end ===`);

        console.log(`=== boom party ===`);
        this.printParty(boomParty, Users);
        console.log(`=== end ===`);
        */

        // console.dir(Users, { depth: 3 });

        let Weapons = {};

        {
            const usersKeys = Object.keys(Users);
            for (var i = 0; i < usersKeys.length; i++) {
                const usersKey = usersKeys[i];

                const tmpUser = Users[usersKey];
                if (!(tmpUser.mainHand in Weapons)) {
                    Weapons[tmpUser.mainHand] = { count: 0 };
                }

                Weapons[tmpUser.mainHand].count = Weapons[tmpUser.mainHand].count + 1;
            }
        }


        const tankDomain = [6789, 6487, 6689, 6668, 5458];
        let tankList = {};

        const supportDomain = [5498, 5034, 5337, 5074, 5418, 5438, 5398, 6628, 6809, 6749, 6527, 6709, 5478, 6648];
        let supportList = {};

        const healDomain = [5720, 5760, 5780, 5619, 5659];
        let healList = {};

        let dealList = {};

        let msg = ``;

        {
            msg += `\`\`\`md\n== 킬보드 : ${battleId} 검색 : ${guild} / ${ally} ==\n`;
            msg += '=======================\n';

            let maxCount = 0;
            const weaponsKeys = Object.keys(Weapons);
            for (var i = 0; i < weaponsKeys.length; i++) {
                const weaponsKey = weaponsKeys[i];
                const weaponCount = Weapons[weaponsKey].count;
                const intWeaponKey = parseInt(weaponsKey);

                if (tankDomain.includes(intWeaponKey)) {
                    // tank
                    if (!(weaponsKey in tankList)) {
                        tankList[weaponsKey] = { count: weaponCount };
                    }
                } else if (supportDomain.includes(intWeaponKey)) {
                    // support
                    if (!(weaponsKey in supportList)) {
                        supportList[weaponsKey] = { count: weaponCount };
                    }
                } else if (healDomain.includes(intWeaponKey)) {
                    // heal
                    if (!(weaponsKey in healList)) {
                        healList[weaponsKey] = { count: weaponCount };
                    }
                } else {
                    // deal
                    if (!(weaponsKey in dealList)) {
                        dealList[weaponsKey] = { count: weaponCount };
                    }
                }

                maxCount = maxCount + weaponCount;
            }
            msg += `== 총 인원 : ${maxCount} == \n`

            const printList = (list, prefix) => {
                let msg = ``;
                for (var i = 0, keys = Object.keys(list); i < keys.length; i++) {
                    const key = keys[i];
                    const count = list[key].count;

                    msg += `┣ ${findIndex2Kr(key)} (${count} 명)\n`;
                }

                return msg;
            }

            msg += `= 🛡️ 클랩 탱커 리스트 🛡️ =\n`;
            msg += printList(tankList);
            msg += `= 🌈 서포터 리스트 🌈 =\n`;
            msg += printList(supportList);
            msg += `= ❤️‍🩹 힐러 리스트 ❤️‍🩹=\n`;
            msg += printList(healList);
            msg += `= 🗡️ 딜러 리스트 🗡️ =\n`;
            msg += printList(dealList);
            msg += '=======================\`\`\`\n';
        }

        return msg;
    }
}


module.exports = ZvzMetaViewer;


/*
const test = new ZvzMetaViewer();


const arg1 = process.argv[2];
const arg2 = process.argv[3];
const arg3 = process.argv[4];

console.log(arg1, arg2, arg3);

let guild = null;
if (arg2 == 'null') guild = null;
else
    guild = process.argv[3].toLowerCase();
let ally = null;
if (arg3 == undefined)
    ally = null;
else
    ally = process.argv[4].toLowerCase();

const intId = process.argv[2];

//test.start(intId, guild, ally);


test.start(652216503, 'Negative Mind', null);

test.start(652216503, 'K-Bread', null);

test.start(652216503, 'Uncle mops dutyfree shop', null);

*/