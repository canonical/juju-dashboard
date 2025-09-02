To report a security issue, file a [Private Security Report](https://github.com/canonical/juju-dashboard/security/advisories/new) with a description of the issue, the steps you took to create the issue, affected versions, and, if known, mitigations for the issue.
The [Ubuntu Security disclosure and embargo policy](https://ubuntu.com/security/disclosure-policy) contains more information about what you can expect when you contact us and what we expect from you.

It is recommended to deploy Juju Dashboard with a TLS certificate. See the [Juju TLS guide](https://charmhub.io/topics/security-with-x-509-certificates) for more details. For a brief introduction to deploying the dashboard with a TLS certificate see the [juju-dashboard](https://charmhub.io/juju-dashboard#p-25782-deploy-with-tls-3) or [juju-dashboard-k8s](https://charmhub.io/juju-dashboard-k8s#p-25783-deploy-with-tls-3) charm docs.

For increased security it is recommended to not make Juju Dashboard publicly available. See the docs on [deploying Juju offline](https://documentation.ubuntu.com/juju/latest/howto/manage-your-juju-deployment/set-up-your-juju-deployment-offline/#take-your-deployment-offline).

More information about securing your Juju environment can be found in the Juju [harden your Juju deployment](https://documentation.ubuntu.com/juju/latest/howto/manage-your-juju-deployment/harden-your-juju-deployment/) docs.
