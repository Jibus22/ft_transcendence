TEST_ARG := $(if $(TARGET),--testRegex="$(TARGET)",$())

all:  ##
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up ; docker-compose rm -fsv
## TODO -> change to prod !

## -----------------------------------------------------------------------------
##		RUN
## -----------------------------------------------------------------------------


test:  ## Run tests. Usage: run all tests: `make test`, run chat specific tests : `make test TARGET=chat`
	docker-compose -f docker-compose.yml -f docker-compose.test.yml run back_end_server bash -c 'jest --runInBand --config ./test/jest-e2e.json --watch --verbose --testLocationInResults $(TEST_ARG)' ; docker-compose rm -fsv

dbtest:  ## Run tests. Usage: run all tests: `make test`, run chat specific tests : `make test TARGET=chat`
	docker-compose -f docker-compose.yml -f docker-compose.test.yml run back_end_server bash -c 'node --inspect-brk jest --runInBand --config ./test/jest-e2e.json --watch --verbose --testLocationInResults $(TEST_ARG)' ; docker-compose rm -fsv

debug:
	docker-compose -f docker-compose.yml -f docker-compose.debug.yml up ; docker-compose rm -fsv

db:  ## Run database server in production mode
	docker-compose -f docker-compose.yml up database_server ; docker-compose rm -fsv

## -----------------------------------------------------------------------------
##		SEED
## -----------------------------------------------------------------------------

seed-prod-data: ## Seed data when the production backend and database are running
	@echo 'This recipe seeds all kind of data available for seeding !'
	docker exec -it $$(docker container ls --filter=label=service=backend --quiet) bash -c 'npm run seed:randomData'

seed-prod-users: ## Seed users when the production backend and database are running
	@echo 'This recipe seeds all kind of data available for seeding !'
	docker exec -it $$(docker container ls --filter=label=service=backend --quiet) bash -c 'npm run seed:randomUsers'

seed-prod-getdata: ## Show data from database when the production backend and database are running
	@echo 'This recipe seeds all kind of data available for seeding !'
	docker exec -it $$(docker container ls --filter=label=service=backend --quiet) bash -c 'npm run seed:getData'

seed-data: ## Seed all kind of data in dev environnement (database has to already exist)
	@echo 'This recipe seeds all kind of data available for seeding !'
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml run back_end_server bash -c 'npm run seed:randomData'

seed-users: ## Seed users in dev environnement (database has to already exist)
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml run back_end_server bash -c 'npm run seed:randomUsers'

seed-games: ## Seed games in dev environnement (database has to already exist)
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml run back_end_server bash -c 'npm run seed:randomGames'

seed-rooms: ## Seed chat rooms in dev environnement (database has to already exist)
	@echo 'This recipe seeds new Rooms + Messages for new and existing rooms'
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml run back_end_server bash -c 'npm run seed:randomRooms'

seed-chatMessages: ## Seed chat messages in dev environnement (database has to already exist with some rooms and users)
	@echo 'This recipe seeds new Messages for existing rooms'
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml run back_end_server bash -c 'npm run seed:randomChatMessages'

seed-getData:  ## Show data in dev environnement (database has to already exist)
	@echo 'This recipe get Database content'
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml run back_end_server bash -c 'npm run seed:getData'

## -----------------------------------------------------------------------------
##		RUN
## -----------------------------------------------------------------------------

back:   ## Run back end server in dev mode
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up back_end_server ; docker-compose rm -fsv

front:  ## Run front end server in dev mode
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up front_end_server ; docker-compose rm -fsv

prod:  ## Run front, back and database in production mode
	docker-compose up ; docker-compose rm -fsv

reprod: fclean ## Run production mode after cleaning database and storages files
	docker-compose up ; docker-compose rm -fsv


## -----------------------------------------------------------------------------
##		BUILD
## -----------------------------------------------------------------------------

allbuild:  ## Build all containers
	docker-compose build

prodbuild:  ## Build and run production mode
	docker-compose up --build ; docker-compose rm -fsv

dbbuild:  ## Build and run back end server
	docker-compose build database_server

backbuild:  ## Build and run back end server
	docker-compose build back_end_server

frontbuild:  ## Build and run front end server
	docker-compose build front_end_server

## -----------------------------------------------------------------------------
##		FRONT
## -----------------------------------------------------------------------------

frontbash:  ## Open frontend back container in dev mode on a bash
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml run front_end_server bash

frontbash_prod:  ## Open frontend back container in production mode on a bash
	docker-compose -f docker-compose.yml run front_end_server bash


## -----------------------------------------------------------------------------
##		BACK
## -----------------------------------------------------------------------------

backdoc:  ## Run documentation server
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml run  -p 8080:8080 back_end_server bash -c 'npm run documentation:serve'

backtest:  ## Run all e2e tests
	docker-compose -f docker-compose.yml -f docker-compose.test.yml run back_end_server bash -c 'npm run test:e2ewatch'

backbash:  ## Open backend back container in dev mode on a bash
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml run back_end_server bash

backbash_prod:  ## Open backend back container in production mode on a bash
	docker-compose -f docker-compose.yml run back_end_server bash

dbbash:  ## Open database server container in dev mode on a bash
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml run database_server bash

## -----------------------------------------------------------------------------
##		CLEAN
## -----------------------------------------------------------------------------

dockerclean:  ## Remove all volumes and data from Docker
	docker volume rm --force repo_dist_guest_back
	docker volume rm --force repo_database_storage
	docker volume prune
	docker system prune

dockerfclean:  ## Remove all volumes, images and data from Docker
	@docker system prune
	@docker builder prune
	@docker volume prune
	@docker system prune
	@docker images -a -q | xargs -I % docker rmi %
	@docker system df

dbclean:  ## Remove all database related files and volumes
	${RM} -rf database
	${RM} back_end/dbDev.sqlite back_end/dbDev.sqlite-shm back_end/dbDev.sqlite-wal
	docker volume rm $(shell basename `pwd` | tr '[:upper:]' '[:lower:]')_database_storage

photoclean:  ## Remove all user photos files
	${RM} data/users_photos_*/*

fclean: dbclean photoclean ## Do dbcleam, photoclean and remove backend dist local directory
	${RM} -rf back_end/dist

.PHONY: help

help:  ## Display these informations
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
