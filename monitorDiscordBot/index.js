const { Client, GatewayIntentBits } = require('discord.js');
const { token, wanthealcomeId } = require('./config/discord_config.json');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const User = require('./modules/searchUser.js');
const Monitor = require('./modules/monitor.js');
const Comps = require('./modules/comps');

const discordVoice = require('./modules/voice.js');

client.once('ready', () => {
    console.log('Ready!');

    const monitor = new Monitor(5000);
    monitor.start55(
        client.guilds.cache.get("748345742158200832").channels.cache.get("1031183028732571648"),
        client.guilds.cache.get("748345742158200832").channels.cache.get("1031183277006000138")
    );

    const voice = new discordVoice();
    voice.start(client);

});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    console.log(commandName);
    if (commandName == 'searchuser') {
        // user 검색
        const name = interaction.options.getString('name');
        await interaction.reply('처리 중입니다...');

        {
            const user = new User(interaction);
            await user.start(name);
        }
    } else if (commandName == 'comp') {
        await interaction.reply('처리 중입니다..'); {
            const comp = new Comps(interaction);
            await comp.start();
        }
    }
});

client.login(token);