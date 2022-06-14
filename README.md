# XDC SCM Blockchain Follower #

### Usage ###

This microservice basically handle all Blockchain related services like -
* Contract Details
* Transaction Details
* etc.

### Steps for local setup ###

* Clone the repository in your local system
* Run `npm install` : To install the dependencies
* For run the microservice use SSH tunneling 
* Run `npm run nodemon` : It will start your server on your local machine
* Configuration : `config/env` directory contains files to define environment specific variables
* Dependencies : Defined under `package.json` 
* Database configuration : Defined under `config/dbConnection` 
* Deployment instructions : Docker based deployment, Dockerfile is there in parent directory

### About env folder ###

This folder is having different type of variable like DB url, PORT, microservice url etc.
* **test** : it have all variable which is use for testing purpose.
* **local** : it have all variable which is use for local system.
* **development** : it have all variable which is use in development environment.
* **production** : it have all variable which is use for production environment.


