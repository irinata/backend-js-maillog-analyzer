.PHONY: up down clean

up:
	docker-compose up

down:
	docker-compose down

clean:
	docker-compose down -v --rmi all