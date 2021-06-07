# high-fives-service

A microservice for all things related to high fives

### Setup MongoDB

Download MongoDB locally from https://www.mongodb.com/try/download/community and to visulaize your Database you can download MongoDB Compass from https://www.mongodb.com/try/download/compass

## To setup and run the service locally


```
git clone git@github.com:alcumus/services.git
cd services/microservices/high-five-service
cp .env.example .env
npm run ci
npm start-dev
```
Access the service running on http://localhost:4011/
Access the Swagger UI running on http://localhost:4011/v1/docs
## commands

- `npm test`: Runs tests in the High Five Service
- `npm run start-dev`: Runs the service locally in dev mode
- `npm run build`: Executes the build command
- `npm run start`: Runs the service locally from the build folder (In production mode)
