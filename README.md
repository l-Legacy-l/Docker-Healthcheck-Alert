# Docker-Healthcheck-Alert
Docker-Healthcheck-Alert is a lightweight healthcheck docker monitoring and alerting application using Docker Engine API

## How it works
The application starts a web server that periodically monitors the status of the container. If it detects a container that is unhealthy, an alert mail is sent to you. If an unheathy container would change back to healthy for some reason, a new mail is sent to notify you of the change.

The mail will contain additional information useful for debugging such as the identifier or the last logs generated by the container

### Example of an alert
![alt text](https://i.postimg.cc/prNq87mr/healthcheck-alert.png)

## Pre-requisite

In order to to monitor the health of your containers, you must first configure them to integrate a healthcheck, otherwise you will not be alerted.

### Example of healthcheck in a docker-compose
```
healthcheck:
    test: curl --connect-timeout 10 --silent -f http://127.0.0.1:8080/ || exit 1
    interval: 180s
    timeout: 30s
    retries: 3
```

You must also check if the mail service you want to use is supported by the application.
See the list here => https://nodemailer.com/smtp/well-known/

## Installation
### Docker
Docker image is available in DockerHub => https://hub.docker.com/r/legacy18/docker-healthcheck-alert

docker-compose.yml configuration file is also provided in the source. You can clone this repository or copy the file and execute ``` docker-compose up -d ``` to start the container

### From source code
* Install [NodeJS](https://nodejs.org/)
* Clone this repository and open a shell in that path
* Run `npm install` command to install Docker-Healthcheck-Alert dependencies
* Run `npm run build` command to compile TypeScript code
* Run `npm start` command with the necessary environment variables (MAIL_FROM PASSWORD MAIL_TO MAIL_SERVICE) to start the application
