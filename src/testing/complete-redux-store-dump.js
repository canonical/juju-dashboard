// Internally consistent mock data.
// When generating additional mock data make sure that it's internally consistent
// across the top level keys.

export default {
  root: {
    bakery: {
      storage: {
        _store: {
          'https://api.jujucharms.com/identity': 'yI6WZvcmUgMjAxOS0xMS0yMVQxODo1OToxNC43NDg4MTc0ODNaIn0seyJjaWQiOiJkZWNsYXJlZCB1c2VybmFtZSBoYXRjaCJ9LHsiY2lkIjoiaHR0cDpvcmlnaW4gaHR0cDovLzE5Mi4xNjguNjQuMTY6ODAzNiJ9XSwibG9jYXRpb24iOiJpZGVudGl0eSIsImlkZW50aWZpZXIiOiJBd29RNDhMODZrc2ZzOEpsYVR5YkNMRDI5QklnWTJJMU1UQmlaRFkyTlRsbE5qUTRORE5qTUdObU9XSXhNV013TnpjM01UTWFEZ29GYkc5bmFXNFNCV3h2WjJsdSIsInNpZ25hdHVyZSI6ImQ3Y2M4MGRjOTc5MmQwMDFhY2YwYmFkYjAyM0NTM0ZDYzMmMyYzdhMzYifV0=',
          identity: 'yI6WZvcmUgMjAxOS0xMS0yMVQxODo1OToxNC43NDg4MTc0ODNaIn0seyJjaWQiOiJkZWNsYXJlZCB1c2VybmFtZSBoYXRjaCJ9LHsiY2lkIjoiaHR0cDpvcmlnaW4gaHR0cDovLzE5Mi4xNjguNjQuMTY6ODAzNiJ9XSwibG9jYXRpb24iOiJpZGVudGl0eSIsImlkZW50aWZpZXIiOiJBd29RNDhMODZrc2ZzOEpsYVR5YkNMRDI5QklnWTJJMU1UQmlaRFkyTlRsbE5qUTRORE5qTUdObU9XSXhNV013TnpjM01UTWFEZ29GYkc5bmFXNFNCV3h2WjJsdSIsInNpZ25hdHVyZSI6ImQ3Y2M4MGRjOTc5MmQwMDFhY2YwYmFkYjAyM0NTM0ZDYzMmMyYzdhMzYifV0='
        },
        _services: {},
        _charmstoreCookieSetter: null
      },
      _dischargeDisabled: false
    },
    controllerConnection: {
      transport: {
        _ws: {},
        _counter: 155,
        _callbacks: {},
        _debug: false
      },
      info: {
        controllerTag: 'controller-a030379a-940f-4760-8fcf-3062b41a04e7',
        serverVersion: '2.6.8',
        servers: [],
        user: {
          displayName: 'activedev',
          identity: 'user-activedev@external',
          controllerAccess: '',
          modelAccess: ''
        }
      },
      facades: {
        modelManager: {
          _transport: {
            _ws: {},
            _counter: 155,
            _callbacks: {},
            _debug: false
          },
          _info: {
            controllerTag: 'controller-a030379a-940f-4760-8fcf-3062b41a04e7',
            serverVersion: '2.6.8',
            servers: [],
            user: {
              displayName: 'activedev',
              identity: 'user-activedev@external',
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
      'e1e81a64-3385-4779-8643-05e3d5ed4523': {
        lastConnection: null,
        name: 'canonical-kubernetes',
        ownerTag: 'user-spaceman@external',
        type: '',
        uuid: 'e1e81a64-3385-4779-8643-05e3d5ed4523'
      },
      '2f995dee-392e-4459-8eb9-839c501590af': {
        lastConnection: null,
        name: 'hadoopspark',
        ownerTag: 'user-spaceman@external',
        type: 'iaas',
        uuid: '2f995dee-392e-4459-8eb9-839c501590af'
      },
      '7ffe956a-06ac-4ae9-8aac-04eba4a93da5': {
        lastConnection: null,
        name: 'mymodel',
        ownerTag: 'user-spaceman@external',
        type: '',
        uuid: '7ffe956a-06ac-4ae9-8aac-04eba4a93da5'
      },
      'd291b9ed-1e66-4023-84fe-57130e17a0b2': {
        lastConnection: null,
        name: 'mymodel4',
        ownerTag: 'user-spaceman@external',
        type: '',
        uuid: 'd291b9ed-1e66-4023-84fe-57130e17a0b2'
      },
      '5f612488-b60b-4256-814a-ba1abaa7db23': {
        lastConnection: null,
        name: 'testing',
        ownerTag: 'user-spaceman@external',
        type: 'iaas',
        uuid: '5f612488-b60b-4256-814a-ba1abaa7db23'
      },
      '57650e3c-815f-4540-89df-81fd5d70b7ef': {
        lastConnection: null,
        name: 'group-test',
        ownerTag: 'user-activedev@external',
        type: '',
        uuid: '57650e3c-815f-4540-89df-81fd5d70b7ef'
      },
      'e6782960-fb0b-460e-82a1-64ee03f9a39b': {
        lastConnection: null,
        name: 'new-search-aggregate',
        ownerTag: 'user-activedev@external',
        type: 'iaas',
        uuid: 'e6782960-fb0b-460e-82a1-64ee03f9a39b'
      },
      '84e872ff-9171-46be-829b-70f0f09cb18d': {
        lastConnection: null,
        name: 'sub-test',
        ownerTag: 'user-activedev@external',
        type: 'iaas',
        uuid: '84e872ff-9171-46be-829b-70f0f09cb18d'
      },
      '2446d278-7928-4c50-811b-563e79acd991': {
        lastConnection: null,
        name: 'test1',
        ownerTag: 'user-activedev@external',
        type: 'iaas',
        uuid: '2446d278-7928-4c50-811b-563e79acd991'
      },
      '4b89852b-0633-4fae-8ba2-acf0261d4a03': {
        lastConnection: null,
        name: 'test2',
        ownerTag: 'user-activedev@external',
        type: 'iaas',
        uuid: '4b89852b-0633-4fae-8ba2-acf0261d4a03'
      },
      '81887357-1c78-4ad6-8b89-4fb01ebec720': {
        lastConnection: null,
        name: 'test3',
        ownerTag: 'user-activedev@external',
        type: 'iaas',
        uuid: '81887357-1c78-4ad6-8b89-4fb01ebec720'
      },
      '06b11eb5-abd6-48f3-8910-b54cf5905e60': {
        lastConnection: null,
        name: 'all-kpi',
        ownerTag: 'user-alto@external',
        type: '',
        uuid: '06b11eb5-abd6-48f3-8910-b54cf5905e60'
      },
      '4e8a5213-c34a-4ac9-83fa-1175165467d7': {
        lastConnection: null,
        name: 'ci-website',
        ownerTag: 'user-uncle-phil@external',
        type: '',
        uuid: '4e8a5213-c34a-4ac9-83fa-1175165467d7'
      },
      '227f7472-b508-4260-89eb-9fd360dddf5b': {
        lastConnection: null,
        name: 'ci-different',
        ownerTag: 'user-uncle-phil@external',
        type: '',
        uuid: '227f7472-b508-4260-89eb-9fd360dddf5b'
      },
      'e059c662-679f-4ab4-8a38-e5685aaed391': {
        lastConnection: null,
        name: 'sales-dept',
        ownerTag: 'user-uncle-phil@external',
        type: '',
        uuid: 'e059c662-679f-4ab4-8a38-e5685aaed391'
      },
      'f24f9b6b-4e54-4bc3-8e83-3becae851c24': {
        lastConnection: null,
        name: 'ants-wordpress',
        ownerTag: 'user-that-guy@external',
        type: 'iaas',
        uuid: 'f24f9b6b-4e54-4bc3-8e83-3becae851c24'
      },
      '8f86503e-f79f-49ef-8ed9-3a6ea5b280e7': {
        lastConnection: null,
        name: 'bionic-model',
        ownerTag: 'user-that-guy@external',
        type: 'iaas',
        uuid: '8f86503e-f79f-49ef-8ed9-3a6ea5b280e7'
      }
    },
    modelData: {
      'e1e81a64-3385-4779-8643-05e3d5ed4523': {
        applications: {
          easyrsa: {
            charm: 'cs:~containers/easyrsa-50',
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
            canUpgradeTo: 'cs:~containers/easyrsa-278',
            subordinateTo: [],
            units: {
              'easyrsa/0': {
                agentStatus: {
                  status: 'allocating',
                  info: '',
                  data: {},
                  since: '2018-08-03T14:57:11.486692945Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadStatus: {
                  status: 'waiting',
                  info: 'waiting for machine',
                  data: {},
                  since: '2018-08-03T14:57:11.486692945Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadVersion: '',
                machine: '0',
                openedPorts: [],
                publicAddress: '',
                charm: '',
                subordinates: {}
              }
            },
            meterStatuses: {},
            status: {
              status: 'waiting',
              info: 'waiting for machine',
              data: {},
              since: '2018-08-03T14:57:11.486692945Z',
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
          etcd: {
            charm: 'cs:~containers/etcd-96',
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
            canUpgradeTo: 'cs:~containers/etcd-460',
            subordinateTo: [],
            units: {
              'etcd/0': {
                agentStatus: {
                  status: 'allocating',
                  info: '',
                  data: {},
                  since: '2018-08-03T14:57:11.492815459Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadStatus: {
                  status: 'waiting',
                  info: 'waiting for machine',
                  data: {},
                  since: '2018-08-03T14:57:11.492815459Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadVersion: '',
                machine: '3',
                openedPorts: [],
                publicAddress: '',
                charm: '',
                subordinates: {}
              },
              'etcd/1': {
                agentStatus: {
                  status: 'allocating',
                  info: '',
                  data: {},
                  since: '2018-08-03T14:57:11.494089863Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadStatus: {
                  status: 'waiting',
                  info: 'waiting for machine',
                  data: {},
                  since: '2018-08-03T14:57:11.494089863Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadVersion: '',
                machine: '1',
                openedPorts: [],
                publicAddress: '',
                charm: '',
                subordinates: {}
              },
              'etcd/2': {
                agentStatus: {
                  status: 'allocating',
                  info: '',
                  data: {},
                  since: '2018-08-03T14:57:11.500554837Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadStatus: {
                  status: 'waiting',
                  info: 'waiting for machine',
                  data: {},
                  since: '2018-08-03T14:57:11.500554837Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadVersion: '',
                machine: '2',
                openedPorts: [],
                publicAddress: '',
                charm: '',
                subordinates: {}
              }
            },
            meterStatuses: {},
            status: {
              status: 'waiting',
              info: 'waiting for machine',
              data: {},
              since: '2018-08-03T14:57:11.494089863Z',
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
            charm: 'cs:~containers/flannel-66',
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
              since: '2018-08-03T14:57:10.647465036Z',
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
          'kubeapi-load-balancer': {
            charm: 'cs:~containers/kubeapi-load-balancer-69',
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
            canUpgradeTo: 'cs:~containers/kubeapi-load-balancer-682',
            subordinateTo: [],
            units: {
              'kubeapi-load-balancer/0': {
                agentStatus: {
                  status: 'allocating',
                  info: '',
                  data: {},
                  since: '2018-08-03T14:57:10.684642938Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadStatus: {
                  status: 'waiting',
                  info: 'waiting for machine',
                  data: {},
                  since: '2018-08-03T14:57:10.684642938Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadVersion: '',
                machine: '4',
                openedPorts: [],
                publicAddress: '',
                charm: '',
                subordinates: {}
              }
            },
            meterStatuses: {},
            status: {
              status: 'waiting',
              info: 'waiting for machine',
              data: {},
              since: '2018-08-03T14:57:10.684642938Z',
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
            charm: 'cs:~containers/kubernetes-master-122',
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
            canUpgradeTo: 'cs:~containers/kubernetes-master-754',
            subordinateTo: [],
            units: {
              'kubernetes-master/0': {
                agentStatus: {
                  status: 'allocating',
                  info: '',
                  data: {},
                  since: '2018-08-03T14:57:11.495349493Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadStatus: {
                  status: 'waiting',
                  info: 'waiting for machine',
                  data: {},
                  since: '2018-08-03T14:57:11.495349493Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadVersion: '',
                machine: '6',
                openedPorts: [],
                publicAddress: '',
                charm: '',
                subordinates: {}
              },
              'kubernetes-master/1': {
                agentStatus: {
                  status: 'allocating',
                  info: '',
                  data: {},
                  since: '2018-08-03T14:57:11.495630036Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadStatus: {
                  status: 'waiting',
                  info: 'waiting for machine',
                  data: {},
                  since: '2018-08-03T14:57:11.495630036Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadVersion: '',
                machine: '5',
                openedPorts: [],
                publicAddress: '',
                charm: '',
                subordinates: {}
              }
            },
            meterStatuses: {},
            status: {
              status: 'waiting',
              info: 'waiting for machine',
              data: {},
              since: '2018-08-03T14:57:11.495349493Z',
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
              openstack: ''
            },
            publicAddress: ''
          },
          'kubernetes-worker': {
            charm: 'cs:~containers/kubernetes-worker-138',
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
            canUpgradeTo: 'cs:~containers/kubernetes-worker-590',
            subordinateTo: [],
            units: {
              'kubernetes-worker/0': {
                agentStatus: {
                  status: 'allocating',
                  info: '',
                  data: {},
                  since: '2018-08-03T14:57:11.498056728Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadStatus: {
                  status: 'waiting',
                  info: 'waiting for machine',
                  data: {},
                  since: '2018-08-03T14:57:11.498056728Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadVersion: '',
                machine: '7',
                openedPorts: [],
                publicAddress: '',
                charm: '',
                subordinates: {}
              },
              'kubernetes-worker/1': {
                agentStatus: {
                  status: 'allocating',
                  info: '',
                  data: {},
                  since: '2018-08-03T14:57:11.49892526Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadStatus: {
                  status: 'waiting',
                  info: 'waiting for machine',
                  data: {},
                  since: '2018-08-03T14:57:11.49892526Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadVersion: '',
                machine: '9',
                openedPorts: [],
                publicAddress: '',
                charm: '',
                subordinates: {}
              },
              'kubernetes-worker/2': {
                agentStatus: {
                  status: 'allocating',
                  info: '',
                  data: {},
                  since: '2018-08-03T14:57:11.498056731Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadStatus: {
                  status: 'waiting',
                  info: 'waiting for machine',
                  data: {},
                  since: '2018-08-03T14:57:11.498056731Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadVersion: '',
                machine: '8',
                openedPorts: [],
                publicAddress: '',
                charm: '',
                subordinates: {}
              }
            },
            meterStatuses: {},
            status: {
              status: 'waiting',
              info: 'waiting for machine',
              data: {},
              since: '2018-08-03T14:57:11.498056728Z',
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
              'sdn-plugin': ''
            },
            publicAddress: ''
          }
        },
        machines: {
          '0': {
            agentStatus: {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2018-08-03T15:04:03.342533231Z',
              kind: '',
              version: '',
              life: ''
            },
            instanceStatus: {
              status: 'provisioning error',
              info: 'googleapi: Error 403: Project clean-algebra-206308 cannot accept requests to insert while in an inactive billing state.  Billing state may take several minutes to update., inactiveBillingState',
              data: {},
              since: '2018-08-03T15:04:03.342533231Z',
              kind: '',
              version: '',
              life: ''
            },
            dnsName: '',
            ipAddresses: [],
            instanceId: 'pending',
            series: 'xenial',
            id: '0',
            networkInterfaces: {},
            containers: {},
            constraints: '',
            hardware: '',
            jobs: [
              'JobHostUnits'
            ],
            hasVote: false,
            wantsVote: false,
            lxdProfiles: {}
          },
          '1': {
            agentStatus: {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2018-08-03T15:10:57.825720441Z',
              kind: '',
              version: '',
              life: ''
            },
            instanceStatus: {
              status: 'provisioning error',
              info: 'googleapi: Error 403: Project clean-algebra-206308 cannot accept requests to insert while in an inactive billing state.  Billing state may take several minutes to update., inactiveBillingState',
              data: {},
              since: '2018-08-03T15:10:57.825720441Z',
              kind: '',
              version: '',
              life: ''
            },
            dnsName: '',
            ipAddresses: [],
            instanceId: 'pending',
            series: 'xenial',
            id: '1',
            networkInterfaces: {},
            containers: {},
            constraints: '',
            hardware: '',
            jobs: [
              'JobHostUnits'
            ],
            hasVote: false,
            wantsVote: false,
            lxdProfiles: {}
          },
          '2': {
            agentStatus: {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2018-08-03T15:24:46.395695414Z',
              kind: '',
              version: '',
              life: ''
            },
            instanceStatus: {
              status: 'provisioning error',
              info: 'googleapi: Error 403: Project clean-algebra-206308 cannot accept requests to insert while in an inactive billing state.  Billing state may take several minutes to update., inactiveBillingState',
              data: {},
              since: '2018-08-03T15:24:46.395695414Z',
              kind: '',
              version: '',
              life: ''
            },
            dnsName: '',
            ipAddresses: [],
            instanceId: 'pending',
            series: 'xenial',
            id: '2',
            networkInterfaces: {},
            containers: {},
            constraints: '',
            hardware: '',
            jobs: [
              'JobHostUnits'
            ],
            hasVote: false,
            wantsVote: false,
            lxdProfiles: {}
          },
          '3': {
            agentStatus: {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2018-08-03T15:17:51.995921268Z',
              kind: '',
              version: '',
              life: ''
            },
            instanceStatus: {
              status: 'provisioning error',
              info: 'googleapi: Error 403: Project clean-algebra-206308 cannot accept requests to insert while in an inactive billing state.  Billing state may take several minutes to update., inactiveBillingState',
              data: {},
              since: '2018-08-03T15:17:51.995921268Z',
              kind: '',
              version: '',
              life: ''
            },
            dnsName: '',
            ipAddresses: [],
            instanceId: 'pending',
            series: 'xenial',
            id: '3',
            networkInterfaces: {},
            containers: {},
            constraints: '',
            hardware: '',
            jobs: [
              'JobHostUnits'
            ],
            hasVote: false,
            wantsVote: false,
            lxdProfiles: {}
          },
          '4': {
            agentStatus: {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2018-08-03T15:25:02.214233178Z',
              kind: '',
              version: '',
              life: ''
            },
            instanceStatus: {
              status: 'provisioning error',
              info: 'googleapi: Error 403: Project clean-algebra-206308 cannot accept requests to insert while in an inactive billing state.  Billing state may take several minutes to update., inactiveBillingState',
              data: {},
              since: '2018-08-03T15:25:02.214233178Z',
              kind: '',
              version: '',
              life: ''
            },
            dnsName: '',
            ipAddresses: [],
            instanceId: 'pending',
            series: 'xenial',
            id: '4',
            networkInterfaces: {},
            containers: {},
            constraints: '',
            hardware: '',
            jobs: [
              'JobHostUnits'
            ],
            hasVote: false,
            wantsVote: false,
            lxdProfiles: {}
          },
          '5': {
            agentStatus: {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2018-08-03T15:24:46.123788547Z',
              kind: '',
              version: '',
              life: ''
            },
            instanceStatus: {
              status: 'provisioning error',
              info: 'googleapi: Error 403: Project clean-algebra-206308 cannot accept requests to insert while in an inactive billing state.  Billing state may take several minutes to update., inactiveBillingState',
              data: {},
              since: '2018-08-03T15:24:46.123788547Z',
              kind: '',
              version: '',
              life: ''
            },
            dnsName: '',
            ipAddresses: [],
            instanceId: 'pending',
            series: 'xenial',
            id: '5',
            networkInterfaces: {},
            containers: {},
            constraints: '',
            hardware: '',
            jobs: [
              'JobHostUnits'
            ],
            hasVote: false,
            wantsVote: false,
            lxdProfiles: {}
          },
          '6': {
            agentStatus: {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2018-08-03T15:24:46.085797114Z',
              kind: '',
              version: '',
              life: ''
            },
            instanceStatus: {
              status: 'provisioning error',
              info: 'googleapi: Error 403: Project clean-algebra-206308 cannot accept requests to insert while in an inactive billing state.  Billing state may take several minutes to update., inactiveBillingState',
              data: {},
              since: '2018-08-03T15:24:46.085797114Z',
              kind: '',
              version: '',
              life: ''
            },
            dnsName: '',
            ipAddresses: [],
            instanceId: 'pending',
            series: 'xenial',
            id: '6',
            networkInterfaces: {},
            containers: {},
            constraints: '',
            hardware: '',
            jobs: [
              'JobHostUnits'
            ],
            hasVote: false,
            wantsVote: false,
            lxdProfiles: {}
          },
          '7': {
            agentStatus: {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2018-08-03T15:24:45.91922474Z',
              kind: '',
              version: '',
              life: ''
            },
            instanceStatus: {
              status: 'provisioning error',
              info: 'googleapi: Error 403: Project clean-algebra-206308 cannot accept requests to insert while in an inactive billing state.  Billing state may take several minutes to update., inactiveBillingState',
              data: {},
              since: '2018-08-03T15:24:45.91922474Z',
              kind: '',
              version: '',
              life: ''
            },
            dnsName: '',
            ipAddresses: [],
            instanceId: 'pending',
            series: 'xenial',
            id: '7',
            networkInterfaces: {},
            containers: {},
            constraints: '',
            hardware: '',
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
              since: '2018-08-03T15:24:46.062722784Z',
              kind: '',
              version: '',
              life: ''
            },
            instanceStatus: {
              status: 'provisioning error',
              info: 'googleapi: Error 403: Project clean-algebra-206308 cannot accept requests to insert while in an inactive billing state.  Billing state may take several minutes to update., inactiveBillingState',
              data: {},
              since: '2018-08-03T15:24:46.062722784Z',
              kind: '',
              version: '',
              life: ''
            },
            dnsName: '',
            ipAddresses: [],
            instanceId: 'pending',
            series: 'xenial',
            id: '8',
            networkInterfaces: {},
            containers: {},
            constraints: '',
            hardware: '',
            jobs: [
              'JobHostUnits'
            ],
            hasVote: false,
            wantsVote: false,
            lxdProfiles: {}
          },
          '9': {
            agentStatus: {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2018-08-03T15:24:46.276077785Z',
              kind: '',
              version: '',
              life: ''
            },
            instanceStatus: {
              status: 'provisioning error',
              info: 'googleapi: Error 403: Project clean-algebra-206308 cannot accept requests to insert while in an inactive billing state.  Billing state may take several minutes to update., inactiveBillingState',
              data: {},
              since: '2018-08-03T15:24:46.276077785Z',
              kind: '',
              version: '',
              life: ''
            },
            dnsName: '',
            ipAddresses: [],
            instanceId: 'pending',
            series: 'xenial',
            id: '9',
            networkInterfaces: {},
            containers: {},
            constraints: '',
            hardware: '',
            jobs: [
              'JobHostUnits'
            ],
            hasVote: false,
            wantsVote: false,
            lxdProfiles: {}
          }
        },
        model: {
          name: 'canonical-kubernetes',
          type: 'iaas',
          cloudTag: 'cloud-google',
          region: 'us-central1',
          version: '2.3.8',
          availableVersion: '',
          modelStatus: {
            status: 'available',
            info: '',
            data: {},
            since: '2019-09-20T13:17:37.448204789Z',
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
        offers: {},
        relations: [
          {
            id: 2,
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
              since: '2018-08-03T14:57:11.461331961Z',
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
              since: '2018-08-03T14:57:11.461130355Z',
              kind: '',
              version: '',
              life: ''
            }
          },
          {
            id: 5,
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
              since: '2018-08-03T14:57:11.462908308Z',
              kind: '',
              version: '',
              life: ''
            }
          },
          {
            id: 9,
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
              since: '2018-08-03T14:57:11.464258736Z',
              kind: '',
              version: '',
              life: ''
            }
          },
          {
            id: 7,
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
              since: '2018-08-03T14:57:11.46374984Z',
              kind: '',
              version: '',
              life: ''
            }
          },
          {
            id: 8,
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
              since: '2018-08-03T14:57:11.464826542Z',
              kind: '',
              version: '',
              life: ''
            }
          },
          {
            id: 12,
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
              since: '2018-08-03T14:57:11.483066354Z',
              kind: '',
              version: '',
              life: ''
            }
          },
          {
            id: 10,
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
              since: '2018-08-03T14:57:11.472516355Z',
              kind: '',
              version: '',
              life: ''
            }
          },
          {
            id: 11,
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
              since: '2018-08-03T14:57:11.473621854Z',
              kind: '',
              version: '',
              life: ''
            }
          },
          {
            id: 0,
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
              since: '2018-08-03T14:57:10.659709156Z',
              kind: '',
              version: '',
              life: ''
            }
          },
          {
            id: 4,
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
              since: '2018-08-03T14:57:11.46112528Z',
              kind: '',
              version: '',
              life: ''
            }
          },
          {
            id: 1,
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
              since: '2018-08-03T14:57:11.458360562Z',
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
              since: '2018-08-03T14:57:11.463649892Z',
              kind: '',
              version: '',
              life: ''
            }
          }
        ],
        remoteApplications: {},
        uuid: 'e1e81a64-3385-4779-8643-05e3d5ed4523',
        info: {
          name: 'canonical-kubernetes',
          type: '',
          uuid: 'e1e81a64-3385-4779-8643-05e3d5ed4523',
          controllerUuid: 'a030379a-940f-4760-8fcf-3062b41a04e7',
          providerType: 'gce',
          defaultSeries: 'xenial',
          cloudTag: 'cloud-google',
          cloudRegion: 'us-central1',
          cloudCredentialTag: 'cloudcred-google_spaceman@external_clean-algebra-206308',
          ownerTag: 'user-spaceman@external',
          life: 'alive',
          status: {
            status: 'available',
            info: '',
            data: {},
            since: '2019-09-20T13:17:37.448Z'
          },
          users: [
            {
              user: 'activedev@external',
              displayName: '',
              lastConnection: '2019-10-28T21:59:45Z',
              access: 'read'
            }
          ],
          machines: [
            {
              id: '0',
              status: 'error'
            },
            {
              id: '1',
              status: 'error'
            },
            {
              id: '2',
              status: 'error'
            },
            {
              id: '3',
              status: 'error'
            },
            {
              id: '4',
              status: 'error'
            },
            {
              id: '5',
              status: 'error'
            },
            {
              id: '6',
              status: 'error'
            },
            {
              id: '7',
              status: 'error'
            },
            {
              id: '8',
              status: 'error'
            },
            {
              id: '9',
              status: 'error'
            },
            {
              id: '0',
              status: 'error'
            },
            {
              id: '1',
              status: 'error'
            },
            {
              id: '2',
              status: 'error'
            },
            {
              id: '3',
              status: 'error'
            },
            {
              id: '4',
              status: 'error'
            },
            {
              id: '5',
              status: 'error'
            },
            {
              id: '6',
              status: 'error'
            },
            {
              id: '7',
              status: 'error'
            },
            {
              id: '8',
              status: 'error'
            },
            {
              id: '9',
              status: 'error'
            }
          ],
          agentVersion: '2.3.8'
        }
      },
      '84e872ff-9171-46be-829b-70f0f09cb18d': {
        applications: {
          easyrsa: {
            charm: 'cs:~containers/easyrsa-278',
            series: 'bionic',
            exposed: false,
            life: '',
            relations: {},
            canUpgradeTo: '',
            subordinateTo: [],
            units: {
              'easyrsa/0': {
                agentStatus: {
                  status: 'idle',
                  info: '',
                  data: {},
                  since: '2019-11-14T16:38:42.074180277Z',
                  kind: '',
                  version: '2.6.10',
                  life: ''
                },
                workloadStatus: {
                  status: 'active',
                  info: 'Certificate Authority ready.',
                  data: {},
                  since: '2019-11-14T16:38:37.241246008Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadVersion: '3.0.1',
                machine: '1',
                openedPorts: [],
                publicAddress: '35.229.83.62',
                charm: '',
                subordinates: {},
                leader: true
              }
            },
            meterStatuses: {},
            status: {
              status: 'active',
              info: 'Certificate Authority ready.',
              data: {},
              since: '2019-11-14T16:38:37.241246008Z',
              kind: '',
              version: '',
              life: ''
            },
            workloadVersion: '3.0.1',
            charmVerion: '7af705f',
            endpointBindings: {
              client: ''
            },
            publicAddress: ''
          },
          nrpe: {
            charm: 'cs:nrpe-60',
            series: 'bionic',
            exposed: false,
            life: '',
            relations: {
              'general-info': [
                'ubuntu'
              ]
            },
            canUpgradeTo: '',
            subordinateTo: [
              'ubuntu'
            ],
            units: {},
            meterStatuses: {},
            status: {
              status: 'active',
              info: 'ready',
              data: {},
              since: '2019-11-13T17:04:53.389764415Z',
              kind: '',
              version: '',
              life: ''
            },
            workloadVersion: '',
            charmVerion: 'cs-nrpe-charmers-nrpe-27-62-g8cecde4',
            endpointBindings: {
              'general-info': '',
              'local-monitors': '',
              monitors: '',
              nrpe: '',
              'nrpe-external-master': ''
            },
            publicAddress: ''
          },
          telegraf: {
            charm: 'cs:telegraf-29',
            series: 'bionic',
            exposed: false,
            life: '',
            relations: {
              'juju-info': [
                'ubuntu'
              ]
            },
            canUpgradeTo: '',
            subordinateTo: [
              'ubuntu'
            ],
            units: {},
            meterStatuses: {},
            status: {
              status: 'active',
              info: 'Monitoring ubuntu/0',
              data: {},
              since: '2019-11-12T23:56:43.76306511Z',
              kind: '',
              version: '',
              life: ''
            },
            workloadVersion: '',
            charmVerion: 'e58f7f4',
            endpointBindings: {
              amqp: '',
              apache: '',
              elasticsearch: '',
              exec: '',
              haproxy: '',
              'influxdb-api': '',
              'juju-info': '',
              memcached: '',
              mongodb: '',
              mysql: '',
              postgresql: '',
              'prometheus-client': '',
              'prometheus-rules': '',
              redis: '',
              sentry: ''
            },
            publicAddress: ''
          },
          ubuntu: {
            charm: 'cs:ubuntu-12',
            series: 'bionic',
            exposed: false,
            life: '',
            relations: {
              'juju-info': [
                'nrpe',
                'telegraf'
              ]
            },
            canUpgradeTo: '',
            subordinateTo: [],
            units: {
              'ubuntu/0': {
                agentStatus: {
                  status: 'idle',
                  info: '',
                  data: {},
                  since: '2019-11-12T23:55:51.517470008Z',
                  kind: '',
                  version: '2.6.10',
                  life: ''
                },
                workloadStatus: {
                  status: 'active',
                  info: 'ready',
                  data: {},
                  since: '2019-11-12T23:55:50.148650881Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadVersion: '18.04',
                machine: '0',
                openedPorts: [],
                publicAddress: '35.243.128.238',
                charm: '',
                subordinates: {
                  'nrpe/0': {
                    'agent-status': {
                      status: 'idle',
                      info: '',
                      data: {},
                      since: '2019-11-13T17:04:53.452289758Z',
                      kind: '',
                      version: '2.6.10',
                      life: ''
                    },
                    'workload-status': {
                      status: 'active',
                      info: 'ready',
                      data: {},
                      since: '2019-11-13T17:04:53.389764415Z',
                      kind: '',
                      version: '',
                      life: ''
                    },
                    'workload-version': '',
                    machine: '',
                    'opened-ports': [
                      'icmp',
                      '5666/tcp'
                    ],
                    'public-address': '35.243.128.238',
                    charm: 'cs:nrpe-60',
                    subordinates: null,
                    leader: true
                  },
                  'telegraf/0': {
                    'agent-status': {
                      status: 'idle',
                      info: '',
                      data: {},
                      since: '2019-11-12T23:56:52.679489445Z',
                      kind: '',
                      version: '2.6.10',
                      life: ''
                    },
                    'workload-status': {
                      status: 'active',
                      info: 'Monitoring ubuntu/0',
                      data: {},
                      since: '2019-11-12T23:56:43.76306511Z',
                      kind: '',
                      version: '',
                      life: ''
                    },
                    'workload-version': '',
                    machine: '',
                    'opened-ports': [
                      '9103/tcp'
                    ],
                    'public-address': '35.243.128.238',
                    charm: 'cs:telegraf-29',
                    subordinates: null,
                    leader: true
                  }
                },
                leader: true
              }
            },
            meterStatuses: {},
            status: {
              status: 'active',
              info: 'ready',
              data: {},
              since: '2019-11-12T23:55:50.148650881Z',
              kind: '',
              version: '',
              life: ''
            },
            workloadVersion: '18.04',
            charmVerion: '',
            endpointBindings: {},
            publicAddress: ''
          }
        },
        machines: {
          '0': {
            agentStatus: {
              status: 'started',
              info: '',
              data: {},
              since: '2019-11-12T23:54:50.340907719Z',
              kind: '',
              version: '2.6.10',
              life: ''
            },
            instanceStatus: {
              status: 'running',
              info: 'RUNNING',
              data: {},
              since: '2019-11-12T23:52:50.021261161Z',
              kind: '',
              version: '',
              life: ''
            },
            dnsName: '35.243.128.238',
            ipAddresses: [
              '35.243.128.238',
              '10.142.0.17',
              '252.1.16.1'
            ],
            instanceId: 'juju-9cb18d-0',
            series: 'bionic',
            id: '0',
            networkInterfaces: {
              ens4: {
                ipAddresses: [
                  '10.142.0.17'
                ],
                macAddress: '42:01:0a:8e:00:11',
                gateway: '10.142.0.1',
                dnsNameservers: [],
                isUp: true
              },
              'fan-252': {
                ipAddresses: [
                  '252.1.16.1'
                ],
                macAddress: 'a2:a2:53:31:db:9a',
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
          '1': {
            agentStatus: {
              status: 'started',
              info: '',
              data: {},
              since: '2019-11-14T16:37:22.404294662Z',
              kind: '',
              version: '2.6.10',
              life: ''
            },
            instanceStatus: {
              status: 'running',
              info: 'RUNNING',
              data: {},
              since: '2019-11-14T16:36:04.680894233Z',
              kind: '',
              version: '',
              life: ''
            },
            dnsName: '35.229.83.62',
            ipAddresses: [
              '35.229.83.62',
              '10.142.0.18',
              '252.1.32.1'
            ],
            instanceId: 'juju-9cb18d-1',
            series: 'bionic',
            id: '1',
            networkInterfaces: {
              ens4: {
                ipAddresses: [
                  '10.142.0.18'
                ],
                macAddress: '42:01:0a:8e:00:12',
                gateway: '10.142.0.1',
                dnsNameservers: [],
                isUp: true
              },
              'fan-252': {
                ipAddresses: [
                  '252.1.32.1'
                ],
                macAddress: 'ea:17:cc:17:52:fa',
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
          }
        },
        model: {
          name: 'sub-test',
          type: 'iaas',
          cloudTag: 'cloud-google',
          region: 'us-east1',
          version: '2.6.10',
          availableVersion: '',
          modelStatus: {
            status: 'available',
            info: '',
            data: {},
            since: '2019-11-12T23:49:17.148832532Z',
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
        offers: {},
        relations: [
          {
            id: 0,
            key: 'telegraf:juju-info ubuntu:juju-info',
            'interface': 'juju-info',
            scope: 'container',
            endpoints: [
              {
                application: 'ubuntu',
                name: 'juju-info',
                role: 'provider',
                subordinate: false
              },
              {
                application: 'telegraf',
                name: 'juju-info',
                role: 'requirer',
                subordinate: true
              }
            ],
            status: {
              status: 'joined',
              info: '',
              data: {},
              since: '2019-11-12T23:55:51.497768434Z',
              kind: '',
              version: '',
              life: ''
            }
          },
          {
            id: 1,
            key: 'nrpe:general-info ubuntu:juju-info',
            'interface': 'juju-info',
            scope: 'container',
            endpoints: [
              {
                application: 'nrpe',
                name: 'general-info',
                role: 'requirer',
                subordinate: true
              },
              {
                application: 'ubuntu',
                name: 'juju-info',
                role: 'provider',
                subordinate: false
              }
            ],
            status: {
              status: 'joined',
              info: '',
              data: {},
              since: '2019-11-13T17:03:48.611651175Z',
              kind: '',
              version: '',
              life: ''
            }
          }
        ],
        remoteApplications: {},
        uuid: '84e872ff-9171-46be-829b-70f0f09cb18d',
        info: {
          name: 'sub-test',
          type: 'iaas',
          uuid: '84e872ff-9171-46be-829b-70f0f09cb18d',
          controllerUuid: 'a030379a-940f-4760-8fcf-3062b41a04e7',
          providerType: 'gce',
          defaultSeries: 'bionic',
          cloudTag: 'cloud-google',
          cloudRegion: 'us-east1',
          cloudCredentialTag: 'cloudcred-google_activedev@external_juju',
          ownerTag: 'user-activedev@external',
          life: 'alive',
          status: {
            status: 'available',
            info: '',
            data: {},
            since: '2019-11-12T23:49:17.148Z'
          },
          users: [
            {
              user: 'user-activedev@external',
              displayName: 'activedev',
              lastConnection: '2019-11-15T18:31:36Z',
              access: 'admin'
            },
            {
              user: 'design-it@external',
              displayName: '',
              lastConnection: '2019-11-15T17:19:35Z',
              access: 'read'
            },
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
              instanceId: 'juju-9cb18d-0',
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
              instanceId: 'juju-9cb18d-1',
              status: 'started'
            }
          ],
          agentVersion: '2.6.10'
        }
      },
      '2f995dee-392e-4459-8eb9-839c501590af': {
        applications: {
          client: {
            charm: 'cs:hadoop-client-12',
            series: 'xenial',
            exposed: false,
            life: '',
            relations: {
              hadoop: [
                'plugin'
              ]
            },
            canUpgradeTo: '',
            subordinateTo: [],
            units: {
              'client/0': {
                agentStatus: {
                  status: 'allocating',
                  info: '',
                  data: {},
                  since: '2019-05-02T08:50:01.599306854Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadStatus: {
                  status: 'waiting',
                  info: 'waiting for machine',
                  data: {},
                  since: '2019-05-02T08:50:01.599306854Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadVersion: '',
                machine: '3',
                openedPorts: [],
                publicAddress: '',
                charm: '',
                subordinates: {}
              }
            },
            meterStatuses: {},
            status: {
              status: 'waiting',
              info: 'waiting for machine',
              data: {},
              since: '2019-05-02T08:50:01.599306854Z',
              kind: '',
              version: '',
              life: ''
            },
            workloadVersion: '',
            charmVerion: '',
            endpointBindings: {
              giraph: '',
              hadoop: '',
              java: '',
              mahout: ''
            },
            publicAddress: ''
          },
          failtester: {
            charm: 'cs:~activedev/precise/failtester-7',
            series: 'precise',
            exposed: false,
            life: '',
            relations: {
              loopback: [
                'failtester'
              ]
            },
            canUpgradeTo: '',
            subordinateTo: [],
            units: {
              'failtester/0': {
                agentStatus: {
                  status: 'allocating',
                  info: '',
                  data: {},
                  since: '2019-05-08T15:44:26.445558131Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadStatus: {
                  status: 'waiting',
                  info: 'waiting for machine',
                  data: {},
                  since: '2019-05-08T15:44:26.445558131Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadVersion: '',
                machine: '5',
                openedPorts: [],
                publicAddress: '',
                charm: '',
                subordinates: {}
              }
            },
            meterStatuses: {},
            status: {
              status: 'waiting',
              info: 'waiting for machine',
              data: {},
              since: '2019-05-08T15:44:26.445558131Z',
              kind: '',
              version: '',
              life: ''
            },
            workloadVersion: '',
            charmVerion: '',
            endpointBindings: {
              loopback: '',
              'prov-reltest': '',
              'req-reltest': ''
            },
            publicAddress: ''
          },
          ganglia: {
            charm: 'cs:ganglia-12',
            series: 'xenial',
            exposed: false,
            life: '',
            relations: {
              node: [
                'ganglia-node'
              ]
            },
            canUpgradeTo: '',
            subordinateTo: [],
            units: {
              'ganglia/0': {
                agentStatus: {
                  status: 'allocating',
                  info: '',
                  data: {},
                  since: '2019-05-02T08:50:01.583101402Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadStatus: {
                  status: 'waiting',
                  info: 'waiting for machine',
                  data: {},
                  since: '2019-05-02T08:50:01.583101402Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadVersion: '',
                machine: '3',
                openedPorts: [],
                publicAddress: '',
                charm: '',
                subordinates: {}
              }
            },
            meterStatuses: {},
            status: {
              status: 'waiting',
              info: 'waiting for machine',
              data: {},
              since: '2019-05-02T08:50:01.583101402Z',
              kind: '',
              version: '',
              life: ''
            },
            workloadVersion: '',
            charmVerion: '',
            endpointBindings: {
              'ganglia-node': '',
              head: '',
              master: '',
              node: '',
              website: ''
            },
            publicAddress: ''
          },
          'ganglia-node': {
            charm: 'cs:ganglia-node-7',
            series: 'xenial',
            exposed: false,
            life: '',
            relations: {
              'juju-info': [
                'namenode',
                'resourcemanager',
                'slave'
              ],
              node: [
                'ganglia'
              ]
            },
            canUpgradeTo: '',
            subordinateTo: [
              'namenode',
              'resourcemanager',
              'slave'
            ],
            units: {},
            meterStatuses: {},
            status: {
              status: 'active',
              info: 'Unit is ready',
              data: {},
              since: '2019-05-02T08:53:08.746921025Z',
              kind: '',
              version: '',
              life: ''
            },
            workloadVersion: '3.6.0',
            charmVerion: '',
            endpointBindings: {
              'juju-info': '',
              node: ''
            },
            publicAddress: ''
          },
          namenode: {
            charm: 'cs:hadoop-namenode-46',
            series: 'xenial',
            exposed: false,
            life: '',
            relations: {
              datanode: [
                'slave'
              ],
              'juju-info': [
                'ganglia-node',
                'rsyslog-forwarder-ha'
              ],
              namenode: [
                'plugin',
                'resourcemanager'
              ]
            },
            canUpgradeTo: '',
            subordinateTo: [],
            units: {
              'namenode/0': {
                agentStatus: {
                  status: 'allocating',
                  info: '',
                  data: {},
                  since: '2019-05-02T08:50:02.392134936Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadStatus: {
                  status: 'waiting',
                  info: 'waiting for machine',
                  data: {},
                  since: '2019-05-02T08:50:02.392134936Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadVersion: '',
                machine: '2',
                openedPorts: [],
                publicAddress: '',
                charm: '',
                subordinates: {}
              }
            },
            meterStatuses: {},
            status: {
              status: 'waiting',
              info: 'waiting for machine',
              data: {},
              since: '2019-05-02T08:50:02.392134936Z',
              kind: '',
              version: '',
              life: ''
            },
            workloadVersion: '',
            charmVerion: '',
            endpointBindings: {
              benchmark: '',
              datanode: '',
              java: '',
              namenode: ''
            },
            publicAddress: ''
          },
          plugin: {
            charm: 'cs:hadoop-plugin-46',
            series: 'xenial',
            exposed: false,
            life: '',
            relations: {
              'hadoop-plugin': [
                'client',
                'spark'
              ],
              namenode: [
                'namenode'
              ],
              resourcemanager: [
                'resourcemanager'
              ]
            },
            canUpgradeTo: '',
            subordinateTo: [
              'client',
              'spark'
            ],
            units: {},
            meterStatuses: {},
            status: {
              status: 'waiting',
              info: 'waiting for machine',
              data: {},
              since: '2019-05-02T08:50:01.593105388Z',
              kind: '',
              version: '',
              life: ''
            },
            workloadVersion: '',
            charmVerion: '',
            endpointBindings: {
              'hadoop-plugin': '',
              namenode: '',
              resourcemanager: ''
            },
            publicAddress: ''
          },
          resourcemanager: {
            charm: 'cs:hadoop-resourcemanager-48',
            series: 'xenial',
            exposed: false,
            life: '',
            relations: {
              'juju-info': [
                'ganglia-node',
                'rsyslog-forwarder-ha'
              ],
              namenode: [
                'namenode'
              ],
              nodemanager: [
                'slave'
              ],
              resourcemanager: [
                'plugin'
              ]
            },
            canUpgradeTo: '',
            subordinateTo: [],
            units: {
              'resourcemanager/0': {
                agentStatus: {
                  status: 'allocating',
                  info: '',
                  data: {},
                  since: '2019-05-02T08:50:02.39307821Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadStatus: {
                  status: 'waiting',
                  info: 'waiting for machine',
                  data: {},
                  since: '2019-05-02T08:50:02.39307821Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadVersion: '',
                machine: '2',
                openedPorts: [],
                publicAddress: '',
                charm: '',
                subordinates: {}
              }
            },
            meterStatuses: {},
            status: {
              status: 'waiting',
              info: 'waiting for machine',
              data: {},
              since: '2019-05-02T08:50:02.39307821Z',
              kind: '',
              version: '',
              life: ''
            },
            workloadVersion: '',
            charmVerion: '',
            endpointBindings: {
              benchmark: '',
              java: '',
              namenode: '',
              nodemanager: '',
              resourcemanager: ''
            },
            publicAddress: ''
          },
          rsyslog: {
            charm: 'cs:~bigdata-dev/xenial/rsyslog-7',
            series: 'xenial',
            exposed: false,
            life: '',
            relations: {
              aggregator: [
                'rsyslog-forwarder-ha'
              ]
            },
            canUpgradeTo: '',
            subordinateTo: [],
            units: {
              'rsyslog/0': {
                agentStatus: {
                  status: 'allocating',
                  info: '',
                  data: {},
                  since: '2019-05-02T08:50:01.601456311Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadStatus: {
                  status: 'waiting',
                  info: 'waiting for machine',
                  data: {},
                  since: '2019-05-02T08:50:01.601456311Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadVersion: '',
                machine: '3',
                openedPorts: [],
                publicAddress: '',
                charm: '',
                subordinates: {}
              }
            },
            meterStatuses: {},
            status: {
              status: 'waiting',
              info: 'waiting for machine',
              data: {},
              since: '2019-05-02T08:50:01.601456311Z',
              kind: '',
              version: '',
              life: ''
            },
            workloadVersion: '',
            charmVerion: '',
            endpointBindings: {
              aggregator: '',
              'nrpe-external-master': ''
            },
            publicAddress: ''
          },
          'rsyslog-forwarder-ha': {
            charm: 'cs:~bigdata-dev/xenial/rsyslog-forwarder-ha-7',
            series: 'xenial',
            exposed: false,
            life: '',
            relations: {
              'juju-info': [
                'namenode',
                'resourcemanager',
                'slave'
              ],
              syslog: [
                'rsyslog'
              ]
            },
            canUpgradeTo: '',
            subordinateTo: [
              'namenode',
              'resourcemanager',
              'slave'
            ],
            units: {},
            meterStatuses: {},
            status: {
              status: 'unknown',
              info: '',
              data: {},
              since: '2019-05-02T08:53:07.06261572Z',
              kind: '',
              version: '',
              life: ''
            },
            workloadVersion: '',
            charmVerion: '',
            endpointBindings: {
              'juju-info': '',
              'nrpe-external-master': '',
              syslog: ''
            },
            publicAddress: ''
          },
          slave: {
            charm: 'cs:hadoop-slave-47',
            series: 'xenial',
            exposed: false,
            life: '',
            relations: {
              'juju-info': [
                'ganglia-node',
                'rsyslog-forwarder-ha'
              ],
              namenode: [
                'namenode'
              ],
              resourcemanager: [
                'resourcemanager'
              ]
            },
            canUpgradeTo: '',
            subordinateTo: [],
            units: {
              'slave/0': {
                agentStatus: {
                  status: 'allocating',
                  info: '',
                  data: {},
                  since: '2019-05-02T08:50:02.390200529Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadStatus: {
                  status: 'waiting',
                  info: 'waiting for machine',
                  data: {},
                  since: '2019-05-02T08:50:02.390200529Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadVersion: '',
                machine: '1',
                openedPorts: [],
                publicAddress: '',
                charm: '',
                subordinates: {}
              },
              'slave/1': {
                agentStatus: {
                  status: 'lost',
                  info: 'agent is not communicating with the server',
                  data: {},
                  since: '2019-05-08T15:39:34.383035573Z',
                  kind: '',
                  version: '2.5.4',
                  life: ''
                },
                workloadStatus: {
                  status: 'unknown',
                  info: 'agent lost, see \'juju show-status-log slave/1\'',
                  data: {},
                  since: '2019-05-02T08:52:34.762304661Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadVersion: '',
                machine: '0',
                openedPorts: [],
                publicAddress: '35.227.34.90',
                charm: '',
                subordinates: {
                  'ganglia-node/0': {
                    'agent-status': {
                      status: 'lost',
                      info: 'agent is not communicating with the server',
                      data: {},
                      since: '2019-05-08T07:20:27.51064297Z',
                      kind: '',
                      version: '2.5.4',
                      life: ''
                    },
                    'workload-status': {
                      status: 'unknown',
                      info: 'agent lost, see \'juju show-status-log ganglia-node/0\'',
                      data: {},
                      since: '2019-05-02T08:53:08.746921025Z',
                      kind: '',
                      version: '',
                      life: ''
                    },
                    'workload-version': '3.6.0',
                    machine: '',
                    'opened-ports': null,
                    'public-address': '35.227.34.90',
                    charm: 'cs:ganglia-node-7',
                    subordinates: null
                  },
                  'rsyslog-forwarder-ha/0': {
                    'agent-status': {
                      status: 'lost',
                      info: 'agent is not communicating with the server',
                      data: {},
                      since: '2019-05-08T12:01:30.430496581Z',
                      kind: '',
                      version: '2.5.4',
                      life: ''
                    },
                    'workload-status': {
                      status: 'unknown',
                      info: 'agent lost, see \'juju show-status-log rsyslog-forwarder-ha/0\'',
                      data: {},
                      since: '2019-05-02T08:53:07.06261572Z',
                      kind: '',
                      version: '',
                      life: ''
                    },
                    'workload-version': '',
                    machine: '',
                    'opened-ports': null,
                    'public-address': '35.227.34.90',
                    charm: 'cs:~bigdata-dev/xenial/rsyslog-forwarder-ha-7',
                    subordinates: null
                  }
                }
              },
              'slave/2': {
                agentStatus: {
                  status: 'allocating',
                  info: '',
                  data: {},
                  since: '2019-05-02T08:50:02.395968975Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadStatus: {
                  status: 'waiting',
                  info: 'waiting for machine',
                  data: {},
                  since: '2019-05-02T08:50:02.395968975Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadVersion: '',
                machine: '4',
                openedPorts: [],
                publicAddress: '',
                charm: '',
                subordinates: {}
              }
            },
            meterStatuses: {},
            status: {
              status: 'blocked',
              info: 'missing required namenode and/or resourcemanager relation',
              data: {},
              since: '2019-05-02T08:52:34.762304661Z',
              kind: '',
              version: '',
              life: ''
            },
            workloadVersion: '',
            charmVerion: '',
            endpointBindings: {
              java: '',
              namenode: '',
              resourcemanager: ''
            },
            publicAddress: ''
          },
          spark: {
            charm: 'cs:spark-71',
            series: 'xenial',
            exposed: false,
            life: '',
            relations: {
              hadoop: [
                'plugin'
              ],
              sparkpeers: [
                'spark'
              ]
            },
            canUpgradeTo: '',
            subordinateTo: [],
            units: {
              'spark/0': {
                agentStatus: {
                  status: 'allocating',
                  info: '',
                  data: {},
                  since: '2019-05-02T08:50:02.39323708Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadStatus: {
                  status: 'waiting',
                  info: 'waiting for machine',
                  data: {},
                  since: '2019-05-02T08:50:02.39323708Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadVersion: '',
                machine: '3',
                openedPorts: [],
                publicAddress: '',
                charm: '',
                subordinates: {}
              }
            },
            meterStatuses: {},
            status: {
              status: 'waiting',
              info: 'waiting for machine',
              data: {},
              since: '2019-05-02T08:50:02.39323708Z',
              kind: '',
              version: '',
              life: ''
            },
            workloadVersion: '',
            charmVerion: '',
            endpointBindings: {
              benchmark: '',
              client: '',
              giraph: '',
              hadoop: '',
              java: '',
              mahout: '',
              sparkpeers: '',
              zookeeper: ''
            },
            publicAddress: ''
          }
        },
        machines: {
          '0': {
            agentStatus: {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2019-05-02T08:50:56.362225285Z',
              kind: '',
              version: '2.5.4',
              life: ''
            },
            instanceStatus: {
              status: 'running',
              info: 'RUNNING',
              data: {},
              since: '2019-05-02T08:50:27.2171969Z',
              kind: '',
              version: '',
              life: ''
            },
            dnsName: '35.227.34.90',
            ipAddresses: [
              '35.227.34.90',
              '10.142.0.2',
              '252.0.32.1'
            ],
            instanceId: 'juju-1590af-0',
            series: 'xenial',
            id: '0',
            networkInterfaces: {
              ens4: {
                ipAddresses: [
                  '10.142.0.2'
                ],
                macAddress: '42:01:0a:8e:00:02',
                gateway: '10.142.0.1',
                dnsNameservers: [],
                isUp: true
              },
              'fan-252': {
                ipAddresses: [
                  '252.0.32.1'
                ],
                macAddress: '3e:fe:b7:1a:1b:d4',
                dnsNameservers: [],
                isUp: true
              }
            },
            containers: {},
            constraints: 'mem=7168M root-disk=32768M',
            hardware: 'arch=amd64 cores=8 cpu-power=2200 mem=7200M root-disk=32768M availability-zone=us-east1-b',
            jobs: [
              'JobHostUnits'
            ],
            hasVote: false,
            wantsVote: false,
            lxdProfiles: {}
          },
          '1': {
            agentStatus: {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2019-05-02T09:07:20.615748104Z',
              kind: '',
              version: '',
              life: ''
            },
            instanceStatus: {
              status: 'provisioning error',
              info: 'googleapi: Error 403: Quota \'CPUS\' exceeded. Limit: 8.0 in region us-east1., quotaExceeded',
              data: {},
              since: '2019-05-02T09:07:20.615748104Z',
              kind: '',
              version: '',
              life: ''
            },
            dnsName: '',
            ipAddresses: [],
            instanceId: 'pending',
            series: 'xenial',
            id: '1',
            networkInterfaces: {},
            containers: {},
            constraints: 'mem=7168M root-disk=32768M',
            hardware: '',
            jobs: [
              'JobHostUnits'
            ],
            hasVote: false,
            wantsVote: false,
            lxdProfiles: {}
          },
          '2': {
            agentStatus: {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2019-05-02T09:07:19.184158233Z',
              kind: '',
              version: '',
              life: ''
            },
            instanceStatus: {
              status: 'provisioning error',
              info: 'googleapi: Error 403: Quota \'CPUS\' exceeded. Limit: 8.0 in region us-east1., quotaExceeded',
              data: {},
              since: '2019-05-02T09:07:19.184158233Z',
              kind: '',
              version: '',
              life: ''
            },
            dnsName: '',
            ipAddresses: [],
            instanceId: 'pending',
            series: 'xenial',
            id: '2',
            networkInterfaces: {},
            containers: {},
            constraints: 'mem=7168M root-disk=32768M',
            hardware: '',
            jobs: [
              'JobHostUnits'
            ],
            hasVote: false,
            wantsVote: false,
            lxdProfiles: {}
          },
          '3': {
            agentStatus: {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2019-05-02T09:01:44.062675291Z',
              kind: '',
              version: '',
              life: ''
            },
            instanceStatus: {
              status: 'provisioning error',
              info: 'googleapi: Error 403: Quota \'CPUS\' exceeded. Limit: 8.0 in region us-east1., quotaExceeded',
              data: {},
              since: '2019-05-02T09:01:44.062675291Z',
              kind: '',
              version: '',
              life: ''
            },
            dnsName: '',
            ipAddresses: [],
            instanceId: 'pending',
            series: 'xenial',
            id: '3',
            networkInterfaces: {},
            containers: {},
            constraints: 'mem=7168M root-disk=32768M',
            hardware: '',
            jobs: [
              'JobHostUnits'
            ],
            hasVote: false,
            wantsVote: false,
            lxdProfiles: {}
          },
          '4': {
            agentStatus: {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2019-05-02T08:55:59.390097467Z',
              kind: '',
              version: '',
              life: ''
            },
            instanceStatus: {
              status: 'provisioning error',
              info: 'googleapi: Error 403: Quota \'CPUS\' exceeded. Limit: 8.0 in region us-east1., quotaExceeded',
              data: {},
              since: '2019-05-02T08:55:59.390097467Z',
              kind: '',
              version: '',
              life: ''
            },
            dnsName: '',
            ipAddresses: [],
            instanceId: 'pending',
            series: 'xenial',
            id: '4',
            networkInterfaces: {},
            containers: {},
            constraints: 'mem=7168M root-disk=32768M',
            hardware: '',
            jobs: [
              'JobHostUnits'
            ],
            hasVote: false,
            wantsVote: false,
            lxdProfiles: {}
          },
          '5': {
            agentStatus: {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2019-05-08T15:44:30.519386476Z',
              kind: '',
              version: '',
              life: ''
            },
            instanceStatus: {
              status: 'provisioning error',
              info: 'no matching agent binaries available',
              data: {},
              since: '2019-05-08T15:44:30.519386476Z',
              kind: '',
              version: '',
              life: ''
            },
            dnsName: '',
            ipAddresses: [],
            instanceId: 'pending',
            series: 'precise',
            id: '5',
            networkInterfaces: {},
            containers: {},
            constraints: '',
            hardware: '',
            jobs: [
              'JobHostUnits'
            ],
            hasVote: false,
            wantsVote: false,
            lxdProfiles: {}
          }
        },
        model: {
          name: 'hadoopspark',
          type: 'iaas',
          cloudTag: 'cloud-google',
          region: 'us-east1',
          version: '2.5.4',
          availableVersion: '',
          modelStatus: {
            status: 'available',
            info: '',
            data: {},
            since: '2019-09-05T21:19:11.133167137Z',
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
        offers: {},
        relations: [
          {
            id: 0,
            key: 'ganglia:node ganglia-node:node',
            'interface': 'monitor',
            scope: 'global',
            endpoints: [
              {
                application: 'ganglia',
                name: 'node',
                role: 'requirer',
                subordinate: false
              },
              {
                application: 'ganglia-node',
                name: 'node',
                role: 'provider',
                subordinate: false
              }
            ],
            status: {
              status: 'joined',
              info: '',
              data: {},
              since: '2019-05-02T08:53:06.819333783Z',
              kind: '',
              version: '',
              life: ''
            }
          },
          {
            id: 4,
            key: 'ganglia-node:juju-info slave:juju-info',
            'interface': 'juju-info',
            scope: 'container',
            endpoints: [
              {
                application: 'ganglia-node',
                name: 'juju-info',
                role: 'requirer',
                subordinate: true
              },
              {
                application: 'slave',
                name: 'juju-info',
                role: 'provider',
                subordinate: false
              }
            ],
            status: {
              status: 'joined',
              info: '',
              data: {},
              since: '2019-05-02T08:52:44.126628043Z',
              kind: '',
              version: '',
              life: ''
            }
          },
          {
            id: 6,
            key: 'ganglia-node:juju-info resourcemanager:juju-info',
            'interface': 'juju-info',
            scope: 'container',
            endpoints: [
              {
                application: 'ganglia-node',
                name: 'juju-info',
                role: 'requirer',
                subordinate: true
              },
              {
                application: 'resourcemanager',
                name: 'juju-info',
                role: 'provider',
                subordinate: false
              }
            ],
            status: {
              status: 'joining',
              info: '',
              data: {},
              since: '2019-05-02T08:50:02.379312422Z',
              kind: '',
              version: '',
              life: ''
            }
          },
          {
            id: 7,
            key: 'ganglia-node:juju-info namenode:juju-info',
            'interface': 'juju-info',
            scope: 'container',
            endpoints: [
              {
                application: 'ganglia-node',
                name: 'juju-info',
                role: 'requirer',
                subordinate: true
              },
              {
                application: 'namenode',
                name: 'juju-info',
                role: 'provider',
                subordinate: false
              }
            ],
            status: {
              status: 'joining',
              info: '',
              data: {},
              since: '2019-05-02T08:50:02.380316525Z',
              kind: '',
              version: '',
              life: ''
            }
          },
          {
            id: 1,
            key: 'rsyslog-forwarder-ha:syslog rsyslog:aggregator',
            'interface': 'syslog',
            scope: 'global',
            endpoints: [
              {
                application: 'rsyslog',
                name: 'aggregator',
                role: 'provider',
                subordinate: false
              },
              {
                application: 'rsyslog-forwarder-ha',
                name: 'syslog',
                role: 'requirer',
                subordinate: false
              }
            ],
            status: {
              status: 'joined',
              info: '',
              data: {},
              since: '2019-05-02T08:53:07.248161253Z',
              kind: '',
              version: '',
              life: ''
            }
          },
          {
            id: 5,
            key: 'rsyslog-forwarder-ha:juju-info namenode:juju-info',
            'interface': 'juju-info',
            scope: 'container',
            endpoints: [
              {
                application: 'rsyslog-forwarder-ha',
                name: 'juju-info',
                role: 'requirer',
                subordinate: true
              },
              {
                application: 'namenode',
                name: 'juju-info',
                role: 'provider',
                subordinate: false
              }
            ],
            status: {
              status: 'joining',
              info: '',
              data: {},
              since: '2019-05-02T08:50:02.379355858Z',
              kind: '',
              version: '',
              life: ''
            }
          },
          {
            id: 9,
            key: 'plugin:namenode namenode:namenode',
            'interface': 'dfs',
            scope: 'global',
            endpoints: [
              {
                application: 'plugin',
                name: 'namenode',
                role: 'requirer',
                subordinate: false
              },
              {
                application: 'namenode',
                name: 'namenode',
                role: 'provider',
                subordinate: false
              }
            ],
            status: {
              status: 'joining',
              info: '',
              data: {},
              since: '2019-05-02T08:50:02.388244188Z',
              kind: '',
              version: '',
              life: ''
            }
          },
          {
            id: 11,
            key: 'namenode:datanode slave:namenode',
            'interface': 'dfs-slave',
            scope: 'global',
            endpoints: [
              {
                application: 'namenode',
                name: 'datanode',
                role: 'requirer',
                subordinate: false
              },
              {
                application: 'slave',
                name: 'namenode',
                role: 'provider',
                subordinate: false
              }
            ],
            status: {
              status: 'joined',
              info: '',
              data: {},
              since: '2019-05-02T08:52:44.218874119Z',
              kind: '',
              version: '',
              life: ''
            }
          },
          {
            id: 13,
            key: 'resourcemanager:namenode namenode:namenode',
            'interface': 'dfs',
            scope: 'global',
            endpoints: [
              {
                application: 'resourcemanager',
                name: 'namenode',
                role: 'requirer',
                subordinate: false
              },
              {
                application: 'namenode',
                name: 'namenode',
                role: 'provider',
                subordinate: false
              }
            ],
            status: {
              status: 'joining',
              info: '',
              data: {},
              since: '2019-05-02T08:50:02.39351187Z',
              kind: '',
              version: '',
              life: ''
            }
          },
          {
            id: 16,
            key: 'failtester:loopback',
            'interface': 'lbfailtest',
            scope: 'global',
            endpoints: [
              {
                application: 'failtester',
                name: 'loopback',
                role: 'peer',
                subordinate: false
              }
            ],
            status: {
              status: 'joining',
              info: '',
              data: {},
              since: '2019-05-08T15:44:26.049490137Z',
              kind: '',
              version: '',
              life: ''
            }
          },
          {
            id: 2,
            key: 'spark:sparkpeers',
            'interface': 'spark-quorum',
            scope: 'global',
            endpoints: [
              {
                application: 'spark',
                name: 'sparkpeers',
                role: 'peer',
                subordinate: false
              }
            ],
            status: {
              status: 'joining',
              info: '',
              data: {},
              since: '2019-05-02T08:50:01.602772464Z',
              kind: '',
              version: '',
              life: ''
            }
          },
          {
            id: 15,
            key: 'plugin:hadoop-plugin spark:hadoop',
            'interface': 'hadoop-plugin',
            scope: 'container',
            endpoints: [
              {
                application: 'spark',
                name: 'hadoop',
                role: 'provider',
                subordinate: false
              },
              {
                application: 'plugin',
                name: 'hadoop-plugin',
                role: 'requirer',
                subordinate: true
              }
            ],
            status: {
              status: 'joining',
              info: '',
              data: {},
              since: '2019-05-02T08:50:02.407673687Z',
              kind: '',
              version: '',
              life: ''
            }
          },
          {
            id: 3,
            key: 'rsyslog-forwarder-ha:juju-info slave:juju-info',
            'interface': 'juju-info',
            scope: 'container',
            endpoints: [
              {
                application: 'rsyslog-forwarder-ha',
                name: 'juju-info',
                role: 'requirer',
                subordinate: true
              },
              {
                application: 'slave',
                name: 'juju-info',
                role: 'provider',
                subordinate: false
              }
            ],
            status: {
              status: 'joined',
              info: '',
              data: {},
              since: '2019-05-02T08:52:43.970084603Z',
              kind: '',
              version: '',
              life: ''
            }
          },
          {
            id: 12,
            key: 'resourcemanager:nodemanager slave:resourcemanager',
            'interface': 'mapred-slave',
            scope: 'global',
            endpoints: [
              {
                application: 'resourcemanager',
                name: 'nodemanager',
                role: 'requirer',
                subordinate: false
              },
              {
                application: 'slave',
                name: 'resourcemanager',
                role: 'provider',
                subordinate: false
              }
            ],
            status: {
              status: 'joined',
              info: '',
              data: {},
              since: '2019-05-02T08:52:44.316391991Z',
              kind: '',
              version: '',
              life: ''
            }
          },
          {
            id: 8,
            key: 'rsyslog-forwarder-ha:juju-info resourcemanager:juju-info',
            'interface': 'juju-info',
            scope: 'container',
            endpoints: [
              {
                application: 'rsyslog-forwarder-ha',
                name: 'juju-info',
                role: 'requirer',
                subordinate: true
              },
              {
                application: 'resourcemanager',
                name: 'juju-info',
                role: 'provider',
                subordinate: false
              }
            ],
            status: {
              status: 'joining',
              info: '',
              data: {},
              since: '2019-05-02T08:50:02.38224809Z',
              kind: '',
              version: '',
              life: ''
            }
          },
          {
            id: 10,
            key: 'plugin:resourcemanager resourcemanager:resourcemanager',
            'interface': 'mapred',
            scope: 'global',
            endpoints: [
              {
                application: 'plugin',
                name: 'resourcemanager',
                role: 'requirer',
                subordinate: false
              },
              {
                application: 'resourcemanager',
                name: 'resourcemanager',
                role: 'provider',
                subordinate: false
              }
            ],
            status: {
              status: 'joining',
              info: '',
              data: {},
              since: '2019-05-02T08:50:02.389982943Z',
              kind: '',
              version: '',
              life: ''
            }
          },
          {
            id: 14,
            key: 'plugin:hadoop-plugin client:hadoop',
            'interface': 'hadoop-plugin',
            scope: 'container',
            endpoints: [
              {
                application: 'client',
                name: 'hadoop',
                role: 'provider',
                subordinate: false
              },
              {
                application: 'plugin',
                name: 'hadoop-plugin',
                role: 'requirer',
                subordinate: true
              }
            ],
            status: {
              status: 'joining',
              info: '',
              data: {},
              since: '2019-05-02T08:50:02.402579677Z',
              kind: '',
              version: '',
              life: ''
            }
          }
        ],
        remoteApplications: {},
        uuid: '2f995dee-392e-4459-8eb9-839c501590af',
        info: {
          name: 'hadoopspark',
          type: 'iaas',
          uuid: '2f995dee-392e-4459-8eb9-839c501590af',
          controllerUuid: 'a030379a-940f-4760-8fcf-3062b41a04e7',
          providerType: 'gce',
          defaultSeries: 'bionic',
          cloudTag: 'cloud-google',
          cloudRegion: 'us-east1',
          cloudCredentialTag: 'cloudcred-google_spaceman@external_Algebra-json',
          ownerTag: 'user-spaceman@external',
          life: 'alive',
          status: {
            status: 'available',
            info: '',
            data: {},
            since: '2019-09-05T21:19:11.133Z'
          },
          users: [
            {
              user: 'activedev@external',
              displayName: '',
              lastConnection: '2019-10-28T21:59:45Z',
              access: 'read'
            }
          ],
          machines: [
            {
              id: '0',
              hardware: {
                arch: 'amd64',
                mem: 7200,
                rootDisk: 32768,
                cores: 8,
                cpuPower: 2200,
                tags: [],
                availabilityZone: 'us-east1-b'
              },
              instanceId: 'juju-1590af-0',
              status: 'started'
            },
            {
              id: '1',
              status: 'error'
            },
            {
              id: '2',
              status: 'error'
            },
            {
              id: '3',
              status: 'error'
            },
            {
              id: '4',
              status: 'error'
            },
            {
              id: '5',
              status: 'error'
            }
          ],
          agentVersion: '2.5.4'
        }
      },
      '7ffe956a-06ac-4ae9-8aac-04eba4a93da5': {
        applications: {
          easyrsa: {
            charm: 'cs:~containers/easyrsa-50',
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
            canUpgradeTo: 'cs:~containers/easyrsa-278',
            subordinateTo: [],
            units: {
              'easyrsa/0': {
                agentStatus: {
                  status: 'allocating',
                  info: '',
                  data: {},
                  since: '2018-08-09T13:55:22.137703819Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadStatus: {
                  status: 'waiting',
                  info: 'waiting for machine',
                  data: {},
                  since: '2018-08-09T13:55:22.137703819Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadVersion: '',
                machine: '0',
                openedPorts: [],
                publicAddress: '',
                charm: '',
                subordinates: {}
              }
            },
            meterStatuses: {},
            status: {
              status: 'waiting',
              info: 'waiting for machine',
              data: {},
              since: '2018-08-09T13:55:22.137703819Z',
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
          etcd: {
            charm: 'cs:~containers/etcd-96',
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
            canUpgradeTo: 'cs:~containers/etcd-460',
            subordinateTo: [],
            units: {
              'etcd/0': {
                agentStatus: {
                  status: 'allocating',
                  info: '',
                  data: {},
                  since: '2018-08-09T13:55:22.135162949Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadStatus: {
                  status: 'waiting',
                  info: 'waiting for machine',
                  data: {},
                  since: '2018-08-09T13:55:22.135162949Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadVersion: '',
                machine: '2',
                openedPorts: [],
                publicAddress: '',
                charm: '',
                subordinates: {}
              },
              'etcd/1': {
                agentStatus: {
                  status: 'allocating',
                  info: '',
                  data: {},
                  since: '2018-08-09T13:55:22.137396889Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadStatus: {
                  status: 'waiting',
                  info: 'waiting for machine',
                  data: {},
                  since: '2018-08-09T13:55:22.137396889Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadVersion: '',
                machine: '1',
                openedPorts: [],
                publicAddress: '',
                charm: '',
                subordinates: {}
              },
              'etcd/2': {
                agentStatus: {
                  status: 'allocating',
                  info: '',
                  data: {},
                  since: '2018-08-09T13:55:22.139695377Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadStatus: {
                  status: 'waiting',
                  info: 'waiting for machine',
                  data: {},
                  since: '2018-08-09T13:55:22.139695377Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadVersion: '',
                machine: '3',
                openedPorts: [],
                publicAddress: '',
                charm: '',
                subordinates: {}
              }
            },
            meterStatuses: {},
            status: {
              status: 'waiting',
              info: 'waiting for machine',
              data: {},
              since: '2018-08-09T13:55:22.135162949Z',
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
            charm: 'cs:~containers/flannel-66',
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
              since: '2018-08-09T13:55:20.925255384Z',
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
          'kubeapi-load-balancer': {
            charm: 'cs:~containers/kubeapi-load-balancer-69',
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
            canUpgradeTo: 'cs:~containers/kubeapi-load-balancer-682',
            subordinateTo: [],
            units: {
              'kubeapi-load-balancer/0': {
                agentStatus: {
                  status: 'allocating',
                  info: '',
                  data: {},
                  since: '2018-08-09T13:55:20.927448824Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadStatus: {
                  status: 'waiting',
                  info: 'waiting for machine',
                  data: {},
                  since: '2018-08-09T13:55:20.927448824Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadVersion: '',
                machine: '4',
                openedPorts: [],
                publicAddress: '',
                charm: '',
                subordinates: {}
              }
            },
            meterStatuses: {},
            status: {
              status: 'waiting',
              info: 'waiting for machine',
              data: {},
              since: '2018-08-09T13:55:20.927448824Z',
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
            charm: 'cs:~containers/kubernetes-master-122',
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
            canUpgradeTo: 'cs:~containers/kubernetes-master-754',
            subordinateTo: [],
            units: {
              'kubernetes-master/0': {
                agentStatus: {
                  status: 'allocating',
                  info: '',
                  data: {},
                  since: '2018-08-09T13:55:22.136584916Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadStatus: {
                  status: 'waiting',
                  info: 'waiting for machine',
                  data: {},
                  since: '2018-08-09T13:55:22.136584916Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadVersion: '',
                machine: '6',
                openedPorts: [],
                publicAddress: '',
                charm: '',
                subordinates: {}
              },
              'kubernetes-master/1': {
                agentStatus: {
                  status: 'allocating',
                  info: '',
                  data: {},
                  since: '2018-08-09T13:55:22.139816412Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadStatus: {
                  status: 'waiting',
                  info: 'waiting for machine',
                  data: {},
                  since: '2018-08-09T13:55:22.139816412Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadVersion: '',
                machine: '7',
                openedPorts: [],
                publicAddress: '',
                charm: '',
                subordinates: {}
              }
            },
            meterStatuses: {},
            status: {
              status: 'waiting',
              info: 'waiting for machine',
              data: {},
              since: '2018-08-09T13:55:22.136584916Z',
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
              openstack: ''
            },
            publicAddress: ''
          },
          'kubernetes-worker': {
            charm: 'cs:~containers/kubernetes-worker-138',
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
            canUpgradeTo: 'cs:~containers/kubernetes-worker-590',
            subordinateTo: [],
            units: {
              'kubernetes-worker/0': {
                agentStatus: {
                  status: 'allocating',
                  info: '',
                  data: {},
                  since: '2018-08-09T13:55:22.137454811Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadStatus: {
                  status: 'waiting',
                  info: 'waiting for machine',
                  data: {},
                  since: '2018-08-09T13:55:22.137454811Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadVersion: '',
                machine: '8',
                openedPorts: [],
                publicAddress: '',
                charm: '',
                subordinates: {}
              },
              'kubernetes-worker/1': {
                agentStatus: {
                  status: 'allocating',
                  info: '',
                  data: {},
                  since: '2018-08-09T13:55:22.139324175Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadStatus: {
                  status: 'waiting',
                  info: 'waiting for machine',
                  data: {},
                  since: '2018-08-09T13:55:22.139324175Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadVersion: '',
                machine: '5',
                openedPorts: [],
                publicAddress: '',
                charm: '',
                subordinates: {}
              },
              'kubernetes-worker/2': {
                agentStatus: {
                  status: 'allocating',
                  info: '',
                  data: {},
                  since: '2018-08-09T13:55:22.139704369Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadStatus: {
                  status: 'waiting',
                  info: 'waiting for machine',
                  data: {},
                  since: '2018-08-09T13:55:22.139704369Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadVersion: '',
                machine: '9',
                openedPorts: [],
                publicAddress: '',
                charm: '',
                subordinates: {}
              }
            },
            meterStatuses: {},
            status: {
              status: 'waiting',
              info: 'waiting for machine',
              data: {},
              since: '2018-08-09T13:55:22.139324175Z',
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
              'sdn-plugin': ''
            },
            publicAddress: ''
          }
        },
        machines: {
          '0': {
            agentStatus: {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2018-08-09T14:05:36.995856277Z',
              kind: '',
              version: '',
              life: ''
            },
            instanceStatus: {
              status: 'provisioning error',
              info: 'googleapi: Error 403: Project clean-algebra-206308 cannot accept requests to insert while in an inactive billing state.  Billing state may take several minutes to update., inactiveBillingState',
              data: {},
              since: '2018-08-09T14:05:36.995856277Z',
              kind: '',
              version: '',
              life: ''
            },
            dnsName: '',
            ipAddresses: [],
            instanceId: 'pending',
            series: 'xenial',
            id: '0',
            networkInterfaces: {},
            containers: {},
            constraints: '',
            hardware: '',
            jobs: [
              'JobHostUnits'
            ],
            hasVote: false,
            wantsVote: false,
            lxdProfiles: {}
          },
          '1': {
            agentStatus: {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2018-08-09T14:10:50.324486164Z',
              kind: '',
              version: '',
              life: ''
            },
            instanceStatus: {
              status: 'provisioning error',
              info: 'googleapi: Error 403: Project clean-algebra-206308 cannot accept requests to insert while in an inactive billing state.  Billing state may take several minutes to update., inactiveBillingState',
              data: {},
              since: '2018-08-09T14:10:50.324486164Z',
              kind: '',
              version: '',
              life: ''
            },
            dnsName: '',
            ipAddresses: [],
            instanceId: 'pending',
            series: 'xenial',
            id: '1',
            networkInterfaces: {},
            containers: {},
            constraints: '',
            hardware: '',
            jobs: [
              'JobHostUnits'
            ],
            hasVote: false,
            wantsVote: false,
            lxdProfiles: {}
          },
          '2': {
            agentStatus: {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2018-08-09T14:00:23.860656135Z',
              kind: '',
              version: '',
              life: ''
            },
            instanceStatus: {
              status: 'provisioning error',
              info: 'googleapi: Error 403: Project clean-algebra-206308 cannot accept requests to insert while in an inactive billing state.  Billing state may take several minutes to update., inactiveBillingState',
              data: {},
              since: '2018-08-09T14:00:23.860656135Z',
              kind: '',
              version: '',
              life: ''
            },
            dnsName: '',
            ipAddresses: [],
            instanceId: 'pending',
            series: 'xenial',
            id: '2',
            networkInterfaces: {},
            containers: {},
            constraints: '',
            hardware: '',
            jobs: [
              'JobHostUnits'
            ],
            hasVote: false,
            wantsVote: false,
            lxdProfiles: {}
          },
          '3': {
            agentStatus: {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2018-08-09T14:16:01.2522526Z',
              kind: '',
              version: '',
              life: ''
            },
            instanceStatus: {
              status: 'provisioning error',
              info: 'googleapi: Error 403: Project clean-algebra-206308 cannot accept requests to insert while in an inactive billing state.  Billing state may take several minutes to update., inactiveBillingState',
              data: {},
              since: '2018-08-09T14:16:01.2522526Z',
              kind: '',
              version: '',
              life: ''
            },
            dnsName: '',
            ipAddresses: [],
            instanceId: 'pending',
            series: 'xenial',
            id: '3',
            networkInterfaces: {},
            containers: {},
            constraints: '',
            hardware: '',
            jobs: [
              'JobHostUnits'
            ],
            hasVote: false,
            wantsVote: false,
            lxdProfiles: {}
          },
          '4': {
            agentStatus: {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2018-08-09T14:16:01.715668487Z',
              kind: '',
              version: '',
              life: ''
            },
            instanceStatus: {
              status: 'provisioning error',
              info: 'googleapi: Error 403: Project clean-algebra-206308 cannot accept requests to insert while in an inactive billing state.  Billing state may take several minutes to update., inactiveBillingState',
              data: {},
              since: '2018-08-09T14:16:01.715668487Z',
              kind: '',
              version: '',
              life: ''
            },
            dnsName: '',
            ipAddresses: [],
            instanceId: 'pending',
            series: 'xenial',
            id: '4',
            networkInterfaces: {},
            containers: {},
            constraints: '',
            hardware: '',
            jobs: [
              'JobHostUnits'
            ],
            hasVote: false,
            wantsVote: false,
            lxdProfiles: {}
          },
          '5': {
            agentStatus: {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2018-08-09T14:16:01.506721754Z',
              kind: '',
              version: '',
              life: ''
            },
            instanceStatus: {
              status: 'provisioning error',
              info: 'googleapi: Error 403: Project clean-algebra-206308 cannot accept requests to insert while in an inactive billing state.  Billing state may take several minutes to update., inactiveBillingState',
              data: {},
              since: '2018-08-09T14:16:01.506721754Z',
              kind: '',
              version: '',
              life: ''
            },
            dnsName: '',
            ipAddresses: [],
            instanceId: 'pending',
            series: 'xenial',
            id: '5',
            networkInterfaces: {},
            containers: {},
            constraints: '',
            hardware: '',
            jobs: [
              'JobHostUnits'
            ],
            hasVote: false,
            wantsVote: false,
            lxdProfiles: {}
          },
          '6': {
            agentStatus: {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2018-08-09T14:16:02.10797808Z',
              kind: '',
              version: '',
              life: ''
            },
            instanceStatus: {
              status: 'provisioning error',
              info: 'googleapi: Error 403: Project clean-algebra-206308 cannot accept requests to insert while in an inactive billing state.  Billing state may take several minutes to update., inactiveBillingState',
              data: {},
              since: '2018-08-09T14:16:02.10797808Z',
              kind: '',
              version: '',
              life: ''
            },
            dnsName: '',
            ipAddresses: [],
            instanceId: 'pending',
            series: 'xenial',
            id: '6',
            networkInterfaces: {},
            containers: {},
            constraints: '',
            hardware: '',
            jobs: [
              'JobHostUnits'
            ],
            hasVote: false,
            wantsVote: false,
            lxdProfiles: {}
          },
          '7': {
            agentStatus: {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2018-08-09T14:16:01.314430932Z',
              kind: '',
              version: '',
              life: ''
            },
            instanceStatus: {
              status: 'provisioning error',
              info: 'googleapi: Error 403: Project clean-algebra-206308 cannot accept requests to insert while in an inactive billing state.  Billing state may take several minutes to update., inactiveBillingState',
              data: {},
              since: '2018-08-09T14:16:01.314430932Z',
              kind: '',
              version: '',
              life: ''
            },
            dnsName: '',
            ipAddresses: [],
            instanceId: 'pending',
            series: 'xenial',
            id: '7',
            networkInterfaces: {},
            containers: {},
            constraints: '',
            hardware: '',
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
              since: '2018-08-09T14:16:01.695221375Z',
              kind: '',
              version: '',
              life: ''
            },
            instanceStatus: {
              status: 'provisioning error',
              info: 'googleapi: Error 403: Project clean-algebra-206308 cannot accept requests to insert while in an inactive billing state.  Billing state may take several minutes to update., inactiveBillingState',
              data: {},
              since: '2018-08-09T14:16:01.695221375Z',
              kind: '',
              version: '',
              life: ''
            },
            dnsName: '',
            ipAddresses: [],
            instanceId: 'pending',
            series: 'xenial',
            id: '8',
            networkInterfaces: {},
            containers: {},
            constraints: '',
            hardware: '',
            jobs: [
              'JobHostUnits'
            ],
            hasVote: false,
            wantsVote: false,
            lxdProfiles: {}
          },
          '9': {
            agentStatus: {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2018-08-09T14:16:01.775689302Z',
              kind: '',
              version: '',
              life: ''
            },
            instanceStatus: {
              status: 'provisioning error',
              info: 'googleapi: Error 403: Project clean-algebra-206308 cannot accept requests to insert while in an inactive billing state.  Billing state may take several minutes to update., inactiveBillingState',
              data: {},
              since: '2018-08-09T14:16:01.775689302Z',
              kind: '',
              version: '',
              life: ''
            },
            dnsName: '',
            ipAddresses: [],
            instanceId: 'pending',
            series: 'xenial',
            id: '9',
            networkInterfaces: {},
            containers: {},
            constraints: '',
            hardware: '',
            jobs: [
              'JobHostUnits'
            ],
            hasVote: false,
            wantsVote: false,
            lxdProfiles: {}
          }
        },
        model: {
          name: 'mymodel',
          type: 'iaas',
          cloudTag: 'cloud-google',
          region: 'us-east1',
          version: '2.3.8',
          availableVersion: '',
          modelStatus: {
            status: 'available',
            info: '',
            data: {},
            since: '2019-09-05T21:19:15.284025139Z',
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
        offers: {},
        relations: [
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
              since: '2018-08-09T13:55:22.129073716Z',
              kind: '',
              version: '',
              life: ''
            }
          },
          {
            id: 8,
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
              since: '2018-08-09T13:55:22.130096543Z',
              kind: '',
              version: '',
              life: ''
            }
          },
          {
            id: 10,
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
              since: '2018-08-09T13:55:22.131509944Z',
              kind: '',
              version: '',
              life: ''
            }
          },
          {
            id: 9,
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
              since: '2018-08-09T13:55:22.129210264Z',
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
              since: '2018-08-09T13:55:22.128777869Z',
              kind: '',
              version: '',
              life: ''
            }
          },
          {
            id: 12,
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
              since: '2018-08-09T13:55:22.129262373Z',
              kind: '',
              version: '',
              life: ''
            }
          },
          {
            id: 0,
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
              since: '2018-08-09T13:55:20.9376195Z',
              kind: '',
              version: '',
              life: ''
            }
          },
          {
            id: 2,
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
              since: '2018-08-09T13:55:22.1274733Z',
              kind: '',
              version: '',
              life: ''
            }
          },
          {
            id: 3,
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
              since: '2018-08-09T13:55:22.129028481Z',
              kind: '',
              version: '',
              life: ''
            }
          },
          {
            id: 1,
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
              since: '2018-08-09T13:55:22.127567285Z',
              kind: '',
              version: '',
              life: ''
            }
          },
          {
            id: 6,
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
              since: '2018-08-09T13:55:22.128353316Z',
              kind: '',
              version: '',
              life: ''
            }
          },
          {
            id: 7,
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
              since: '2018-08-09T13:55:22.128477242Z',
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
              since: '2018-08-09T13:55:22.127520979Z',
              kind: '',
              version: '',
              life: ''
            }
          }
        ],
        remoteApplications: {},
        uuid: '7ffe956a-06ac-4ae9-8aac-04eba4a93da5',
        info: {
          name: 'mymodel',
          type: '',
          uuid: '7ffe956a-06ac-4ae9-8aac-04eba4a93da5',
          controllerUuid: 'a030379a-940f-4760-8fcf-3062b41a04e7',
          providerType: 'gce',
          defaultSeries: 'xenial',
          cloudTag: 'cloud-google',
          cloudRegion: 'us-east1',
          cloudCredentialTag: 'cloudcred-google_spaceman@external_clean-algebra-206308',
          ownerTag: 'user-spaceman@external',
          life: 'alive',
          status: {
            status: 'available',
            info: '',
            data: {},
            since: '2019-09-05T21:19:15.284Z'
          },
          users: [
            {
              user: 'activedev@external',
              displayName: '',
              lastConnection: '2019-10-28T21:59:46Z',
              access: 'read'
            }
          ],
          machines: [
            {
              id: '0',
              status: 'error'
            },
            {
              id: '1',
              status: 'error'
            },
            {
              id: '2',
              status: 'error'
            },
            {
              id: '3',
              status: 'error'
            },
            {
              id: '4',
              status: 'error'
            },
            {
              id: '5',
              status: 'error'
            },
            {
              id: '6',
              status: 'error'
            },
            {
              id: '7',
              status: 'error'
            },
            {
              id: '8',
              status: 'error'
            },
            {
              id: '9',
              status: 'error'
            }
          ],
          agentVersion: '2.3.8'
        }
      },
      'd291b9ed-1e66-4023-84fe-57130e17a0b2': {
        applications: {
          easyrsa: {
            charm: 'cs:~containers/easyrsa-114',
            series: 'bionic',
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
            canUpgradeTo: 'cs:~containers/easyrsa-278',
            subordinateTo: [],
            units: {
              'easyrsa/0': {
                agentStatus: {
                  status: 'lost',
                  info: 'agent is not communicating with the server',
                  data: {},
                  since: '2018-10-08T15:00:12.484889109Z',
                  kind: '',
                  version: '2.4.3',
                  life: ''
                },
                workloadStatus: {
                  status: 'unknown',
                  info: 'agent lost, see \'juju show-status-log easyrsa/0\'',
                  data: {},
                  since: '2018-10-08T14:53:25.862204883Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadVersion: '3.0.1',
                machine: '2',
                openedPorts: [],
                publicAddress: '35.184.243.254',
                charm: '',
                subordinates: {}
              }
            },
            meterStatuses: {},
            status: {
              status: 'active',
              info: 'Certificate Authority connected.',
              data: {},
              since: '2018-10-08T14:53:25.862204883Z',
              kind: '',
              version: '',
              life: ''
            },
            workloadVersion: '3.0.1',
            charmVerion: '',
            endpointBindings: {
              client: ''
            },
            publicAddress: ''
          },
          etcd: {
            charm: 'cs:~containers/etcd-201',
            series: 'bionic',
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
            canUpgradeTo: 'cs:~containers/etcd-460',
            subordinateTo: [],
            units: {
              'etcd/0': {
                agentStatus: {
                  status: 'lost',
                  info: 'agent is not communicating with the server',
                  data: {},
                  since: '2018-10-08T14:58:19.860896464Z',
                  kind: '',
                  version: '2.4.3',
                  life: ''
                },
                workloadStatus: {
                  status: 'unknown',
                  info: 'agent lost, see \'juju show-status-log etcd/0\'',
                  data: {},
                  since: '2018-10-08T14:55:13.827371195Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadVersion: '3.2.10',
                machine: '9',
                openedPorts: [
                  '2379/tcp'
                ],
                publicAddress: '104.154.116.14',
                charm: '',
                subordinates: {}
              },
              'etcd/1': {
                agentStatus: {
                  status: 'lost',
                  info: 'agent is not communicating with the server',
                  data: {},
                  since: '2018-10-08T14:58:20.769354636Z',
                  kind: '',
                  version: '2.4.3',
                  life: ''
                },
                workloadStatus: {
                  status: 'unknown',
                  info: 'agent lost, see \'juju show-status-log etcd/1\'',
                  data: {},
                  since: '2018-10-08T14:55:13.993780984Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadVersion: '3.2.10',
                machine: '1',
                openedPorts: [
                  '2379/tcp'
                ],
                publicAddress: '35.239.243.48',
                charm: '',
                subordinates: {}
              },
              'etcd/2': {
                agentStatus: {
                  status: 'lost',
                  info: 'agent is not communicating with the server',
                  data: {},
                  since: '2018-10-08T14:58:19.840816673Z',
                  kind: '',
                  version: '2.4.3',
                  life: ''
                },
                workloadStatus: {
                  status: 'unknown',
                  info: 'agent lost, see \'juju show-status-log etcd/2\'',
                  data: {},
                  since: '2018-10-08T14:53:54.357715664Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadVersion: '3.2.10',
                machine: '3',
                openedPorts: [
                  '2379/tcp'
                ],
                publicAddress: '35.224.252.29',
                charm: '',
                subordinates: {}
              }
            },
            meterStatuses: {},
            status: {
              status: 'active',
              info: 'Healthy with 3 known peers',
              data: {},
              since: '2018-10-08T14:55:13.993780984Z',
              kind: '',
              version: '',
              life: ''
            },
            workloadVersion: '3.2.10',
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
          failtester: {
            charm: 'cs:~activedev/precise/failtester-7',
            series: 'precise',
            exposed: false,
            life: '',
            relations: {
              loopback: [
                'failtester'
              ]
            },
            canUpgradeTo: '',
            subordinateTo: [],
            units: {
              'failtester/0': {
                agentStatus: {
                  status: 'allocating',
                  info: '',
                  data: {},
                  since: '2019-05-08T16:13:17.522547252Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadStatus: {
                  status: 'waiting',
                  info: 'waiting for machine',
                  data: {},
                  since: '2019-05-08T16:13:17.522547252Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadVersion: '',
                machine: '10',
                openedPorts: [],
                publicAddress: '',
                charm: '',
                subordinates: {}
              }
            },
            meterStatuses: {},
            status: {
              status: 'waiting',
              info: 'waiting for machine',
              data: {},
              since: '2019-05-08T16:13:17.522547252Z',
              kind: '',
              version: '',
              life: ''
            },
            workloadVersion: '',
            charmVerion: '',
            endpointBindings: {
              loopback: '',
              'prov-reltest': '',
              'req-reltest': ''
            },
            publicAddress: ''
          },
          flannel: {
            charm: 'cs:~containers/flannel-141',
            series: 'bionic',
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
            canUpgradeTo: 'cs:~containers/flannel-450',
            subordinateTo: [
              'kubernetes-master',
              'kubernetes-worker'
            ],
            units: {},
            meterStatuses: {},
            status: {
              status: 'active',
              info: 'Flannel subnet 10.1.93.1/24',
              data: {},
              since: '2018-10-08T14:53:59.331400946Z',
              kind: '',
              version: '',
              life: ''
            },
            workloadVersion: '0.10.0',
            charmVerion: '',
            endpointBindings: {
              cni: '',
              etcd: '',
              'nrpe-external-master': ''
            },
            publicAddress: ''
          },
          'kubeapi-load-balancer': {
            charm: 'cs:~containers/kubeapi-load-balancer-154',
            series: 'bionic',
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
            canUpgradeTo: 'cs:~containers/kubeapi-load-balancer-682',
            subordinateTo: [],
            units: {
              'kubeapi-load-balancer/0': {
                agentStatus: {
                  status: 'lost',
                  info: 'agent is not communicating with the server',
                  data: {},
                  since: '2018-10-08T15:00:13.008776633Z',
                  kind: '',
                  version: '2.4.3',
                  life: ''
                },
                workloadStatus: {
                  status: 'unknown',
                  info: 'agent lost, see \'juju show-status-log kubeapi-load-balancer/0\'',
                  data: {},
                  since: '2018-10-11T10:20:25.7858764Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadVersion: '1.14.0',
                machine: '0',
                openedPorts: [
                  '443/tcp'
                ],
                publicAddress: '35.184.25.213',
                charm: '',
                subordinates: {}
              }
            },
            meterStatuses: {},
            status: {
              status: 'active',
              info: 'Loadbalancer ready.',
              data: {},
              since: '2018-10-11T10:20:25.7858764Z',
              kind: '',
              version: '',
              life: ''
            },
            workloadVersion: '1.14.0',
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
            charm: 'cs:~containers/kubernetes-master-210',
            series: 'bionic',
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
            canUpgradeTo: 'cs:~containers/kubernetes-master-754',
            subordinateTo: [],
            units: {
              'kubernetes-master/0': {
                agentStatus: {
                  status: 'lost',
                  info: 'agent is not communicating with the server',
                  data: {},
                  since: '2018-10-08T15:05:52.650156718Z',
                  kind: '',
                  version: '2.4.3',
                  life: ''
                },
                workloadStatus: {
                  status: 'unknown',
                  info: 'agent lost, see \'juju show-status-log kubernetes-master/0\'',
                  data: {},
                  since: '2018-10-08T15:04:40.737693566Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadVersion: '1.12.0',
                machine: '5',
                openedPorts: [
                  '6443/tcp'
                ],
                publicAddress: '35.239.136.24',
                charm: '',
                subordinates: {
                  'flannel/0': {
                    'agent-status': {
                      status: 'lost',
                      info: 'agent is not communicating with the server',
                      data: {},
                      since: '2018-10-08T14:54:11.557598139Z',
                      kind: '',
                      version: '2.4.3',
                      life: ''
                    },
                    'workload-status': {
                      status: 'unknown',
                      info: 'agent lost, see \'juju show-status-log flannel/0\'',
                      data: {},
                      since: '2018-10-08T14:53:59.331400946Z',
                      kind: '',
                      version: '',
                      life: ''
                    },
                    'workload-version': '0.10.0',
                    machine: '',
                    'opened-ports': null,
                    'public-address': '35.239.136.24',
                    charm: 'cs:~containers/flannel-141',
                    subordinates: null
                  }
                }
              },
              'kubernetes-master/1': {
                agentStatus: {
                  status: 'lost',
                  info: 'agent is not communicating with the server',
                  data: {},
                  since: '2018-10-08T15:09:24.889459894Z',
                  kind: '',
                  version: '2.4.3',
                  life: ''
                },
                workloadStatus: {
                  status: 'unknown',
                  info: 'agent lost, see \'juju show-status-log kubernetes-master/1\'',
                  data: {},
                  since: '2018-10-08T15:09:24.141608099Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadVersion: '1.12.0',
                machine: '7',
                openedPorts: [
                  '6443/tcp'
                ],
                publicAddress: '35.225.168.246',
                charm: '',
                subordinates: {
                  'flannel/1': {
                    'agent-status': {
                      status: 'lost',
                      info: 'agent is not communicating with the server',
                      data: {},
                      since: '2018-10-08T15:03:23.198522775Z',
                      kind: '',
                      version: '2.4.3',
                      life: ''
                    },
                    'workload-status': {
                      status: 'unknown',
                      info: 'agent lost, see \'juju show-status-log flannel/1\'',
                      data: {},
                      since: '2018-10-08T15:03:22.636743746Z',
                      kind: '',
                      version: '',
                      life: ''
                    },
                    'workload-version': '0.10.0',
                    machine: '',
                    'opened-ports': null,
                    'public-address': '35.225.168.246',
                    charm: 'cs:~containers/flannel-141',
                    subordinates: null
                  }
                }
              }
            },
            meterStatuses: {},
            status: {
              status: 'active',
              info: 'Kubernetes master running.',
              data: {},
              since: '2018-10-08T15:04:40.737693566Z',
              kind: '',
              version: '',
              life: ''
            },
            workloadVersion: '1.12.0',
            charmVerion: '',
            endpointBindings: {
              aws: '',
              azure: '',
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
            charm: 'cs:~containers/kubernetes-worker-231',
            series: 'bionic',
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
            canUpgradeTo: 'cs:~containers/kubernetes-worker-590',
            subordinateTo: [],
            units: {
              'kubernetes-worker/0': {
                agentStatus: {
                  status: 'lost',
                  info: 'agent is not communicating with the server',
                  data: {},
                  since: '2018-10-08T15:04:44.254710784Z',
                  kind: '',
                  version: '2.4.3',
                  life: ''
                },
                workloadStatus: {
                  status: 'unknown',
                  info: 'agent lost, see \'juju show-status-log kubernetes-worker/0\'',
                  data: {},
                  since: '2018-10-08T14:59:31.586068084Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadVersion: '1.12.0',
                machine: '4',
                openedPorts: [
                  '80/tcp',
                  '443/tcp'
                ],
                publicAddress: '35.232.127.235',
                charm: '',
                subordinates: {
                  'flannel/3': {
                    'agent-status': {
                      status: 'lost',
                      info: 'agent is not communicating with the server',
                      data: {},
                      since: '2018-10-08T14:56:08.071444675Z',
                      kind: '',
                      version: '2.4.3',
                      life: ''
                    },
                    'workload-status': {
                      status: 'unknown',
                      info: 'agent lost, see \'juju show-status-log flannel/3\'',
                      data: {},
                      since: '2018-10-08T14:56:03.718860559Z',
                      kind: '',
                      version: '',
                      life: ''
                    },
                    'workload-version': '0.10.0',
                    machine: '',
                    'opened-ports': null,
                    'public-address': '35.232.127.235',
                    charm: 'cs:~containers/flannel-141',
                    subordinates: null
                  }
                }
              },
              'kubernetes-worker/1': {
                agentStatus: {
                  status: 'lost',
                  info: 'agent is not communicating with the server',
                  data: {},
                  since: '2018-10-08T15:04:44.210102952Z',
                  kind: '',
                  version: '2.4.3',
                  life: ''
                },
                workloadStatus: {
                  status: 'unknown',
                  info: 'agent lost, see \'juju show-status-log kubernetes-worker/1\'',
                  data: {},
                  since: '2018-10-08T15:01:33.267424296Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadVersion: '1.12.0',
                machine: '8',
                openedPorts: [
                  '80/tcp',
                  '443/tcp'
                ],
                publicAddress: '35.188.63.154',
                charm: '',
                subordinates: {
                  'flannel/2': {
                    'agent-status': {
                      status: 'lost',
                      info: 'agent is not communicating with the server',
                      data: {},
                      since: '2018-10-08T14:55:42.929647252Z',
                      kind: '',
                      version: '2.4.3',
                      life: ''
                    },
                    'workload-status': {
                      status: 'unknown',
                      info: 'agent lost, see \'juju show-status-log flannel/2\'',
                      data: {},
                      since: '2018-10-08T14:55:38.942056285Z',
                      kind: '',
                      version: '',
                      life: ''
                    },
                    'workload-version': '0.10.0',
                    machine: '',
                    'opened-ports': null,
                    'public-address': '35.188.63.154',
                    charm: 'cs:~containers/flannel-141',
                    subordinates: null
                  }
                }
              },
              'kubernetes-worker/2': {
                agentStatus: {
                  status: 'lost',
                  info: 'agent is not communicating with the server',
                  data: {},
                  since: '2018-10-10T13:16:02.808134741Z',
                  kind: '',
                  version: '2.4.3',
                  life: ''
                },
                workloadStatus: {
                  status: 'unknown',
                  info: 'agent lost, see \'juju show-status-log kubernetes-worker/2\'',
                  data: {},
                  since: '2018-10-08T15:04:50.976444251Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadVersion: '1.12.0',
                machine: '6',
                openedPorts: [
                  '80/tcp',
                  '443/tcp'
                ],
                publicAddress: '35.188.207.247',
                charm: '',
                subordinates: {
                  'flannel/4': {
                    'agent-status': {
                      status: 'lost',
                      info: 'agent is not communicating with the server',
                      data: {},
                      since: '2018-10-08T14:56:36.90109005Z',
                      kind: '',
                      version: '2.4.3',
                      life: ''
                    },
                    'workload-status': {
                      status: 'unknown',
                      info: 'agent lost, see \'juju show-status-log flannel/4\'',
                      data: {},
                      since: '2018-10-08T14:56:32.619885336Z',
                      kind: '',
                      version: '',
                      life: ''
                    },
                    'workload-version': '0.10.0',
                    machine: '',
                    'opened-ports': null,
                    'public-address': '35.188.207.247',
                    charm: 'cs:~containers/flannel-141',
                    subordinates: null
                  }
                }
              }
            },
            meterStatuses: {},
            status: {
              status: 'active',
              info: 'Kubernetes worker running.',
              data: {},
              since: '2018-10-08T15:01:33.267424296Z',
              kind: '',
              version: '',
              life: ''
            },
            workloadVersion: '1.12.0',
            charmVerion: '',
            endpointBindings: {
              aws: '',
              azure: '',
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
          }
        },
        machines: {
          '0': {
            agentStatus: {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2018-10-08T14:15:24.799890838Z',
              kind: '',
              version: '2.4.3',
              life: ''
            },
            instanceStatus: {
              status: 'running',
              info: 'RUNNING',
              data: {},
              since: '2018-10-08T14:11:44.670960211Z',
              kind: '',
              version: '',
              life: ''
            },
            dnsName: '35.184.25.213',
            ipAddresses: [
              '35.184.25.213',
              '10.128.0.2',
              '252.0.32.1'
            ],
            instanceId: 'juju-17a0b2-0',
            series: 'bionic',
            id: '0',
            networkInterfaces: {
              ens4: {
                ipAddresses: [
                  '10.128.0.2'
                ],
                macAddress: '42:01:0a:80:00:02',
                gateway: '10.128.0.1',
                dnsNameservers: [],
                isUp: true
              },
              'fan-252': {
                ipAddresses: [
                  '252.0.32.1'
                ],
                macAddress: '42:93:b1:d6:6b:13',
                dnsNameservers: [],
                isUp: true
              }
            },
            containers: {},
            constraints: '',
            hardware: 'arch=amd64 cores=1 cpu-power=138 mem=1700M root-disk=10240M availability-zone=us-central1-a',
            jobs: [
              'JobHostUnits'
            ],
            hasVote: false,
            wantsVote: false,
            lxdProfiles: {}
          },
          '1': {
            agentStatus: {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2018-10-08T14:16:33.09323003Z',
              kind: '',
              version: '2.4.3',
              life: ''
            },
            instanceStatus: {
              status: 'running',
              info: 'RUNNING',
              data: {},
              since: '2018-10-08T14:13:14.188017622Z',
              kind: '',
              version: '',
              life: ''
            },
            dnsName: '35.239.243.48',
            ipAddresses: [
              '35.239.243.48',
              '10.128.0.8',
              '252.0.128.1'
            ],
            instanceId: 'juju-17a0b2-1',
            series: 'bionic',
            id: '1',
            networkInterfaces: {
              ens4: {
                ipAddresses: [
                  '10.128.0.8'
                ],
                macAddress: '42:01:0a:80:00:08',
                gateway: '10.128.0.1',
                dnsNameservers: [],
                isUp: true
              },
              'fan-252': {
                ipAddresses: [
                  '252.0.128.1'
                ],
                macAddress: '42:f8:ca:c3:a1:15',
                dnsNameservers: [],
                isUp: true
              }
            },
            containers: {},
            constraints: '',
            hardware: 'arch=amd64 cores=1 cpu-power=138 mem=1700M root-disk=10240M availability-zone=us-central1-a',
            jobs: [
              'JobHostUnits'
            ],
            hasVote: false,
            wantsVote: false,
            lxdProfiles: {}
          },
          '2': {
            agentStatus: {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2018-10-08T14:17:04.802970819Z',
              kind: '',
              version: '2.4.3',
              life: ''
            },
            instanceStatus: {
              status: 'running',
              info: 'RUNNING',
              data: {},
              since: '2018-10-08T14:12:47.935117603Z',
              kind: '',
              version: '',
              life: ''
            },
            dnsName: '35.184.243.254',
            ipAddresses: [
              '35.184.243.254',
              '10.128.0.4',
              '252.0.64.1'
            ],
            instanceId: 'juju-17a0b2-2',
            series: 'bionic',
            id: '2',
            networkInterfaces: {
              ens4: {
                ipAddresses: [
                  '10.128.0.4'
                ],
                macAddress: '42:01:0a:80:00:04',
                gateway: '10.128.0.1',
                dnsNameservers: [],
                isUp: true
              },
              'fan-252': {
                ipAddresses: [
                  '252.0.64.1'
                ],
                macAddress: 'ae:82:80:fe:cc:b2',
                dnsNameservers: [],
                isUp: true
              }
            },
            containers: {},
            constraints: '',
            hardware: 'arch=amd64 cores=1 cpu-power=138 mem=1700M root-disk=10240M availability-zone=us-central1-b',
            jobs: [
              'JobHostUnits'
            ],
            hasVote: false,
            wantsVote: false,
            lxdProfiles: {}
          },
          '3': {
            agentStatus: {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2018-10-08T14:16:39.687870834Z',
              kind: '',
              version: '2.4.3',
              life: ''
            },
            instanceStatus: {
              status: 'running',
              info: 'RUNNING',
              data: {},
              since: '2018-10-08T14:13:14.18800033Z',
              kind: '',
              version: '',
              life: ''
            },
            dnsName: '35.224.252.29',
            ipAddresses: [
              '35.224.252.29',
              '10.128.0.6',
              '252.0.96.1'
            ],
            instanceId: 'juju-17a0b2-3',
            series: 'bionic',
            id: '3',
            networkInterfaces: {
              ens4: {
                ipAddresses: [
                  '10.128.0.6'
                ],
                macAddress: '42:01:0a:80:00:06',
                gateway: '10.128.0.1',
                dnsNameservers: [],
                isUp: true
              },
              'fan-252': {
                ipAddresses: [
                  '252.0.96.1'
                ],
                macAddress: 'e2:9f:ca:04:d8:a5',
                dnsNameservers: [],
                isUp: true
              }
            },
            containers: {},
            constraints: '',
            hardware: 'arch=amd64 cores=1 cpu-power=138 mem=1700M root-disk=10240M availability-zone=us-central1-b',
            jobs: [
              'JobHostUnits'
            ],
            hasVote: false,
            wantsVote: false,
            lxdProfiles: {}
          },
          '4': {
            agentStatus: {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2018-10-08T14:17:12.490336938Z',
              kind: '',
              version: '2.4.3',
              life: ''
            },
            instanceStatus: {
              status: 'running',
              info: 'RUNNING',
              data: {},
              since: '2018-10-08T14:13:14.187392339Z',
              kind: '',
              version: '',
              life: ''
            },
            dnsName: '35.232.127.235',
            ipAddresses: [
              '35.232.127.235',
              '10.128.0.11',
              '252.0.176.1'
            ],
            instanceId: 'juju-17a0b2-4',
            series: 'bionic',
            id: '4',
            networkInterfaces: {
              ens4: {
                ipAddresses: [
                  '10.128.0.11'
                ],
                macAddress: '42:01:0a:80:00:0b',
                gateway: '10.128.0.1',
                dnsNameservers: [],
                isUp: true
              },
              'fan-252': {
                ipAddresses: [
                  '252.0.176.1'
                ],
                macAddress: 'ae:8c:2e:9e:c8:1a',
                dnsNameservers: [],
                isUp: true
              }
            },
            containers: {},
            constraints: '',
            hardware: 'arch=amd64 cores=1 cpu-power=138 mem=1700M root-disk=10240M availability-zone=us-central1-c',
            jobs: [
              'JobHostUnits'
            ],
            hasVote: false,
            wantsVote: false,
            lxdProfiles: {}
          },
          '5': {
            agentStatus: {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2018-10-08T14:17:00.187538906Z',
              kind: '',
              version: '2.4.3',
              life: ''
            },
            instanceStatus: {
              status: 'running',
              info: 'RUNNING',
              data: {},
              since: '2018-10-08T14:13:18.308584698Z',
              kind: '',
              version: '',
              life: ''
            },
            dnsName: '35.239.136.24',
            ipAddresses: [
              '35.239.136.24',
              '10.128.0.10',
              '252.0.160.1'
            ],
            instanceId: 'juju-17a0b2-5',
            series: 'bionic',
            id: '5',
            networkInterfaces: {
              ens4: {
                ipAddresses: [
                  '10.128.0.10'
                ],
                macAddress: '42:01:0a:80:00:0a',
                gateway: '10.128.0.1',
                dnsNameservers: [],
                isUp: true
              },
              'fan-252': {
                ipAddresses: [
                  '252.0.160.1'
                ],
                macAddress: 'c2:84:fe:56:14:18',
                dnsNameservers: [],
                isUp: true
              }
            },
            containers: {},
            constraints: '',
            hardware: 'arch=amd64 cores=1 cpu-power=138 mem=1700M root-disk=10240M availability-zone=us-central1-a',
            jobs: [
              'JobHostUnits'
            ],
            hasVote: false,
            wantsVote: false,
            lxdProfiles: {}
          },
          '6': {
            agentStatus: {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2018-10-08T14:16:14.161622566Z',
              kind: '',
              version: '2.4.3',
              life: ''
            },
            instanceStatus: {
              status: 'running',
              info: 'RUNNING',
              data: {},
              since: '2018-10-08T14:12:15.818963831Z',
              kind: '',
              version: '',
              life: ''
            },
            dnsName: '35.188.207.247',
            ipAddresses: [
              '35.188.207.247',
              '10.128.0.3',
              '252.0.48.1'
            ],
            instanceId: 'juju-17a0b2-6',
            series: 'bionic',
            id: '6',
            networkInterfaces: {
              ens4: {
                ipAddresses: [
                  '10.128.0.3'
                ],
                macAddress: '42:01:0a:80:00:03',
                gateway: '10.128.0.1',
                dnsNameservers: [],
                isUp: true
              },
              'fan-252': {
                ipAddresses: [
                  '252.0.48.1'
                ],
                macAddress: '8e:af:90:57:9a:59',
                dnsNameservers: [],
                isUp: true
              }
            },
            containers: {},
            constraints: '',
            hardware: 'arch=amd64 cores=1 cpu-power=138 mem=1700M root-disk=10240M availability-zone=us-central1-a',
            jobs: [
              'JobHostUnits'
            ],
            hasVote: false,
            wantsVote: false,
            lxdProfiles: {}
          },
          '7': {
            agentStatus: {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2018-10-08T14:17:15.039999764Z',
              kind: '',
              version: '2.4.3',
              life: ''
            },
            instanceStatus: {
              status: 'running',
              info: 'RUNNING',
              data: {},
              since: '2018-10-08T14:13:14.187669425Z',
              kind: '',
              version: '',
              life: ''
            },
            dnsName: '35.225.168.246',
            ipAddresses: [
              '35.225.168.246',
              '10.128.0.7',
              '252.0.112.1'
            ],
            instanceId: 'juju-17a0b2-7',
            series: 'bionic',
            id: '7',
            networkInterfaces: {
              ens4: {
                ipAddresses: [
                  '10.128.0.7'
                ],
                macAddress: '42:01:0a:80:00:07',
                gateway: '10.128.0.1',
                dnsNameservers: [],
                isUp: true
              },
              'fan-252': {
                ipAddresses: [
                  '252.0.112.1'
                ],
                macAddress: 'e6:0d:97:91:6f:36',
                dnsNameservers: [],
                isUp: true
              }
            },
            containers: {},
            constraints: '',
            hardware: 'arch=amd64 cores=1 cpu-power=138 mem=1700M root-disk=10240M availability-zone=us-central1-b',
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
              since: '2018-10-08T14:16:48.17982928Z',
              kind: '',
              version: '2.4.3',
              life: ''
            },
            instanceStatus: {
              status: 'running',
              info: 'RUNNING',
              data: {},
              since: '2018-10-08T14:13:14.187532588Z',
              kind: '',
              version: '',
              life: ''
            },
            dnsName: '35.188.63.154',
            ipAddresses: [
              '35.188.63.154',
              '10.128.0.5',
              '252.0.80.1'
            ],
            instanceId: 'juju-17a0b2-8',
            series: 'bionic',
            id: '8',
            networkInterfaces: {
              ens4: {
                ipAddresses: [
                  '10.128.0.5'
                ],
                macAddress: '42:01:0a:80:00:05',
                gateway: '10.128.0.1',
                dnsNameservers: [],
                isUp: true
              },
              'fan-252': {
                ipAddresses: [
                  '252.0.80.1'
                ],
                macAddress: 'b6:4f:ff:07:f5:29',
                dnsNameservers: [],
                isUp: true
              }
            },
            containers: {},
            constraints: '',
            hardware: 'arch=amd64 cores=1 cpu-power=138 mem=1700M root-disk=10240M availability-zone=us-central1-b',
            jobs: [
              'JobHostUnits'
            ],
            hasVote: false,
            wantsVote: false,
            lxdProfiles: {}
          },
          '9': {
            agentStatus: {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2018-10-08T14:17:05.646888979Z',
              kind: '',
              version: '2.4.3',
              life: ''
            },
            instanceStatus: {
              status: 'running',
              info: 'RUNNING',
              data: {},
              since: '2018-10-08T14:13:14.187978395Z',
              kind: '',
              version: '',
              life: ''
            },
            dnsName: '104.154.116.14',
            ipAddresses: [
              '104.154.116.14',
              '10.128.0.9',
              '252.0.144.1'
            ],
            instanceId: 'juju-17a0b2-9',
            series: 'bionic',
            id: '9',
            networkInterfaces: {
              ens4: {
                ipAddresses: [
                  '10.128.0.9'
                ],
                macAddress: '42:01:0a:80:00:09',
                gateway: '10.128.0.1',
                dnsNameservers: [],
                isUp: true
              },
              'fan-252': {
                ipAddresses: [
                  '252.0.144.1'
                ],
                macAddress: 'da:ed:5a:9b:e6:78',
                dnsNameservers: [],
                isUp: true
              }
            },
            containers: {},
            constraints: '',
            hardware: 'arch=amd64 cores=1 cpu-power=138 mem=1700M root-disk=10240M availability-zone=us-central1-c',
            jobs: [
              'JobHostUnits'
            ],
            hasVote: false,
            wantsVote: false,
            lxdProfiles: {}
          },
          '10': {
            agentStatus: {
              status: 'pending',
              info: '',
              data: {},
              since: '2019-05-08T16:13:16.312096379Z',
              kind: '',
              version: '',
              life: ''
            },
            instanceStatus: {
              status: 'pending',
              info: '',
              data: {},
              since: '2019-05-08T16:13:16.312096379Z',
              kind: '',
              version: '',
              life: ''
            },
            dnsName: '',
            ipAddresses: [],
            instanceId: 'pending',
            series: 'precise',
            id: '10',
            networkInterfaces: {},
            containers: {},
            constraints: '',
            hardware: '',
            jobs: [
              'JobHostUnits'
            ],
            hasVote: false,
            wantsVote: false,
            lxdProfiles: {}
          }
        },
        model: {
          name: 'mymodel4',
          type: 'iaas',
          cloudTag: 'cloud-google',
          region: 'us-central1',
          version: '2.4.3',
          availableVersion: '',
          modelStatus: {
            status: 'available',
            info: '',
            data: {},
            since: '2019-09-05T18:45:19.308895028Z',
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
        offers: {},
        relations: [
          {
            id: 2,
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
              status: 'joined',
              info: '',
              data: {},
              since: '2018-10-08T14:53:23.56481836Z',
              kind: '',
              version: '',
              life: ''
            }
          },
          {
            id: 4,
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
              status: 'joined',
              info: '',
              data: {},
              since: '2018-10-08T14:50:44.741899428Z',
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
              status: 'joined',
              info: '',
              data: {},
              since: '2018-10-08T14:51:05.0781343Z',
              kind: '',
              version: '',
              life: ''
            }
          },
          {
            id: 9,
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
              status: 'joined',
              info: '',
              data: {},
              since: '2018-10-08T14:55:11.412181489Z',
              kind: '',
              version: '',
              life: ''
            }
          },
          {
            id: 3,
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
              status: 'joined',
              info: '',
              data: {},
              since: '2018-10-08T14:50:44.804422799Z',
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
              status: 'joined',
              info: '',
              data: {},
              since: '2018-10-08T14:51:04.92236232Z',
              kind: '',
              version: '',
              life: ''
            }
          },
          {
            id: 6,
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
              status: 'joined',
              info: '',
              data: {},
              since: '2018-10-08T14:50:31.151858631Z',
              kind: '',
              version: '',
              life: ''
            }
          },
          {
            id: 8,
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
              status: 'joined',
              info: '',
              data: {},
              since: '2018-10-08T14:51:05.297594667Z',
              kind: '',
              version: '',
              life: ''
            }
          },
          {
            id: 10,
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
              status: 'joined',
              info: '',
              data: {},
              since: '2018-10-08T14:50:44.870226986Z',
              kind: '',
              version: '',
              life: ''
            }
          },
          {
            id: 12,
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
              status: 'joined',
              info: '',
              data: {},
              since: '2018-10-08T14:50:44.67467258Z',
              kind: '',
              version: '',
              life: ''
            }
          },
          {
            id: 11,
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
              status: 'joined',
              info: '',
              data: {},
              since: '2018-10-08T14:50:31.33620189Z',
              kind: '',
              version: '',
              life: ''
            }
          },
          {
            id: 13,
            key: 'failtester:loopback',
            'interface': 'lbfailtest',
            scope: 'global',
            endpoints: [
              {
                application: 'failtester',
                name: 'loopback',
                role: 'peer',
                subordinate: false
              }
            ],
            status: {
              status: 'joining',
              info: '',
              data: {},
              since: '2019-05-08T16:13:17.312770591Z',
              kind: '',
              version: '',
              life: ''
            }
          },
          {
            id: 0,
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
              status: 'joined',
              info: '',
              data: {},
              since: '2018-10-08T14:50:31.422410935Z',
              kind: '',
              version: '',
              life: ''
            }
          },
          {
            id: 1,
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
              status: 'joined',
              info: '',
              data: {},
              since: '2018-10-08T14:50:31.242239399Z',
              kind: '',
              version: '',
              life: ''
            }
          }
        ],
        remoteApplications: {},
        uuid: 'd291b9ed-1e66-4023-84fe-57130e17a0b2',
        info: {
          name: 'mymodel4',
          type: '',
          uuid: 'd291b9ed-1e66-4023-84fe-57130e17a0b2',
          controllerUuid: 'a030379a-940f-4760-8fcf-3062b41a04e7',
          providerType: 'gce',
          defaultSeries: 'bionic',
          cloudTag: 'cloud-google',
          cloudRegion: 'us-central1',
          cloudCredentialTag: 'cloudcred-google_spaceman@external_clean-algebra-206308',
          ownerTag: 'user-spaceman@external',
          life: 'alive',
          status: {
            status: 'available',
            info: '',
            data: {},
            since: '2019-09-05T18:45:19.308Z'
          },
          users: [
            {
              user: 'activedev@external',
              displayName: '',
              lastConnection: '2019-10-28T21:59:46Z',
              access: 'read'
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
                availabilityZone: 'us-central1-a'
              },
              instanceId: 'juju-17a0b2-0',
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
                availabilityZone: 'us-central1-a'
              },
              instanceId: 'juju-17a0b2-1',
              status: 'started'
            },
            {
              id: '10',
              status: 'pending'
            },
            {
              id: '2',
              hardware: {
                arch: 'amd64',
                mem: 1700,
                rootDisk: 10240,
                cores: 1,
                cpuPower: 138,
                tags: [],
                availabilityZone: 'us-central1-b'
              },
              instanceId: 'juju-17a0b2-2',
              status: 'started'
            },
            {
              id: '3',
              hardware: {
                arch: 'amd64',
                mem: 1700,
                rootDisk: 10240,
                cores: 1,
                cpuPower: 138,
                tags: [],
                availabilityZone: 'us-central1-b'
              },
              instanceId: 'juju-17a0b2-3',
              status: 'started'
            },
            {
              id: '4',
              hardware: {
                arch: 'amd64',
                mem: 1700,
                rootDisk: 10240,
                cores: 1,
                cpuPower: 138,
                tags: [],
                availabilityZone: 'us-central1-c'
              },
              instanceId: 'juju-17a0b2-4',
              status: 'started'
            },
            {
              id: '5',
              hardware: {
                arch: 'amd64',
                mem: 1700,
                rootDisk: 10240,
                cores: 1,
                cpuPower: 138,
                tags: [],
                availabilityZone: 'us-central1-a'
              },
              instanceId: 'juju-17a0b2-5',
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
                availabilityZone: 'us-central1-a'
              },
              instanceId: 'juju-17a0b2-6',
              status: 'started'
            },
            {
              id: '7',
              hardware: {
                arch: 'amd64',
                mem: 1700,
                rootDisk: 10240,
                cores: 1,
                cpuPower: 138,
                tags: [],
                availabilityZone: 'us-central1-b'
              },
              instanceId: 'juju-17a0b2-7',
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
                availabilityZone: 'us-central1-b'
              },
              instanceId: 'juju-17a0b2-8',
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
                availabilityZone: 'us-central1-c'
              },
              instanceId: 'juju-17a0b2-9',
              status: 'started'
            }
          ],
          agentVersion: '2.4.3'
        }
      },
      '5f612488-b60b-4256-814a-ba1abaa7db23': {
        applications: {
          mediawiki: {
            charm: 'cs:trusty/mediawiki-3',
            series: 'trusty',
            exposed: true,
            life: '',
            relations: {
              db: [
                'mysql'
              ]
            },
            canUpgradeTo: 'cs:trusty/mediawiki-19',
            subordinateTo: [],
            units: {
              'mediawiki/0': {
                agentStatus: {
                  status: 'lost',
                  info: 'agent is not communicating with the server',
                  data: {},
                  since: '2018-11-13T14:37:48.474814666Z',
                  kind: '',
                  version: '2.4.5',
                  life: ''
                },
                workloadStatus: {
                  status: 'unknown',
                  info: 'agent lost, see \'juju show-status-log mediawiki/0\'',
                  data: {},
                  since: '2018-11-13T14:37:24.047363172Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadVersion: '',
                machine: '3',
                openedPorts: [
                  '80/tcp'
                ],
                publicAddress: '35.233.19.171',
                charm: '',
                subordinates: {}
              }
            },
            meterStatuses: {},
            status: {
              status: 'unknown',
              info: '',
              data: {},
              since: '2018-11-13T14:37:24.047363172Z',
              kind: '',
              version: '',
              life: ''
            },
            workloadVersion: '',
            charmVerion: '',
            endpointBindings: {
              cache: '',
              db: '',
              slave: '',
              website: ''
            },
            publicAddress: ''
          },
          mysql: {
            charm: 'cs:trusty/mysql-29',
            series: 'trusty',
            exposed: true,
            life: '',
            relations: {
              cluster: [
                'mysql'
              ],
              db: [
                'mediawiki'
              ]
            },
            canUpgradeTo: 'cs:trusty/mysql-58',
            subordinateTo: [],
            units: {
              'mysql/0': {
                agentStatus: {
                  status: 'lost',
                  info: 'agent is not communicating with the server',
                  data: {},
                  since: '2018-11-13T14:41:02.016347783Z',
                  kind: '',
                  version: '2.4.5',
                  life: ''
                },
                workloadStatus: {
                  status: 'unknown',
                  info: 'agent lost, see \'juju show-status-log mysql/0\'',
                  data: {},
                  since: '2018-11-13T14:37:34.207651081Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadVersion: '',
                machine: '4',
                openedPorts: [],
                publicAddress: '35.240.53.197',
                charm: '',
                subordinates: {}
              }
            },
            meterStatuses: {},
            status: {
              status: 'unknown',
              info: '',
              data: {},
              since: '2018-11-13T14:37:34.207651081Z',
              kind: '',
              version: '',
              life: ''
            },
            workloadVersion: '',
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
        machines: {
          '1': {
            agentStatus: {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2018-11-13T14:37:10.907031705Z',
              kind: '',
              version: '2.4.5',
              life: ''
            },
            instanceStatus: {
              status: 'running',
              info: 'RUNNING',
              data: {},
              since: '2018-11-13T14:35:48.407691975Z',
              kind: '',
              version: '',
              life: ''
            },
            dnsName: '35.240.42.59',
            ipAddresses: [
              '35.240.42.59',
              '10.132.0.4',
              '252.0.64.1'
            ],
            instanceId: 'juju-a7db23-1',
            series: 'xenial',
            id: '1',
            networkInterfaces: {
              ens4: {
                ipAddresses: [
                  '10.132.0.4'
                ],
                macAddress: '42:01:0a:84:00:04',
                gateway: '10.132.0.1',
                dnsNameservers: [],
                isUp: true
              },
              'fan-252': {
                ipAddresses: [
                  '252.0.64.1'
                ],
                macAddress: '92:2b:a1:fb:6a:1c',
                dnsNameservers: [],
                isUp: true
              }
            },
            containers: {},
            constraints: '',
            hardware: 'arch=amd64 cores=1 cpu-power=138 mem=1700M root-disk=10240M availability-zone=europe-west1-d',
            jobs: [
              'JobHostUnits'
            ],
            hasVote: false,
            wantsVote: false,
            lxdProfiles: {}
          },
          '2': {
            agentStatus: {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2018-11-13T14:37:29.766013507Z',
              kind: '',
              version: '2.4.5',
              life: ''
            },
            instanceStatus: {
              status: 'running',
              info: 'RUNNING',
              data: {},
              since: '2018-11-13T14:35:52.917791812Z',
              kind: '',
              version: '',
              life: ''
            },
            dnsName: '35.241.229.233',
            ipAddresses: [
              '35.241.229.233',
              '10.132.0.5',
              '252.0.80.1'
            ],
            instanceId: 'juju-a7db23-2',
            series: 'xenial',
            id: '2',
            networkInterfaces: {
              ens4: {
                ipAddresses: [
                  '10.132.0.5'
                ],
                macAddress: '42:01:0a:84:00:05',
                gateway: '10.132.0.1',
                dnsNameservers: [],
                isUp: true
              },
              'fan-252': {
                ipAddresses: [
                  '252.0.80.1'
                ],
                macAddress: '4a:2a:63:74:e2:f2',
                dnsNameservers: [],
                isUp: true
              }
            },
            containers: {},
            constraints: '',
            hardware: 'arch=amd64 cores=1 cpu-power=138 mem=1700M root-disk=10240M availability-zone=europe-west1-b',
            jobs: [
              'JobHostUnits'
            ],
            hasVote: false,
            wantsVote: false,
            lxdProfiles: {}
          },
          '3': {
            agentStatus: {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2018-11-13T14:36:39.42882555Z',
              kind: '',
              version: '2.4.5',
              life: ''
            },
            instanceStatus: {
              status: 'running',
              info: 'RUNNING',
              data: {},
              since: '2018-11-13T14:35:22.612821332Z',
              kind: '',
              version: '',
              life: ''
            },
            dnsName: '35.233.19.171',
            ipAddresses: [
              '35.233.19.171',
              '10.132.0.3'
            ],
            instanceId: 'juju-a7db23-3',
            series: 'trusty',
            id: '3',
            networkInterfaces: {
              eth0: {
                ipAddresses: [
                  '10.132.0.3'
                ],
                macAddress: '42:01:0a:84:00:03',
                gateway: '10.132.0.1',
                dnsNameservers: [],
                isUp: true
              }
            },
            containers: {},
            constraints: '',
            hardware: 'arch=amd64 cores=1 cpu-power=138 mem=1700M root-disk=10240M availability-zone=europe-west1-c',
            jobs: [
              'JobHostUnits'
            ],
            hasVote: false,
            wantsVote: false,
            lxdProfiles: {}
          },
          '4': {
            agentStatus: {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2018-11-13T14:36:30.506826465Z',
              kind: '',
              version: '2.4.5',
              life: ''
            },
            instanceStatus: {
              status: 'running',
              info: 'RUNNING',
              data: {},
              since: '2018-11-13T14:35:10.16538196Z',
              kind: '',
              version: '',
              life: ''
            },
            dnsName: '35.240.53.197',
            ipAddresses: [
              '35.240.53.197',
              '10.132.0.2'
            ],
            instanceId: 'juju-a7db23-4',
            series: 'trusty',
            id: '4',
            networkInterfaces: {
              eth0: {
                ipAddresses: [
                  '10.132.0.2'
                ],
                macAddress: '42:01:0a:84:00:02',
                gateway: '10.132.0.1',
                dnsNameservers: [],
                isUp: true
              }
            },
            containers: {},
            constraints: '',
            hardware: 'arch=amd64 cores=1 cpu-power=138 mem=1700M root-disk=10240M availability-zone=europe-west1-b',
            jobs: [
              'JobHostUnits'
            ],
            hasVote: false,
            wantsVote: false,
            lxdProfiles: {}
          }
        },
        model: {
          name: 'testing',
          type: 'iaas',
          cloudTag: 'cloud-google',
          region: 'europe-west1',
          version: '2.4.5',
          availableVersion: '',
          modelStatus: {
            status: 'available',
            info: '',
            data: {},
            since: '2019-09-05T18:45:19.278579543Z',
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
        offers: {},
        relations: [
          {
            id: 0,
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
              since: '2018-11-13T14:37:36.669077154Z',
              kind: '',
              version: '',
              life: ''
            }
          },
          {
            id: 2,
            key: 'mediawiki:db mysql:db',
            'interface': 'mysql',
            scope: 'global',
            endpoints: [
              {
                application: 'mediawiki',
                name: 'db',
                role: 'requirer',
                subordinate: false
              },
              {
                application: 'mysql',
                name: 'db',
                role: 'provider',
                subordinate: false
              }
            ],
            status: {
              status: 'joined',
              info: '',
              data: {},
              since: '2018-11-13T14:37:24.849366573Z',
              kind: '',
              version: '',
              life: ''
            }
          }
        ],
        remoteApplications: {},
        uuid: '5f612488-b60b-4256-814a-ba1abaa7db23',
        info: {
          name: 'testing',
          type: 'iaas',
          uuid: '5f612488-b60b-4256-814a-ba1abaa7db23',
          controllerUuid: 'a030379a-940f-4760-8fcf-3062b41a04e7',
          providerType: 'gce',
          defaultSeries: 'bionic',
          cloudTag: 'cloud-google',
          cloudRegion: 'europe-west1',
          cloudCredentialTag: 'cloudcred-google_spaceman@external_clean-algebra-206308',
          ownerTag: 'user-spaceman@external',
          life: 'alive',
          status: {
            status: 'available',
            info: '',
            data: {},
            since: '2019-09-05T18:45:19.278Z'
          },
          users: [
            {
              user: 'activedev@external',
              displayName: '',
              lastConnection: '2019-10-28T21:59:46Z',
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
                availabilityZone: 'europe-west1-d'
              },
              instanceId: 'juju-a7db23-1',
              status: 'started'
            },
            {
              id: '2',
              hardware: {
                arch: 'amd64',
                mem: 1700,
                rootDisk: 10240,
                cores: 1,
                cpuPower: 138,
                tags: [],
                availabilityZone: 'europe-west1-b'
              },
              instanceId: 'juju-a7db23-2',
              status: 'started'
            },
            {
              id: '3',
              hardware: {
                arch: 'amd64',
                mem: 1700,
                rootDisk: 10240,
                cores: 1,
                cpuPower: 138,
                tags: [],
                availabilityZone: 'europe-west1-c'
              },
              instanceId: 'juju-a7db23-3',
              status: 'started'
            },
            {
              id: '4',
              hardware: {
                arch: 'amd64',
                mem: 1700,
                rootDisk: 10240,
                cores: 1,
                cpuPower: 138,
                tags: [],
                availabilityZone: 'europe-west1-b'
              },
              instanceId: 'juju-a7db23-4',
              status: 'started'
            }
          ],
          agentVersion: '2.4.5'
        }
      },
      '57650e3c-815f-4540-89df-81fd5d70b7ef': {
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
        machines: {},
        model: {
          name: 'group-test',
          type: 'iaas',
          cloudTag: 'cloud-google',
          region: 'us-central1',
          version: '2.6.8',
          availableVersion: '',
          modelStatus: {
            status: 'available',
            info: '',
            data: {},
            since: '2019-09-05T18:45:19.726966118Z',
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
        offers: {},
        relations: [
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
          }
        ],
        remoteApplications: {},
        uuid: '57650e3c-815f-4540-89df-81fd5d70b7ef',
        info: {
          name: 'group-test',
          type: '',
          uuid: '57650e3c-815f-4540-89df-81fd5d70b7ef',
          controllerUuid: 'a030379a-940f-4760-8fcf-3062b41a04e7',
          providerType: 'gce',
          defaultSeries: 'bionic',
          cloudTag: 'cloud-google',
          cloudRegion: 'us-central1',
          cloudCredentialTag: 'cloudcred-google_activedev@external_admin',
          ownerTag: 'user-activedev@external',
          life: 'alive',
          status: {
            status: 'available',
            info: '',
            data: {},
            since: '2019-09-05T18:45:19.726Z'
          },
          users: [
            {
              user: 'activedev@external',
              displayName: 'activedev',
              lastConnection: '2019-10-28T21:59:47Z',
              access: 'admin'
            },
            {
              user: 'design-it@external',
              displayName: '',
              lastConnection: '2019-10-28T16:54:39Z',
              access: 'read'
            }
          ],
          machines: [],
          agentVersion: '2.6.8'
        }
      },
      'e6782960-fb0b-460e-82a1-64ee03f9a39b': {
        applications: {
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
              since: '2019-10-03T13:46:03.467910559Z',
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
            canUpgradeTo: 'cs:trusty/kibana-22',
            subordinateTo: [],
            units: {
              'kibana/0': {
                agentStatus: {
                  status: 'idle',
                  info: '',
                  data: {},
                  since: '2019-10-03T13:57:14.983500189Z',
                  kind: '',
                  version: '2.6.8',
                  life: ''
                },
                workloadStatus: {
                  status: 'active',
                  info: 'ready',
                  data: {},
                  since: '2019-10-03T13:49:27.687502244Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadVersion: '',
                machine: '1',
                openedPorts: [
                  '80/tcp'
                ],
                publicAddress: '34.69.195.88',
                charm: '',
                subordinates: {},
                leader: true
              }
            },
            meterStatuses: {},
            status: {
              status: 'active',
              info: 'ready',
              data: {},
              since: '2019-10-03T13:49:27.687502244Z',
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
          }
        },
        machines: {
          '1': {
            agentStatus: {
              status: 'started',
              info: '',
              data: {},
              since: '2019-10-03T13:48:57.228293794Z',
              kind: '',
              version: '2.6.8',
              life: ''
            },
            instanceStatus: {
              status: 'running',
              info: 'RUNNING',
              data: {},
              since: '2019-10-03T13:46:20.301469659Z',
              kind: '',
              version: '',
              life: ''
            },
            dnsName: '34.69.195.88',
            ipAddresses: [
              '34.69.195.88',
              '10.128.0.2'
            ],
            instanceId: 'juju-f9a39b-1',
            series: 'trusty',
            id: '1',
            networkInterfaces: {
              eth0: {
                ipAddresses: [
                  '10.128.0.2'
                ],
                macAddress: '42:01:0a:80:00:02',
                gateway: '10.128.0.1',
                dnsNameservers: [],
                isUp: true
              }
            },
            containers: {},
            constraints: '',
            hardware: 'arch=amd64 cores=1 cpu-power=138 mem=1700M root-disk=10240M availability-zone=us-central1-a',
            jobs: [
              'JobHostUnits'
            ],
            hasVote: false,
            wantsVote: false,
            lxdProfiles: {}
          }
        },
        model: {
          name: 'new-search-aggregate',
          type: 'iaas',
          cloudTag: 'cloud-google',
          region: 'us-central1',
          version: '2.6.8',
          availableVersion: '',
          modelStatus: {
            status: 'available',
            info: '',
            data: {},
            since: '2019-10-03T13:45:58.932460259Z',
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
              status: 'joined',
              info: '',
              data: {},
              since: '2019-10-03T13:48:52.034003134Z',
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
              status: 'joined',
              info: '',
              data: {},
              since: '2019-10-03T13:48:51.928212956Z',
              kind: '',
              version: '',
              life: ''
            }
          }
        ],
        remoteApplications: {},
        uuid: 'e6782960-fb0b-460e-82a1-64ee03f9a39b',
        info: {
          name: 'new-search-aggregate',
          type: 'iaas',
          uuid: 'e6782960-fb0b-460e-82a1-64ee03f9a39b',
          controllerUuid: 'a030379a-940f-4760-8fcf-3062b41a04e7',
          providerType: 'gce',
          defaultSeries: 'bionic',
          cloudTag: 'cloud-google',
          cloudRegion: 'us-central1',
          cloudCredentialTag: 'cloudcred-google_activedev@external_jujuongce',
          ownerTag: 'user-activedev@external',
          life: 'alive',
          status: {
            status: 'available',
            info: '',
            data: {},
            since: '2019-10-03T13:45:58.932Z'
          },
          users: [
            {
              user: 'small-island@external',
              displayName: '',
              lastConnection: '2019-10-28T12:43:13Z',
              access: 'read'
            },
            {
              user: 'spaceman@external',
              displayName: '',
              lastConnection: '2019-10-28T17:18:17Z',
              access: 'read'
            },
            {
              user: 'activedev@external',
              displayName: 'activedev',
              lastConnection: '2019-10-28T21:59:48Z',
              access: 'admin'
            },
            {
              user: 'design-it@external',
              displayName: '',
              lastConnection: '2019-10-28T16:54:40Z',
              access: 'read'
            },
            {
              user: 'that-guy@external',
              displayName: '',
              lastConnection: '2019-10-27T22:15:05Z',
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
                availabilityZone: 'us-central1-a'
              },
              instanceId: 'juju-f9a39b-1',
              status: 'started'
            }
          ],
          agentVersion: '2.6.8'
        }
      },
      '2446d278-7928-4c50-811b-563e79acd991': {
        applications: {},
        machines: {},
        model: {
          name: 'test1',
          type: 'iaas',
          cloudTag: 'cloud-google',
          region: 'us-east1',
          version: '2.6.8',
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
        offers: {},
        relations: [],
        remoteApplications: {},
        uuid: '2446d278-7928-4c50-811b-563e79acd991',
        info: {
          name: 'test1',
          type: 'iaas',
          uuid: '2446d278-7928-4c50-811b-563e79acd991',
          controllerUuid: 'a030379a-940f-4760-8fcf-3062b41a04e7',
          providerType: 'gce',
          defaultSeries: 'bionic',
          cloudTag: 'cloud-google',
          cloudRegion: 'us-east1',
          cloudCredentialTag: 'cloudcred-google_activedev@external_juju',
          ownerTag: 'user-activedev@external',
          life: 'alive',
          status: {
            status: 'available',
            info: '',
            data: {},
            since: '2019-08-26T16:32:52.061Z'
          },
          users: [
            {
              user: 'activedev@external',
              displayName: 'activedev',
              lastConnection: '2019-10-28T21:59:48Z',
              access: 'admin'
            },
            {
              user: 'design-it@external',
              displayName: '',
              lastConnection: '2019-10-28T16:54:39Z',
              access: 'read'
            }
          ],
          machines: [],
          agentVersion: '2.6.8'
        }
      },
      '4b89852b-0633-4fae-8ba2-acf0261d4a03': {
        applications: {},
        machines: {},
        model: {
          name: 'test2',
          type: 'iaas',
          cloudTag: 'cloud-google',
          region: 'us-east1',
          version: '2.6.8',
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
        offers: {},
        relations: [],
        remoteApplications: {},
        uuid: '4b89852b-0633-4fae-8ba2-acf0261d4a03',
        info: {
          name: 'test2',
          type: 'iaas',
          uuid: '4b89852b-0633-4fae-8ba2-acf0261d4a03',
          controllerUuid: 'a030379a-940f-4760-8fcf-3062b41a04e7',
          providerType: 'gce',
          defaultSeries: 'bionic',
          cloudTag: 'cloud-google',
          cloudRegion: 'us-east1',
          cloudCredentialTag: 'cloudcred-google_activedev@external_juju',
          ownerTag: 'user-activedev@external',
          life: 'alive',
          status: {
            status: 'available',
            info: '',
            data: {},
            since: '2019-08-26T16:32:59.869Z'
          },
          users: [
            {
              user: 'activedev@external',
              displayName: 'activedev',
              lastConnection: '2019-10-28T21:59:48Z',
              access: 'admin'
            }
          ],
          machines: [],
          agentVersion: '2.6.8'
        }
      },
      '81887357-1c78-4ad6-8b89-4fb01ebec720': {
        applications: {},
        machines: {},
        model: {
          name: 'test3',
          type: 'iaas',
          cloudTag: 'cloud-google',
          region: 'us-east1',
          version: '2.6.8',
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
        offers: {},
        relations: [],
        remoteApplications: {},
        uuid: '81887357-1c78-4ad6-8b89-4fb01ebec720',
        info: {
          name: 'test3',
          type: 'iaas',
          uuid: '81887357-1c78-4ad6-8b89-4fb01ebec720',
          controllerUuid: 'a030379a-940f-4760-8fcf-3062b41a04e7',
          providerType: 'gce',
          defaultSeries: 'bionic',
          cloudTag: 'cloud-google',
          cloudRegion: 'us-east1',
          cloudCredentialTag: 'cloudcred-google_activedev@external_juju',
          ownerTag: 'user-activedev@external',
          life: 'alive',
          status: {
            status: 'available',
            info: '',
            data: {},
            since: '2019-08-26T16:33:07.803Z'
          },
          users: [
            {
              user: 'activedev@external',
              displayName: 'activedev',
              lastConnection: '2019-10-28T21:59:49Z',
              access: 'admin'
            }
          ],
          machines: [],
          agentVersion: '2.6.8'
        }
      },
      '06b11eb5-abd6-48f3-8910-b54cf5905e60': {
        applications: {
          grafana: {
            charm: 'cs:~prometheus-charmers/grafana-3',
            series: 'xenial',
            exposed: true,
            life: '',
            relations: {},
            canUpgradeTo: 'cs:~prometheus-charmers/grafana-36',
            subordinateTo: [],
            units: {
              'grafana/0': {
                agentStatus: {
                  status: 'idle',
                  info: '',
                  data: {},
                  since: '2019-09-05T21:19:11.128049274Z',
                  kind: '',
                  version: '2.6.8',
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
            canUpgradeTo: 'cs:haproxy-55',
            subordinateTo: [],
            units: {
              'haproxy/0': {
                agentStatus: {
                  status: 'executing',
                  info: 'running config-changed hook',
                  data: {},
                  since: '2019-09-05T21:51:53.56596084Z',
                  kind: '',
                  version: '2.6.8',
                  life: ''
                },
                workloadStatus: {
                  status: 'unknown',
                  info: '',
                  data: {},
                  since: '2017-03-09T20:41:42.239525442Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadVersion: '',
                machine: '1',
                openedPorts: [
                  '80/tcp'
                ],
                publicAddress: '104.196.135.3',
                charm: '',
                subordinates: {}
              }
            },
            meterStatuses: {},
            status: {
              status: 'unknown',
              info: '',
              data: {},
              since: '2017-03-09T20:41:42.239525442Z',
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
                  since: '2019-09-05T21:19:16.969051222Z',
                  kind: '',
                  version: '2.6.8',
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
        machines: {
          '1': {
            agentStatus: {
              status: 'started',
              info: '',
              data: {},
              since: '2019-09-05T21:55:33.052358552Z',
              kind: '',
              version: '2.6.8',
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
            dnsName: '104.196.135.3',
            ipAddresses: [
              '104.196.135.3',
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
              since: '2019-09-05T21:55:31.835014811Z',
              kind: '',
              version: '2.6.8',
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
              since: '2019-09-05T21:55:29.037784368Z',
              kind: '',
              version: '2.6.8',
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
        model: {
          name: 'all-kpi',
          type: 'iaas',
          cloudTag: 'cloud-google',
          region: 'us-east1',
          version: '2.6.8',
          availableVersion: '',
          modelStatus: {
            status: 'available',
            info: '',
            data: {},
            since: '2019-09-05T21:19:14.344233106Z',
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
              since: '2019-09-05T21:20:02.969834785Z',
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
              since: '2019-09-05T21:19:16.687005235Z',
              kind: '',
              version: '',
              life: ''
            }
          }
        ],
        remoteApplications: {},
        uuid: '06b11eb5-abd6-48f3-8910-b54cf5905e60',
        info: {
          name: 'all-kpi',
          type: '',
          uuid: '06b11eb5-abd6-48f3-8910-b54cf5905e60',
          controllerUuid: 'a030379a-940f-4760-8fcf-3062b41a04e7',
          providerType: 'gce',
          defaultSeries: 'xenial',
          cloudTag: 'cloud-google',
          cloudRegion: 'us-east1',
          cloudCredentialTag: 'cloudcred-google_alto@external_google-rickbot',
          ownerTag: 'user-alto@external',
          life: 'alive',
          status: {
            status: 'available',
            info: '',
            data: {},
            since: '2019-09-05T21:19:14.344Z'
          },
          users: [
            {
              user: 'activedev@external',
              displayName: '',
              lastConnection: '2019-10-28T21:59:49Z',
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
          agentVersion: '2.6.8'
        }
      },
      '4e8a5213-c34a-4ac9-83fa-1175165467d7': {
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
        model: {
          name: 'ci-website',
          type: 'iaas',
          cloudTag: 'cloud-google',
          region: 'us-east1',
          version: '2.4.7',
          availableVersion: '',
          modelStatus: {
            status: 'available',
            info: '',
            data: {},
            since: '2019-04-13T18:20:28.225413066Z',
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
        offers: {},
        relations: [],
        remoteApplications: {},
        uuid: '4e8a5213-c34a-4ac9-83fa-1175165467d7',
        info: {
          name: 'ci-website',
          type: '',
          uuid: '4e8a5213-c34a-4ac9-83fa-1175165467d7',
          controllerUuid: 'a030379a-940f-4760-8fcf-3062b41a04e7',
          providerType: 'gce',
          defaultSeries: 'xenial',
          cloudTag: 'cloud-google',
          cloudRegion: 'us-east1',
          cloudCredentialTag: 'cloudcred-google_uncle-phil@external_gce',
          ownerTag: 'user-uncle-phil@external',
          life: 'alive',
          status: {
            status: 'available',
            info: '',
            data: {},
            since: '2019-04-13T18:20:28.225Z'
          },
          users: [
            {
              user: 'activedev@external',
              displayName: '',
              lastConnection: '2019-10-28T21:59:50Z',
              access: 'admin'
            },
            {
              user: 'big-island@external',
              displayName: '',
              lastConnection: '2019-09-19T09:57:49Z',
              access: 'read'
            },
            {
              user: 'alto@external',
              displayName: '',
              lastConnection: '2018-06-07T15:14:33Z',
              access: 'admin'
            },
            {
              user: 'uncle-phil@external',
              displayName: 'uncle-phil',
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
        }
      },
      '227f7472-b508-4260-89eb-9fd360dddf5b': {
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
        model: {
          name: 'ci-different',
          type: 'iaas',
          cloudTag: 'cloud-google',
          region: 'us-east1',
          version: '2.5.4',
          availableVersion: '',
          modelStatus: {
            status: 'available',
            info: '',
            data: {},
            since: '2019-04-13T18:20:27.770196926Z',
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
        offers: {},
        relations: [],
        remoteApplications: {},
        uuid: '227f7472-b508-4260-89eb-9fd360dddf5b',
        info: {
          name: 'ci-different',
          type: '',
          uuid: '227f7472-b508-4260-89eb-9fd360dddf5b',
          controllerUuid: 'a030379a-940f-4760-8fcf-3062b41a04e7',
          providerType: 'gce',
          defaultSeries: 'xenial',
          cloudTag: 'cloud-google',
          cloudRegion: 'us-east1',
          cloudCredentialTag: 'cloudcred-google_uncle-phil@external_gce',
          ownerTag: 'user-uncle-phil@external',
          life: 'alive',
          status: {
            status: 'available',
            info: '',
            data: {},
            since: '2019-04-13T18:20:27.77Z'
          },
          users: [
            {
              user: 'activedev@external',
              displayName: '',
              lastConnection: '2019-10-28T21:59:50Z',
              access: 'admin'
            },
            {
              user: 'big-island@external',
              displayName: '',
              lastConnection: '2019-09-19T09:57:49Z',
              access: 'read'
            },
            {
              user: 'alto@external',
              displayName: '',
              lastConnection: '2018-06-07T15:14:33Z',
              access: 'admin'
            },
            {
              user: 'uncle-phil@external',
              displayName: 'uncle-phil',
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
        }
      },
      'e059c662-679f-4ab4-8a38-e5685aaed391': {
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
                  since: '2019-09-05T22:00:06.652059977Z',
                  kind: '',
                  version: '2.6.8',
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
                  since: '2019-09-28T16:27:25.098805073Z',
                  kind: '',
                  version: '2.6.8',
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
        machines: {
          '24': {
            agentStatus: {
              status: 'started',
              info: '',
              data: {},
              since: '2019-09-28T13:25:40.310211767Z',
              kind: '',
              version: '2.6.8',
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
              since: '2019-09-05T22:00:03.730318268Z',
              kind: '',
              version: '2.6.8',
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
                macAddress: 'fe:2e:e6:e9:40:39',
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
        model: {
          name: 'sales-dept',
          type: 'iaas',
          cloudTag: 'cloud-google',
          region: 'us-east1',
          version: '2.6.8',
          availableVersion: '',
          modelStatus: {
            status: 'available',
            info: '',
            data: {},
            since: '2019-04-13T20:37:44.426748762Z',
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
        offers: {},
        relations: [],
        remoteApplications: {},
        uuid: 'e059c662-679f-4ab4-8a38-e5685aaed391',
        info: {
          name: 'sales-dept',
          type: '',
          uuid: 'e059c662-679f-4ab4-8a38-e5685aaed391',
          controllerUuid: 'a030379a-940f-4760-8fcf-3062b41a04e7',
          providerType: 'gce',
          defaultSeries: 'xenial',
          cloudTag: 'cloud-google',
          cloudRegion: 'us-east1',
          cloudCredentialTag: 'cloudcred-google_uncle-phil@external_gce',
          ownerTag: 'user-uncle-phil@external',
          life: 'alive',
          status: {
            status: 'available',
            info: '',
            data: {},
            since: '2019-04-13T20:37:44.426Z'
          },
          users: [
            {
              user: 'activedev@external',
              displayName: '',
              lastConnection: '2019-10-28T21:59:50Z',
              access: 'admin'
            },
            {
              user: 'big-island@external',
              displayName: '',
              lastConnection: '2019-09-19T09:57:49Z',
              access: 'admin'
            },
            {
              user: 'uncle-phil@external',
              displayName: 'uncle-phil',
              lastConnection: '2019-09-26T11:52:21Z',
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
          agentVersion: '2.6.8'
        }
      },
      'f24f9b6b-4e54-4bc3-8e83-3becae851c24': {
        applications: {
          mysql: {
            charm: 'cs:mysql-58',
            series: 'zesty',
            exposed: false,
            life: '',
            relations: {
              cluster: [
                'mysql'
              ],
              db: [
                'wordpress'
              ]
            },
            canUpgradeTo: '',
            subordinateTo: [],
            units: {
              'mysql/0': {
                agentStatus: {
                  status: 'allocating',
                  info: '',
                  data: {},
                  since: '2019-10-02T18:16:25.27191485Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadStatus: {
                  status: 'waiting',
                  info: 'waiting for machine',
                  data: {},
                  since: '2019-10-02T18:16:25.27191485Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadVersion: '',
                machine: '1',
                openedPorts: [],
                publicAddress: '',
                charm: '',
                subordinates: {}
              }
            },
            meterStatuses: {},
            status: {
              status: 'waiting',
              info: 'waiting for machine',
              data: {},
              since: '2019-10-02T18:16:25.27191485Z',
              kind: '',
              version: '',
              life: ''
            },
            workloadVersion: '',
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
          },
          wordpress: {
            charm: 'cs:trusty/wordpress-5',
            series: 'trusty',
            exposed: false,
            life: '',
            relations: {
              db: [
                'mysql'
              ],
              loadbalancer: [
                'wordpress'
              ]
            },
            canUpgradeTo: '',
            subordinateTo: [],
            units: {
              'wordpress/0': {
                agentStatus: {
                  status: 'idle',
                  info: '',
                  data: {},
                  since: '2019-10-02T18:18:25.854711704Z',
                  kind: '',
                  version: '2.6.8',
                  life: ''
                },
                workloadStatus: {
                  status: 'active',
                  info: '',
                  data: {},
                  since: '2019-10-02T18:18:23.528020871Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadVersion: '',
                machine: '0',
                openedPorts: [
                  '80/tcp'
                ],
                publicAddress: '54.93.70.109',
                charm: '',
                subordinates: {},
                leader: true
              }
            },
            meterStatuses: {},
            status: {
              status: 'active',
              info: '',
              data: {},
              since: '2019-10-02T18:18:23.528020871Z',
              kind: '',
              version: '',
              life: ''
            },
            workloadVersion: '',
            charmVerion: '',
            endpointBindings: {
              cache: '',
              db: '',
              loadbalancer: '',
              nfs: '',
              website: ''
            },
            publicAddress: ''
          }
        },
        machines: {
          '0': {
            agentStatus: {
              status: 'started',
              info: '',
              data: {},
              since: '2019-10-02T18:17:39.422512562Z',
              kind: '',
              version: '2.6.8',
              life: ''
            },
            instanceStatus: {
              status: 'running',
              info: 'running',
              data: {},
              since: '2019-10-02T18:16:43.297615345Z',
              kind: '',
              version: '',
              life: ''
            },
            dnsName: '54.93.70.109',
            ipAddresses: [
              '54.93.70.109',
              '172.31.0.148'
            ],
            instanceId: 'i-03f7b3b663e53af18',
            series: 'trusty',
            id: '0',
            networkInterfaces: {
              eth0: {
                ipAddresses: [
                  '172.31.0.148'
                ],
                macAddress: '02:a4:92:c5:ea:28',
                gateway: '172.31.0.1',
                dnsNameservers: [],
                isUp: true
              }
            },
            containers: {},
            constraints: '',
            hardware: 'arch=amd64 cores=2 cpu-power=700 mem=1024M root-disk=8192M availability-zone=eu-central-1a',
            jobs: [
              'JobHostUnits'
            ],
            hasVote: false,
            wantsVote: false,
            lxdProfiles: {}
          },
          '1': {
            agentStatus: {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2019-10-02T18:16:27.906557984Z',
              kind: '',
              version: '',
              life: ''
            },
            instanceStatus: {
              status: 'provisioning error',
              info: 'no matching agent binaries available',
              data: {},
              since: '2019-10-02T18:16:27.906557984Z',
              kind: '',
              version: '',
              life: ''
            },
            dnsName: '',
            ipAddresses: [],
            instanceId: 'pending',
            series: 'zesty',
            id: '1',
            networkInterfaces: {},
            containers: {},
            constraints: '',
            hardware: '',
            jobs: [
              'JobHostUnits'
            ],
            hasVote: false,
            wantsVote: false,
            lxdProfiles: {}
          }
        },
        model: {
          name: 'ants-wordpress',
          type: 'iaas',
          cloudTag: 'cloud-aws',
          region: 'eu-central-1',
          version: '2.6.8',
          availableVersion: '',
          modelStatus: {
            status: 'available',
            info: '',
            data: {},
            since: '2019-10-02T18:16:21.513793859Z',
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
        offers: {},
        relations: [
          {
            id: 0,
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
              status: 'joining',
              info: '',
              data: {},
              since: '2019-10-02T18:16:24.755448976Z',
              kind: '',
              version: '',
              life: ''
            }
          },
          {
            id: 2,
            key: 'wordpress:db mysql:db',
            'interface': 'mysql',
            scope: 'global',
            endpoints: [
              {
                application: 'mysql',
                name: 'db',
                role: 'provider',
                subordinate: false
              },
              {
                application: 'wordpress',
                name: 'db',
                role: 'requirer',
                subordinate: false
              }
            ],
            status: {
              status: 'joined',
              info: '',
              data: {},
              since: '2019-10-02T18:18:25.793346773Z',
              kind: '',
              version: '',
              life: ''
            }
          },
          {
            id: 1,
            key: 'wordpress:loadbalancer',
            'interface': 'reversenginx',
            scope: 'global',
            endpoints: [
              {
                application: 'wordpress',
                name: 'loadbalancer',
                role: 'peer',
                subordinate: false
              }
            ],
            status: {
              status: 'joined',
              info: '',
              data: {},
              since: '2019-10-02T18:18:25.564872902Z',
              kind: '',
              version: '',
              life: ''
            }
          }
        ],
        remoteApplications: {},
        uuid: 'f24f9b6b-4e54-4bc3-8e83-3becae851c24',
        info: {
          name: 'ants-wordpress',
          type: 'iaas',
          uuid: 'f24f9b6b-4e54-4bc3-8e83-3becae851c24',
          controllerUuid: 'a030379a-940f-4760-8fcf-3062b41a04e7',
          providerType: 'ec2',
          defaultSeries: 'bionic',
          cloudTag: 'cloud-aws',
          cloudRegion: 'eu-central-1',
          cloudCredentialTag: 'cloudcred-aws_that-guy@external_personal',
          ownerTag: 'user-that-guy@external',
          life: 'alive',
          status: {
            status: 'available',
            info: '',
            data: {},
            since: '2019-10-02T18:16:21.513Z'
          },
          users: [
            {
              user: 'activedev@external',
              displayName: '',
              lastConnection: '2019-10-28T21:59:51Z',
              access: 'read'
            }
          ],
          machines: [
            {
              id: '0',
              hardware: {
                arch: 'amd64',
                mem: 1024,
                rootDisk: 8192,
                cores: 2,
                cpuPower: 700,
                tags: [],
                availabilityZone: 'eu-central-1a'
              },
              instanceId: 'i-03f7b3b663e53af18',
              status: 'started'
            },
            {
              id: '1',
              status: 'error'
            }
          ],
          agentVersion: '2.6.8'
        }
      },
      '8f86503e-f79f-49ef-8ed9-3a6ea5b280e7': {
        applications: {
          elasticsearch: {
            charm: 'cs:elasticsearch-37',
            series: 'bionic',
            exposed: false,
            life: '',
            relations: {
              peer: [
                'elasticsearch'
              ]
            },
            canUpgradeTo: 'cs:elasticsearch-39',
            subordinateTo: [],
            units: {
              'elasticsearch/0': {
                agentStatus: {
                  status: 'idle',
                  info: '',
                  data: {},
                  since: '2019-09-06T00:48:46.58371569Z',
                  kind: '',
                  version: '2.6.8',
                  life: ''
                },
                workloadStatus: {
                  status: 'blocked',
                  info: 'elasticsearch service not running',
                  data: {},
                  since: '2019-09-06T00:53:08.031130015Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                workloadVersion: '',
                machine: '0',
                openedPorts: [
                  '9200/tcp'
                ],
                publicAddress: '52.59.204.2',
                charm: '',
                subordinates: {},
                leader: true
              }
            },
            meterStatuses: {},
            status: {
              status: 'blocked',
              info: 'elasticsearch service not running',
              data: {},
              since: '2019-09-06T00:53:08.031130015Z',
              kind: '',
              version: '',
              life: ''
            },
            workloadVersion: '',
            charmVerion: 'a77cd02',
            endpointBindings: {
              client: '',
              data: '',
              logs: '',
              'nrpe-external-master': '',
              peer: ''
            },
            publicAddress: ''
          }
        },
        machines: {
          '0': {
            agentStatus: {
              status: 'started',
              info: '',
              data: {},
              since: '2019-09-10T23:11:18.771905307Z',
              kind: '',
              version: '2.6.8',
              life: ''
            },
            instanceStatus: {
              status: 'running',
              info: 'running',
              data: {},
              since: '2019-08-15T13:28:27.084497253Z',
              kind: '',
              version: '',
              life: ''
            },
            dnsName: '52.59.204.2',
            ipAddresses: [
              '52.59.204.2',
              '172.31.2.248',
              '252.2.248.1'
            ],
            instanceId: 'i-02861ca6dd9841aae',
            series: 'bionic',
            id: '0',
            networkInterfaces: {
              ens5: {
                ipAddresses: [
                  '172.31.2.248'
                ],
                macAddress: '02:9b:28:05:a7:6e',
                gateway: '172.31.0.1',
                dnsNameservers: [],
                isUp: true
              },
              'fan-252': {
                ipAddresses: [
                  '252.2.248.1'
                ],
                macAddress: 'da:8d:ad:96:d4:0a',
                dnsNameservers: [],
                isUp: true
              }
            },
            containers: {},
            constraints: '',
            hardware: 'arch=amd64 cores=2 cpu-power=200 mem=1024M root-disk=8192M availability-zone=eu-central-1a',
            jobs: [
              'JobHostUnits'
            ],
            hasVote: false,
            wantsVote: false,
            lxdProfiles: {}
          }
        },
        model: {
          name: 'bionic-model',
          type: 'iaas',
          cloudTag: 'cloud-aws',
          region: 'eu-central-1',
          version: '2.6.8',
          availableVersion: '',
          modelStatus: {
            status: 'available',
            info: '',
            data: {},
            since: '2019-09-06T00:48:32.452286447Z',
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
              status: 'joined',
              info: '',
              data: {},
              since: '2019-09-06T00:48:33.185567921Z',
              kind: '',
              version: '',
              life: ''
            }
          }
        ],
        remoteApplications: {},
        uuid: '8f86503e-f79f-49ef-8ed9-3a6ea5b280e7',
        info: {
          name: 'bionic-model',
          type: 'iaas',
          uuid: '8f86503e-f79f-49ef-8ed9-3a6ea5b280e7',
          controllerUuid: 'a030379a-940f-4760-8fcf-3062b41a04e7',
          providerType: 'ec2',
          defaultSeries: 'bionic',
          cloudTag: 'cloud-aws',
          cloudRegion: 'eu-central-1',
          cloudCredentialTag: 'cloudcred-aws_that-guy@external_personal',
          ownerTag: 'user-that-guy@external',
          life: 'alive',
          status: {
            status: 'available',
            info: '',
            data: {},
            since: '2019-09-06T00:48:32.452Z'
          },
          users: [
            {
              user: 'activedev@external',
              displayName: '',
              lastConnection: '2019-10-28T21:59:51Z',
              access: 'read'
            }
          ],
          machines: [
            {
              id: '0',
              hardware: {
                arch: 'amd64',
                mem: 1024,
                rootDisk: 8192,
                cores: 2,
                cpuPower: 200,
                tags: [],
                availabilityZone: 'eu-central-1a'
              },
              instanceId: 'i-02861ca6dd9841aae',
              status: 'started'
            }
          ],
          agentVersion: '2.6.8'
        }
      }
    }
  }
}
