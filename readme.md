# chatty

Showcase of RESTful Microservices internally communicating over gRPC

### Setup

```
git clone git+ssh://github.com/dhruv-m-patel/chatty.git
cd chatty
npm ci
npm run bootstrap
npm start
```

- Visit http://localhost:3000/health for service1 health
- Visit http://localhost:4000/health for service2 health
