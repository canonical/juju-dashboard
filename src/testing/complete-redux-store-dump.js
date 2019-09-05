// Internally consistent mock data.
// When generating additional mock data make sure that it's internally consistent
// across the top level keys.

export default {
  root: {
    controllerConnection: {
      transport: {
        _ws: {},
        _counter: 39,
        _callbacks: {},
        _debug: true
      },
      info: {
        controllerTag: 'controller-a030329a-941f-4760-8fcd-3063b41a04e7',
        serverVersion: '2.6.5',
        servers: [],
        user: {
          displayName: 'mrdata',
          identity: 'user-mrdata@external',
          controllerAccess: '',
          modelAccess: ''
        }
      },
      facades: {
        modelManager: {
          _transport: {
            _ws: {},
            _counter: 39,
            _callbacks: {},
            _debug: true
          },
          _info: {
            controllerTag: 'controller-a030329a-941f-4760-8fcd-3063b41a04e7',
            serverVersion: '2.6.5',
            servers: [],
            user: {
              displayName: 'mrdata',
              identity: 'user-mrdata@external',
              controllerAccess: '',
              modelAccess: ''
            }
          },
          version: 5
        }
      }
    }
  },
  juju: {
    models: {
      '57651e3c-815f-4520-82df-81fd5d70b7ef': {
        lastConnection: null,
        name: 'group-test',
        ownerTag: 'user-mrdata@external',
        type: '',
        uuid: '57651e3c-815f-4520-82df-81fd5d70b7ef'
      },
      '2446g278-7928-4c50-811b-563f79acd991': {
        lastConnection: null,
        name: 'test1',
        ownerTag: 'user-mrdata@external',
        type: 'iaas',
        uuid: '2446g278-7928-4c50-811b-563f79acd991'
      },
      '4b89852b-0633-4fae-8ba2-acf0261d4a03': {
        lastConnection: null,
        name: 'test2',
        ownerTag: 'user-mrdata@external',
        type: 'iaas',
        uuid: '4b89852b-0633-4fae-8ba2-acf0261d4a03'
      },
      '81887357-1c78-4ad6-8b89-4fb01ebec720': {
        lastConnection: null,
        name: 'test3',
        ownerTag: 'user-mrdata@external',
        type: 'iaas',
        uuid: '81887357-1c78-4ad6-8b89-4fb01ebec720'
      },
      '06b11eb5-abd6-48f3-8910-b54cf5905e60': {
        lastConnection: null,
        name: 'juju-all-the-things',
        ownerTag: 'user-otheruser@external',
        type: '',
        uuid: '06b11eb5-abd6-48f3-8910-b54cf5905e60'
      },
      '4e8a5223-c34a-4ac9-83ca-1175165467d7': {
        lastConnection: null,
        name: 'frontend-ci',
        ownerTag: 'user-space-man@external',
        type: '',
        uuid: '4e8a5223-c34a-4ac9-83ca-1175165467d7'
      },
      '227f7472-b508-4260-89eb-9fd360ddqf5b': {
        lastConnection: null,
        name: 'backend-ci',
        ownerTag: 'user-space-man@external',
        type: '',
        uuid: '227f7472-b508-4260-89eb-9fd360ddqf5b'
      },
      'e059c662-679f-4ab4-8a38-e5685awed391': {
        lastConnection: null,
        name: 'data-aggregator',
        ownerTag: 'user-space-man@external',
        type: '',
        uuid: 'e059c662-679f-4ab4-8a38-e5685awed391'
      }
    },
    modelInfo: {
      '57651e3c-815f-4520-82df-81fd5d70b7ef': {
        name: 'group-test',
        type: '',
        uuid: '57651e3c-815f-4520-82df-81fd5d70b7ef',
        controllerUuid: 'a030329a-941f-4760-8fcd-3063b41a04e7',
        providerType: 'gce',
        defaultSeries: 'bionic',
        cloudTag: 'cloud-google',
        cloudRegion: 'us-central1',
        cloudCredentialTag: 'cloudcred-google_mrdata@external_admin',
        ownerTag: 'user-mrdata@external',
        life: 'alive',
        status: {
          status: 'available',
          info: '',
          data: {},
          since: '2019-08-22T17:10:51.413Z'
        },
        users: [
          {
            user: 'mrdata@external',
            displayName: 'mrdata',
            lastConnection: '2019-08-29T19:46:26Z',
            access: 'admin'
          }
        ],
        machines: [],
        agentVersion: '2.5.4'
      },
      '2446g278-7928-4c50-811b-563f79acd991': {
        name: 'test1',
        type: 'iaas',
        uuid: '2446g278-7928-4c50-811b-563f79acd991',
        controllerUuid: 'a030329a-941f-4760-8fcd-3063b41a04e7',
        providerType: 'gce',
        defaultSeries: 'bionic',
        cloudTag: 'cloud-google',
        cloudRegion: 'us-east1',
        cloudCredentialTag: 'cloudcred-google_mrdata@external_juju',
        ownerTag: 'user-mrdata@external',
        life: 'alive',
        status: {
          status: 'available',
          info: '',
          data: {},
          since: '2019-08-26T16:32:52.061Z'
        },
        users: [
          {
            user: 'mrdata@external',
            displayName: 'mrdata',
            lastConnection: '2019-08-29T19:46:26Z',
            access: 'admin'
          }
        ],
        machines: [],
        agentVersion: '2.6.6'
      },
      '4b89852b-0633-4fae-8ba2-acf0261d4a03': {
        name: 'test2',
        type: 'iaas',
        uuid: '4b89852b-0633-4fae-8ba2-acf0261d4a03',
        controllerUuid: 'a030329a-941f-4760-8fcd-3063b41a04e7',
        providerType: 'gce',
        defaultSeries: 'bionic',
        cloudTag: 'cloud-google',
        cloudRegion: 'us-east1',
        cloudCredentialTag: 'cloudcred-google_mrdata@external_juju',
        ownerTag: 'user-mrdata@external',
        life: 'alive',
        status: {
          status: 'available',
          info: '',
          data: {},
          since: '2019-08-26T16:32:59.869Z'
        },
        users: [
          {
            user: 'mrdata@external',
            displayName: 'mrdata',
            lastConnection: '2019-08-29T19:46:26Z',
            access: 'admin'
          }
        ],
        machines: [],
        agentVersion: '2.6.6'
      },
      '81887357-1c78-4ad6-8b89-4fb01ebec720': {
        name: 'test3',
        type: 'iaas',
        uuid: '81887357-1c78-4ad6-8b89-4fb01ebec720',
        controllerUuid: 'a030329a-941f-4760-8fcd-3063b41a04e7',
        providerType: 'gce',
        defaultSeries: 'bionic',
        cloudTag: 'cloud-google',
        cloudRegion: 'us-east1',
        cloudCredentialTag: 'cloudcred-google_mrdata@external_juju',
        ownerTag: 'user-mrdata@external',
        life: 'alive',
        status: {
          status: 'available',
          info: '',
          data: {},
          since: '2019-08-26T16:33:07.803Z'
        },
        users: [
          {
            user: 'mrdata@external',
            displayName: 'mrdata',
            lastConnection: '2019-08-29T19:46:27Z',
            access: 'admin'
          }
        ],
        machines: [],
        agentVersion: '2.6.6'
      },
      '06b11eb5-abd6-48f3-8910-b54cf5905e60': {
        name: 'juju-all-the-things',
        type: '',
        uuid: '06b11eb5-abd6-48f3-8910-b54cf5905e60',
        controllerUuid: 'a030329a-941f-4760-8fcd-3063b41a04e7',
        providerType: 'gce',
        defaultSeries: 'xenial',
        cloudTag: 'cloud-google',
        cloudRegion: 'us-east1',
        cloudCredentialTag: 'cloudcred-google_otheruser@external_google-bigbot',
        ownerTag: 'user-otheruser@external',
        life: 'alive',
        status: {
          status: 'available',
          info: '',
          data: {},
          since: '2019-08-20T03:58:06.759Z'
        },
        users: [
          {
            user: 'mrdata@external',
            displayName: '',
            lastConnection: '2019-08-29T19:46:27Z',
            access: 'read'
          }
        ],
        machines: [
          {
            id: '1',
            hardware: {
              arch: 'amd64',
              mem: 1700,
              rootDisk: 10240,
              cores: 1,
              cpuPower: 138,
              tags: [],
              availabilityZone: 'us-east1-c'
            },
            instanceId: 'juju-905e60-1',
            status: 'started'
          },
          {
            id: '6',
            hardware: {
              arch: 'amd64',
              mem: 1700,
              rootDisk: 10240,
              cores: 1,
              cpuPower: 138,
              tags: [],
              availabilityZone: 'us-east1-b'
            },
            instanceId: 'juju-905e60-6',
            status: 'started'
          },
          {
            id: '9',
            hardware: {
              arch: 'amd64',
              mem: 1700,
              rootDisk: 10240,
              cores: 1,
              cpuPower: 138,
              tags: [],
              availabilityZone: 'us-east1-d'
            },
            instanceId: 'juju-905e60-9',
            status: 'started'
          },
          {
            id: '1',
            hardware: {
              arch: 'amd64',
              mem: 1700,
              rootDisk: 10240,
              cores: 1,
              cpuPower: 138,
              tags: [],
              availabilityZone: 'us-east1-c'
            },
            instanceId: 'juju-905e60-1',
            status: 'started'
          },
          {
            id: '6',
            hardware: {
              arch: 'amd64',
              mem: 1700,
              rootDisk: 10240,
              cores: 1,
              cpuPower: 138,
              tags: [],
              availabilityZone: 'us-east1-b'
            },
            instanceId: 'juju-905e60-6',
            status: 'started'
          },
          {
            id: '9',
            hardware: {
              arch: 'amd64',
              mem: 1700,
              rootDisk: 10240,
              cores: 1,
              cpuPower: 138,
              tags: [],
              availabilityZone: 'us-east1-d'
            },
            instanceId: 'juju-905e60-9',
            status: 'started'
          }
        ],
        agentVersion: '2.5.4'
      },
      '4e8a5223-c34a-4ac9-83ca-1175165467d7': {
        name: 'frontend-ci',
        type: '',
        uuid: '4e8a5223-c34a-4ac9-83ca-1175165467d7',
        controllerUuid: 'a030329a-941f-4760-8fcd-3063b41a04e7',
        providerType: 'gce',
        defaultSeries: 'xenial',
        cloudTag: 'cloud-google',
        cloudRegion: 'us-east1',
        cloudCredentialTag: 'cloudcred-google_space-man@external_gce',
        ownerTag: 'user-space-man@external',
        life: 'alive',
        status: {
          status: 'available',
          info: '',
          data: {},
          since: '2019-04-13T18:20:28.225Z'
        },
        users: [
          {
            user: 'french@external',
            displayName: '',
            lastConnection: '2019-07-04T12:55:47Z',
            access: 'admin'
          },
          {
            user: 'mrdata@external',
            displayName: '',
            lastConnection: '2019-08-29T19:46:27Z',
            access: 'admin'
          },
          {
            user: 'downthere@external',
            displayName: '',
            lastConnection: '2019-08-28T04:11:03Z',
            access: 'read'
          },
          {
            user: 'overthere@external',
            displayName: '',
            lastConnection: '2018-10-16T19:40:22Z',
            access: 'admin'
          },
          {
            user: 'otheruser@external',
            displayName: '',
            lastConnection: '2018-06-07T15:14:33Z',
            access: 'admin'
          },
          {
            user: 'space-man@external',
            displayName: 'space-man',
            lastConnection: '2019-04-16T13:11:05Z',
            access: 'admin'
          }
        ],
        machines: [
          {
            id: '1',
            hardware: {
              arch: 'amd64',
              mem: 1700,
              rootDisk: 10240,
              cores: 1,
              cpuPower: 138,
              tags: [],
              availabilityZone: 'us-east1-b'
            },
            instanceId: 'juju-5467d7-1',
            status: 'started'
          },
          {
            id: '2',
            hardware: {
              arch: 'amd64',
              mem: 7500,
              rootDisk: 100352,
              cores: 2,
              cpuPower: 550,
              tags: [],
              availabilityZone: 'us-east1-b'
            },
            instanceId: 'juju-5467d7-2',
            status: 'started'
          },
          {
            id: '2',
            hardware: {
              arch: 'amd64',
              mem: 7500,
              rootDisk: 100352,
              cores: 2,
              cpuPower: 550,
              tags: [],
              availabilityZone: 'us-east1-b'
            },
            instanceId: 'juju-5467d7-2',
            status: 'started'
          }
        ],
        agentVersion: '2.4.7'
      },
      '227f7472-b508-4260-89eb-9fd360ddqf5b': {
        name: 'backend-ci',
        type: '',
        uuid: '227f7472-b508-4260-89eb-9fd360ddqf5b',
        controllerUuid: 'a030329a-941f-4760-8fcd-3063b41a04e7',
        providerType: 'gce',
        defaultSeries: 'xenial',
        cloudTag: 'cloud-google',
        cloudRegion: 'us-east1',
        cloudCredentialTag: 'cloudcred-google_space-man@external_gce',
        ownerTag: 'user-space-man@external',
        life: 'alive',
        status: {
          status: 'available',
          info: '',
          data: {},
          since: '2019-04-13T18:20:27.77Z'
        },
        users: [
          {
            user: 'mrdata@external',
            displayName: '',
            lastConnection: '2019-08-29T19:46:28Z',
            access: 'admin'
          },
          {
            user: 'otheruser@external',
            displayName: '',
            lastConnection: '2018-06-07T15:14:33Z',
            access: 'admin'
          },
          {
            user: 'space-man@external',
            displayName: 'space-man',
            lastConnection: '2019-05-10T07:09:18Z',
            access: 'admin'
          }
        ],
        machines: [
          {
            id: '0',
            hardware: {
              arch: 'amd64',
              mem: 1700,
              rootDisk: 10240,
              cores: 1,
              cpuPower: 138,
              tags: [],
              availabilityZone: 'us-east1-b'
            },
            instanceId: 'juju-dddf5b-0',
            status: 'started'
          },
          {
            id: '3',
            hardware: {
              arch: 'amd64',
              mem: 7500,
              rootDisk: 100352,
              cores: 2,
              cpuPower: 550,
              tags: [],
              availabilityZone: 'us-east1-b'
            },
            instanceId: 'juju-dddf5b-3',
            status: 'started'
          },
          {
            id: '8',
            hardware: {
              arch: 'amd64',
              mem: 1700,
              rootDisk: 10240,
              cores: 1,
              cpuPower: 138,
              tags: [],
              availabilityZone: 'us-east1-c'
            },
            instanceId: 'juju-dddf5b-8',
            status: 'started'
          },
          {
            id: '10',
            hardware: {
              arch: 'amd64',
              mem: 1700,
              rootDisk: 10240,
              cores: 1,
              cpuPower: 138,
              tags: [],
              availabilityZone: 'us-east1-b'
            },
            instanceId: 'juju-dddf5b-10',
            status: 'started'
          },
          {
            id: '3',
            hardware: {
              arch: 'amd64',
              mem: 7500,
              rootDisk: 100352,
              cores: 2,
              cpuPower: 550,
              tags: [],
              availabilityZone: 'us-east1-b'
            },
            instanceId: 'juju-dddf5b-3',
            status: 'started'
          },
          {
            id: '8',
            hardware: {
              arch: 'amd64',
              mem: 1700,
              rootDisk: 10240,
              cores: 1,
              cpuPower: 138,
              tags: [],
              availabilityZone: 'us-east1-c'
            },
            instanceId: 'juju-dddf5b-8',
            status: 'started'
          }
        ],
        agentVersion: '2.5.4'
      },
      'e059c662-679f-4ab4-8a38-e5685awed391': {
        name: 'data-aggregator',
        type: '',
        uuid: 'e059c662-679f-4ab4-8a38-e5685awed391',
        controllerUuid: 'a030329a-941f-4760-8fcd-3063b41a04e7',
        providerType: 'gce',
        defaultSeries: 'xenial',
        cloudTag: 'cloud-google',
        cloudRegion: 'us-east1',
        cloudCredentialTag: 'cloudcred-google_space-man@external_gce',
        ownerTag: 'user-space-man@external',
        life: 'alive',
        status: {
          status: 'available',
          info: '',
          data: {},
          since: '2019-04-13T20:37:44.426Z'
        },
        users: [
          {
            user: 'mrdata@external',
            displayName: '',
            lastConnection: '2019-08-29T19:46:28Z',
            access: 'admin'
          },
          {
            user: 'space-man@external',
            displayName: 'space-man',
            lastConnection: '2019-04-16T12:37:51Z',
            access: 'admin'
          }
        ],
        machines: [
          {
            id: '24',
            hardware: {
              arch: 'amd64',
              mem: 1700,
              rootDisk: 10240,
              cores: 1,
              cpuPower: 138,
              tags: [],
              availabilityZone: 'us-east1-b'
            },
            instanceId: 'juju-aed391-24',
            status: 'started'
          },
          {
            id: '31',
            hardware: {
              arch: 'amd64',
              mem: 7200,
              rootDisk: 50176,
              cores: 8,
              cpuPower: 2200,
              tags: [],
              availabilityZone: 'us-east1-b'
            },
            instanceId: 'juju-aed391-31',
            status: 'started'
          },
          {
            id: '15',
            hardware: {
              arch: 'amd64',
              mem: 7200,
              rootDisk: 10240,
              cores: 8,
              cpuPower: 2200,
              tags: [],
              availabilityZone: 'us-east1-c'
            },
            instanceId: 'juju-aed391-15',
            status: 'started'
          },
          {
            id: '24',
            hardware: {
              arch: 'amd64',
              mem: 1700,
              rootDisk: 10240,
              cores: 1,
              cpuPower: 138,
              tags: [],
              availabilityZone: 'us-east1-b'
            },
            instanceId: 'juju-aed391-24',
            status: 'started'
          },
          {
            id: '25',
            hardware: {
              arch: 'amd64',
              mem: 7200,
              rootDisk: 10240,
              cores: 8,
              cpuPower: 2200,
              tags: [],
              availabilityZone: 'us-east1-c'
            },
            instanceId: 'juju-aed391-25',
            status: 'started'
          }
        ],
        agentVersion: '2.5.4'
      }
    },
    modelStatuses: {
      '57651e3c-815f-4520-82df-81fd5d70b7ef': {
        model: {
          name: 'group-test',
          type: 'iaas',
          cloudTag: 'cloud-google',
          region: 'us-central1',
          version: '2.5.4',
          availableVersion: '',
          modelStatus: {
            status: 'available',
            info: '',
            data: {},
            since: '2019-08-22T17:10:51.413237648Z',
            kind: '',
            version: '',
            life: ''
          },
          meterStatus: {
            color: '',
            message: ''
          },
          sla: 'unsupported'
        },
        machines: {},
        applications: {
          easyrsa: {
            charm: 'cs:~containers/easyrsa-68',
            series: 'xenial',
            exposed: false,
            life: '',
            relations: {
              client: [
                'etcd',
                'kubeapi-load-balancer',
                'kubernetes-master',
                'kubernetes-worker'
              ]
            },
            canUpgradeTo: '',
            subordinateTo: [],
            units: {},
            meterStatuses: {},
            status: {
              status: 'waiting',
              info: 'waiting for machine',
              data: {},
              since: '2018-09-04T21:13:51.680343033Z',
              kind: '',
              version: '',
              life: ''
            },
            workloadVersion: '',
            charmVerion: '',
            endpointBindings: {
              client: ''
            },
            publicAddress: ''
          },
          elasticsearch: {
            charm: 'cs:trusty/elasticsearch-15',
            series: 'trusty',
            exposed: false,
            life: '',
            relations: {
              client: [
                'kibana'
              ],
              peer: [
                'elasticsearch'
              ]
            },
            canUpgradeTo: '',
            subordinateTo: [],
            units: {},
            meterStatuses: {},
            status: {
              status: 'waiting',
              info: 'waiting for machine',
              data: {},
              since: '2018-09-04T19:24:40.602296842Z',
              kind: '',
              version: '',
              life: ''
            },
            workloadVersion: '',
            charmVerion: '',
            endpointBindings: {
              client: '',
              data: '',
              logs: '',
              'nrpe-external-master': '',
              peer: ''
            },
            publicAddress: ''
          },
          etcd: {
            charm: 'cs:~containers/etcd-126',
            series: 'xenial',
            exposed: false,
            life: '',
            relations: {
              certificates: [
                'easyrsa'
              ],
              cluster: [
                'etcd'
              ],
              db: [
                'flannel',
                'kubernetes-master'
              ]
            },
            canUpgradeTo: '',
            subordinateTo: [],
            units: {},
            meterStatuses: {},
            status: {
              status: 'waiting',
              info: 'waiting for machine',
              data: {},
              since: '2018-09-04T21:13:51.68483125Z',
              kind: '',
              version: '',
              life: ''
            },
            workloadVersion: '',
            charmVerion: '',
            endpointBindings: {
              certificates: '',
              cluster: '',
              db: '',
              'nrpe-external-master': '',
              proxy: ''
            },
            publicAddress: ''
          },
          flannel: {
            charm: 'cs:~containers/flannel-81',
            series: 'xenial',
            exposed: false,
            life: '',
            relations: {
              cni: [
                'kubernetes-master',
                'kubernetes-worker'
              ],
              etcd: [
                'etcd'
              ]
            },
            canUpgradeTo: '',
            subordinateTo: [
              'kubernetes-master',
              'kubernetes-worker'
            ],
            units: {},
            meterStatuses: {},
            status: {
              status: 'waiting',
              info: 'waiting for machine',
              data: {},
              since: '2018-09-04T21:13:51.680475374Z',
              kind: '',
              version: '',
              life: ''
            },
            workloadVersion: '',
            charmVerion: '',
            endpointBindings: {
              cni: '',
              etcd: '',
              'nrpe-external-master': ''
            },
            publicAddress: ''
          },
          kibana: {
            charm: 'cs:trusty/kibana-14',
            series: 'trusty',
            exposed: false,
            life: '',
            relations: {
              rest: [
                'elasticsearch'
              ]
            },
            canUpgradeTo: '',
            subordinateTo: [],
            units: {},
            meterStatuses: {},
            status: {
              status: 'waiting',
              info: 'waiting for machine',
              data: {},
              since: '2018-09-04T19:24:40.602193361Z',
              kind: '',
              version: '',
              life: ''
            },
            workloadVersion: '',
            charmVerion: '',
            endpointBindings: {
              rest: '',
              web: ''
            },
            publicAddress: ''
          },
          'kubeapi-load-balancer': {
            charm: 'cs:~containers/kubeapi-load-balancer-88',
            series: 'xenial',
            exposed: true,
            life: '',
            relations: {
              apiserver: [
                'kubernetes-master'
              ],
              certificates: [
                'easyrsa'
              ],
              loadbalancer: [
                'kubernetes-master'
              ],
              website: [
                'kubernetes-worker'
              ]
            },
            canUpgradeTo: '',
            subordinateTo: [],
            units: {},
            meterStatuses: {},
            status: {
              status: 'waiting',
              info: 'waiting for machine',
              data: {},
              since: '2018-09-04T21:13:51.08177152Z',
              kind: '',
              version: '',
              life: ''
            },
            workloadVersion: '',
            charmVerion: '',
            endpointBindings: {
              apiserver: '',
              certificates: '',
              loadbalancer: '',
              'nrpe-external-master': '',
              website: ''
            },
            publicAddress: ''
          },
          'kubernetes-master': {
            charm: 'cs:~containers/kubernetes-master-144',
            series: 'xenial',
            exposed: false,
            life: '',
            relations: {
              certificates: [
                'easyrsa'
              ],
              cni: [
                'flannel'
              ],
              etcd: [
                'etcd'
              ],
              'kube-api-endpoint': [
                'kubeapi-load-balancer'
              ],
              'kube-control': [
                'kubernetes-worker'
              ],
              loadbalancer: [
                'kubeapi-load-balancer'
              ]
            },
            canUpgradeTo: '',
            subordinateTo: [],
            units: {},
            meterStatuses: {},
            status: {
              status: 'waiting',
              info: 'waiting for machine',
              data: {},
              since: '2018-09-04T21:13:51.681160931Z',
              kind: '',
              version: '',
              life: ''
            },
            workloadVersion: '',
            charmVerion: '',
            endpointBindings: {
              aws: '',
              'ceph-storage': '',
              certificates: '',
              'cluster-dns': '',
              cni: '',
              etcd: '',
              gcp: '',
              'kube-api-endpoint': '',
              'kube-control': '',
              loadbalancer: '',
              'nrpe-external-master': '',
              openstack: '',
              vsphere: ''
            },
            publicAddress: ''
          },
          'kubernetes-worker': {
            charm: 'cs:~containers/kubernetes-worker-163',
            series: 'xenial',
            exposed: true,
            life: '',
            relations: {
              certificates: [
                'easyrsa'
              ],
              cni: [
                'flannel'
              ],
              'kube-api-endpoint': [
                'kubeapi-load-balancer'
              ],
              'kube-control': [
                'kubernetes-master'
              ]
            },
            canUpgradeTo: '',
            subordinateTo: [],
            units: {},
            meterStatuses: {},
            status: {
              status: 'waiting',
              info: 'waiting for machine',
              data: {},
              since: '2018-09-04T21:13:51.680988946Z',
              kind: '',
              version: '',
              life: ''
            },
            workloadVersion: '',
            charmVerion: '',
            endpointBindings: {
              aws: '',
              certificates: '',
              cni: '',
              dockerhost: '',
              gcp: '',
              'kube-api-endpoint': '',
              'kube-control': '',
              'kube-dns': '',
              nfs: '',
              'nrpe-external-master': '',
              openstack: '',
              'sdn-plugin': '',
              vsphere: ''
            },
            publicAddress: ''
          },
          rsyslog: {
            charm: 'cs:trusty/rsyslog-10',
            series: 'trusty',
            exposed: false,
            life: '',
            relations: {},
            canUpgradeTo: '',
            subordinateTo: [],
            units: {},
            meterStatuses: {},
            status: {
              status: 'waiting',
              info: 'waiting for machine',
              data: {},
              since: '2018-09-04T19:24:40.602281437Z',
              kind: '',
              version: '',
              life: ''
            },
            workloadVersion: '',
            charmVerion: '',
            endpointBindings: {
              aggregator: ''
            },
            publicAddress: ''
          }
        },
        remoteApplications: {},
        offers: {},
        relations: [
          {
            id: 0,
            key: 'elasticsearch:peer',
            'interface': 'http',
            scope: 'global',
            endpoints: [
              {
                application: 'elasticsearch',
                name: 'peer',
                role: 'peer',
                subordinate: false
              }
            ],
            status: {
              status: 'joining',
              info: '',
              data: {},
              since: '2018-09-04T19:24:40.60945185Z',
              kind: '',
              version: '',
              life: ''
            }
          },
          {
            id: 1,
            key: 'kibana:rest elasticsearch:client',
            'interface': 'elasticsearch',
            scope: 'global',
            endpoints: [
              {
                application: 'kibana',
                name: 'rest',
                role: 'requirer',
                subordinate: false
              },
              {
                application: 'elasticsearch',
                name: 'client',
                role: 'provider',
                subordinate: false
              }
            ],
            status: {
              status: 'joining',
              info: '',
              data: {},
              since: '2018-09-04T19:24:41.453843444Z',
              kind: '',
              version: '',
              life: ''
            }
          },
          {
            id: 2,
            key: 'etcd:cluster',
            'interface': 'etcd',
            scope: 'global',
            endpoints: [
              {
                application: 'etcd',
                name: 'cluster',
                role: 'peer',
                subordinate: false
              }
            ],
            status: {
              status: 'joining',
              info: '',
              data: {},
              since: '2018-09-04T21:13:51.688991735Z',
              kind: '',
              version: '',
              life: ''
            }
          },
          {
            id: 4,
            key: 'flannel:etcd etcd:db',
            'interface': 'etcd',
            scope: 'global',
            endpoints: [
              {
                application: 'flannel',
                name: 'etcd',
                role: 'requirer',
                subordinate: false
              },
              {
                application: 'etcd',
                name: 'db',
                role: 'provider',
                subordinate: false
              }
            ],
            status: {
              status: 'joining',
              info: '',
              data: {},
              since: '2018-09-04T21:13:52.48602489Z',
              kind: '',
              version: '',
              life: ''
            }
          },
          {
            id: 10,
            key: 'etcd:certificates easyrsa:client',
            'interface': 'tls-certificates',
            scope: 'global',
            endpoints: [
              {
                application: 'etcd',
                name: 'certificates',
                role: 'requirer',
                subordinate: false
              },
              {
                application: 'easyrsa',
                name: 'client',
                role: 'provider',
                subordinate: false
              }
            ],
            status: {
              status: 'joining',
              info: '',
              data: {},
              since: '2018-09-04T21:13:52.487465097Z',
              kind: '',
              version: '',
              life: ''
            }
          },
          {
            id: 12,
            key: 'kubernetes-master:etcd etcd:db',
            'interface': 'etcd',
            scope: 'global',
            endpoints: [
              {
                application: 'kubernetes-master',
                name: 'etcd',
                role: 'requirer',
                subordinate: false
              },
              {
                application: 'etcd',
                name: 'db',
                role: 'provider',
                subordinate: false
              }
            ],
            status: {
              status: 'joining',
              info: '',
              data: {},
              since: '2018-09-04T21:13:52.491449685Z',
              kind: '',
              version: '',
              life: ''
            }
          },
          {
            id: 3,
            key: 'kubeapi-load-balancer:certificates easyrsa:client',
            'interface': 'tls-certificates',
            scope: 'global',
            endpoints: [
              {
                application: 'kubeapi-load-balancer',
                name: 'certificates',
                role: 'requirer',
                subordinate: false
              },
              {
                application: 'easyrsa',
                name: 'client',
                role: 'provider',
                subordinate: false
              }
            ],
            status: {
              status: 'joining',
              info: '',
              data: {},
              since: '2018-09-04T21:13:52.486288632Z',
              kind: '',
              version: '',
              life: ''
            }
          },
          {
            id: 6,
            key: 'kubernetes-master:loadbalancer kubeapi-load-balancer:loadbalancer',
            'interface': 'public-address',
            scope: 'global',
            endpoints: [
              {
                application: 'kubernetes-master',
                name: 'loadbalancer',
                role: 'requirer',
                subordinate: false
              },
              {
                application: 'kubeapi-load-balancer',
                name: 'loadbalancer',
                role: 'provider',
                subordinate: false
              }
            ],
            status: {
              status: 'joining',
              info: '',
              data: {},
              since: '2018-09-04T21:13:52.48664444Z',
              kind: '',
              version: '',
              life: ''
            }
          },
          {
            id: 8,
            key: 'kubeapi-load-balancer:apiserver kubernetes-master:kube-api-endpoint',
            'interface': 'http',
            scope: 'global',
            endpoints: [
              {
                application: 'kubernetes-master',
                name: 'kube-api-endpoint',
                role: 'provider',
                subordinate: false
              },
              {
                application: 'kubeapi-load-balancer',
                name: 'apiserver',
                role: 'requirer',
                subordinate: false
              }
            ],
            status: {
              status: 'joining',
              info: '',
              data: {},
              since: '2018-09-04T21:13:52.488753789Z',
              kind: '',
              version: '',
              life: ''
            }
          },
          {
            id: 13,
            key: 'kubernetes-worker:kube-api-endpoint kubeapi-load-balancer:website',
            'interface': 'http',
            scope: 'global',
            endpoints: [
              {
                application: 'kubernetes-worker',
                name: 'kube-api-endpoint',
                role: 'requirer',
                subordinate: false
              },
              {
                application: 'kubeapi-load-balancer',
                name: 'website',
                role: 'provider',
                subordinate: false
              }
            ],
            status: {
              status: 'joining',
              info: '',
              data: {},
              since: '2018-09-04T21:13:52.491605003Z',
              kind: '',
              version: '',
              life: ''
            }
          },
          {
            id: 5,
            key: 'kubernetes-master:certificates easyrsa:client',
            'interface': 'tls-certificates',
            scope: 'global',
            endpoints: [
              {
                application: 'kubernetes-master',
                name: 'certificates',
                role: 'requirer',
                subordinate: false
              },
              {
                application: 'easyrsa',
                name: 'client',
                role: 'provider',
                subordinate: false
              }
            ],
            status: {
              status: 'joining',
              info: '',
              data: {},
              since: '2018-09-04T21:13:52.485851175Z',
              kind: '',
              version: '',
              life: ''
            }
          },
          {
            id: 11,
            key: 'kubernetes-worker:certificates easyrsa:client',
            'interface': 'tls-certificates',
            scope: 'global',
            endpoints: [
              {
                application: 'kubernetes-worker',
                name: 'certificates',
                role: 'requirer',
                subordinate: false
              },
              {
                application: 'easyrsa',
                name: 'client',
                role: 'provider',
                subordinate: false
              }
            ],
            status: {
              status: 'joining',
              info: '',
              data: {},
              since: '2018-09-04T21:13:52.489944386Z',
              kind: '',
              version: '',
              life: ''
            }
          },
          {
            id: 9,
            key: 'flannel:cni kubernetes-master:cni',
            'interface': 'kubernetes-cni',
            scope: 'container',
            endpoints: [
              {
                application: 'flannel',
                name: 'cni',
                role: 'requirer',
                subordinate: true
              },
              {
                application: 'kubernetes-master',
                name: 'cni',
                role: 'provider',
                subordinate: false
              }
            ],
            status: {
              status: 'joining',
              info: '',
              data: {},
              since: '2018-09-04T21:13:52.488806622Z',
              kind: '',
              version: '',
              life: ''
            }
          },
          {
            id: 14,
            key: 'flannel:cni kubernetes-worker:cni',
            'interface': 'kubernetes-cni',
            scope: 'container',
            endpoints: [
              {
                application: 'flannel',
                name: 'cni',
                role: 'requirer',
                subordinate: true
              },
              {
                application: 'kubernetes-worker',
                name: 'cni',
                role: 'provider',
                subordinate: false
              }
            ],
            status: {
              status: 'joining',
              info: '',
              data: {},
              since: '2018-09-04T21:13:52.488013866Z',
              kind: '',
              version: '',
              life: ''
            }
          },
          {
            id: 7,
            key: 'kubernetes-worker:kube-control kubernetes-master:kube-control',
            'interface': 'kube-control',
            scope: 'global',
            endpoints: [
              {
                application: 'kubernetes-master',
                name: 'kube-control',
                role: 'provider',
                subordinate: false
              },
              {
                application: 'kubernetes-worker',
                name: 'kube-control',
                role: 'requirer',
                subordinate: false
              }
            ],
            status: {
              status: 'joining',
              info: '',
              data: {},
              since: '2018-09-04T21:13:52.4865962Z',
              kind: '',
              version: '',
              life: ''
            }
          }
        ],
        controllerTimestamp: '2019-08-29T19:46:25.706585464Z'
      },
      '2446g278-7928-4c50-811b-563f79acd991': {
        model: {
          name: 'test1',
          type: 'iaas',
          cloudTag: 'cloud-google',
          region: 'us-east1',
          version: '2.6.6',
          availableVersion: '',
          modelStatus: {
            status: 'available',
            info: '',
            data: {},
            since: '2019-08-26T16:32:52.06136116Z',
            kind: '',
            version: '',
            life: ''
          },
          meterStatus: {
            color: '',
            message: ''
          },
          sla: 'unsupported'
        },
        machines: {},
        applications: {},
        remoteApplications: {},
        offers: {},
        relations: [],
        controllerTimestamp: '2019-08-29T19:46:25.985521867Z'
      },
      '4b89852b-0633-4fae-8ba2-acf0261d4a03': {
        model: {
          name: 'test2',
          type: 'iaas',
          cloudTag: 'cloud-google',
          region: 'us-east1',
          version: '2.6.6',
          availableVersion: '',
          modelStatus: {
            status: 'available',
            info: '',
            data: {},
            since: '2019-08-26T16:32:59.869183649Z',
            kind: '',
            version: '',
            life: ''
          },
          meterStatus: {
            color: '',
            message: ''
          },
          sla: 'unsupported'
        },
        machines: {},
        applications: {},
        remoteApplications: {},
        offers: {},
        relations: [],
        controllerTimestamp: '2019-08-29T19:46:26.31534672Z'
      },
      '81887357-1c78-4ad6-8b89-4fb01ebec720': {
        model: {
          name: 'test3',
          type: 'iaas',
          cloudTag: 'cloud-google',
          region: 'us-east1',
          version: '2.6.6',
          availableVersion: '',
          modelStatus: {
            status: 'available',
            info: '',
            data: {},
            since: '2019-08-26T16:33:07.803688819Z',
            kind: '',
            version: '',
            life: ''
          },
          meterStatus: {
            color: '',
            message: ''
          },
          sla: 'unsupported'
        },
        machines: {},
        applications: {},
        remoteApplications: {},
        offers: {},
        relations: [],
        controllerTimestamp: '2019-08-29T19:46:27.123149166Z'
      },
      '06b11eb5-abd6-48f3-8910-b54cf5905e60': {
        model: {
          name: 'juju-all-the-things',
          type: 'iaas',
          cloudTag: 'cloud-google',
          region: 'us-east1',
          version: '2.5.4',
          availableVersion: '',
          modelStatus: {
            status: 'available',
            info: '',
            data: {},
            since: '2019-08-20T03:58:06.759061182Z',
            kind: '',
            version: '',
            life: ''
          },
          meterStatus: {
            color: '',
            message: ''
          },
          sla: 'unsupported'
        },
        machines: {
          '1': {
            agentStatus: {
              status: 'started',
              info: '',
              data: {},
              since: '2019-08-20T03:58:05.281591141Z',
              kind: '',
              version: '2.5.4',
              life: ''
            },
            instanceStatus: {
              status: 'running',
              info: 'RUNNING',
              data: {},
              since: '2017-03-09T20:40:24.303597554Z',
              kind: '',
              version: '',
              life: ''
            },
            dnsName: '100.192.135.3',
            ipAddresses: [
              '100.192.135.3',
              '10.142.0.3'
            ],
            instanceId: 'juju-905e60-1',
            series: 'xenial',
            id: '1',
            networkInterfaces: {
              ens4: {
                ipAddresses: [
                  '10.142.0.3'
                ],
                macAddress: '42:01:0a:8e:00:03',
                gateway: '10.142.0.1',
                dnsNameservers: [],
                isUp: true
              }
            },
            containers: {},
            constraints: '',
            hardware: 'arch=amd64 cores=1 cpu-power=138 mem=1700M root-disk=10240M availability-zone=us-east1-c',
            jobs: [
              'JobHostUnits'
            ],
            hasVote: false,
            wantsVote: false,
            lxdProfiles: {}
          },
          '6': {
            agentStatus: {
              status: 'started',
              info: '',
              data: {},
              since: '2019-08-20T03:58:07.289050235Z',
              kind: '',
              version: '2.5.4',
              life: ''
            },
            instanceStatus: {
              status: 'running',
              info: 'RUNNING',
              data: {},
              since: '2017-08-08T18:34:53.07539597Z',
              kind: '',
              version: '',
              life: ''
            },
            dnsName: '35.190.148.22',
            ipAddresses: [
              '35.190.148.22',
              '10.142.0.5'
            ],
            instanceId: 'juju-905e60-6',
            series: 'xenial',
            id: '6',
            networkInterfaces: {
              ens4: {
                ipAddresses: [
                  '10.142.0.5'
                ],
                macAddress: '42:01:0a:8e:00:05',
                gateway: '10.142.0.1',
                dnsNameservers: [],
                isUp: true
              }
            },
            containers: {},
            constraints: '',
            hardware: 'arch=amd64 cores=1 cpu-power=138 mem=1700M root-disk=10240M availability-zone=us-east1-b',
            jobs: [
              'JobHostUnits'
            ],
            hasVote: false,
            wantsVote: false,
            lxdProfiles: {}
          },
          '9': {
            agentStatus: {
              status: 'started',
              info: '',
              data: {},
              since: '2019-08-20T03:58:07.526597045Z',
              kind: '',
              version: '2.5.4',
              life: ''
            },
            instanceStatus: {
              status: 'running',
              info: 'RUNNING',
              data: {},
              since: '2017-08-10T18:36:41.667407283Z',
              kind: '',
              version: '',
              life: ''
            },
            dnsName: '35.237.46.199',
            ipAddresses: [
              '35.237.46.199',
              '10.142.0.7'
            ],
            instanceId: 'juju-905e60-9',
            series: 'xenial',
            id: '9',
            networkInterfaces: {
              ens4: {
                ipAddresses: [
                  '10.142.0.7'
                ],
                macAddress: '42:01:0a:8e:00:07',
                gateway: '10.142.0.1',
                dnsNameservers: [],
                isUp: true
              }
            },
            containers: {},
            constraints: '',
            hardware: 'arch=amd64 cores=1 cpu-power=138 mem=1700M root-disk=10240M availability-zone=us-east1-d',
            jobs: [
              'JobHostUnits'
            ],
            hasVote: false,
            wantsVote: false,
            lxdProfiles: {}
          }
        },
        applications: {
          grafana: {
            charm: 'cs:~prometheus-charmers/grafana-3',
            series: 'xenial',
            exposed: true,
            life: '',
            relations: {},
            canUpgradeTo: 'cs:~prometheus-charmers/grafana-33',
            subordinateTo: [],
            units: {
              'grafana/0': {
                agentStatus: {
                  status: 'idle',
                  info: '',
                  data: {},
                  since: '2019-08-22T16:16:38.490854491Z',
                  kind: '',
                  version: '2.5.4',
                  life: ''
                },
                workloadStatus: {
                  status: 'active',
                  info: 'Started grafana-server',
                  data: {},
                  since: '2019-08-22T16:16:38.265924752Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadVersion: '',
                machine: '6',
                openedPorts: [
                  '3000/tcp'
                ],
                publicAddress: '35.190.148.22',
                charm: '',
                subordinates: {},
                leader: true
              }
            },
            meterStatuses: {},
            status: {
              status: 'active',
              info: 'Started grafana-server',
              data: {},
              since: '2019-08-22T16:16:38.265924752Z',
              kind: '',
              version: '',
              life: ''
            },
            workloadVersion: '',
            charmVerion: '',
            endpointBindings: {
              'grafana-source': '',
              'nrpe-external-master': '',
              website: ''
            },
            publicAddress: ''
          },
          haproxy: {
            charm: 'cs:haproxy-40',
            series: 'xenial',
            exposed: true,
            life: '',
            relations: {
              peer: [
                'haproxy'
              ]
            },
            canUpgradeTo: 'cs:haproxy-54',
            subordinateTo: [],
            units: {
              'haproxy/0': {
                agentStatus: {
                  status: 'idle',
                  info: '',
                  data: {},
                  since: '2019-08-29T19:42:47.753477405Z',
                  kind: '',
                  version: '2.5.4',
                  life: ''
                },
                workloadStatus: {
                  status: 'error',
                  info: 'hook failed: "config-changed"',
                  data: {},
                  since: '2019-08-29T19:42:47.753477405Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadVersion: '',
                machine: '1',
                openedPorts: [
                  '80/tcp'
                ],
                publicAddress: '100.192.135.3',
                charm: '',
                subordinates: {},
                leader: true
              }
            },
            meterStatuses: {},
            status: {
              status: 'error',
              info: 'hook failed: "config-changed"',
              data: {
                hook: 'config-changed'
              },
              since: '2019-08-29T19:42:47.753477405Z',
              kind: '',
              version: '',
              life: ''
            },
            workloadVersion: '',
            charmVerion: '',
            endpointBindings: {
              'local-monitors': '',
              munin: '',
              'nrpe-external-master': '',
              peer: '',
              reverseproxy: '',
              statistics: '',
              website: ''
            },
            publicAddress: ''
          },
          mysql: {
            charm: 'cs:mysql-57',
            series: 'xenial',
            exposed: true,
            life: '',
            relations: {
              cluster: [
                'mysql'
              ]
            },
            canUpgradeTo: 'cs:mysql-58',
            subordinateTo: [],
            units: {
              'mysql/0': {
                agentStatus: {
                  status: 'idle',
                  info: '',
                  data: {},
                  since: '2019-08-22T16:16:42.729376346Z',
                  kind: '',
                  version: '2.5.4',
                  life: ''
                },
                workloadStatus: {
                  status: 'active',
                  info: 'Ready',
                  data: {},
                  since: '2019-08-22T16:16:42.67178892Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadVersion: '5.7.19',
                machine: '9',
                openedPorts: [
                  '3306/tcp'
                ],
                publicAddress: '35.237.46.199',
                charm: '',
                subordinates: {},
                leader: true
              }
            },
            meterStatuses: {},
            status: {
              status: 'active',
              info: 'Ready',
              data: {},
              since: '2019-08-22T16:16:42.67178892Z',
              kind: '',
              version: '',
              life: ''
            },
            workloadVersion: '5.7.19',
            charmVerion: '',
            endpointBindings: {
              ceph: '',
              cluster: '',
              data: '',
              db: '',
              'db-admin': '',
              ha: '',
              'local-monitors': '',
              master: '',
              monitors: '',
              munin: '',
              'nrpe-external-master': '',
              'shared-db': '',
              slave: ''
            },
            publicAddress: ''
          }
        },
        remoteApplications: {},
        offers: {},
        relations: [
          {
            id: 0,
            key: 'haproxy:peer',
            'interface': 'haproxy-peer',
            scope: 'global',
            endpoints: [
              {
                application: 'haproxy',
                name: 'peer',
                role: 'peer',
                subordinate: false
              }
            ],
            status: {
              status: 'joined',
              info: '',
              data: {},
              since: '2019-08-20T03:58:06.931395952Z',
              kind: '',
              version: '',
              life: ''
            }
          },
          {
            id: 5,
            key: 'mysql:cluster',
            'interface': 'mysql-ha',
            scope: 'global',
            endpoints: [
              {
                application: 'mysql',
                name: 'cluster',
                role: 'peer',
                subordinate: false
              }
            ],
            status: {
              status: 'joined',
              info: '',
              data: {},
              since: '2019-08-20T03:58:06.78747013Z',
              kind: '',
              version: '',
              life: ''
            }
          }
        ],
        controllerTimestamp: '2019-08-29T19:46:26.742014007Z'
      },
      '4e8a5223-c34a-4ac9-83ca-1175165467d7': {
        model: {
          name: 'frontend-ci',
          type: 'iaas',
          cloudTag: 'cloud-google',
          region: 'us-east1',
          version: '2.4.7',
          availableVersion: '',
          modelStatus: {
            status: 'suspended',
            info: 'suspended since cloud credential is not valid',
            data: {},
            since: null,
            kind: '',
            version: '',
            life: ''
          },
          meterStatus: {
            color: '',
            message: ''
          },
          sla: 'unsupported'
        },
        machines: {
          '2': {
            agentStatus: {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2019-01-08T00:54:52.357321928Z',
              kind: '',
              version: '2.4.7',
              life: ''
            },
            instanceStatus: {
              status: 'running',
              info: 'RUNNING',
              data: {},
              since: '2016-12-12T17:36:03.774497893Z',
              kind: '',
              version: '',
              life: ''
            },
            dnsName: '104.196.205.152',
            ipAddresses: [
              '104.196.205.152',
              '10.142.0.4'
            ],
            instanceId: 'juju-5467d7-2',
            series: 'trusty',
            id: '2',
            networkInterfaces: {
              eth0: {
                ipAddresses: [
                  '10.142.0.4'
                ],
                macAddress: '42:01:0a:8e:00:04',
                gateway: '10.142.0.1',
                dnsNameservers: [],
                isUp: true
              },
              lxcbr0: {
                ipAddresses: [
                  '10.0.3.1'
                ],
                macAddress: 'e6:85:69:27:5d:f6',
                dnsNameservers: [],
                isUp: true
              }
            },
            containers: {},
            constraints: 'arch=amd64 cores=2 mem=7500M root-disk=100000M',
            hardware: 'arch=amd64 cores=2 cpu-power=550 mem=7500M root-disk=100352M availability-zone=us-east1-b',
            jobs: [
              'JobHostUnits'
            ],
            hasVote: false,
            wantsVote: false,
            lxdProfiles: {}
          }
        },
        applications: {
          jenkins: {
            charm: 'cs:trusty/jenkins-6',
            series: 'trusty',
            exposed: true,
            life: '',
            relations: {},
            canUpgradeTo: '',
            subordinateTo: [],
            units: {
              'jenkins/2': {
                agentStatus: {
                  status: 'lost',
                  info: 'agent is not communicating with the server',
                  data: {},
                  since: '2019-03-15T05:39:24.628170925Z',
                  kind: '',
                  version: '2.4.7',
                  life: ''
                },
                workloadStatus: {
                  status: 'unknown',
                  info: 'agent lost, see \'juju show-status-log jenkins/2\'',
                  data: {},
                  since: '2016-12-12T18:48:33.18032085Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadVersion: '',
                machine: '2',
                openedPorts: [
                  '8080/tcp'
                ],
                publicAddress: '104.196.205.152',
                charm: '',
                subordinates: {}
              }
            },
            meterStatuses: {},
            status: {
              status: 'unknown',
              info: '',
              data: {},
              since: '2016-12-12T18:48:33.18032085Z',
              kind: '',
              version: '',
              life: ''
            },
            workloadVersion: '',
            charmVerion: '',
            endpointBindings: {
              extension: '',
              master: '',
              website: '',
              zuul: ''
            },
            publicAddress: ''
          }
        },
        remoteApplications: {},
        offers: {},
        relations: [],
        controllerTimestamp: '2019-08-29T19:46:27.54263706Z'
      },
      '227f7472-b508-4260-89eb-9fd360ddqf5b': {
        model: {
          name: 'backend-ci',
          type: 'iaas',
          cloudTag: 'cloud-google',
          region: 'us-east1',
          version: '2.5.4',
          availableVersion: '',
          modelStatus: {
            status: 'suspended',
            info: 'suspended since cloud credential is not valid',
            data: {},
            since: null,
            kind: '',
            version: '',
            life: ''
          },
          meterStatus: {
            color: '',
            message: ''
          },
          sla: 'unsupported'
        },
        machines: {
          '3': {
            agentStatus: {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2019-05-02T08:12:38.881378598Z',
              kind: '',
              version: '2.5.4',
              life: ''
            },
            instanceStatus: {
              status: 'running',
              info: 'RUNNING',
              data: {},
              since: '2016-12-08T17:05:11.571200318Z',
              kind: '',
              version: '',
              life: ''
            },
            dnsName: '35.185.13.18',
            ipAddresses: [
              '35.185.13.18',
              '10.142.0.3'
            ],
            instanceId: 'juju-dddf5b-3',
            series: 'trusty',
            id: '3',
            networkInterfaces: {
              docker0: {
                ipAddresses: [
                  '172.17.0.1'
                ],
                macAddress: '02:42:60:a5:a6:3a',
                dnsNameservers: [],
                isUp: true
              },
              eth0: {
                ipAddresses: [
                  '10.142.0.3'
                ],
                macAddress: '42:01:0a:8e:00:03',
                gateway: '10.142.0.1',
                dnsNameservers: [],
                isUp: true
              },
              lxcbr0: {
                ipAddresses: [
                  '10.0.3.1'
                ],
                macAddress: '00:16:3e:00:00:00',
                dnsNameservers: [],
                isUp: true
              },
              lxdbr0: {
                ipAddresses: [
                  '10.138.167.1'
                ],
                macAddress: 'fe:ee:dd:7c:7c:96',
                dnsNameservers: [],
                isUp: true
              }
            },
            containers: {},
            constraints: 'arch=amd64 cores=2 mem=7500M root-disk=100000M',
            hardware: 'arch=amd64 cores=2 cpu-power=550 mem=7500M root-disk=100352M availability-zone=us-east1-b',
            jobs: [
              'JobHostUnits'
            ],
            hasVote: false,
            wantsVote: false,
            lxdProfiles: {}
          },
          '8': {
            agentStatus: {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2019-05-02T08:12:30.877393491Z',
              kind: '',
              version: '2.5.4',
              life: ''
            },
            instanceStatus: {
              status: 'running',
              info: 'RUNNING',
              data: {},
              since: '2017-11-14T14:48:06.848274153Z',
              kind: '',
              version: '',
              life: ''
            },
            dnsName: '35.196.56.156',
            ipAddresses: [
              '35.196.56.156',
              '10.142.0.9',
              '172.17.0.1'
            ],
            instanceId: 'juju-dddf5b-8',
            series: 'xenial',
            id: '8',
            networkInterfaces: {
              'br-5cabaa8d9f97': {
                ipAddresses: [
                  '192.168.112.1'
                ],
                macAddress: '02:42:b1:a8:80:ff',
                dnsNameservers: [],
                isUp: true
              },
              docker0: {
                ipAddresses: [
                  '172.17.0.1'
                ],
                macAddress: '02:42:c3:b8:68:a2',
                dnsNameservers: [],
                isUp: true
              },
              ens4: {
                ipAddresses: [
                  '10.142.0.9'
                ],
                macAddress: '42:01:0a:8e:00:09',
                gateway: '10.142.0.1',
                dnsNameservers: [],
                isUp: true
              }
            },
            containers: {},
            constraints: '',
            hardware: 'arch=amd64 cores=1 cpu-power=138 mem=1700M root-disk=10240M availability-zone=us-east1-c',
            jobs: [
              'JobHostUnits'
            ],
            hasVote: false,
            wantsVote: false,
            lxdProfiles: {}
          },
          '10': {
            agentStatus: {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2019-05-02T08:12:30.493649596Z',
              kind: '',
              version: '2.5.4',
              life: ''
            },
            instanceStatus: {
              status: 'running',
              info: 'RUNNING',
              data: {},
              since: '2019-04-04T15:44:22.211076428Z',
              kind: '',
              version: '',
              life: ''
            },
            dnsName: '34.73.34.208',
            ipAddresses: [
              '34.73.34.208',
              '10.142.15.216',
              '172.17.0.1',
              '172.18.0.1'
            ],
            instanceId: 'juju-dddf5b-10',
            series: 'xenial',
            id: '10',
            networkInterfaces: {
              'br-61abc6582581': {
                ipAddresses: [
                  '172.18.0.1'
                ],
                macAddress: '02:42:a9:2c:f9:d9',
                dnsNameservers: [],
                isUp: true
              },
              docker0: {
                ipAddresses: [
                  '172.17.0.1'
                ],
                macAddress: '02:42:9e:4b:6b:d7',
                dnsNameservers: [],
                isUp: true
              },
              ens4: {
                ipAddresses: [
                  '10.142.15.216'
                ],
                macAddress: '42:01:0a:8e:0f:d8',
                gateway: '10.142.0.1',
                dnsNameservers: [],
                isUp: true
              }
            },
            containers: {},
            constraints: '',
            hardware: 'arch=amd64 cores=1 cpu-power=138 mem=1700M root-disk=10240M availability-zone=us-east1-b',
            jobs: [
              'JobHostUnits'
            ],
            hasVote: false,
            wantsVote: false,
            lxdProfiles: {}
          }
        },
        applications: {
          athens: {
            charm: 'cs:~martin-hilton/athens-1',
            series: 'xenial',
            exposed: false,
            life: '',
            relations: {},
            canUpgradeTo: '',
            subordinateTo: [],
            units: {
              'athens/0': {
                agentStatus: {
                  status: 'lost',
                  info: 'agent is not communicating with the server',
                  data: {},
                  since: '2019-07-03T22:48:13.632221294Z',
                  kind: '',
                  version: '2.5.4',
                  life: ''
                },
                workloadStatus: {
                  status: 'unknown',
                  info: 'agent lost, see \'juju show-status-log athens/0\'',
                  data: {},
                  since: '2019-04-05T09:29:46.433940737Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadVersion: 'v0.3.1',
                machine: '10',
                openedPorts: [
                  '3000/tcp'
                ],
                publicAddress: '34.73.34.208',
                charm: '',
                subordinates: {}
              }
            },
            meterStatuses: {},
            status: {
              status: 'active',
              info: 'athens running',
              data: {},
              since: '2019-04-05T09:29:46.433940737Z',
              kind: '',
              version: '',
              life: ''
            },
            workloadVersion: 'v0.3.1',
            charmVerion: '',
            endpointBindings: {
              dockerhost: '',
              'nrpe-external-master': '',
              'sdn-plugin': ''
            },
            publicAddress: ''
          },
          jenkins: {
            charm: 'cs:trusty/jenkins-6',
            series: 'trusty',
            exposed: true,
            life: '',
            relations: {},
            canUpgradeTo: '',
            subordinateTo: [],
            units: {
              'jenkins/3': {
                agentStatus: {
                  status: 'lost',
                  info: 'agent is not communicating with the server',
                  data: {},
                  since: '2019-07-03T22:49:13.793357083Z',
                  kind: '',
                  version: '2.5.4',
                  life: ''
                },
                workloadStatus: {
                  status: 'unknown',
                  info: 'agent lost, see \'juju show-status-log jenkins/3\'',
                  data: {},
                  since: '2016-12-08T17:10:17.805061659Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadVersion: '',
                machine: '3',
                openedPorts: [
                  '6543/tcp',
                  '8080/tcp',
                  '32887/tcp',
                  '37933/tcp'
                ],
                publicAddress: '35.185.13.18',
                charm: '',
                subordinates: {}
              }
            },
            meterStatuses: {},
            status: {
              status: 'unknown',
              info: '',
              data: {},
              since: '2016-12-08T17:10:17.805061659Z',
              kind: '',
              version: '',
              life: ''
            },
            workloadVersion: '',
            charmVerion: '',
            endpointBindings: {
              extension: '',
              master: '',
              website: '',
              zuul: ''
            },
            publicAddress: ''
          },
          'jenkins-slave': {
            charm: 'cs:~juju-qa/xenial/jenkins-slave-7',
            series: 'xenial',
            exposed: false,
            life: '',
            relations: {},
            canUpgradeTo: '',
            subordinateTo: [],
            units: {
              'jenkins-slave/4': {
                agentStatus: {
                  status: 'lost',
                  info: 'agent is not communicating with the server',
                  data: {},
                  since: '2019-07-04T13:38:18.681832755Z',
                  kind: '',
                  version: '2.5.4',
                  life: ''
                },
                workloadStatus: {
                  status: 'unknown',
                  info: 'agent lost, see \'juju show-status-log jenkins-slave/4\'',
                  data: {},
                  since: '2019-07-04T13:38:18.568175905Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadVersion: '',
                machine: '8',
                openedPorts: [],
                publicAddress: '35.196.56.156',
                charm: '',
                subordinates: {}
              }
            },
            meterStatuses: {},
            status: {
              status: 'active',
              info: 'jenkins-slave-4 is accepting work',
              data: {},
              since: '2019-07-04T13:38:18.568175905Z',
              kind: '',
              version: '',
              life: ''
            },
            workloadVersion: '',
            charmVerion: '',
            endpointBindings: {
              slave: ''
            },
            publicAddress: ''
          }
        },
        remoteApplications: {},
        offers: {},
        relations: [],
        controllerTimestamp: '2019-08-29T19:46:27.955889854Z'
      },
      'e059c662-679f-4ab4-8a38-e5685awed391': {
        model: {
          name: 'data-aggregator',
          type: 'iaas',
          cloudTag: 'cloud-google',
          region: 'us-east1',
          version: '2.5.4',
          availableVersion: '',
          modelStatus: {
            status: 'suspended',
            info: 'suspended since cloud credential is not valid',
            data: {},
            since: null,
            kind: '',
            version: '',
            life: ''
          },
          meterStatus: {
            color: 'green',
            message: ''
          },
          sla: 'essential'
        },
        machines: {
          '24': {
            agentStatus: {
              status: 'started',
              info: '',
              data: {},
              since: '2019-05-02T08:13:13.869692938Z',
              kind: '',
              version: '2.5.4',
              life: ''
            },
            instanceStatus: {
              status: 'running',
              info: 'RUNNING',
              data: {},
              since: '2018-04-11T14:32:24.425079587Z',
              kind: '',
              version: '',
              life: ''
            },
            dnsName: '35.227.34.67',
            ipAddresses: [
              '35.227.34.67',
              '10.142.0.6'
            ],
            instanceId: 'juju-aed391-24',
            series: 'xenial',
            id: '24',
            networkInterfaces: {
              ens4: {
                ipAddresses: [
                  '10.142.0.6'
                ],
                macAddress: '42:01:0a:8e:00:06',
                gateway: '10.142.0.1',
                dnsNameservers: [],
                isUp: true
              }
            },
            containers: {},
            constraints: '',
            hardware: 'arch=amd64 cores=1 cpu-power=138 mem=1700M root-disk=10240M availability-zone=us-east1-b',
            jobs: [
              'JobHostUnits'
            ],
            hasVote: false,
            wantsVote: false,
            lxdProfiles: {}
          },
          '31': {
            agentStatus: {
              status: 'started',
              info: '',
              data: {},
              since: '2019-05-02T08:13:18.84170171Z',
              kind: '',
              version: '2.5.4',
              life: ''
            },
            instanceStatus: {
              status: 'running',
              info: 'RUNNING',
              data: {},
              since: '2018-11-13T15:39:56.774647464Z',
              kind: '',
              version: '',
              life: ''
            },
            dnsName: '35.229.48.99',
            ipAddresses: [
              '35.229.48.99',
              '10.142.0.8',
              '10.138.102.1'
            ],
            instanceId: 'juju-aed391-31',
            series: 'bionic',
            id: '31',
            networkInterfaces: {
              ens4: {
                ipAddresses: [
                  '10.142.0.8'
                ],
                macAddress: '42:01:0a:8e:00:08',
                gateway: '10.142.0.1',
                dnsNameservers: [],
                isUp: true
              },
              jujushellbr0: {
                ipAddresses: [
                  '10.138.102.1'
                ],
                macAddress: 'fe:57:cd:a6:81:b9',
                dnsNameservers: [],
                isUp: true
              }
            },
            containers: {},
            constraints: 'arch=amd64 cores=8 cpu-power=2200 mem=7200M root-disk=50000M',
            hardware: 'arch=amd64 cores=8 cpu-power=2200 mem=7200M root-disk=50176M availability-zone=us-east1-b',
            jobs: [
              'JobHostUnits'
            ],
            hasVote: false,
            wantsVote: false,
            lxdProfiles: {}
          }
        },
        applications: {
          'jujushell-prod': {
            charm: 'cs:~juju-gui/jujushell-15',
            series: 'bionic',
            exposed: true,
            life: '',
            relations: {},
            canUpgradeTo: 'cs:~juju-gui/jujushell-16',
            subordinateTo: [],
            units: {
              'jujushell-prod/5': {
                agentStatus: {
                  status: 'idle',
                  info: '',
                  data: {},
                  since: '2019-08-22T16:16:36.074746751Z',
                  kind: '',
                  version: '2.5.4',
                  life: ''
                },
                workloadStatus: {
                  status: 'active',
                  info: 'jujushell running',
                  data: {},
                  since: '2018-11-13T15:44:14.069437478Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadVersion: '',
                machine: '31',
                openedPorts: [
                  '443/tcp'
                ],
                publicAddress: '35.229.48.99',
                charm: '',
                subordinates: {},
                leader: true
              }
            },
            meterStatuses: {},
            status: {
              status: 'active',
              info: 'jujushell running',
              data: {},
              since: '2018-11-13T15:44:14.069437478Z',
              kind: '',
              version: '',
              life: ''
            },
            workloadVersion: '',
            charmVerion: '',
            endpointBindings: {
              prometheus: '',
              website: ''
            },
            publicAddress: ''
          },
          'prometheus-prod': {
            charm: 'cs:~prometheus-charmers/prometheus-23',
            series: 'xenial',
            exposed: true,
            life: '',
            relations: {},
            canUpgradeTo: 'cs:~prometheus-charmers/prometheus-25',
            subordinateTo: [],
            units: {
              'prometheus-prod/0': {
                agentStatus: {
                  status: 'idle',
                  info: '',
                  data: {},
                  since: '2019-08-22T16:16:37.164173048Z',
                  kind: '',
                  version: '2.5.4',
                  life: ''
                },
                workloadStatus: {
                  status: 'active',
                  info: 'Ready',
                  data: {},
                  since: '2018-04-11T14:36:22.699676784Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadVersion: '',
                machine: '24',
                openedPorts: [
                  '9090/tcp',
                  '12321/tcp'
                ],
                publicAddress: '35.227.34.67',
                charm: '',
                subordinates: {},
                leader: true
              }
            },
            meterStatuses: {},
            status: {
              status: 'active',
              info: 'Ready',
              data: {},
              since: '2018-04-11T14:36:22.699676784Z',
              kind: '',
              version: '',
              life: ''
            },
            workloadVersion: '',
            charmVerion: '',
            endpointBindings: {
              'alertmanager-service': '',
              'blackbox-exporter': '',
              'grafana-source': '',
              'nrpe-external-master': '',
              scrape: '',
              'snmp-exporter': '',
              target: '',
              website: ''
            },
            publicAddress: ''
          }
        },
        remoteApplications: {},
        offers: {},
        relations: [],
        controllerTimestamp: '2019-08-29T19:46:28.41342262Z'
      }
    }
  }
}
