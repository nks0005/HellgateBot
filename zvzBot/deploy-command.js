// 등록
const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

require("dotenv").config();

/*
    searchUser '유저이름'

*/
const commands = [
        new SlashCommandBuilder().setName('searchzvzcomps').setDescription('해당 킬보드의 특정 ZVZ 그룹의 조합을 얻어옵니다.')
        .addStringOption(option => option.setName('killboard').setDescription('킬보드 ID').setRequired(true))
        .addStringOption(option => option.setName('guild').setDescription('길드명').setRequired(false))
        .addStringOption(option => option.setName('ally').setDescription('연합명').setRequired(false))
    ]
    .map(command => command.toJSON());


const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

rest.put(
    Routes.applicationCommands("1048850837193105412"), { body: commands },
);