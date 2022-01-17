TEST_ARG := $(if $(TARGET),--testRegex="$(TARGET)",$())

all:
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up ; docker-compose rm -fsv
## TODO -> change to prod !

## -----------------------------------------------------------------------------
##		RUN
## -----------------------------------------------------------------------------


# usage:
#  run all tests: `make test`
#  run chat specific tests : `make test TARGET=chat`
test:
	docker-compose -f docker-compose.yml -f docker-compose.test.yml run back_end_server bash -c 'jest --config ./test/jest-e2e.json --maxWorkers=1 --watch --verbose --testLocationInResults $(TEST_ARG)' ; docker-compose rm -fsv

db:
	docker-compose -f docker-compose.yml up database_server ; docker-compose rm -fsv

seed-data:
	@echo 'This recipe seeds all kind of data available for seeding !'
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml run back_end_server bash -c 'npm run seed:randomData'

seed-users:
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml run back_end_server bash -c 'npm run seed:randomUsers'

seed-games:
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml run back_end_server bash -c 'npm run seed:randomGames'

seed-rooms:
	@echo 'This recipe seeds new Rooms + Messages for new and existing rooms'
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml run back_end_server bash -c 'npm run seed:randomRooms'

seed-chatMessages:
	@echo 'This recipe seeds new Messages for existing rooms'
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml run back_end_server bash -c 'npm run seed:randomChatMessages'

seed-getData:
	@echo 'This recipe get Database content'
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml run back_end_server bash -c 'npm run seed:getData'

back:
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up back_end_server ; docker-compose rm -fsv

front:
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up front_end_server ; docker-compose rm -fsv

prod:
	docker-compose up ; docker-compose rm -fsv

reprod: dbclean
	docker-compose up ; docker-compose rm -fsv


## -----------------------------------------------------------------------------
##		BUILD
## -----------------------------------------------------------------------------

allbuild:
	docker-compose build

prodbuild:
	docker-compose up --build ; docker-compose rm -fsv

backbuild:
	docker-compose build back_end_server

frontbuild:
	docker-compose build front_end_server

## -----------------------------------------------------------------------------
##		BACK
## -----------------------------------------------------------------------------

backdoc:
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml run  -p 8080:8080 back_end_server bash -c 'npm run documentation:serve'

backtest:
	docker-compose -f docker-compose.yml -f docker-compose.test.yml run back_end_server bash -c 'npm run test:e2ewatch'

backbash:
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml run back_end_server bash

backbash_prod:
	docker-compose -f docker-compose.yml run back_end_server bash

migration:
	docker-compose -f docker-compose.yml up ; docker-compose rm -fsv

dbbash:
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml run database_server bash

## -----------------------------------------------------------------------------
##		CLEAN
## -----------------------------------------------------------------------------

dockerclean:
	docker volume rm --force repo_dist_guest_back
	docker volume rm --force repo_database_storage
	docker volume prune
	docker system prune

dockerfclean:
	@docker system prune
	@docker builder prune
	@docker volume prune
	@docker system prune
	@docker images -a -q | xargs -I % docker rmi %
	@docker system df

dbclean:
	${RM} -rf database
	${RM} back_end/dbDev.sqlite back_end/dbDev.sqlite-shm back_end/dbDev.sqlite-wal

photoclean:
	${RM} data/users_photos_*/*

fclean: dbclean photoclean
	${RM} -rf back_end/dist
