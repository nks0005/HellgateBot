const Sequelize = require('sequelize');

module.exports = class User extends Sequelize.Model {
    static init(sequelize) {
        return super.init({

            userId: {
                type: Sequelize.STRING(100),
                allowNull: false,
                unique: true
            },

            name: {
                type: Sequelize.STRING(100),
                allowNull: false
            },

            guild: {
                type: Sequelize.STRING(100),
                allowNull: true
            },

            ally: {
                type: Sequelize.STRING(100),
                allowNull: true
            },

            win55: {
                type: Sequelize.INTEGER.UNSIGNED,
                defaultValue: 0
            },

            lose55: {
                type: Sequelize.INTEGER.UNSIGNED,
                defaultValue: 0
            },

            win1010: {
                type: Sequelize.INTEGER.UNSIGNED,
                defaultValue: 0
            },

            lose1010: {
                type: Sequelize.INTEGER.UNSIGNED,
                defaultValue: 0
            },

        }, {
            sequelize
        });
    }

    static associate(db) {
        db.User.hasOne(db.WinTeam, { foreignKey: 'userId', sourceKey: 'userId' });
        db.User.hasOne(db.LoseTeam, { foreignKey: 'userId', sourceKey: 'userId' });
    }
}