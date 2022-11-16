const Sequelize = require('sequelize');

const env = process.env.NODE_ENV || 'development';
const config = require('../config/config.json')[env];

const BattleLog = require('./battlelog');
const WinTeam = require('./winteam');
const LoseTeam = require('./loseteam');
const Gear = require('./gear');
const User = require('./user');

const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config);
db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.BattleLog = BattleLog;
db.WinTeam = WinTeam;
db.LoseTeam = LoseTeam;
db.Gear = Gear;
db.User = User;

BattleLog.init(sequelize);
WinTeam.init(sequelize);
LoseTeam.init(sequelize);
Gear.init(sequelize);
User.init(sequelize);

BattleLog.associate(db);
WinTeam.associate(db);
LoseTeam.associate(db);
Gear.associate(db);
User.associate(db);

module.exports = db;