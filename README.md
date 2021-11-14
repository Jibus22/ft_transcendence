# ft_transcendence
Web application of an amazing pong game.

## Back end:

### FIRST:
docker-compose build


### Run dev mode for backend/frontend/both:
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up [--build] [back_end_server|front_end_server]

### Run dev mode with debugger for backend/frontend/both:
docker-compose -f docker-compose.yml -f docker-compose.debug.yml up [--build] [back_end_server|front_end_server]

### Run end-to-end test mode for backend:
docker-compose -f docker-compose.yml -f docker-compose.test.yml run back_end_server bash -c 'npm run test:e2e'


### Run production mode:
docker-compose up [--build]

### Documentation for the backend routes:
http://localhost:3000/api/


### DEBUG conf to attach vscode to docker container:
```
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Docker: Attach to Node",
      "type": "pwa-node",
      "request": "attach",
      "restart": true,
      "port": 9229,
      "address": "localhost",
      "localRoot": "${workspaceFolder}/back_end",
      "remoteRoot": "/usr/src/app",
      "protocol": "inspector"
    }
  ]
}
```
