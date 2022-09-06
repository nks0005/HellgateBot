const Sequelize = require('sequelize');

module.exports = class PlayerLog extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            userName: {
                type: Sequelize.STRING(255),
                allowNull: false,
            },

            userId: {
                type: Sequelize.STRING(255),
                allowNull: false,
            },

            guildName: {
                type: Sequelize.STRING(255),
                allowNull: true,
            },

            allianceName: {
                type: Sequelize.STRING(255),
                allowNull: true,
            },

            killType: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
            },

            damage: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: true,
            },

            heal: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: true,
            },

            avgIp: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
            },

            mainHand: { type: Sequelize.INTEGER.UNSIGNED, allowNull: true },
            offHand: { type: Sequelize.INTEGER.UNSIGNED, allowNull: true },
            head: { type: Sequelize.INTEGER.UNSIGNED, allowNull: true },
            armor: { type: Sequelize.INTEGER.UNSIGNED, allowNull: true },
            shoes: { type: Sequelize.INTEGER.UNSIGNED, allowNull: true },
            cape: { type: Sequelize.INTEGER.UNSIGNED, allowNull: true }

        }, {
            sequelize,
            timestamps: false,
            underscored: false,
            modelName: 'PlayerLog',
            tableName: 'playerlogs',
            paranoid: false,
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    }

    static associate(db) {
        db.PlayerLog.belongsTo(db.EventLog, { foreignKey: 'eventId', targetKey: 'eventId' });
    }
}