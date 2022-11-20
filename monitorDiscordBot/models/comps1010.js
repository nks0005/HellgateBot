const Sequelize = require('sequelize');

module.exports = class Comps1010 extends Sequelize.Model {
    static init(sequelize) {
        return super.init({

            w1: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
            },

            w2: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
            },

            w3: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
            },

            w4: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
            },

            w5: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
            },

            w6: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
            },

            w7: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
            },

            w8: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
            },

            w9: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
            },

            w10: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
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