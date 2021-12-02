dbclean:
	${RM} back_end/dbDev.sqlite back_end/dbDev.sqlite-shm back_end/dbDev.sqlite-wal

photoclean:
	${RM} data/users_photos_*/*

fclean: dbclean photoclean
