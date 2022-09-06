# Express-Generate을 통해 프로젝트 구성
1. express generate를 설치
> npm install express-generate -g
> express Server

> 출처 : https://www.deok.me/entry/NodeJS-NodeJS-Express-%EC%84%A4%EC%B9%98-%EB%B0%8F-%EC%84%9C%EB%B9%84%EC%8A%A4-%EA%B0%9C%EB%B0%9C-%EC%8B%9C%EC%9E%91%ED%95%98%EA%B8%B0

# sequelize 설치
1. 패키지 설치
> npm i sequelize sequelize-cli mysql2
> npx sequelize init


# axios 설치
1. 패키지 설치
> npm i axios


# 서버 구동
## 내부 구동
1. 최신 킬보드 수집 : ```https://gameinfo.albiononline.com/api/gameinfo/battles?offset=0&limit=50&sort=recent```
2. 이벤트 로그 수집 : ```https://gameinfo.albiononline.com/api/gameinfo/events/battle/${battleId}?offset=0&limit=${totalKills}```
31. Crystal League 인지 확인. 20v20 or 5v5 : 이벤트 로그에서 `KillArea` 값이 `CRYSTAL_LEAGUE`인 경우
32. Hellgate 여부 확인. 2v2, 5v5, 10v10 : `KillArea` 값이 `OPEN_WORLD`, 구분 알고리즘 이용
4. Data Base에 저장 - 유저 장비의 경우 index 값을 이용한다. `module/items.json`

## API 구동 - URL : JSON
### /HELLGATE
- /DOUBLE
  - get     : 2v2 헬게이트 기록들을 얻어온다.
  - post    : 기록들을 업데이트한다.
- /FIVE
  - get      : 5v5 헬게이트 기록들을 얻어온다.
  - post
- /TEN
  - get     : 10v10 헬게이트 기록들을 얻어온다.
  - post

### /CRYSTAL
- /FIVE
  - get     : 5v5 크리스탈 기록들을 얻어온다.
  - post
- /TWENTY
  - get     : 20v20 크리스탈 기록들을 얻어온다.
  - post




# DB 구성
- 구분 2개가 필요함 : 크리 or 헬게이트, 2v2, 5v5, 10v10, 20v20 여부