const { Client, GatewayIntentBits } = require('discord.js');
const { token, wanthealcomeId } = require('./config/discord_config.json');
const { joinVoiceChannel } = require('@discordjs/voice');
const Util = require('./modules/util.js').modules;



const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', () => {
    console.log('Ready!');


    const test = async(client) => {
        const Client = client;

        const date = new Date().getMilliseconds();

        Client.guilds.cache.get("748345742158200832").channels.cache.get("1018762422879780864").setName(`2v2-hg ${date}`).then(() => { console.log('성공') }).catch((err) => { console.error('에러') });
        Client.guilds.cache.get("748345742158200832").channels.cache.get("1018762614299430922").setName(`5v5-hg ${date}`).then(() => { console.log('성공') }).catch((err) => { console.error('에러') });
        Client.guilds.cache.get("748345742158200832").channels.cache.get("1018762712584556575").setName(`10v10-hg ${date}`).then(() => { console.log('성공') }).catch((err) => { console.error('에러') });
    }
    test(client);

    /*

        // 채널명을 바꾸는 명령어
        //client.guilds.get("748345742158200832").channels.get("1017509122729574511").setName(' Update Time');
        //client.guilds.cache.get(748345742158200832).channels.cache.get("1017509122729574511").join().then(connection => { console.log('성공') }).catch(e => { console.error(`실패\n${e}`) });

        const connection = joinVoiceChannel({
            channelId: "1017509122729574511",
            guildId: "748345742158200832",
            adapterCreator: client.guilds.cache.get("748345742158200832").voiceAdapterCreator
        });

        const err = async(client) => {
            while (true) {
                const Client = client;
                try {

                    var date = new Date();
                    let filteredTime = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':' + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
                    const strKrTime = `Updated : ${filteredTime} KR`;

                    Client.guilds.cache.get("748345742158200832").channels.cache.get("1017509122729574511").setName(strKrTime).then(() => { console.log('성공') }).catch((err) => { console.error('에러') });
                    console.log(strKrTime);
                    await Util.sleep(5 * 60 * 1000); // 5분마다

                    // 채널 업데이트는 10분당 2개의 요청만 가능하다.
                    // 일반 요청은 10분당 10,000개만 가능하다.
                    // https://stackoverflow.com/questions/62103163/how-often-can-i-rename-discord-channels-name

                } catch (err) {
                    console.error(err);
                }
            }
        }
        err(client);
        */
});


client.login(token);