# Gaia-X Lab Registry

A boilerplate to use for new express-js backend / API projects.

Credits to the (typescript-express-starter)[https://github.com/ljlm0402/typescript-express-starter#readme] repository at https://github.com/ljlm0402/typescript-express-starter#readme. This repository uses a customized & enhanced version of the `Mongoose` template.

## Default Setup

- Typesript enabled
- Prettier setup with husky to follow & enforce code styling standards upon commits
- Swagger documentation via a `./swagger.yml` file, available at `[host]/api-docs`
- Dockerfile to be used in `development` & `production` environments
- Quick development setup via `docker compose` -> `docker compose up` will serve `localhost:3000`
- VSCode Extensions and on-save formatting
- Sample K8 deployment files for easy MongoDB & Server pod deployments, located at `deploy/[mongo/server]-deployment.yaml`
- TODO: Testing setup with jest
