# Learn Passport JS
## Requirements

In an Organisation there are 3 roles

- Admin
- Supervisor
- Employee

Admin will be able to create / update / delete / view users
Supervisor will be able to View / update users who report to them
Employee will be able to only view / update info of themselves

- Design REST APIs to create / update / delete / view users depending on the persona logged in
- Design your own login system and method to determine role of logged in user
- Use NodeJS, ExpressJS and PassportJS

## Installation
You can run everything in docker containers.

```
docker-compose up
```

You can also run the server directly in node if you have a MongoDB locally.
```
npm install
npm run start
```

If you don't have a MongoDB, you can just run it in a docker container, with some bootstrapped data.

```bash
docker-compose up -d mongo-seed
```

### Environment variables
[dotenv](https://www.npmjs.com/package/dotenv) is used to read the envirionment variables from `.env`. However, the file is ignored in git. The following is the sample setup. They're included in [docker-compose.yml](/docker-compose.yml). You don't need to worry about them if you run them in docker containers. 

```
DB_STRING=mongodb://localhost:27017/learn-passport
KEY_FOLDER=../../../keypair
PUB_KEY_NAME=id_rsa.pub
PRIV_KEY_NAME=id_rsa
NODE_ENV=dev
```

## User Schema
To simplify the problem, the user profile is very simple.

```typescript
interface IUser {
  username: string;
  tShirtSize: string;
  isAdmin: boolean;
  members: string[];
  manager: string;
  hash: string;
  salt: string;
  createdAt: Date;
  lastUpdated: Date;
}
```

## API Docs
It's recommended to include an OpenAPI 3.0 under [docs](/docs/).
GET `/api/v1/users` get all users
POST `/api/v1/users` Create a new user
PUT `/api/v1/users/:userId` Update a user
DELETE `/api/v1/users/:userId` Delete a user

[A postman collection](/docs/learn-passport.postman_collection.json) is added for sample inputs. The integration tests may help.

## Bootstrap
You are encouraged to use `docker-compose up -d` to run mongoDB in a docker-container. There is a *SQL-Migration* included in [mongo](/mongo/init.json) used to seed data.

To bootstrap the data, use the following command.
```bash
mongoimport --host mongodb --db learn-passport --collection users --type json --file /init.json --jsonArray
```

Here's sample users

| username | Role       | Password | ReportTo
|:--------|:-----------|:-------------------------------------------------------------------------------| -- |
| admin | admin | `admin` | N/A |
| jeff  | manager | `manager` | N/A |
| david | user | `teamplayer` | jeff |

## Tests
[Jest](https://jestjs.io/) is the test framework. And supertest is used to spin up a server at port 0, and run the api/integration tests.

```bash
> jest --version
28.1.3
```

### JWT, RSA Public Key and Private Key
In order to use JWT and issue a JWT, a pair of private key and public key is used. I have included a pair under the folder [keypair](/keypair). It's never the right practice to upload a private key to Github. Since it's been exposed publicly, please do not use it for production.

You can also generate a new pair using [the JavaScript Snippet](/keypair/generateKeypair.js).
```base
node keypair/generateKeyPair.js
```

### Coverage

|File                   | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s               |
|-----------------------|---------|----------|---------|---------|---------------------------------|
All files              |   93.38 |    71.42 |     100 |   93.38 |                                 
 src                   |   88.88 |       25 |     100 |   88.88 |                                 
  app.ts               |   88.88 |       25 |     100 |   88.88 | 13-14,55-57,60-61               
 src/lib               |   97.74 |    74.19 |     100 |   97.74 |                                 
  configurePassport.ts |   95.06 |    71.42 |     100 |   95.06 | 35,41,52,63                     
  connectDB.ts         |     100 |       50 |     100 |     100 | 4                               
  errors.ts            |     100 |      100 |     100 |     100 |                                 
  utils.ts             |   98.75 |       80 |     100 |   98.75 | 15-16                           
 src/models            |     100 |      100 |     100 |     100 |                                 
  User.ts              |     100 |      100 |     100 |     100 |                                 
 src/routes            |   89.61 |       75 |     100 |   89.61 |                                 
  auth.ts              |   86.61 |    81.81 |     100 |   86.61 | 26-28,53-54,74-79,83-86,123-124 
  users.ts             |   92.48 |    70.58 |     100 |   92.48 | 43,61,73-75,78-80,99-100        


### Unit tests
### Integration tests
The tests under [integrations](/test/integration) requires you spin up a MongoDB. Sample data used for testing will be added to the database called test -- `'mongodb://localhost:27017/test'`
To verify the setup is bootstraped, simply run: 

```bash
> jest -- UserModel.spec.ts
```

If you have a diffent mongodb address, please update the address under the [setup-test.ts](/test/app.spec.ts)
```typescript
process.env.DB_STRING = 'mongodb://localhost:27017/test';
process.env.NODE_ENV = 'test';
```

## Limitations
Due to the limited time, the following features are not implemented.

- Under the register flow, the user can specify the manager (but not members). This is the only chance for them to set their manager. An admin can use api to create a user, where they can specify the new user's members and manager.
- Members / Manager update, it can be performed by an admin only. And the admin has to complete it by multiple update requests. For example, to update John's manager from Sam to Jeff, the admin needs to remove John from Sam's `members` list, add John to Jeff's `members` list and lastly update John's `manager` field to Jeff.
- A member's member is also their manager's member. A manager's manager is also their manager. It's a tree. However, the permission checking doesn't recursively get to the root node or leaf node. For example, Jeff manages Tim, Tim manages Sam, Sam is a also member of Jeff, and Jeff is also Sam's manager. However, in the simplified model, Jeff and Sam are not related.
- When a user is deleted, the admin has to take care of their members or manager, in order to unlink the relationship.

## Extension

- If you follow Auth0's [Fine Grained Authorization](https://auth0.com/developers/lab/fine-grained-authorization) model or Google's Zanzibar, it's better to define a type of team with a few relations, to represent the hierarchy tree. But it's out of the scope of this project.

```
type team
  relations
    define child as self
    define parent as self
    define manager as self or manager from parent
    define member as self or manager or member from child
```
