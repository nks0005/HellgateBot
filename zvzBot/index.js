const { Client, GatewayIntentBits } = require('discord.js');
const { parse } = require('dotenv');
const ZvzMetaViewer = require('./modules/zvzmetaviewer.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const ZvZMetaViewer = require('./modules/zvzmetaviewer.js');
require("dotenv").config();



client.once('ready', () => {
    console.log('Ready!');
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    if (commandName == 'searchzvzcomps') {
        await interaction.reply('처리중...');
        const zvzMetaViewer = new ZvzMetaViewer();

        const killboardId = interaction.options.getString('killboard');
        const guildName = interaction.options.getString('guild');
        const allyName = interaction.options.getString('ally');

        console.log(`killboardId : ${killboardId}\nguildName : ${guildName}\nallyName : ${allyName}`);

        let id = parseInt(killboardId);
        if (isNaN(id)) {
            await interaction.editReply('killboard 아이디 값을 제대로 입력해주세요.');
            return;
        }

        if (guildName == null && allyName == null) {
            await interaction.editReply('guild 혹은 ally 이름을 입력하세요.');
            return;
        }

        const msg = await zvzMetaViewer.start(id, guildName, allyName);
        await interaction.editReply(msg);

        //const msg = await zvzMetaViewer.start();

    }

    console.log(commandName);
});

client.login(process.env.DISCORD_TOKEN);