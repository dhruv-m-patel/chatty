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

### Inter-service communication using gRPC

The inter-service communication was established in following steps:

1. Define protos for each gRPC server
2. Define gRPC server for each server that consumes the proto and spins up the server on a separate port, which is different then what express app runs on.
3. Implement gRPC clients referring to proto from the other service to consume messages from it. Export the client for express app routes to make communication through messages.
4. Import client in route handler and call the function to receive message from the other service over gRPC message. When message is received, send response back to client from REST endpoint.

- To see service1 consume a message from service2, visit http://localhost:3000/message-from-service2

- To see service2 consume a message from service1, visit http://localhost:4000/message-from-service1
