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

    

    async processUpload(data) {
        try {
            if (data.status == 201 && data.data != null) {
                const { crystal, type, logTime, battleId, EventLogs } = data.data;
                let hellgateEmbed = new EmbedBuilder();

                var date = new Date(logTime).getTime();
                // date += (18 * 60 * 60 * 1000);

                let match = '';
                if (crystal == 0) {
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

                for (const eventlog of EventLogs) {
                    const { PlayerLogs } = eventlog;

                    

                    let checkZeroIp = false;
                    //let offsetSupport = 2;
                    let arrMsg = [];

                    for (const playerlog of PlayerLogs) {
                        const { userName, killType, damage, heal, avgIp, mainHand } = playerlog;
                        const krMainHand = Util.findIndexKr(mainHand);
                        let offset = 0;

                        if (killType == 0) {
                            arrMsg[0] = `${userName}(${avgIp}, ${krMainHand})`;
                        } else if (killType == 1) {
                            if (avgIp == 0) checkZeroIp = true;
                            arrMsg[1] = `${userName}(${avgIp}, ${krMainHand})`;
                        } else if (killType == 2) {
                            //offset = offsetSupport++;
                            //arrMsg[offset] = `- ${userName}(${avgIp}, ${krMainHand})|damage:(${damage})\n`;
                        }
                    }
                    //let support = ``;
                    //for (var i = 2; i < offsetSupport; i++)
                    //    support += arrMsg[i];
                    //if (support == ``) support = `?`;

                    if (!checkZeroIp)
                        hellgateEmbed.addFields({ name: `🗡️${arrMsg[0]}`, value: `${arrMsg[1]}` });

                }


                // 데이터베이스에서 목적지를 찾는다.
                const channelData = await Channel.findAll({
                    where: {
                        crystal: crystal,
                        type: type
                    }
                });

                for (const ch of channelData) {
                    const { guildId, channelId } = ch;

                    this.client.guilds.cache.get(guildId).channels.cache.get(channelId).send({ embeds: [hellgateEmbed] });
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