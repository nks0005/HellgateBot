const { User, WinTeam, Gear, LoseTeam } = require('../models');
const jsonItems = require('./items.json');

const { EmbedBuilder, Embed } = require("discord.js");

const findIndex2Kr = (index) => {

    for (const item of jsonItems) {
        if (index == item['Index']) {
            let ret = item['LocalizedNames']['KO-KR'];
            ret = ret.replace('장로의 ', '');

            return ret;
        }
    }
}


class searchUser {

    constructor(interaction) {
        this.interaction = interaction;
    }

    async start(name) {
        await this.interaction.editReply(`${name} 검색중입니다.`);

        const user = await User.findOne({
            where: { name: name }
        });

        if (user == null) {
            await this.interaction.editReply(`${name}가 존재하지 않습니다.`);
            return -1;
        }

        const winlists = await WinTeam.findAll({
            attributes: ['equipId'],
            where: {
                userId: user.id
            }
        });


        let gearList = {};

        for (const winlist of winlists) {
            const { equipId } = winlist;

            const gear = await Gear.findOne({
                where: { id: equipId }
            });

            if (gear == null) continue;

            if (!(gear.mainHand in gearList))
                gearList[gear.mainHand] = { win: 0, lose: 0 };

            gearList[gear.mainHand].win = (gearList[gear.mainHand].win + 1);


        }

        const loseLists = await LoseTeam.findAll({
            attributes: ['equipId'],
            where: {
                userId: user.id
            }
        });


        for (const loseList of loseLists) {
            const { equipId } = loseList;

            const gear = await Gear.findOne({
                where: { id: equipId }
            });

            if (gear == null) continue;

            if (!(gear.mainHand in gearList))
                gearList[gear.mainHand] = { win: 0, lose: 0 };

            gearList[gear.mainHand].lose = (gearList[gear.mainHand].lose + 1);
        }

        console.dir(gearList, { depth: 3 });

        let hellgateEmbed = new EmbedBuilder();

        let date = new Date();
        const color = date.getTime() % 0xffffff;
        console.log(color.toString(16));

        hellgateEmbed.setColor(`${color.toString(16)}`)
            .setTitle(`${name} 전적표`)
            .setFooter({ text: '©hellgate bot' });

        hellgateEmbed.addFields({ name: `5v5`, value: `승 : ${user.win55}\n패 : ${user.lose55}` });
        hellgateEmbed.addFields({ name: `10v10`, value: `승 : ${user.win1010}\n패 : ${user.lose1010}` });



        let msg = ``;


        const gearListKeys = Object.keys(gearList);
        for (var i = 0; i < gearListKeys.length; i++) {
            const gearListKey = gearListKeys[i];

            msg += `\n${findIndex2Kr(gearListKey)}\n승 : ${gearList[gearListKey].win}\n패 : ${gearList[gearListKey].lose}\n`;
        }

        hellgateEmbed.addFields({ name: `무기 승률`, value: msg });


        await this.interaction.editReply({ embeds: [hellgateEmbed] });
    }
}
module.exports = searchUser;