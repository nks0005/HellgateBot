const { find } = require('async');
const { User, WinTeam, Gear, LoseTeam, Comp55 } = require('../models');
const jsonItems = require('./items.json');

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


    async start() {
        // 정보 리스트를 얻어온다
        const Comps = await Comp55.findAll({
            order: [
                ['victory', 'DESC']
            ]
        });

        let msg = `\`\`\`md\n`;
        for (const comp of Comps) {
            const { w1, w2, w3, w4, w5, victory, defeat } = comp;

            msg += `승 : ${victory} 패 : ${defeat}\n${findIndex2Kr(w1)} ${findIndex2Kr(w2)} ${findIndex2Kr(w3)} ${findIndex2Kr(w4)} ${findIndex2Kr(w5)}\n\n`;
        }
        msg += `\`\`\``;

        await this.interaction.editReply(msg);
    }

}


module.exports = Comp;