const { Comp55, Comps1010 } = require('../models');
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

class Comp {
    constructor(Interaction) {
        this.interaction = Interaction;
    }


    async start55() {
        // 정보 리스트를 얻어온다
        const Comps = await Comp55.findAll({
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
            .setTitle(`5v5 조합 통계`)
            .setFooter({ text: '©hellgate bot' });


        for (const comp of Comps) {
            const { w1, w2, w3, w4, w5, victory, defeat } = comp;

            hellgateEmbed.addFields({ name: `승: ${victory} | 패: ${defeat}`, value: `${findIndex2Kr(w1)} ${findIndex2Kr(w2)} ${findIndex2Kr(w3)} ${findIndex2Kr(w4)} ${findIndex2Kr(w5)}`, inline: true });
        }

        await this.interaction.editReply({ embeds: [hellgateEmbed] });
    }

    async start1010() {
        // 정보 리스트를 얻어온다
        const Comps = await Comps1010.findAll({
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
            .setTitle(`10v10 조합 통계`)
            .setFooter({ text: '©hellgate bot' });


        for (const comp of Comps) {
            const { w1, w2, w3, w4, w5, w6, w7, w8, w9, w10, victory, defeat } = comp;

            hellgateEmbed.addFields({ name: `승: ${victory} | 패: ${defeat}`, value: `${findIndex2Kr(w1)} ${findIndex2Kr(w2)} ${findIndex2Kr(w3)} ${findIndex2Kr(w4)} ${findIndex2Kr(w5)} ${findIndex2Kr(w6)} ${findIndex2Kr(w7)} ${findIndex2Kr(w8)} ${findIndex2Kr(w9)} ${findIndex2Kr(w10)}`, inline: true });
        }

        await this.interaction.editReply({ embeds: [hellgateEmbed] });
    }

}


module.exports = Comp;