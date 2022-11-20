const Sequelize = require('sequelize');

module.exports = class Weapon55 extends Sequelize.Model {
    static init(sequelize) {
        return super.init({

            mainHand: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
                unique: true
            },

            victory: {
                type: Sequelize.INTEGER.UNSIGNED,
                defaultValue: 0
            },

            defeat: {
                type: Sequelize.INTEGER.UNSIGNED,
                defaultValue: 0
            }
        }, {
            sequelize,
        });
    }

    static associate(db) {

    }
}