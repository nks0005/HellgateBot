// 등록
const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { botToken } = require('./config/config.json');

const commands = [
        new SlashCommandBuilder().setName('button').setDescription('버튼 테스트'),
        new SlashCommandBuilder().setName('search').setDescription('24시간 내 5v5 헬게 통계 치를 얻어옵니다.'),
        new SlashCommandBuilder().setName('totallist').setDescription('2022-07-05부터 현재까지 5v5 헬게 조합 정보를 얻어옵니다.'),
        new SlashCommandBuilder().setName('searchall55').setDescription('2022-07-05부터 현재까지 5v5 헬게 통계 치를 얻어옵니다.'), new SlashCommandBuilder().setName('searchall1010').setDescription('2022-07-23부터 현재까지 10v10 헬게 통계 치를 얻어옵니다.'),
        new SlashCommandBuilder().setName('user55').setDescription('5v5 유저 전적을 검색합니다.').addStringOption(option => option.setName('user_name').setDescription('닉네임을 적습니다.').setRequired(true)),
    ]
    .map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(botToken);
rest.put(Routes.applicationGuildCommands("980050496897314836", "748345742158200832"), { body: commands })
    .then(() => console.log('Successfully registered application commands.'))
    .catch(console.error);