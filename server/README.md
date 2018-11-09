# QAS Ticket Dashboard application

## Prerequisites
1. Latest version of Node to be installed.
2. Gulp: npm install --global gulp-cli

## Steps to Run
npm install          <= install all the npm dependencies__
npm run build:client <= build client
npm run build:server <= build server
npm run build        <= build both client & server
npm run start        <= start application with pm2
npm run watch        <= start the nodemon and watch for changes
npm run package:ec2  <= create ec2 package at ../packages/ec2/qas-ticket-dashboard-1.0.0.zip

## Steps to setup environment variables
1. Create config.env file in server folder
2. Write the following lines into config.env file  
HOSTNAME=           <= Base url of a web service to get needed resources. For instance, https://agile.qasymphony.com  
UNAME=              <= Username for HOSTNAME's authentication requirement  
PASS=               <= Password for HOSTNAME's authentication requirement  
BOARDID=            <= Dashboard ID provided HOSTNAME  
