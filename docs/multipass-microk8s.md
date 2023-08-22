# MicroK8s in Multipass

This guide will take you through the process of setting up MicroK8s in Multipass for testing
Juju Dashboard.

**Note: this setup is recommended for testing only and will require [additional steps](#reboot-instructions) to view the dashboard each time the Multipass container is booted.**

This guide builds upon some docs from each project that may be useful if you run into
issues:

- [Installing MicroK8s with
  multipass](https://microk8s.io/docs/install-multipass)
- [How to use MicroK8s with Juju](https://juju.is/docs/olm/microk8s)
- [Deploy Juju Dashboard](/README.md#deploy)
- [Building and Testing the k8s charm](https://github.com/canonical/juju-dashboard-charm#building-and-testing-the-k8s-charm)

To begin, launch and enter into a new Multipass container:

```shell
multipass launch -c 2 -d 20G -m 8G --name microk8s
multipass shell microk8s
```

Now install MicroK8s. Newer versions of Juju require strict MicroK8s (you can check for newer strict
channels using `snap info microk8s`).

```shell
sudo snap install microk8s --channel=1.28-strict/stable
```

You will need to be in the microk8s group so run:

```shell
sudo usermod -a -G snap_microk8s ubuntu
```

To reload your groups exit the multipass shell and then enter it again:

```shell
multipass shell microk8s
```

Now enable the storage and DNS add-ons:

```shell
sudo microk8s status --wait-ready
sudo microk8s.enable hostpath-storage
sudo microk8s.enable dns
sudo microk8s status --wait-ready
```

Install Juju:

```shell
sudo snap install juju --channel=latest
mkdir -p ~/.local/share
```

Bootstrap a new controller in MicroK8s:

```shell
juju bootstrap microk8s micro
juju change-user-password admin
```

Switch to the controller model:

```shell
juju switch controller
```

You have a choice of either [using the charm](#deploy-from-charmhub) from Charmhub or [building the charm](#build-the-charm)
locally.

## Deploy from Charmhub

To deploy from Charmhub run:

```shell
juju deploy juju-dashboard-k8s dashboard
```

Now move on to the [post deployment](#post-deployment) instructions.

## Build the charm

You will need to [install Docker
Engine](https://docs.docker.com/engine/install/ubuntu/). The simplest method is
to use the install script:

```shell
sudo apt update && sudo apt-get install uidmap -y
curl -sSL https://get.docker.com/ | sh
dockerd-rootless-setuptool.sh install
sudo usermod -aG docker $USER
```

Now exit and then enter the shell to reload your groups:

```shell
multipass shell microk8s
```

Fetch the dashboard:

```shell
git clone https://github.com/canonical/juju-dashboard.git
cd juju-dashboard
```

Build and import the Docker image:

```shell
DOCKER_BUILDKIT=1 docker build -t juju-dashboard .
docker image save juju-dashboard | microk8s ctr image import -
```

Now get the dashboard charm:

```shell
cd ~
git clone https://github.com/canonical/juju-dashboard-charm.git
cd juju-dashboard-charm/k8s-charm/
```

Install Charmcraft:

```shell
sudo snap install charmcraft --classic
lxd init --auto
```

Build the charm:

```shell
charmcraft pack
```

Get the ID of the Docker image you built earlier:

```shell
docker image inspect juju-dashboard | grep "Id"
```

Then deploy the charm using the image ID:

```shell
juju deploy --resource dashboard-image=[docker-image-id] ./juju-dashboard*.charm dashboard
```

Now you can move on to the post deployment steps.

## Post deployment

Once your charm has been deployed run:

```shell
juju integrate controller dashboard
```

Wait for the charm to have been deployed (you can check with `juju status`) then
you will need to forward the dashboard port so that you can access the dashboard
from outside the Multipass container.

```shell
microk8s.kubectl port-forward dashboard-0 8080:8080 --namespace=controller-micro --address=0.0.0.0
```

Exit the Multipass shell and find the IP of the Multipass container:

```
multipass info microk8s
```

Now you can access the dashboard at `http://[multipass.ip]:8080`.

Once you're finished with MicroK8s you can stop the Multipass container with:

```shell
multipass stop
```

If you don't need it anymore you can remove it with:

```shell
multipass delete microk8s
multipass purge
```

## Reboot instructions

Each time you start the Multipass container you will need to do the following
steps:

Remove the dashboard with:

```shell
juju switch controller
juju remove-application dashboard
```

Then redeploy the dashboard using the method you used previously.

If you deployed from Charmhub then deploy again in the same way:

```shell
juju deploy juju-dashboard-k8s dashboard
```

If you deployed from a locally built charm then run:

```shell
cd juju-dashboard-charm/k8s-charm/
docker image inspect juju-dashboard | grep "Id"
juju deploy --resource dashboard-image=[docker-image-id] ./juju-dashboard*.charm dashboard
```

For both methods you will need to integrate the dashboard:

```shell
juju integrate controller dashboard
```

Check the status with `juju status` and wait for the dashboard to be deployed and then run:

```shell
microk8s.kubectl port-forward dashboard-0 8080:8080 --namespace=controller-micro --address=0.0.0.0
```

You should now be able to access the dashboard again.
