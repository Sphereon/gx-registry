<h1 align="center">Gaia-X Lab Registry</h1>

- [Gaia-X Trust Framework](#gaia-x-trust-framework)
  - [Gaia-X Lab Registry](#gaia-x-lab-registry)
  - [Gaia-X Lab Compliance Service](#gaia-x-lab-compliance-service)
- [Get Started with Using The API](#get-started-with-using-the-api)
  - [Look for a given Trust Anchor public key in the registry](#look-for-a-given-trust-anchor-public-key-in-the-registry)
  - [Verify that a given Certificate Chain is resolvable against a Trust Anchor in the registry](#verify-that-a-given-certificate-chain-is-resolvable-against-a-trust-anchor-in-the-registry)
- [Get Started With Development](#get-started-with-development)
  - [Default Setup](#default-setup)

## Gaia-X Trust Framework

For Gaia-X to ensure a higher and unprecedented level of trust in digital platforms, we need to make trust an easy to understand and adopted principle. For this reason, Gaia-X developed a [Trust Framework](https://gaia-x.gitlab.io/policy-rules-committee/trust-framework/) – formerly known as Gaia-X Compliance and Labelling Framework that safeguards data protection, transparency, security, portability, and flexibility for the ecosystem as well as sovereignty and European Control.

The Trust Framework is the set of rules that define the minimum baseline to be part of the Gaia-X Ecosystem. Those rules ensure a common governance and the basic levels of interoperability across individual ecosystems while letting the users in full control of their choices.

In other words, the Gaia-X Ecosystem is the virtual set of participants and service offerings following the requirements from the Gaia-X Trust Framework.

### Gaia-X Lab Registry

Using the Gaia-X Lab Registry, you can verify the validity of signed claims (e.g., Self Descriptions) by checking the provided certificates against Gaia-X endorsed Trust Anchor certificates.

The Gaia-X Lab Registry is responsible for storing Trust Anchor certificates at any time.

All key pairs used to sign claims must have at least one of the Trust Anchors in their certificate chain to comply with the Gaia-X Trust Framework.

Find a list of endorsed trust anchors here: https://gaia-x.gitlab.io/policy-rules-committee/trust-framework/trust_anchors/

### Gaia-X Lab Compliance Service

The Compliance Service will validate the shape and content of Self Descriptions. Required fields and consistency rules are defined in the [Trust Framework](https://gaia-x.gitlab.io/policy-rules-committee/trust-framework/trust_anchors/).

The Compliance Service can validate shapes of self-descriptions and sign valid self-descriptions.

GitLab repository: https://gitlab.com/gaia-x/lab/compliance/gx-compliance

## Get Started with Using The API

You can find the Swagger API documentation under `localhost:3000/docs/` or https://registry.lab.gaia-x.eu/docs/

### Look for a given Trust Anchor public key in the registry

Using the `/api/trustAnchor` route, you can check if a given public key exists in the list of endorsed trust anchors.
You must provide the public key in the request body.

**Request body:**

```json
{
  "certificate": "MIIE0TCCA7mgAwIBAgICApMwDQYJKoZIhvcNAQEFBQAwgc8xCzAJBgNVBAYTAkFUMYGLMIGIBgNVBAoegYAAQQAtAFQAcgB1AHMAdAAgAEcAZQBzAC4AIABmAPwAcgAgAFMAaQBjAGgAZQByAGgAZQBpAHQAcwBzAHkAcwB0AGUAbQBlACAAaQBtACAAZQBsAGUAawB0AHIALgAgAEQAYQB0AGUAbgB2AGUAcgBrAGUAaAByACAARwBtAGIASDEYMBYGA1UECxMPQS1UcnVzdC1RdWFsLTAxMRgwFgYDVQQDEw9BLVRydXN0LVF1YWwtMDEwHhcNMDIwMjA2MjMwMDAwWhcNMDUwMjA2MjMwMDAwWjCB0TELMAkGA1UEBhMCQVQxgYswgYgGA1UECh6BgABBAC0AVAByAHUAcwB0ACAARwBlAHMALgAgAGYA/AByACAAUwBpAGMAaABlAHIAaABlAGkAdABzAHMAeQBzAHQAZQBtAGUAIABpAG0AIABlAGwAZQBrAHQAcgAuACAARABhAHQAZQBuAHYAZQByAGsAZQBoAHIAIABHAG0AYgBIMRkwFwYDVQQLExBUcnVzdFNpZ24tU2lnLTAxMRkwFwYDVQQDExBUcnVzdFNpZ24tU2lnLTAxMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA3vqE78j1NAlAT8GC1kqNk6qL+jn1dLTADCiQVIyct01vkO0zINkUg2x6k7E2xnmyDPg4ihayczDYcuzzQMMms63MFDlONMZ180CxFsZpOYK8SctdTWdH0tGJFJF0oBWI6ROykMxo3knPLMDMTS586MgPdKxmihk5OjyZvqiEH1SdmuFR4UTke81cisUkM6+hh4v/AYrPShXOlEmNmFILMw9iQST5aeylmgfWwixCZgnmS7fr3j65gezxhPN56qRyndgu97/9VsKMASYTsaD8pZEZ230TIopuwGb4AeO7CUrU22scpnreHLW1ZX4hldJYJXzFpBH2pAnHfiQgADs4CwIDAQABo4GyMIGvMA8GA1UdEwEB/wQFMAMBAf8wEQYDVR0OBAoECEeMFJHO+gwZMBMGA1UdIwQMMAqACEs8jB2F6W+tMA4GA1UdDwEB/wQEAwIBBjBkBgNVHR8EXTBbMFmgV6BVhlNsZGFwOi8vbGRhcC5hLXRydXN0LmF0L291PUEtVHJ1c3QtUXVhbC0wMSxvPUEtVHJ1c3QsYz1BVD9jZXJ0aWZpY2F0ZXJldm9jYXRpb25saXN0PzANBgkqhkiG9w0BAQUFAAOCAQEAS1Ch3C9IGqX4c/PCp0Hp93r+07ftu+A77EW7w5kDQ6QhuuXAJgVk4Vyp4D+wlJMxQpvDGkBnaSYcRyT5rT7ie/eImbHi+ep6AD/mcKs8D2XXDDEy/UxuvEe7pDqrAZc93LID8HnrMf2OFqXbmBggN/TvD20s2CBnEgP+QCm9asttMCg1FLIAIeDL/JstH3ddTlIQNPgUCCaUmATP8oOnh2eon7Fn5+dnKDUY4j6lRDPsDzu0wU0s9VWiyS9Lay0f7P9h3LcYHtAYZg2BPlEAqpOVNVXZ+4JdjRKvhHh9pgadnGNkunrenDiekHgbABop0s2yj5EDAkqYIosnp4bOCQ=="
}
```

**Responses:**

If a corresponding trust anchor is found, a HTTP response status code `200` and a response object will be returned.

**Response object:**

HTTP response status code `200`:

```json
{
  "trustState": "trusted",
  "trustedForAttributes": "/.*/gm",
  "trustedAt": 1645817070
}
```

**Negative responses:**
|HTTP response status code |Description |
|--- | --- |
|`404`| Could not find a Trust Anchor for the given public key|
|`400`| Invalid request|

### Verify that a given Certificate Chain is resolvable against a Trust Anchor in the registry

Using the `/api/trustAnchor/chain` route, you can check if any of the given certificates in a certificate chain is resolvable against an endorsed trust anchor.
You must provide the certificate chain as `String` in the request body. Make sure to provide a cleared `String` without spaces and new line characters.

**Request body (certificates shortened in example):**

```json
{
  "certs": "-----BEGIN CERTIFICATE-----MIIDxzCCA02gAwIBAgISAwrdU+...sF6DpICK1MndBOGAY5E5RDu1EW6+Snk852PQTDM=-----END CERTIFICATE----------BEGIN CERTIFICATE-----MIICxjCCAk2gAwIBAgIRALO93.../Lgul/-----END CERTIFICATE----------BEGIN CERTIFICATE-----MIICGzCCAaGgAwIBAgIQQdKd0XLq7qeAwSxs6S...q4AaOeMSQ+2b1tbFfLn-----END CERTIFICATE-----"
}
```

**Responses:**

If a corresponding trust anchor is found, a HTTP response status code `200` and a response object will be returned.

**Response object:**

HTTP response status code `200`:

```json
{
  "result": true
}
```

**Negative responses:**

HTTP response status code `409` - Certificate chain could not be verified:

```json
{
  "result": false,
  "resultCode": -1,
  "resultMessage": "No valid certificate paths found"
}
```

| HTTP response status code | Description     |
| ------------------------- | --------------- |
| `400`                     | Invalid request |

## Get Started With Development

Clone the repository and jump into the newly created directory:

```sh
git clone https://gitlab.com/gaia-x/lab/compliance/gx-registry.git
cd gx-registry
```

Next we need to take care of the initial setup of the project:

```sh
# Install all the dependencies
npm install

# Make sure the ./dist folder exists
mkdir ./dist

# Create a .env file or use the example:
# The PORT .env variable is required to be set
mv .env.example .env

# Make sure npx is installed, as it is used for our commitlint setup
npm install -g npx
```

If everything is setup correctly, you can start the development environment with docker-compose. Make sure that the Docker daemon is running on your host operating system.

```sh
docker-compose up
```

### Default Setup

Credits to the (typescript-express-starter)[https://github.com/ljlm0402/typescript-express-starter#readme] repository at https://github.com/ljlm0402/typescript-express-starter#readme. This repository uses a customized & enhanced version of the `Mongoose` template.

- Typesript enabled
- Prettier setup with husky to follow & enforce code styling standards upon commits
- Swagger documentation via a `./swagger.yml` file, available at `[host]/docs`
- Dockerfile to be used in `development` & `production` environments
- Quick development setup via `docker compose` -> `docker compose up` will serve `localhost:3000`
- VSCode Extensions and on-save formatting
- Sample K8 deployment files for easy MongoDB & Server pod deployments, located at `deploy/[mongo/server]-deployment.yaml`
