# JAAS Dashboard

A dashboard for JAAS (Juju as a service)

## Getting started

Assuming you already have [Docker](https://www.docker.com/) installed, you can simply run;

```
./run
```

...and view the site locally at: http://localhost:8036/

## Running tests

To run tests locally:

```
./run test
```

### Updating CRA

When updating Create React App it's important to take a look at the `optimization.minimizer` values in the webpack config and then update the config in `craco.config.js`. After copying over any updates be sure to re-introduce the `terserOptions.mangle.reserved` key and values in the newly updated config.
