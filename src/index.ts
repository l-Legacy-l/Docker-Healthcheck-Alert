import axios, { AxiosRequestConfig } from 'axios';
import { Container, ContainerDetails, HEALTH_STATUS } from './model/DockerResponse';
const nodemailer = require('nodemailer');


const config: AxiosRequestConfig = {
  socketPath: '/var/run/docker.sock'
}
const transporter = nodemailer.createTransport({
  service: process.env.MAIL_SERVICE,
  auth: {
    user: process.env.MAIL_FROM,
    pass: process.env.PASSWORD
  }
});

const mailOptionsUnhealthy = {
  from: process.env.MAIL_FROM,
  to: process.env.MAIL_TO,
  subject: 'Docker Heathcheck Alert - Unhealthy container reported',
  html: ''
};

const mailOptionsHealthy = {
  from: process.env.MAIL_FROM,
  to: process.env.MAIL_TO,
  subject: 'Docker Heathcheck Alert - Healthy container reported',
  html: ''
};


let unHealthyContainerIds: string[] = [];

const dockerAxios = axios.create(config);

async function request(path: string) {
  try {
    const response = await dockerAxios.get(path);
    if (response?.status >= 200 && response?.status < 300) {
      return response.data;
    }
    throw new Error('Error, response status from docker socket was : ' + response.status);

  } catch (error) {
    throw new Error('Error on the HTTP call: ' + error);
  }
}

function main() {
  const interval = process.env.INTERVAL ? +process.env.INTERVAL : 180000
  setInterval(() => {
    performContainerHeathCheck();
  }, interval);

}

async function performContainerHeathCheck() {
  const containers: Container[] = await request('/containers/json');
  for (const container of containers) {
    const containerDetails: ContainerDetails = await request('/containers/' + container.Id + '/json');
    if (containerDetails.State?.Health?.Status) {
      if (containerDetails.State.Health.Status === HEALTH_STATUS.unhealthy &&
        !unHealthyContainerIds.find((Id) => Id === containerDetails.Id)) {

        unHealthyContainerIds.push(containerDetails.Id);
        sendAlert(containerDetails, mailOptionsUnhealthy);

      } else if (containerDetails.State.Health.Status === HEALTH_STATUS.healthy &&
        unHealthyContainerIds.find((Id) => Id === containerDetails.Id)) {

        unHealthyContainerIds = unHealthyContainerIds.filter((Id) => Id !== containerDetails.Id);
        sendAlert(containerDetails, mailOptionsHealthy);
      }
    }

  }
}

function sendAlert(container: ContainerDetails, mailOptions: {
  from: string | undefined, to: string | undefined, subject: string,
  html: string
}) {
  if (container.State.Health.Status === HEALTH_STATUS.unhealthy) {
    mailOptions.html = '<p>Container ' + container.Name + ' is unhealthy:</p><p>' + '<strong>id:</strong> ' + container.Id + '</p><p><strong>Health:</strong> '
      + JSON.stringify(container.State.Health) +
      '</p><p><strong>Status:</strong> ' + JSON.stringify(container.State.Status) + '</p>';
  } else {
    mailOptions.html = '<p>Container ' + container.Name + ' is back to healthy:</p><p>' + '<strong>id:</strong> ' + container.Id + '</p><p><strong>Health:</strong> '
      + JSON.stringify(container.State.Health) +
      '</p><p><strong>Status:</strong> ' + JSON.stringify(container.State.Status) + '</p>';
  }

  transporter.sendMail(mailOptions, (error: string, info: { response: string }) => {
    if (error) {
      throw new Error('Error when sending the mail: ' + error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}

main();