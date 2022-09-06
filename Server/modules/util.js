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
    constructor() {}

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

    static async sleep(ms) {
        return new Promise(resolve => { setTimeout(resolve, ms) });
    }
}

exports.modules = Util;