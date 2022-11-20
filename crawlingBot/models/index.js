const Sequelize = require('sequelize');

const env = process.env.NODE_ENV || 'development';
const config = require('../config/config.json')[env];

const BattleLog = require('./battlelog');
const WinTeam = require('./winteam');
const LoseTeam = require('./loseteam');
const Gear = require('./gear');
const User = require('./user');

const Comps55 = require('./comps55');
const Comps1010 = require('./comps1010');
const Weapon55 = require('./weapon55');
const Weapon1010 = require('./weapon1010');

const Discord = require('./discord.js');
const { seq } = require('async');

const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config);
db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.BattleLog = BattleLog;
db.WinTeam = WinTeam;
db.LoseTeam = LoseTeam;
db.Gear = Gear;
db.User = User;

db.Comp55 = Comps55;
db.Comps1010 = Comps1010;
db.Weapon55 = Weapon55;
db.Weapon1010 = Weapon1010;

db.Discord = Discord;

BattleLog.init(sequelize);
WinTeam.init(sequelize);
LoseTeam.init(sequelize);
Gear.init(sequelize);
User.init(sequelize);

Comps55.init(sequelize);
Comps1010.init(sequelize);
Weapon55.init(sequelize);
Weapon1010.init(sequelize);

Discord.init(sequelize);

BattleLog.associate(db);
WinTeam.associate(db);
LoseTeam.associate(db);
Gear.associate(db);
User.associate(db);

Comps55.associate(db);
Comps1010.associate(db);
Weapon55.associate(db);
Weapon1010.associate(db);

Discord.associate(db);

module.exports = db;