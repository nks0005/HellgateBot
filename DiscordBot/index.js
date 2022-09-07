const { Client, GatewayIntentBits } = require('discord.js');
const { token, wanthealcomeId } = require('./config/discord_config.json');
const { Channel, sequelize } = require('./models/index.js');
const Monitor = require('./modules/monitor.js').modules;

sequelize.sync({ force: false }).then(() => {
        console.log('데이터베이스 연결 성공');
    })
    .catch((err) => {
        console.error(err);
    })

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', () => {
    console.log('Ready!');



    m = new Monitor(20000, client);
    m.update();
});


client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'setchannel') {
        try {
            const { channelId, guildId, user: { id } } = interaction;
            console.log(`channelId : ${channelId}, guildId : ${guildId}, id : ${id}`);

            if (id != wanthealcomeId)
                await interaction.reply('권한이 필요합니다.');

            const ret = await Channel.findOne({
                where: { channelId: channelId, guildId: guildId }
            });

            if (ret) {
                interaction.reply('이미 등록되어있습니다.');
            } else {

                let crystal = -1,
                    type = -1;
                const commandType = interaction.options.getString('type');

                switch (commandType) {
                    case "hellgate_2":
                        crystal = 0;
                        type = 0;
                        break;

                    case "hellgate_5":
                        crystal = 0;
                        type = 1;
                        break;

                    case "hellgate_10":
                        crystal = 0;
                        type = 2;
                        break;

                    case "crystal_5":
                        crystal = 1;
                        type = 1;
                        break;

                    case "crystal_20":
                        crystal = 1;
                        type = 3;
                        break;

                    default:
                        throw 'Type 매개 변수가 잘못 되었습니다.';
                }

                await Channel.create({
                    guildId: guildId,
                    channelId: channelId,
                    userId: id,
                    crystal: crystal,
                    type: type
                });

                interaction.reply('정상적으로 등록되었습니다.');
            }
        } catch (err) {
            console.error(err);
            interaction.reply('등록 중 오류가 발생했습니다.');
        }
    }
});

client.login(token);