# Juju Dashboard Charm

The charm to deploy the dashboard for [Juju](https://juju.is) and [JAAS](https://jaas.ai)

## Usage

```bash
juju switch controller
juju deploy juju-dashboard dashboard
juju relate dashboard controller
juju expose dashboard
juju dashboard
```

## Relations

This charm provides an http interface called "dashboard".

It requires the "juju-dashboard" interface on the Juju controller charm.

## Contributing

Please see the [Juju SDK docs](https://juju.is/docs/sdk) for guidelines
on enhancements to this charm following best practice guidelines for developer guidance.
