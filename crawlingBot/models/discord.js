const Sequelize = require('sequelize');

module.exports = class Discord extends Sequelize.Model {
    static init(sequelize) {
        return super.init({

            battleId: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
                unique: true
            },

        }, {
            sequelize,
            timestamps: true,
            paranoid: true,
            underscored: false
        });
    }

    static associate(db) {
        db.BattleLog.hasOne(db.WinTeam, { foreignKey: 'battleId', sourceKey: 'battleId' });
        db.BattleLog.hasOne(db.LoseTeam, { foreignKey: 'battleId', sourceKey: 'battleId' });
    }
}