const Sequelize = require('sequelize');

module.exports = class Channel extends Sequelize.Model {
    static init(sequelize) {
        return super.init({

            guildId: {
                type: Sequelize.STRING(255),
                allowNull: false,
            },

            channelId: {
                type: Sequelize.STRING(255),
                allowNull: false,
            },

            userId: {
                type: Sequelize.STRING(255),
                allowNull: false,
            },

            crystal: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
            },

            type: {
                type: Sequelize.BOOLEAN,
                allowNull: false
            }

        }, {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'Channel',
            tableName: 'channels',
            paranoid: true,
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    }

    static associate(db) {

    }
}