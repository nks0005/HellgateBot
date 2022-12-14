// 등록
const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { token } = require('./config/discord_config.json');


/*
    searchUser '유저이름'

*/
const commands = [
        new SlashCommandBuilder().setName('searchuser').setDescription('유저 검색을 수행합니다.').addStringOption(option => option.setName('name').setDescription('유저이름').setRequired(true)),
        new SlashCommandBuilder().setName('comp55').setDescription('5v5 조합 검색을 수행합니다.'),
        new SlashCommandBuilder().setName('comp1010').setDescription('10v10 조합 검색을 수행합니다.'),
        new SlashCommandBuilder().setName('weapon55').setDescription('5v5 무기 검색을 수행합니다.'),
        new SlashCommandBuilder().setName('weapon1010').setDescription('10v10 무기 검색을 수행합니다.'),
    ]
    .map(command => command.toJSON());


const rest = new REST({ version: '10' }).setToken(token);

rest.put(
    Routes.applicationCommands("980050496897314836"), { body: commands },
);