const Sequelize = require('sequelize');

module.exports = class EventLog extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            eventId: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
                unique: true
            },

            memberCount: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
            },


        }, {
            sequelize,
            timestamps: false,
            underscored: false,
            modelName: 'EventLog',
            tableName: 'eventlogs',
            paranoid: false,
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    }

    static associate(db) {
        db.EventLog.belongsTo(db.BattleLog, { foreignKey: 'battleId', targetKey: 'battleId' });
        db.EventLog.hasMany(db.PlayerLog, { foreignKey: 'eventId', sourceKey: 'eventId' });
    }
}