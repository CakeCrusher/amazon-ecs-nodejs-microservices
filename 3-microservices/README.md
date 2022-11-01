# MY NOTES

## containers

- speed
  - they can be moved around with ease
  - they can be connected to other containers on build
- pipeline
  - the contianer can be quickly copied horizontally across the pipeline
- density
  - the container requires less space
  - you can run heterogeneous processes to optimize a server and ensure there is little downtime

## microservices

- isolates crashes
- isolation for security
  - cannot traverse horizontally across services
- independent scaling
  - makes it easier to measure cost
- development velocity
  - unless a connection is made then developers dont need to worry about other services

## process

- tagging the docker image enables pushing it to ther repository without having to rebuild it
  - useful for versioning
- ec2 load balancer is connected to VPC and targets the
- use the same load balancer to shift traffic

## AWS

- IAM
  - requires a permission group
- access keys
  - consists of an access key ID and secret access key
- ECS (elastic container service)
  - magagement service that supports docker containers that runs a cluster of ec2 instances
- application load balancer connected to vpc targets the target group
  - with microservices the load balancer uses routing rules to direct traffic to the right port
  - contains listeners that direct routing
- ECR (elastic container registry)
- target group
  - tracks the instances and ports that are running
- task definition
  - associated to the image
- clusters
  - envelops the containers
  - associates the load balancer with the target group
- workers
  - controllers that manage different tasks
- drill down
  - get more specific
- stdin (standard input)
  - data sent in a stream to be read by a program
- cloud formation
  - crates a stack that manages the resources

## ERRORS

- task definition route to [image-url]:latest must be :v1 because the image pushed was pushed with tag v1
- authenticate docker login with aws
  - > aws ecr get-login-password | docker login --username AWS --password-stdin 531310678730.dkr.ecr.us-east-2.amazonaws.com/api

# -------------------

## From Monolith To Microservices

In this example we take our monolithic application deployed on ECS and split it up into microservices.

![Reference architecture of microservices on EC2 Container Service](../images/microservice-containers.png)

## Why Microservices?

**Isolation of crashes:** Even the best engineering organizations can and do have fatal crashes in production. In addition to following all the standard best practices for handling crashes gracefully, one approach that can limit the impact of such crashes is building microservices. Good microservice architecture means that if one micro piece of your service is crashing then only that part of your service will go down. The rest of your service can continue to work properly.

**Isolation for security:** In a monolithic application if one feature of the application has a security breach, for example a vulnerability that allows remote code execution then you must assume that an attacker could have gained access to every other feature of the system as well. This can be dangerous if for example your avatar upload feature has a security issue which ends up compromising your database with user passwords. Separating out your features into micorservices using EC2 Container Service allows you to lock down access to AWS resources by giving each service its own IAM role. When microservice best practices are followed the result is that if an attacker compromises one service they only gain access to the resources of that service, and can't horizontally access other resources from other services without breaking into those services as well.

**Independent scaling:** When features are broken out into microservices then the amount of infrastructure and number of instances of each microservice class can be scaled up and down independently. This makes it easier to measure the infrastructure cost of particular feature, identify features that may need to be optimized first, as well as keep performance reliable for other features if one particular feature is going out of control on its resource needs.

**Development velocity**: Microservices can enable a team to build faster by lowering the risk of development. In a monolith adding a new feature can potentially impact every other feature that the monolith contains. Developers must carefully consider the impact of any code they add, and ensure that they don't break anything. On the other hand a proper microservice architecture has new code for a new feature going into a new service. Developers can be confident that any code they write will actually not be able to impact the existing code at all unless they explictly write a connection between two microservices.

## Application Changes for Microsevices

**Define microservice boundaries:** Defining the boundaries for services is specific to your application's design, but for this REST API one fairly clear approach to breaking it up is to make one service for each of the top level classes of objects that the API serves:

```
/api/users/* -> A service for all user related REST paths
/api/posts/* -> A service for all post related REST paths
/api/threads/* -> A service for all thread related REST paths
```

So each service will only serve one particular class of REST object, and nothing else. This will give us some significant advantages in our ability to independently monitor and independently scale each service.

**Stitching microservices together:** Once we have created three separate microservices we need a way to stitch these separate services back together into one API that we can expose to clients. This is where Amazon Application Load Balancer (ALB) comes in. We can create rules on the ALB that direct requests that match a specific path to a specific service. The ALB looks like one API to clients and they don't need to even know that there are multiple microservices working together behind the scenes.

**Chipping away slowly:** It is not always possible to fully break apart a monolithic service in one go as it is with this simple example. If our monolith was too complicated to break apart all at once we can still use ALB to redirect just a subset of the traffic from the monolithic service out to a microservice. The rest of the traffic would continue on to the monolith exactly as it did before.

Once we have verified this new microservice works we can remove the old code paths that are no longer being executed in the monolith. Whenever ready repeat the process by splitting another small portion of the code out into a new service. In this way even very complicated monoliths can be gradually broken apart in a safe manner that will not risk existing features.

## Deployment

1. Launch an ECS cluster using the Cloudformation template:

   ```
   $ aws cloudformation deploy \
   --template-file infrastructure/ecs.yml \
   --region <region> \
   --stack-name <stack name> \
   --capabilities CAPABILITY_NAMED_IAM
   ```

2. Deploy the services onto your cluster:

   ```
   $ ./deploy.sh <region> <stack name>
   ```
