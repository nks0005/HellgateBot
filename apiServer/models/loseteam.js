const Sequelize = require('sequelize');

module.exports = class LoseTeam extends Sequelize.Model {
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
        db.LoseTeam.belongsTo(db.BattleLog, { foreignKey: 'battleId', sourceKey: 'battleId' });

        db.LoseTeam.belongsTo(db.User, { foreignKey: 'userId', sourceKey: 'userId' });
        db.LoseTeam.belongsTo(db.Gear, { foreignKey: 'equipId', sourceKey: 'id' });
    }
}