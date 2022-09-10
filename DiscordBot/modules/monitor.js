const axios = require('axios');
const { Channel, sequelize } = require('../models/index.js');
const Util = require('./util.js').modules;
const { EmbedBuilder } = require("discord.js");

/**
 * 서버로 부터 데이터를 받아서
 * 킬보드로 올린다.
 */
class Monitor {
    constructor(timeCycle, client) {
        this.timeCycle = timeCycle;
        this.client = client;
    }

    async getDataUrl(matchType) {
        const { Field, Type } = matchType;
        const url = Util.getURL().HOME + Field + Type;

        const ret = await axios(url);
        return ret;
    }

    /**
     * 이벤트 로그를 통해 승리팀과 패배팀을 반환해준다.
     * 
     * ## 승리, 패배팀 구별 알고리즘
        1. init. 첫번째 Victim은 B팀. Killer와 Support는 A팀으로 정한다
        2. loop.
            1. 다음 Victim을 B팀인지 A팀인지 비교한다.
                1. A팀에 있다면 Killer와 Support를 B팀으로 정한다.
                2. B팀에 있다면 Killer와 Support를 A팀으로 정한다.
                3. 두 팀다 없다면 ( 간혹 안정해져 있을 때가 있음 )
                    1. Killer을 B팀인지 A팀인지 비교한다.
                        1. A팀이라면 Victim을 B팀으로, Support를 A팀으로 정한다.
                     2. B팀이라면 Victim을 A팀으로, Support를 B팀으로 정한다.
                        3. 두 팀다 없다면
                         1. Support들을 비교한다.
                            1. 한명이라도 A팀이라면 Killer와 Support를 A팀. Victim을 B팀으로
     * 
     * @param {json} eventlog 
     * @return {{partyA, partyB}} 
     */
    whoIsWin(EventLogs) {
        // Set 클래스를 이용하여 중복 닉네임이 들어가지 않도록 한다.
        // 닉네임_헬멧_무기_갑옷_신발
        let partyA = new Set();
        let partyB = new Set();

        let battleId = EventLogs[0]['battleId'];

        for (const eventlog of EventLogs) {
            let skipIp = false;
            const { memberCount, PlayerLogs } = eventlog;

            let victim = new Set();
            let killers = new Set();

            for (const playerlog of PlayerLogs) {
                const { userName, killType, avgIp, mainHand, offHand, head, armor, shoes, cape } = playerlog;

                if (avgIp == 0) {
                    continue;
                }
                const weapon = offHand != null ? `${mainHand}_${offHand}` : `${mainHand}`

                const mixedName = `${userName}_${weapon}_${head}_${armor}_${shoes}_${cape}_${avgIp}`;
                // Victim
                if (killType == 1) {
                    victim.add(mixedName);
                } else {
                    killers.add(mixedName);
                }
            }

            let arrVictim = [...victim];
            let arrKiller = [...killers];

            // init.
            if (partyA.size == 0 && partyB.size == 0) {
                partyB.add(arrVictim[0]);
                for (const killer of arrKiller) {
                    if (!partyB.has(killer))
                        partyA.add(killer);
                }
            }

            else {
                // Victim이 누구 팀인가?
                if (partyA.has(arrVictim[0])) {
                    // A팀 일 경우

                    // B팀에 킬러들을 넣으면 된다
                    for (const killer of arrKiller) {
                        if (!partyA.has(killer))
                            partyB.add(killer);
                    }
                }
                else if (partyB.has(arrVictim[0])) {
                    // B팀 일 경우

                    // A팀에 킬러들을 넣으면 된다
                    for (const killer of arrKiller) {
                        if (!partyB.has(killer))
                            partyA.add(killer);
                    }
                }
                else {
                    // A팀도, B팀도 아닐 경우

                    // killer 들을 비교한다
                    let isPartyA = false;
                    let isPartyB = false;
                    for (const killer of arrKiller) {
                        if (partyA.has(killer)) {
                            isPartyA = true;
                        }
                        if (partyB.has(killer)) {
                            isPartyB = true;
                        }
                    }

                    if ((isPartyA == false && isPartyB == false) || (isPartyA == true && isPartyB == true)) {
                        // 두 파티에 있거나 없을 경우 버그. 스킵한다.
                        continue;
                    }
                    else if (isPartyA) {
                        // 킬러가 A팀이라면 죽은자는 B팀
                        partyB.add(arrVictim[0]);

                        for (const killer of arrKiller) {
                            if (!partyB.has(killer))
                                partyA.add(killer);
                        }

                    } else if (isPartyB) {
                        // 킬러가 B팀이라면 죽은자는 A팀
                        partyA.add(arrVictim[0]);

                        for (const killer of arrKiller) {
                            if (!partyA.has(killer))
                                partyB.add(killer);
                        }
                    }
                }
            }
        }

        let finalPartyA = new Set();
        let finalPartyB = new Set();

        for (const member of partyA) {
            if (member != null) finalPartyA.add(member);
        }

        for (const member of partyB) {
            if (member != null) finalPartyB.add(member);
        }


        return { partyA: finalPartyA, partyB: finalPartyB };
    }


    processMember(member) {
        let { userName, mainHand, offHand, head, armor, shoes, cape, avgIp } = this.processSplitString(member);

        mainHand = Util.findIndexKr(mainHand).replace(' ', '');
        offHand = Util.findIndexKr(offHand).replace(' ', '');
        head = Util.findIndexKr(head).replace(' ', '');
        armor = Util.findIndexKr(armor).replace(' ', '');
        shoes = Util.findIndexKr(shoes).replace(' ', '');
        cape = Util.findIndexKr(cape).replace(' ', '').replace('망토', '');

        return { userName, mainHand, offHand, head, armor, shoes, cape, avgIp };
    }

    /**
     * 합쳐진 문자열을 분해하고, 각 인덱스에 맞춰 배열한다.
     * 
     * @param {string} mixedName 
     */
    processSplitString(mixedName) {
        let userName, mainHand, offHand = '', head, armor, shoes, cape, avgIp;


        const splited = mixedName.split('_');

        // 보조 무기가 없을 경우
        if (splited.length == 7) {
            userName = splited[0];
            mainHand = splited[1];
            head = splited[2];
            armor = splited[3];
            shoes = splited[4];
            cape = splited[5];
            avgIp = splited[6];
        }
        else if (splited.length == 8) {
            userName = splited[0];
            mainHand = splited[1];
            offHand = splited[2];
            head = splited[3];
            armor = splited[4];
            shoes = splited[5];
            cape = splited[6];
            avgIp = splited[7];
        }
        else {
            console.log(`이상한 값 : ${mixedName}`);
            return null;
        }


        return { userName, mainHand, offHand, head, armor, shoes, cape, avgIp };
    }

    /**
     * A, B파티를 받아서 목적에 맞는 알람을 출력한다.
     * 
     * role, ID
     * (1) 995137308732960778 : 높은 IP 
     * (2) 995632668974788659 : 대자연 ( 애니그마틱 + )
     * (3) 995632741108432896 : 그레일시커, 단검 ( 토단 )
     * (4) 995635540613398538 : 오스키퍼 2개
     * (5) 1017763696145084426 : 심판관부츠 + 조각용소드
     * (6) 1017763872108728341 : 가디언 헬멧
     * (7) 1017763962483380225
     * (8) 1017770650275938334
     * (9) 1017770723047116860
     * @param {party} partyA 
     * @param {party} partyB 
     */
    processAlarm(partyA, partyB) {
        let flag_1, flag_2, flag_3_1, flag_3_2, flag_4, flag_5_1, flag_5_2, flag_6, flag_7, flag_8, flag_9 = false;

        const checkIp = (avgIp) => {
            if (avgIp > 1410) return true;
            return false;
        };

        const checkDejayun = (mainHand) => {
            if (mainHand.includes('에니그마틱'))
                return true;
            return false;
        };

        const checkTodan_1 = (mainHand) => {
            if (mainHand.includes('그레일시커'))
                return true;
            return false;
        };
        const checkTodan_2 = (mainHand) => {
            if (mainHand.includes('대거'))
                return true;
            return false;
        };

        const checkOskiper = (mainHand) => {
            if (mainHand.includes('오스키퍼'))
                return true;
            return false;
        }

        const checkDiver_1 = (mainHand) => {
            if (mainHand.includes('조각용소드'))
                return true;
            return false;
        }
        const checkDiver_2 = (shoes) => {
            if (shoes.includes('심판관부츠'))
                return true;
            return false;
        }

        const checkGaudian = (shoes) => {
            if (shoes.includes('가디언헬멧'))
                return true;
            return false;
        }

        for (const member of partyA) {
            const { userName, mainHand, offHand, head, armor, shoes, cape, avgIp } = this.processMember(member);

            flag_1 = checkIp(avgIp);
            flag_2 = checkDejayun(mainHand);
            flag_3_1 = checkTodan_1(mainHand);
            flag_3_2 = checkTodan_2(mainHand);
            flag_4 = checkOskiper(mainHand);
            flag_5_1 = checkDiver_1(mainHand);
            flag_5_2 = checkDiver_2(shoes);
            flag_6 = checkGaudian(head);

        }

        for (const member of partyB) {
            const { userName, mainHand, offHand, head, armor, shoes, cape, avgIp } = this.processMember(member);

            flag_1 = checkIp(avgIp);
            flag_2 = checkDejayun(mainHand);
            flag_3_1 = checkTodan_1(mainHand);
            flag_3_2 = checkTodan_2(mainHand);
            flag_4 = checkOskiper(mainHand);
            flag_5_1 = checkDiver_1(mainHand);
            flag_5_2 = checkDiver_2(shoes);
            flag_6 = checkGaudian(head);
        }

        let alarmMsg = ``;
        if (flag_1) alarmMsg += `높은 IP 유저가 있습니다.<@&995137308732960778>\n`;
        if (flag_2) alarmMsg += `대자연 유저가 있습니다.<@&995632668974788659>\n`;
        if (flag_3_1 && flag_3_2) alarmMsg += `토단 유저가 있습니다.<@&995632741108432896>\n`;
        if (flag_4) alarmMsg += `오스키퍼 유저가 있습니다.<@&995635540613398538>\n`;
        if (flag_5_1 && flag_5_2) alarmMsg += `심판관 다이브가 있습니다.<@&1017763696145084426>\n`;
        if (flag_6) alarmMsg += `가디언 헬멧 유저가 있습니다.<@&1017763872108728341>\n`

        return alarmMsg;
    }

    async processUpload(data) {
        try {
            if (data.status == 201 && data.data != null) {
                const { crystal, type, logTime, battleId, EventLogs } = data.data;
                let hellgateEmbed = new EmbedBuilder();

                var date = new Date(logTime).getTime();
                // date += (18 * 60 * 60 * 1000);

                let match = '';
                if (crystal == 1) {
                    if (type == 1) {
                        match = "5v5 crystal";
                    } else if (type == 3) {
                        match = "20v20 crystal";
                    }
                } else {
                    if (type == 0) match = "2v2 hellgate";
                    else if (type == 1) match = "5v5 hellgate";
                    else if (type == 2) match = "10v10 hellgate";
                }


                hellgateEmbed.setColor('#0099ff')
                    .setTitle(`https://albionbattles.com/battles/${battleId}`)
                    .setURL(`https://albionbattles.com/battles/${battleId}`)
                    .setAuthor({ name: `Find! ${match} killboard`, url: `https://albionbattles.com/battles/${battleId}` })
                    .setTimestamp(date)
                    .setFooter({ text: '한국 시간 : ' });

                const { partyA, partyB } = this.whoIsWin(EventLogs);
                let arrMsgPartyA = ``;
                let arrMsgPartyB = ``;

                // A팀 부터 작업
                for (const member of partyA) {
                    const { userName, mainHand, offHand, head, armor, shoes, cape, avgIp } = this.processMember(member);

                    //console.log(userName, mainHand, offHand, head, armor, shoes, cape);
                    arrMsgPartyA += `[${mainHand}] ${userName} (${avgIp})\n${(offHand == '' ? '' : ` ${offHand}`)} ${head} ${armor} ${shoes} ${cape}\n\n`;
                }
                hellgateEmbed.addFields({ name: `🗡️Winner Team`, value: arrMsgPartyA });

                // B팀 작업
                for (const member of partyB) {
                    const { userName, mainHand, offHand, head, armor, shoes, cape, avgIp } = this.processMember(member);

                    //console.log(userName, mainHand, offHand, head, armor, shoes, cape);
                    arrMsgPartyB += `[${mainHand}] ${userName} (${avgIp})\n${(offHand == '' ? '' : ` ${offHand}`)} ${head} ${armor} ${shoes} ${cape}\n\n`;
                }
                hellgateEmbed.addFields({ name: `☠️Loser Team`, value: arrMsgPartyB });


                // 알람 필터링
                alarmMsg = this.processAlarm(partyA, partyB);

                // 데이터베이스에서 목적지를 찾는다.
                const channelData = await Channel.findAll({
                    where: {
                        crystal: crystal,
                        type: type
                    }
                });

                for (const ch of channelData) {
                    const { guildId, channelId } = ch;

                    console.log(`${match} 전송 완료 `);
                    this.client.guilds.cache.get(guildId).channels.cache.get(channelId).send({ embeds: [hellgateEmbed] });
                    this.client.guilds.cache.get(guildId).channels.cache.get(channelId).send(alarmMsg);
                }
            }
        } catch (err) {
            console.error(err);
        }
    }

    async update() {
        let data = '';

        // 2v2 헬게이트
        await this.processUpload(await this.getDataUrl({ Field: Util.getURL().HELLGATE, Type: Util.getURL().DOUBLE }));

        // 5v5 헬게이트
        await this.processUpload(await this.getDataUrl({ Field: Util.getURL().HELLGATE, Type: Util.getURL().FIVE }));

        // 10v10 헬게이트
        await this.processUpload(await this.getDataUrl({ Field: Util.getURL().HELLGATE, Type: Util.getURL().TEN }));

        // 5v5 크리스탈
        await this.processUpload(await this.getDataUrl({ Field: Util.getURL().CRYSTAL, Type: Util.getURL().FIVE }));

        // 20v20 크리스탈
        await this.processUpload(await this.getDataUrl({ Field: Util.getURL().CRYSTAL, Type: Util.getURL().TWENTY }));

    }

    async updateCycle() {
        while (true) {
            try {
                await Util.sleep(this.timeCycle);

                await this.update();
            } catch (err) {
                console.error(err);

            }
        }
    }

}

exports.modules = Monitor;