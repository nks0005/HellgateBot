# 디스코드 봇

## 패키지 설치
- npm install discord.js
- npm install @discordjs/rest discord-api-types



## 데이터베이스
- 데이터베이스 : discordbot_development


## 승리, 패배팀 구별 알고리즘
1. init. 첫번째 Victim은 B팀. Killer와 Support는 A팀으로 정한다
2. loop.
   1. 다음 Victim을 B팀인지 A팀인지 비교한다.
      1. A팀에 있다면 Killer와 Support를 B팀으로 정한다.
      2. B팀에 있다면 Killer와 Support를 A팀으로 정한다.
      3. 두 팀다 없다면 ( 간혹 안정해져 있을 때가 있음 )
         1. Killer을 B팀인지 A팀인지 비교한다.
            1. A팀이라면 Victim을 B팀으로, Support를 A팀으로 정한다.
            2. B팀이라면 Victim을 A팀으로, Support를 B팀으로 정한다.
            3. 두 팀다 없다면
               1. Support들을 비교한다.
                  1. 한명이라도 A팀이라면 Killer와 Support를 A팀. Victim을 B팀으로