const { User, WinTeam, Gear, LoseTeam, Discord, BattleLog } = require('../models');
const { hasHook } = require('../models/battlelog');
const jsonItems = require('./items.json');
const { EmbedBuilder } = require("discord.js");

const findIndex2Kr = (index) => {

    for (const item of jsonItems) {
        if (index == item['Index']) {
            let ret = item['LocalizedNames']['KO-KR'];
            ret = ret.replace('장로의 ', '');

            return ret;
        }
    }
}



class Monitor {
    constructor(timecycle) {
        this.timeCycle = timecycle;
    }

    async sleep(ms) {
        return new Promise(resolve => { setTimeout(resolve, ms) });
    }

    async processTeam(members) {
        let msg = ``;
        for (const member of members) {
            const { ip, userId, equipId } = member;

            const user = await User.findOne({ where: { id: userId } });
            const { name, guild, ally } = user;

            const gear = await Gear.findOne({ where: { id: equipId } });
            let { mainHand, offHand, head, armor, shoes, cape } = gear;

            mainHand = `${findIndex2Kr(mainHand)}`.replace(' ', '');
            offHand = `${findIndex2Kr(offHand)}`.replace(' ', '');
            head = `${findIndex2Kr(head)}`.replace(' ', '');
            armor = `${findIndex2Kr(armor)}`.replace(' ', '');
            shoes = `${ findIndex2Kr(shoes)}`.replace(' ', '');
            cape = `${findIndex2Kr(cape)}`.replace(' ', '');

            msg += `[${mainHand}] ${name} (${ip})\n${(offHand=='undefined'?'':offHand+' ')}${head=='undefined'?'':head} ${armor=='undefined'?'':armor} ${shoes=='undefined'?'':shoes} ${cape=='undefined'?'':cape}\n\n`;
        }

        return msg;
    }

    async processPrintChannel(battleLog, channel) {
        const { battleId, startTime, totalFame } = battleLog;
        try {

            // battleLog의 승리자, 패배자 정보들을 얻어온다

            const victoryMembers = await WinTeam.findAll({ where: { battleId: battleId } });
            const defeatMembers = await LoseTeam.findAll({ where: { battleId: battleId } });



            let hellgateEmbed = new EmbedBuilder();

            let date = new Date(startTime);

            const color = date.getTime() % 0xffffff;
            console.log(color.toString(16));

            hellgateEmbed.setColor(`${color.toString(16)}`)
                .setTitle(`https://albionbattles.com/battles/${battleId}`)
                .setURL(`https://albionbattles.com/battles/${battleId}`)
                .setAuthor({ name: `Find 5v5 hellgate  [ UTC Time :  ${date.toISOString().replace(/T/, ' ').replace(/\..+/, '')} ]`, url: `https://albionbattles.com/battles/${battleId}` })
                .setTimestamp(date.getTime())
                .setFooter({ text: '한국 시간 : ' });


            hellgateEmbed.addFields({ name: `🗡️Victory Team`, value: await this.processTeam(victoryMembers) });

            hellgateEmbed.addFields({ name: `☠️Defeat Team`, value: await this.processTeam(defeatMembers) });

            await channel.send({ embeds: [hellgateEmbed] });

            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    }
    compareLogs(battleLog, discordLogs) {
        if (discordLogs == null) return false;

        for (const discordLog of discordLogs) {
            if (battleLog.battleId == discordLog.battleId) return true;
        }

        return false;
    }
    async processMonitoringHellgate(channel, matchType) {
        // BattleLogs 기록들을 얻어온다
        const battleLogs = await BattleLog.findAll({
            where: {
                matchType: matchType
            }
        });

        // 디스코드 기록들을 얻어온다
        const discordLogs = await Discord.findAll({
            order: [
                ['battleId', 'DESC']
            ],
        });

        for (const battleLog of battleLogs) {
            const logCheck = this.compareLogs(battleLog, discordLogs);

            if (logCheck == true)
                continue;

            // 모니터링 출력 진행
            const ret = await this.processPrintChannel(battleLog, channel);

            if (ret == true)
                await Discord.create({ battleId: battleLog.battleId });
        }
    }

    async start55(channel55, channel1010) {
        while (true) {
            await this.processMonitoringHellgate(channel55, 5);
            await this.processMonitoringHellgate(channel1010, 10);

            await this.sleep(this.timeCycle);
        }
    }
}


module.exports = Monitor;