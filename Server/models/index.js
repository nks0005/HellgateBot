const Sequelize = require('sequelize');

const env = process.env.NODE_ENV || 'development';
const config = require('../config/config.json')[env];

const BattleLog = require('./battlelog');
const EventLog = require('./eventlog');
const PlayerLog = require('./playerlog');

const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config);
db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.BattleLog = BattleLog;
db.EventLog = EventLog;
db.PlayerLog = PlayerLog;

BattleLog.init(sequelize);
EventLog.init(sequelize);
PlayerLog.init(sequelize);

BattleLog.associate(db);
EventLog.associate(db);
PlayerLog.associate(db);

module.exports = db;