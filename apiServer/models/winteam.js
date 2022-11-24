const Sequelize = require('sequelize');

module.exports = class WinTeam extends Sequelize.Model {
    static init(sequelize) {
        return super.init({

            ip: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false
            }

        }, {
            sequelize
        });
    }

    static associate(db) {
        db.WinTeam.belongsTo(db.BattleLog, { foreignKey: 'battleId', sourceKey: 'battleId' });

        db.WinTeam.belongsTo(db.User, { foreignKey: 'userId', sourceKey: 'userId' });
        db.WinTeam.belongsTo(db.Gear, { foreignKey: 'equipId', sourceKey: 'id' });
    }
}