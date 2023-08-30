import { Spinner } from "@canonical/react-components";
import { useEffect } from "react";

import { actions as jujuActions } from "store/juju";
import {
  getCrossModelQueryErrors,
  getCrossModelQueryLoaded,
  getCrossModelQueryLoading,
  getCrossModelQueryResults,
} from "store/juju/selectors";
import { useAppDispatch, useAppSelector } from "store/store";

import CodeSnippetBlock from "../CodeSnippetBlock/CodeSnippetBlock";

import "./_results-block.scss";

export enum TestId {
  LOADING = "loading",
}

export enum Label {
  NO_RESULTS = "No results returned!",
}

const ResultsBlock = (): JSX.Element | null => {
  const dispatch = useAppDispatch();
  const isCrossModelQueryLoading = useAppSelector(getCrossModelQueryLoading);
  const isCrossModelQueryLoaded = useAppSelector(getCrossModelQueryLoaded);
  const crossModelQueryResults = useAppSelector(getCrossModelQueryResults);
  const crossModelQueryErrors = useAppSelector(getCrossModelQueryErrors);

  useEffect(
    () => () => {
      // Clear cross-model query results when component is unmounted.
      dispatch(jujuActions.clearCrossModelQuery());
    },
    [dispatch]
  );

  // The loading state needs to be first so that it appears even if the results
  // have never loaded.
  if (isCrossModelQueryLoading) {
    return (
      <div className="u-align--center">
        <div className="u-sv3">
          <hr />
        </div>
        <Spinner data-testid={TestId.LOADING} />
      </div>
    );
  }

  if (!isCrossModelQueryLoaded || !!crossModelQueryErrors) {
    return null;
  }

  // Display a message if there are no results. The JQ filter is applied per
  // model, so it could return null for every model, in which case this displays
  // a single message.
  if (
    !crossModelQueryResults ||
    Object.values(crossModelQueryResults).every((resultArray) =>
      resultArray.every((result) => result === null)
    )
  ) {
    return (
      <div className="results-block">
        <hr />
        <p>{Label.NO_RESULTS}</p>
      </div>
    );
  }

  const mockData = {
    "07a3c7d8-e90e-4063-8f4a-1a2ba2fe01df": [
      {
        applications: {
          calico: {
            "application-status": {
              current: "unknown",
              since: "16 Aug 2023 10:33:20+10:00",
            },
            base: { channel: "22.04", name: "ubuntu" },
            charm: "calico",
            "charm-channel": "stable",
            "charm-name": "calico",
            "charm-origin": "charmhub",
            "charm-rev": 87,
            "charm-version": "a164af4",
            "endpoint-bindings": { "": "alpha", cni: "alpha", etcd: "alpha" },
            exposed: false,
            relations: {
              cni: ["kubernetes-control-plane", "kubernetes-worker"],
              etcd: ["etcd"],
            },
            "subordinate-to": ["kubernetes-control-plane", "kubernetes-worker"],
          },
          containerd: {
            "application-status": {
              current: "unknown",
              since: "16 Aug 2023 10:33:31+10:00",
            },
            base: { channel: "22.04", name: "ubuntu" },
            charm: "containerd",
            "charm-channel": "stable",
            "charm-name": "containerd",
            "charm-origin": "charmhub",
            "charm-rev": 65,
            "charm-version": "0a104da",
            "endpoint-bindings": {
              "": "alpha",
              containerd: "alpha",
              "docker-registry": "alpha",
              untrusted: "alpha",
            },
            exposed: false,
            relations: {
              containerd: ["kubernetes-control-plane", "kubernetes-worker"],
            },
            "subordinate-to": ["kubernetes-control-plane", "kubernetes-worker"],
          },
          easyrsa: {
            "application-status": {
              current: "waiting",
              message: "waiting for machine",
              since: "16 Aug 2023 10:33:53+10:00",
            },
            base: { channel: "22.04", name: "ubuntu" },
            charm: "easyrsa",
            "charm-channel": "stable",
            "charm-name": "easyrsa",
            "charm-origin": "charmhub",
            "charm-rev": 42,
            "charm-version": "b26c377",
            "endpoint-bindings": { "": "alpha", client: "alpha" },
            exposed: false,
            relations: {
              client: ["etcd", "kubernetes-control-plane", "kubernetes-worker"],
            },
            units: {
              "easyrsa/0": {
                "juju-status": {
                  current: "allocating",
                  since: "16 Aug 2023 10:33:53+10:00",
                },
                machine: "0/lxd/0",
                "workload-status": {
                  current: "waiting",
                  message: "waiting for machine",
                  since: "16 Aug 2023 10:33:53+10:00",
                },
              },
            },
          },
          etcd: {
            "application-status": {
              current: "waiting",
              message: "waiting for machine",
              since: "16 Aug 2023 10:33:51+10:00",
            },
            base: { channel: "22.04", name: "ubuntu" },
            charm: "etcd",
            "charm-channel": "stable",
            "charm-name": "etcd",
            "charm-origin": "charmhub",
            "charm-rev": 742,
            "charm-version": "8e8a5bb",
            "endpoint-bindings": {
              "": "alpha",
              certificates: "alpha",
              cluster: "alpha",
              db: "alpha",
              grafana: "alpha",
              "nrpe-external-master": "alpha",
              prometheus: "alpha",
              proxy: "alpha",
            },
            exposed: false,
            relations: {
              certificates: ["easyrsa"],
              cluster: ["etcd"],
              db: ["calico", "kubernetes-control-plane"],
            },
            units: {
              "etcd/0": {
                "juju-status": {
                  current: "allocating",
                  since: "16 Aug 2023 10:33:51+10:00",
                },
                machine: "0",
                "public-address": "44.234.46.248",
                "workload-status": {
                  current: "waiting",
                  message: "waiting for machine",
                  since: "16 Aug 2023 10:33:51+10:00",
                },
              },
            },
          },
          "kubernetes-control-plane": {
            "application-status": {
              current: "waiting",
              message: "waiting for machine",
              since: "16 Aug 2023 10:33:51+10:00",
            },
            base: { channel: "22.04", name: "ubuntu" },
            charm: "kubernetes-control-plane",
            "charm-channel": "stable",
            "charm-name": "kubernetes-control-plane",
            "charm-origin": "charmhub",
            "charm-profile": "juju-k8s2-kubernetes-control-plane-274",
            "charm-rev": 274,
            "charm-version": "7258630",
            "endpoint-bindings": {
              "": "alpha",
              aws: "alpha",
              "aws-iam": "alpha",
              azure: "alpha",
              "ceph-client": "alpha",
              "ceph-storage": "alpha",
              certificates: "alpha",
              cni: "alpha",
              "container-runtime": "alpha",
              coordinator: "alpha",
              "dns-provider": "alpha",
              etcd: "alpha",
              "external-cloud-provider": "alpha",
              gcp: "alpha",
              grafana: "alpha",
              ha: "alpha",
              "keystone-credentials": "alpha",
              "kube-api-endpoint": "alpha",
              "kube-control": "alpha",
              "kube-masters": "alpha",
              loadbalancer: "alpha",
              "loadbalancer-external": "alpha",
              "loadbalancer-internal": "alpha",
              "nrpe-external-master": "alpha",
              openstack: "alpha",
              prometheus: "alpha",
              "vault-kv": "alpha",
              vsphere: "alpha",
            },
            exposed: true,
            relations: {
              certificates: ["easyrsa"],
              cni: ["calico"],
              "container-runtime": ["containerd"],
              coordinator: ["kubernetes-control-plane"],
              etcd: ["etcd"],
              "kube-control": ["kubernetes-worker"],
              "kube-masters": ["kubernetes-control-plane"],
            },
            units: {
              "kubernetes-control-plane/0": {
                "juju-status": {
                  current: "allocating",
                  since: "16 Aug 2023 10:33:51+10:00",
                },
                machine: "0",
                "public-address": "44.234.46.248",
                "workload-status": {
                  current: "waiting",
                  message: "waiting for machine",
                  since: "16 Aug 2023 10:33:51+10:00",
                },
              },
            },
          },
          "kubernetes-worker": {
            "application-status": {
              current: "waiting",
              message: "waiting for machine",
              since: "16 Aug 2023 10:33:52+10:00",
            },
            base: { channel: "22.04", name: "ubuntu" },
            charm: "kubernetes-worker",
            "charm-channel": "stable",
            "charm-name": "kubernetes-worker",
            "charm-origin": "charmhub",
            "charm-profile": "juju-k8s2-kubernetes-worker-112",
            "charm-rev": 112,
            "charm-version": "e7d13cc",
            "endpoint-bindings": {
              "": "alpha",
              aws: "alpha",
              azure: "alpha",
              certificates: "alpha",
              cni: "alpha",
              "container-runtime": "alpha",
              coordinator: "alpha",
              gcp: "alpha",
              "ingress-proxy": "alpha",
              "kube-api-endpoint": "alpha",
              "kube-control": "alpha",
              nfs: "alpha",
              "nrpe-external-master": "alpha",
              openstack: "alpha",
              scrape: "alpha",
              vsphere: "alpha",
            },
            exposed: true,
            relations: {
              certificates: ["easyrsa"],
              cni: ["calico"],
              "container-runtime": ["containerd"],
              coordinator: ["kubernetes-worker"],
              "kube-control": ["kubernetes-control-plane"],
            },
            units: {
              "kubernetes-worker/0": {
                "juju-status": {
                  current: "allocating",
                  since: "16 Aug 2023 10:33:52+10:00",
                },
                machine: "1",
                "public-address": "54.218.14.35",
                "workload-status": {
                  current: "waiting",
                  message: "waiting for machine",
                  since: "16 Aug 2023 10:33:52+10:00",
                },
              },
            },
          },
        },
        controller: { timestamp: "10:35:34+10:00" },
        machines: {
          "0": {
            base: { channel: "22.04", name: "ubuntu" },
            constraints: "cores=2 mem=8192M root-disk=16384M",
            containers: {
              "0/lxd/0": {
                base: { channel: "22.04", name: "ubuntu" },
                "instance-id": "pending",
                "juju-status": {
                  current: "pending",
                  since: "16 Aug 2023 10:33:52+10:00",
                },
                "machine-status": {
                  current: "pending",
                  since: "16 Aug 2023 10:33:52+10:00",
                },
                "modification-status": {
                  current: "idle",
                  since: "16 Aug 2023 10:33:52+10:00",
                },
              },
            },
            "dns-name": "44.234.46.248",
            hardware:
              "arch=amd64 cores=2 cpu-power=700 mem=8192M root-disk=16384M availability-zone=us-west-2d",
            "instance-id": "i-0786c85c882bf194e",
            "ip-addresses": ["44.234.46.248", "172.31.60.224"],
            "juju-status": {
              current: "pending",
              since: "16 Aug 2023 10:33:46+10:00",
            },
            "machine-status": {
              current: "running",
              message: "running",
              since: "16 Aug 2023 10:34:09+10:00",
            },
            "modification-status": {
              current: "idle",
              since: "16 Aug 2023 10:33:46+10:00",
            },
          },
          "1": {
            base: { channel: "22.04", name: "ubuntu" },
            constraints: "cores=2 mem=8192M root-disk=16384M",
            "dns-name": "54.218.14.35",
            hardware:
              "arch=amd64 cores=2 cpu-power=700 mem=8192M root-disk=16384M availability-zone=us-west-2c",
            "instance-id": "i-0d2b2204229887387",
            "ip-addresses": ["54.218.14.35", "172.31.6.230"],
            "juju-status": {
              current: "pending",
              since: "16 Aug 2023 10:33:46+10:00",
            },
            "machine-status": {
              current: "running",
              message: "running",
              since: "16 Aug 2023 10:34:09+10:00",
            },
            "modification-status": {
              current: "idle",
              since: "16 Aug 2023 10:33:46+10:00",
            },
          },
        },
        model: {
          cloud: "aws",
          controller: "jaas-staging",
          "model-status": {
            current: "available",
            since: "16 Aug 2023 10:32:17+10:00",
          },
          name: "k8s2",
          region: "us-west-2",
          sla: "unsupported",
          type: "iaas",
          version: "3.2.2.1",
        },
        storage: {},
      },
    ],
  };

  return (
    <CodeSnippetBlock
      title="Results"
      className="results-block"
      code={mockData}
    />
  );
};

export default ResultsBlock;
