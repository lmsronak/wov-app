# Prerequesites

The following libraries /modules are required for the application to run.

- Nodejs version - 20.3.0 or above

# Installation Steps

- pull the code into your own machine first (Not on the server).
- run the below command on the root directory of the project and also in the frontend directory of the project.
  `npm install `
- after successfully installing nodemodules in root and frontend run the below command to build the project.
  `npm run build `
- after the build is successfull a publish folder should be created like below
  `publish/backend/dist
publish/frontend/dist
publish/package.json`
- inside the publish folder create a .env file and add the below environment variables.
  `PORT=8000  #the port on which the application will run
MONGO_URI=mongodb://localhost:27017/ChakraApp  # you actual mongodb connection string where the database is hosted
JWT_SECRET=AU1q+\06KV7w  # jwt verification secret key (keep a difficult key)
NODE_ENV=production  # keep this as production`
- once this is done copy the entire publish folder and transfer it on the server you want to run.
- after transfer run the below command to run your application
- `npm run prod`
- you application should now be running on http://<host ip>:8000
-

# Example .env

MONGO_URI=mongodb://localhost:27017/ChakraApp
NODE_ENV=development
PORT=8080
JWT_SECRET=AU1q+\06KV7w
