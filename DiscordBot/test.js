const { Client, GatewayIntentBits } = require('discord.js');
const { token, wanthealcomeId } = require('./config/discord_config.json');
const { joinVoiceChannel } = require('@discordjs/voice');



const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', () => {
    console.log('Ready!');

    // 채널명을 바꾸는 명령어
    //client.guilds.get("748345742158200832").channels.get("1017509122729574511").setName(' Update Time');
    //client.guilds.cache.get(748345742158200832).channels.cache.get("1017509122729574511").join().then(connection => { console.log('성공') }).catch(e => { console.error(`실패\n${e}`) });

    const connection = joinVoiceChannel({
        channelId: "1017509122729574511",
        guildId: "748345742158200832",
        adapterCreator: client.guilds.cache.get("748345742158200832").voiceAdapterCreator
    });

    var date = new Date();
    var strKrTime = `Updated : ${date.getHours()}:${date.getMinutes()}`;

    client.guilds.cache.get("748345742158200832").channels.cache.get("1017509122729574511").setName(strKrTime);

});


client.login(token);