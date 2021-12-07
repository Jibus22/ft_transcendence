all:
	docker-compose build

back:
	docker-compose build back_end_server

front:
	docker-compose build front_end_server

dockerclean:
	docker system prune
	docker volume prune

doc:
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml run  -p 8080:8080 back_end_server bash -c 'npm run documentation:serve'

backtest:
	docker-compose -f docker-compose.yml -f docker-compose.test.yml run back_end_server bash -c 'npm run test:e2ewatch'

dbclean:
	${RM} back_end/dbDev.sqlite back_end/dbDev.sqlite-shm back_end/dbDev.sqlite-wal

photoclean:
	${RM} data/users_photos_*/*

fclean: dbclean photoclean
