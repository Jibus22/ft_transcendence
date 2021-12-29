all:
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up ; docker-compose rm -fsv


# usage: `make test TARGET=chat`
test:
	docker-compose -f docker-compose.yml -f docker-compose.test.yml run back_end_server bash -c 'jest --config ./test/jest-e2e.json --maxWorkers=1 --watch --verbose --testLocationInResults --testRegex="$(TARGET)"'

back:
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up back_end_server ; docker-compose rm -fsv

front:
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up front_end_server ; docker-compose rm -fsv



allbuild:
	docker-compose build

backbuild:
	docker-compose build back_end_server

frontbuild:
	docker-compose build front_end_server



dockerclean:
	docker system prune
	docker volume prune



backdoc:
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml run  -p 8080:8080 back_end_server bash -c 'npm run documentation:serve'

backtest:
	docker-compose -f docker-compose.yml -f docker-compose.test.yml run back_end_server bash -c 'npm run test:e2ewatch'

backstart:
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up back_end_server

backbash:
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml run back_end_server bash


dbclean:
	${RM} back_end/dbDev.sqlite back_end/dbDev.sqlite-shm back_end/dbDev.sqlite-wal

photoclean:
	${RM} data/users_photos_*/*

fclean: dbclean photoclean
