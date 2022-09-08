const jsonItems = require('./items.json');

const TYPE = {
    C_5: 18,
    C_20: 20,
    H_2: 33,
    H_5: 34,
    H_10: 36,

    C: 16,
    H: 32,

    _2: 1,
    _5: 2,
    _10: 4,
    _20: 8
};

const m_URL = {
    HOME: `http://localhost:3000/`,
    HELLGATE: `HELLGATE/`,
    CRYSTAL: `CRYSTAL/`,
    DOUBLE: `DOUBLE/`,
    FIVE: `FIVE/`,
    TEN: `TEN/`,
    TWENTY: `TWENTY/`
};


const killType = { Killer: 0, Victim: 1, Support: 2 };

class Util {
    constructor() { }

    static getType() { return TYPE; }
    static getKillType() { return killType; }
    static getURL() { return m_URL; }

    static array2count(array) {
        return parseInt(Object.keys(array).length);
    }

    static timestamp2datetime(timestamp) {
        return new Date(timestamp).toISOString().slice(0, 19).replace('T', ' ');
    }

    static equip2Type(Equip) {
        if (Equip == null) return Equip;
        return Equip['Type'];
    }

    static filterMainHand(mainHand) {
        let filterMainHand = ``;
        let start = mainHand.indexOf('_') + 1;
        let end = mainHand.lastIndexOf('@');

        if (end == -1)
            filterMainHand = mainHand.substring(start);
        else
            filterMainHand = mainHand.substring(start, end);

        return filterMainHand;
    }

    static findItemKr(itemName) {
        itemName = 'T8_' + itemName;

        for (const item of jsonItems) {
            if (itemName == item['UniqueName']) {
                let ret = item['LocalizedNames']['KO-KR'];
                ret = ret.replace('장로의 ', '');

                return ret;
            }
        }
    }

    static findIndexKr(Index) {
        if (Index == null) return '';

        for (const item of jsonItems) {
            if (Index == item['Index']) {
                let ret = item['LocalizedNames']['KO-KR'];
                ret = ret.replace('장로의 ', '');

                return ret;
            }
        }

        return '';
    }

    static findItemIndex(itemName) {
        itemName = 'T8_' + itemName;

        for (const item of jsonItems) {
            if (itemName == item['UniqueName']) {
                let ret = item['Index'];

                return ret;
            }
        }
    }

    static compareParty(partyA, userName) {
        let Check = false;
        for (const party of partyA) {
            if (party.Name == userName) {
                Check = true;
            }
        }
        return Check;
    }

    static Type2Index(Type) {
        if (Type == null) return Type;

        Type = Type['Type'];

        const MainHand = this.filterMainHand(`${Type}`);
        const m_Index = parseInt(this.findItemIndex(`${MainHand}`));

        return m_Index;
    }

    static async sleep(ms) {
        return new Promise(resolve => { setTimeout(resolve, ms) });
    }
}

exports.modules = Util;