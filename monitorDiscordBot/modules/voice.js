const { joinVoiceChannel } = require('@discordjs/voice');
const { BattleLog } = require('../models');
const { Op } = require('sequelize');

class Voice {
    constructor() {

    }

    async sleep(ms) {
        return new Promise(resolve => { setTimeout(resolve, ms) });
    }

    async start(client) {
        while (true) {
            const Client = client;
            try {
                // 채널 접속
                const connection = joinVoiceChannel({
                    channelId: "1041364056923185162",
                    guildId: "748345742158200832",
                    adapterCreator: client.guilds.cache.get("748345742158200832").voiceAdapterCreator
                });

                // 업데이트 채널
                let date = new Date();
                let filteredTime = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':' + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
                const strKrTime = `Updated : ${filteredTime} KR`;

                Client.guilds.cache.get("748345742158200832").channels.cache.get("1041364056923185162").setName(strKrTime).then(() => { console.log('업데이트 시간 갱신') }).catch((err) => { console.error(err) });
                console.log(strKrTime);

                // Match / 1hour 업데이트 채널



                const processMatch = async(channelId, type) => {
                    try {
                        const tmpDate = new Date();
                        const nowDate = new Date();
                        const startDate = tmpDate.setHours(tmpDate.getHours() - 1);


                        let count = await BattleLog.count({
                            where: {
                                matchType: type,
                                "startTime": {
                                    [Op.between]: [startDate, nowDate]
                                },
                            }
                        });
                        console.log(count);

                        if (count > 0) {
                            const msg = `[${type}:${type}] ${count}판 `;

                            Client.guilds.cache.get("748345742158200832").channels.cache.get(`${channelId}`).setName(msg).then(() => { console.log(`${type}:${type} 매치 갱신`) }).catch((err) => { console.error(err) });
                        } else {
                            const msg = `[${type}:${type}] 0판 `;
                            Client.guilds.cache.get("748345742158200832").channels.cache.get(`${channelId}`).setName(msg).then(() => { console.log(`${type}:${type} 매치 갱신`) }).catch((err) => { console.error(err) });
                        }
                    } catch (err) { console.error(err); }
                };
                //processMatch("1018762422879780864", 2);
                await processMatch("1043838002566271066", 5);
                //processMatch("1018762712584556575", 10);

                await this.sleep(10 * 60 * 1000); // 10분마다

                connection.destroy();
                await this.sleep(1000);
                /*
                 * 채널 업데이트는 10분당 2개의 요청만 가능하다.
                 * 일반 요청은 10분당 10,000개만 가능하다.
                 * https://stackoverflow.com/questions/62103163/how-often-can-i-rename-discord-channels-name
                 */
            } catch (err) {
                console.error(err);
            }
        }
    }

}


module.exports = Voice;