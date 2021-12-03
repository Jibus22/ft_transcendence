all:
	docker-compose build

back:
	docker-compose build back_end_server

front:
	docker-compose build front_end_server

dbclean:
	${RM} back_end/dbDev.sqlite back_end/dbDev.sqlite-shm back_end/dbDev.sqlite-wal

photoclean:
	${RM} data/users_photos_*/*

fclean: dbclean photoclean
