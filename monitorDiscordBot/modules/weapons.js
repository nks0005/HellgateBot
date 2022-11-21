const { User, WinTeam, Gear, LoseTeam, Weapon55 } = require('../models');
const jsonItems = require('./items.json');

const { EmbedBuilder } = require("discord.js");

const findIndex2Kr = (index) => {

    for (const item of jsonItems) {
        if (index == item['Index']) {
            let ret = item['LocalizedNames']['KO-KR'];
            ret = ret.replace('장로의 ', '');
            ret = ret.replace(' ', '');

            return ret;
        }
    }
}

class Weapon {
    constructor(Interaction) {
        this.interaction = Interaction;
    }


    async start55() {
        // 정보 리스트를 얻어온다
        const Weapons = await Weapon55.findAll({
            order: [
                ['victory', 'DESC']
            ],
            limit: 20
        });

        let hellgateEmbed = new EmbedBuilder();

        let date = new Date();
        const color = date.getTime() % 0xffffff;
        console.log(color.toString(16));

        hellgateEmbed.setColor(`${color.toString(16)}`)
            .setTitle(`무기 통계`)
            .setFooter({ text: '©hellgate bot' });


        for (const weapon of Weapons) {
            const { mainHand, victory, defeat } = weapon;

            hellgateEmbed.addFields({ name: `승: ${victory} | 패: ${defeat}`, value: `${findIndex2Kr(mainHand)}` });
        }

        await this.interaction.editReply({ embeds: [hellgateEmbed] });
    }

    async start1010() {
        // 정보 리스트를 얻어온다
        const Weapons = await Weapon1010.findAll({
            order: [
                ['victory', 'DESC']
            ],
            limit: 20
        });

        let hellgateEmbed = new EmbedBuilder();

        let date = new Date();
        const color = date.getTime() % 0xffffff;
        console.log(color.toString(16));

        hellgateEmbed.setColor(`${color.toString(16)}`)
            .setTitle(`무기 통계`)
            .setFooter({ text: '©hellgate bot' });


        for (const weapon of Weapons) {
            const { mainHand, victory, defeat } = weapon;

            hellgateEmbed.addFields({ name: `승: ${victory} | 패: ${defeat}`, value: `${findIndex2Kr(mainHand)}` });
        }

        await this.interaction.editReply({ embeds: [hellgateEmbed] });
    }

}


module.exports = Weapon;