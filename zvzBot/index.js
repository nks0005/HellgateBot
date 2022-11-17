// zvz Meta Viewer

const axios = require('axios');
const crypto = require('crypto');

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
                Users[Id].mainHand = Equipment.MainHand.Type;
            }

        return tmpUsers;
    }

    async processParty(party, groupMembers) {
        let tmpParty = party;

        let members = [];
        for (const group of groupMembers) {
            const { Id } = group;
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

    async start(battleId) {
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

            const { name, id, allianceName } = players[playerKey];

            Users[id] = { name: name, ally: allianceName };
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
                const groupMembersKeys = Object.keys(GroupMembers);
                if (groupMembersKeys.length == 20) {
                    // fullParty
                    fullParty = await this.processParty(fullParty, GroupMembers);
                } else {
                    // boomParty
                    boomParty = await this.processParty(boomParty, GroupMembers);
                }
            }
        }

        // console.dir(Users, { depth: 3 });
        console.log('full party');
        console.dir(fullParty, { depth: 3 });

        console.log('boom party');
        console.dir(boomParty, { depth: 3 });


    }
}

const test = new ZvzMetaViewer();

test.start(642235067);