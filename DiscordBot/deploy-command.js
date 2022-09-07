// 등록
const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { token } = require('./config/config.json');


/**
 * hellgate_2
 * hellgate_5
 * hellgate_10
 *
 * crystal_5
 * crystal_20
 */
const commands = [
        new SlashCommandBuilder().setName('setchannel').setDescription('모니터링 채널 설정').addStringOption(option => option.setName('type').setDescription('모니터링 종류').setRequired(true)),
    ]
    .map(command => command.toJSON());


const rest = new REST({ version: '10' }).setToken(token);

rest.put(
    Routes.applicationCommands("980050496897314836"), { body: commands },
);