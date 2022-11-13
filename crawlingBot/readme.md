# 목적
> https://gameinfo.albiononline.com/api/gameinfo/events/battle/${id}?offset=0&limit=${totalKills}
> https://gameinfo.albiononline.com/api/gameinfo/battles?offset=${index==0?0:index*50}&limit=50&sort=recent`
> 위 두 사이트에서 데이터들을 수집하여 DB에 저장한다.

# 과정
> API로 부터 데이터를 읽어온다
> 5v5, 10v10 헬게이트 인지 확인한다
> 승리팀 패배팀을 구분한다
> 1. 승리팀 유저들을 등록한다. User 테이블
> 2. 승리팀 유저들의 승리 카운트를 1 높인다. User 테이블
> 3. 패배팀도 반복.
> 4. 기어를 등록한다.
> 1. 4. 에서 얻어온 userId, gearId를 이용하여 해당 유저를 승리 혹은 패배 테이블에 등록한다.
> 다 넣었을 경우, 트랜젝션을 수행한다.