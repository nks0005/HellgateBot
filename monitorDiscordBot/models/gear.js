const Sequelize = require('sequelize');

module.exports = class Gear extends Sequelize.Model {
    static init(sequelize) {
        return super.init({

            mainHand: {
                type: Sequelize.STRING(100),
                allowNull: false
            },

            offHand: {
                type: Sequelize.STRING(100)
            },

            head: {
                type: Sequelize.STRING(100)
            },

            armor: {
                type: Sequelize.STRING(100)
            },

            shoes: {
                type: Sequelize.STRING(100)
            },

            cape: {
                type: Sequelize.STRING(100)
            },



        }, {
            sequelize
        });
    }

    static associate(db) {
        db.Gear.hasOne(db.WinTeam, { foreignKey: 'equipId', sourceKey: 'id' });
        db.Gear.hasOne(db.LoseTeam, { foreignKey: 'equipId', sourceKey: 'id' });
    }
}