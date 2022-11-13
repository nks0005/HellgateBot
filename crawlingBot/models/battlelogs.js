const Sequelize = require('sequelize');

module.exports = class BattleLog extends Sequelize.Model {
    static init(sequelize) {
        return super.init({

            battleId: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
                unique: true
            },

            startTime: {
                type: Sequelize.DATE,
                allowNull: false,
            },

            totalFame: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false
            },

            totalKills: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false
            },

            matchType: {
                type: Sequelize.BOOLEAN,
                allowNull: false
            },

            check: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            }
        }, {
            sequelize,
            timestamps: true,
            paranoid: true,
            underscored: false
        });
    }

    static associate(db) {

    }
}