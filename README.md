# Gaia-X Lab Registry

## Getting started

Clone the repository and `cd` into the newly created directory.
Install all the dependencies:
```
npm install
```

If you are setting up the project locally for the first time make sure to

1. Create a `./dist` directory:
```
mkdir ./dist
```
2. Create a .env file or use the example:
```
mv .env.example .env
```

The `PORT` env variable is required to be set.


Once the intitial setup is complete you can simply start the development server with docker-compose:
```
docker-compose up
```

Make sure that the Docker daemon is running on your host operating system.


## Default Setup

Credits to the (typescript-express-starter)[https://github.com/ljlm0402/typescript-express-starter#readme] repository at https://github.com/ljlm0402/typescript-express-starter#readme. This repository uses a customized & enhanced version of the `Mongoose` template.

- Typesript enabled
- Prettier setup with husky to follow & enforce code styling standards upon commits
- Swagger documentation via a `./swagger.yml` file, available at `[host]/api-docs`
- Dockerfile to be used in `development` & `production` environments
- Quick development setup via `docker compose` -> `docker compose up` will serve `localhost:3000`
- VSCode Extensions and on-save formatting
- Sample K8 deployment files for easy MongoDB & Server pod deployments, located at `deploy/[mongo/server]-deployment.yaml`
- TODO: Testing setup with jest
