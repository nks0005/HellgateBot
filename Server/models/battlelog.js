const Sequelize = require('sequelize');

module.exports = class BattleLog extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            battleId: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
                unique: true
            },

            totalKills: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
            },

            totalPlayers: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
            },

            logTime: {
                type: Sequelize.DATE,
                allowNull: false,
            },

            send: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
            },

            checkTotal: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
            },

            crystal: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
            },

            type: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
            },
        }, {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'BattleLog',
            tableName: 'battlelogs',
            paranoid: true,
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    }

    static associate(db) {
        db.BattleLog.hasMany(db.EventLog, { foreignKey: 'battleId', sourceKey: 'battleId' });
    }
}