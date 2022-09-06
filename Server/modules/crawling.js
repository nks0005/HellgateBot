const axios = require('axios');

const Util = require('./util').modules;

/**
 * 킬보드들을 주기적으로 수집하여 구분하고 서버로 전송
 */
class crawling {
    constructor(loopCount, timeCycle) {
        this.loopCount = loopCount; // 최신 킬보드를 50개 묶음으로 긁어오는데, 이때 묶음의 개수
        this.timeCycle = timeCycle; // 몇 ms 주기로 긁는지
    }

    /**
     * 전투 기록을 받아서 크리스탈 리그, 헬게이트, 2v2, 5v5, 10v10, 20v20 구분
     *
     * @param {json} battlelog 하나의 전투 기록
     * @return {int} bit(0000 0000) 
     * 0000 xxxx : 16(crystal), 32(not crystal)
     * xxxx 0000 : 1(2v2), 2(5v5), 4(10v10), 8(20v20)
     * 
     * crystal 5v5 : 18
     * crystal 20v20 : 20
     * 
     * hellgate 2v2 : 33
     * hellgate 5v5 : 34
     * hellgate 10v10 : 36
     * 
     * @exception 정상적인 데이터를 얻지 못할 경우 에러
     */
    async checkBattleType(battlelog) {
        let retType = 0;
        try {
            const { id, totalKills, players } = battlelog;
            const totalPlayers = Util.array2count(players);

            // 최대 40명 이상일 수 없다.
            if (totalPlayers > 40) return retType;

            /*
            // 데이터 베이스에 이미 존재하는지 여부 확인
            let checkBattle = await BattleLog.findOne({
                where: { battleId: id }
            });
            if (checkBattle != null) return retType;
            */

            let result = await axios.get(`https://gameinfo.albiononline.com/api/gameinfo/events/battle/${id}?offset=0&limit=${totalKills}`);

            if (result.status == 200 && result.data != null) {
                for (const eventlog of result.data) {
                    const { KillArea, GroupMembers, Participants } = eventlog;
                    const PartyMemberCount = Util.array2count(GroupMembers);

                    // 크리스탈 여부 확인
                    if (KillArea == `CRYSTAL_LEAGUE`) {
                        retType |= 16;

                        /**
                         * 크리스탈 5v5, 20v20 확인
                         *
                         * 크리스탈의 경우 인원수
                         */
                        if (PartyMemberCount == 5) retType |= 2;
                        else if (PartyMemberCount >= 15 && PartyMemberCount <= 20) retType != 8;


                    } else if (KillArea == `OPEN_WORLD`) {
                        retType |= 32;

                        /**
                         * 헬게이트 2v2, 5v5, 10v10 확인
                         *
                         * # 조건
                         * 1. 최소 IP ~ 최대 IP(근사치)
                         * 2v2 : 900 ~ 1300
                         * 5v5 : 1000 ~ 1450
                         * 10v10 : 1000 ~ 1450
                         *
                         * 2. 2v2를 제외한 5v5, 10v10은 힐러가 존재
                         * 3. 킬수는 파티 맴버의 이상이여야 함
                         */
                        {
                            let checkOverIp, party, healer = 0;
                            //console.log(`PartyMemberCount : ${PartyMemberCount}, totalPlayers : ${totalPlayers}, totalKills : ${totalKills}`);

                            if (PartyMemberCount == 2 && (totalPlayers == 3 || totalPlayers == 4) && (totalKills >= 2 && totalKills < 4)) {
                                for (const support of Participants) {
                                    const { SupportHealingDone, AverageItemPower } = support;

                                    //if (SupportHealingDone > 0) healer++;
                                    if (AverageItemPower != 0 && (AverageItemPower < 900 || AverageItemPower > 1300)) checkOverIp++;
                                }

                                if (!checkOverIp) retType |= 1;

                            } else if (PartyMemberCount == 5 && (totalPlayers == 10 || totalPlayers == 9) && (totalKills >= 5 && totalKills < 10)) {
                                for (const support of Participants) {
                                    const { SupportHealingDone, AverageItemPower } = support;

                                    if (SupportHealingDone > 0) healer++;
                                    if (AverageItemPower != 0 && (AverageItemPower < 1000 || AverageItemPower > 1450)) checkOverIp++;
                                }

                                if (!checkOverIp && healer) retType |= 2;

                            } else if (PartyMemberCount == 10 && (totalPlayers == 19 || totalPlayers == 20) && (totalKills >= 10 && totalKills < 20)) {
                                for (const support of Participants) {
                                    const { SupportHealingDone, AverageItemPower } = support;

                                    if (SupportHealingDone > 0) healer++;
                                    if (AverageItemPower != 0 && (AverageItemPower < 1000 || AverageItemPower > 1450)) checkOverIp++;
                                }

                                if (!checkOverIp && healer) retType |= 4;
                            }
                        }
                    }
                }
            }

        } catch (err) {
            console.error(err);
            throw err;
        } finally {
            // console.log(retType);
            return retType;
        }
    }



    // `timeCycle` 주기로 실행
    async updateLoop() {
        console.log(`등록 완료 : ${this.loopCount}, ${this.timeCycle}`);
        while (true) {
            this.update();
            await Util.sleep(this.timeCycle);
        }
    }

    // 킬보드들을 주기적으로 수집
    async update() {
        for (var i = 0; i < this.loopCount; i++) {
            //console.log(`i : ${i}`);
            (async(index) => {
                try {
                    //console.log(`https://gameinfo.albiononline.com/api/gameinfo/battles?offset=${index==0?0:index*50}&limit=50&sort=recent`);
                    let result = await axios.get(`https://gameinfo.albiononline.com/api/gameinfo/battles?offset=${index==0?0:index*50}&limit=50&sort=recent`);
                    if (result.status == 200 && result.data != null) {
                        for (const battlelog of result.data) {
                            const { id } = battlelog;
                            switch (await this.checkBattleType(battlelog)) {

                                case Util.getType().C_5: // 크리스탈 5v5
                                    //console.log(`[c5] https://albionbattles.com/battles/${battlelog['id']}`);
                                    await axios.post(Util.getURL().HOME + Util.getURL().CRYSTAL + Util.getURL().FIVE, { battleId: id })
                                    break;

                                case Util.getType().C_20: // 크리스탈 20v20
                                    //console.log(`[c20] https://albionbattles.com/battles/${battlelog['id']}`);
                                    await axios.post(Util.getURL().HOME + Util.getURL().CRYSTAL + Util.getURL().TWENTY, { battleId: id })
                                    break;

                                case Util.getType().H_2: // 헬게이트 2v2
                                    //console.log(`[h2] https://albionbattles.com/battles/${battlelog['id']}`);
                                    await axios.post(Util.getURL().HOME + Util.getURL().HELLGATE + Util.getURL().DOUBLE, { battleId: id })
                                    break;

                                case Util.getType().H_5: // 헬게이트 5v5
                                    //console.log(`[h5] https://albionbattles.com/battles/${battlelog['id']}`);
                                    await axios.post(Util.getURL().HOME + Util.getURL().HELLGATE + Util.getURL().FIVE, { battleId: id })
                                    break;

                                case Util.getType().H_10: // 헬게이트 10v10
                                    //console.log(`[h10] https://albionbattles.com/battles/${battlelog['id']}`);
                                    await axios.post(Util.getURL().HOME + Util.getURL().HELLGATE + Util.getURL().TEN, { battleId: id })
                                    break;

                                default:
                                    break;
                            };
                        }
                    }
                } catch (err) {
                    console.error(err);
                }
            })(i);
        }
    }
}

exports.modules = crawling;