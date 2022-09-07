const Sequelize = require('sequelize');

const env = process.env.NODE_ENV || 'development';
const config = require('../config/config.json')[env];

const Channel = require('./channel.js');

const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config);
db.sequelize = sequelize;

db.Channel = Channel;

Channel.init(sequelize);
Channel.associate(db);

module.exports = db;