/* eslint-disable */
// Internally consistent mock data.
// When generating additional mock data make sure that it's internally consistent
// across the top level keys.

export default {
  root: {
    config: {
      controllerAPIEndpoint: 'wss://jimm.jujucharms.com/api',
      baseAppURL: '/',
      identityProviderAvailable: true,
      isJuju: false,
      showWebCLI: false
    },
    appVersion: '0.4.0',
    bakery: {
      storage: {
        _store: {
          'https://api.staging.jujucharms.com/identity': 'W3siYyI6W3sJpZCB1c3NvU9aTmVmWHlzIn1d',
          identity: 'W3siYyI6W3siaSaWRlbnRpdWRnpGQVpCV3BTcDRWLUl1UzF1SzgifV0=',
          'https://api.jujucharms.com/identity': 'W3siYyI6W3siaSI6InRpbWUtYcDRWLUl1UzF1SzgifV0='
        },
        _services: {},
        _charmstoreCookieSetter: null
      },
      _dischargeDisabled: false
    },
    controllerConnections: {
      'wss://jimm.jujucharms.com/api': {
        controllerTag: 'controller-a030379a-940f-4760-8fcf-3062b41a04e7',
        serverVersion: '2.8.3',
        user: {
          'display-name': 'eggman',
          identity: 'user-eggman@external',
          'controller-access': '',
          'model-access': ''
        }
      }
    },
    jujus: {
      'wss://jimm.jujucharms.com/api': {
        _transport: {
          _ws: {},
          _counter: 20,
          _callbacks: {},
          _debug: false
        },
        _facades: [
          null,
          null,
          null,
          null,
          null,
          null,
          null
        ],
        _bakery: {
          storage: {
            _store: {
              'https://api.staging.jujucharms.com/identity': 'W3siYyI6W3siaSI6InRpFh1NWtPNHdNY2paeGd3MU9aTmVmWHlzIn1d',
              identity: 'W3siYyI6W3siaSI6InRpbCV3BTcDRWLUl1UzF1SzgifV0=',
              'https://api.jujucharms.com/identity': 'W3siYyI6W3siaSI6InRpbWUGQVpCV3BTcDRWLUl1UzF1SzgifV0='
            },
            _services: {},
            _charmstoreCookieSetter: null
          },
          _dischargeDisabled: false
        },
        _admin: {
          version: 3,
          _transport: {
            _ws: {},
            _counter: 20,
            _callbacks: {},
            _debug: false
          },
          _info: {}
        }
      }
    },
    pingerIntervalIds: {
      'wss://jimm.jujucharms.com/api': 18
    }
  },
  juju: {
    models: {
      '84e872ff-9171-46be-829b-70f0ffake18d': {
        lastConnection: null,
        name: 'sub-test',
        ownerTag: 'user-eggman@external',
        type: 'iaas',
        uuid: '84e872ff-9171-46be-829b-70f0ffake18d'
      },
      '348932aa-ac01-46d5-862b-d50fakee5fb7': {
        name: 'october',
        ownerTag: 'user-island@external',
        type: 'iaas',
        uuid: '348932aa-ac01-46d5-862b-d50fakee5fb7'
      },
      '19b56b55-6373-4286-8c19-957fakee8469': {
        name: 'test-model',
        ownerTag: 'user-island@external',
        type: '',
        uuid: '19b56b55-6373-4286-8c19-957fakee8469'
      },
      'e1e81a64-3385-4779-8643-05e3d5fake23': {
        name: 'canonical-kubernetes',
        ownerTag: 'user-pizza@external',
        type: '',
        uuid: 'e1e81a64-3385-4779-8643-05e3d5fake23'
      },
      '2f995dee-392e-4459-8eb9-839c5fake0af': {
        name: 'hadoopspark',
        ownerTag: 'user-pizza@external',
        type: 'iaas',
        uuid: '2f995dee-392e-4459-8eb9-839c5fake0af'
      },
      '7ffe956a-06ac-4ae9-8aac-04ebafakeda5': {
        name: 'mymodel',
        ownerTag: 'user-pizza@external',
        type: '',
        uuid: '7ffe956a-06ac-4ae9-8aac-04ebafakeda5'
      },
      'd291b9ed-1e66-4023-84fe-57130e1fake2': {
        name: 'mymodel4',
        ownerTag: 'user-pizza@external',
        type: '',
        uuid: 'd291b9ed-1e66-4023-84fe-57130e1fake2'
      },
      '5f612488-b60b-4256-814a-ba1fake7db23': {
        name: 'testing',
        ownerTag: 'user-pizza@external',
        type: 'iaas',
        uuid: '5f612488-b60b-4256-814a-ba1fake7db23'
      },
      'fb7f06ff-2144-4be3-86c9-6fe44fake1b9': {
        name: 'all-unplaced',
        ownerTag: 'user-eggman@external',
        type: 'iaas',
        uuid: 'fb7f06ff-2144-4be3-86c9-6fe44fake1b9'
      },
      'eb211d71-d838-4e7f-8828-8cb5fake217e': {
        name: 'foo',
        ownerTag: 'user-eggman@external',
        type: 'iaas',
        uuid: 'eb211d71-d838-4e7f-8828-8cb5fake217e'
      },
      '57650e3c-815f-4540-89df-81fdfakeb7ef': {
        name: 'group-test',
        ownerTag: 'user-eggman@external',
        type: '',
        uuid: '57650e3c-815f-4540-89df-81fdfakeb7ef'
      },
      'c2d8a696-e2eb-4021-8ab0-12220fake62a': {
        name: 'local-test',
        ownerTag: 'user-eggman@external',
        type: 'iaas',
        uuid: 'c2d8a696-e2eb-4021-8ab0-12220fake62a'
      },
      'e6782960-fb0b-460e-82a1-64eefakea39b': {
        name: 'new-search-aggregate',
        ownerTag: 'user-eggman@external',
        type: 'iaas',
        uuid: 'e6782960-fb0b-460e-82a1-64eefakea39b'
      },
      '2446d278-7928-4c50-811b-563efaked991': {
        name: 'test1',
        ownerTag: 'user-eggman@external',
        type: 'iaas',
        uuid: '2446d278-7928-4c50-811b-563efaked991'
      },
      '930f4bb0-070a-462a-8d4e-19d97fake8f2': {
        name: 'unplaced',
        ownerTag: 'user-eggman@external',
        type: 'iaas',
        uuid: '930f4bb0-070a-462a-8d4e-19d97fake8f2'
      },
      '06b11eb5-abd6-48f3-8910-b54cfake5e60': {
        name: 'juju-kpi',
        ownerTag: 'user-bike@external',
        type: '',
        uuid: '06b11eb5-abd6-48f3-8910-b54cfake5e60'
      }
    },
    modelData: {
      '84e872ff-9171-46be-829b-70f0ffake18d': {
        applications: {
          easyrsa: {
            charm: 'cs:~containers/easyrsa-278',
            series: 'bionic',
            exposed: false,
            life: '',
            relations: {},
            'can-upgrade-to': '',
            'subordinate-to': [],
            units: {
              'easyrsa/0': {
                'agent-status': {
                  status: 'idle',
                  info: '',
                  data: {},
                  since: '2019-11-14T16:38:42.074180277Z',
                  kind: '',
                  version: '2.6.10',
                  life: ''
                },
                'workload-status': {
                  status: 'active',
                  info: 'Certificate Authority ready.',
                  data: {},
                  since: '2019-11-14T16:38:37.241246008Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-version': '3.0.1',
                machine: '1',
                'opened-ports': [],
                'public-address': '35.229.83.62',
                charm: '',
                subordinates: {},
                leader: true
              }
            },
            'meter-statuses': {},
            status: {
              status: 'active',
              info: 'Certificate Authority ready.',
              data: {},
              since: '2019-11-14T16:38:37.241246008Z',
              kind: '',
              version: '',
              life: ''
            },
            'workload-version': '3.0.1',
            'charm-version': '7af705f',
            'endpoint-bindings': {
              client: ''
            },
            'public-address': ''
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
            'can-upgrade-to': '',
            'subordinate-to': [
              'ubuntu'
            ],
            units: {},
            'meter-statuses': {},
            status: {
              status: 'active',
              info: 'ready',
              data: {},
              since: '2019-11-13T17:04:53.389764415Z',
              kind: '',
              version: '',
              life: ''
            },
            'workload-version': '',
            'charm-version': 'cs-nrpe-charmers-nrpe-27-62-g8cecde4',
            'endpoint-bindings': {
              'general-info': '',
              'local-monitors': '',
              monitors: '',
              nrpe: '',
              'nrpe-external-master': ''
            },
            'public-address': ''
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
            'can-upgrade-to': '',
            'subordinate-to': [
              'ubuntu'
            ],
            units: {},
            'meter-statuses': {},
            status: {
              status: 'active',
              info: 'Monitoring ubuntu/0',
              data: {},
              since: '2019-11-12T23:56:43.76306511Z',
              kind: '',
              version: '',
              life: ''
            },
            'workload-version': '',
            'charm-version': 'e58f7f4',
            'endpoint-bindings': {
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
            'public-address': ''
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
            'can-upgrade-to': '',
            'subordinate-to': [],
            units: {
              'ubuntu/0': {
                'agent-status': {
                  status: 'idle',
                  info: '',
                  data: {},
                  since: '2019-11-12T23:55:51.517470008Z',
                  kind: '',
                  version: '2.6.10',
                  life: ''
                },
                'workload-status': {
                  status: 'active',
                  info: 'ready',
                  data: {},
                  since: '2019-11-12T23:55:50.148650881Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-version': '18.04',
                machine: '0',
                'opened-ports': [],
                'public-address': '35.243.128.238',
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
            'meter-statuses': {},
            status: {
              status: 'active',
              info: 'ready',
              data: {},
              since: '2019-11-12T23:55:50.148650881Z',
              kind: '',
              version: '',
              life: ''
            },
            'workload-version': '18.04',
            'charm-version': '',
            'endpoint-bindings': {},
            'public-address': ''
          }
        },
        machines: {
          '0': {
            'agent-status': {
              status: 'started',
              info: '',
              data: {},
              since: '2019-11-12T23:54:50.340907719Z',
              kind: '',
              version: '2.6.10',
              life: ''
            },
            'instance-status': {
              status: 'running',
              info: 'RUNNING',
              data: {},
              since: '2019-11-12T23:52:50.021261161Z',
              kind: '',
              version: '',
              life: ''
            },
            'dns-name': '35.243.128.238',
            'ip-addresses': [
              '35.243.128.238',
              '10.142.0.17',
              '252.1.16.1'
            ],
            'instance-id': 'juju-9cb18d-0',
            series: 'bionic',
            id: '0',
            'network-interfaces': {
              ens4: {
                'ip-addresses': [
                  '10.142.0.17'
                ],
                'mac-address': '42:01:0a:8e:00:11',
                gateway: '10.142.0.1',
                'is-up': true
              },
              'fan-252': {
                'ip-addresses': [
                  '252.1.16.1'
                ],
                'mac-address': 'a2:a2:53:31:db:9a',
                'is-up': true
              }
            },
            containers: {},
            constraints: '',
            hardware: 'arch=amd64 cores=1 cpu-power=138 mem=1700M root-disk=10240M availability-zone=us-east1-b',
            jobs: [
              'JobHostUnits'
            ],
            'has-vote': false,
            'wants-vote': false,
            'lxd-profiles': {}
          },
          '1': {
            'agent-status': {
              status: 'started',
              info: '',
              data: {},
              since: '2019-11-14T16:37:22.404294662Z',
              kind: '',
              version: '2.6.10',
              life: ''
            },
            'instance-status': {
              status: 'running',
              info: 'RUNNING',
              data: {},
              since: '2019-11-14T16:36:04.680894233Z',
              kind: '',
              version: '',
              life: ''
            },
            'dns-name': '35.229.83.62',
            'ip-addresses': [
              '35.229.83.62',
              '10.142.0.18',
              '252.1.32.1'
            ],
            'instance-id': 'juju-9cb18d-1',
            series: 'bionic',
            id: '1',
            'network-interfaces': {
              ens4: {
                'ip-addresses': [
                  '10.142.0.18'
                ],
                'mac-address': '42:01:0a:8e:00:12',
                gateway: '10.142.0.1',
                'is-up': true
              },
              'fan-252': {
                'ip-addresses': [
                  '252.1.32.1'
                ],
                'mac-address': 'ea:17:cc:17:52:fa',
                'is-up': true
              }
            },
            containers: {},
            constraints: '',
            hardware: 'arch=amd64 cores=1 cpu-power=138 mem=1700M root-disk=10240M availability-zone=us-east1-c',
            jobs: [
              'JobHostUnits'
            ],
            'has-vote': false,
            'wants-vote': false,
            'lxd-profiles': {}
          }
        },
        model: {
          name: 'sub-test',
          type: 'iaas',
          'cloud-tag': 'cloud-google',
          region: 'us-east1',
          version: '2.6.10',
          'available-version': '',
          'model-status': {
            status: 'available',
            info: '',
            data: {},
            since: '2019-11-12T23:49:17.148832532Z',
            kind: '',
            version: '',
            life: ''
          },
          'meter-status': {
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
        uuid: '84e872ff-9171-46be-829b-70f0ffake18d',
        info: {
          name: 'sub-test',
          type: 'iaas',
          uuid: '84e872ff-9171-46be-829b-70f0ffake18d',
          'controller-uuid': 'a030379a-940f-4760-8fcf-3062b41a04e7',
          'provider-type': 'gce',
          'default-series': 'bionic',
          'cloud-tag': 'cloud-google',
          'cloud-region': 'us-east1',
          'cloud-credential-tag': 'cloudcred-google_eggman@external_juju',
          'owner-tag': 'user-eggman@external',
          life: 'alive',
          status: {
            status: 'available',
            info: '',
            data: {},
            since: '2019-11-12T23:49:17.148Z'
          },
          users: [
            {
              user: 'user-eggman@external',
              'display-name': 'eggman',
              'last-connection': '2019-11-15T18:31:36Z',
              access: 'admin'
            },
            {
              user: 'design-it@external',
              'display-name': '',
              'last-connection': '2019-11-15T17:19:35Z',
              access: 'read'
            },
          ],
          machines: [
            {
              id: '0',
              hardware: {
                arch: 'amd64',
                mem: 1700,
                'root-disk': 10240,
                cores: 1,
                'cpu-power': 138,
                tags: [],
                'availability-zone': 'us-east1-b'
              },
              'instance-id': 'juju-9cb18d-0',
              status: 'started'
            },
            {
              id: '1',
              hardware: {
                arch: 'amd64',
                mem: 1700,
                'root-disk': 10240,
                cores: 1,
                'cpu-power': 138,
                tags: [],
                'availability-zone': 'us-east1-c'
              },
              'instance-id': 'juju-9cb18d-1',
              status: 'started'
            }
          ],
          'agent-version': '2.6.10'
        }
      },
      '19b56b55-6373-4286-8c19-957fakee8469': {
        annotations: {
          kibana: {
            'gui-x': '300',
            'gui-y': '300'
          }
        },
        applications: {
          kibana: {
            'charm-verion': '',
            charm: 'cs:trusty/kibana-15',
            series: 'trusty',
            exposed: false,
            life: '',
            relations: {},
            'can-upgrade-to': 'cs:trusty/kibana-19',
            'subordinate-to': [],
            units: {
              'kibana/0': {
                'agent-status': {
                  status: 'lost',
                  info: 'agent is not communicating with the server',
                  data: {},
                  since: '2018-01-08T03:08:31.292857537Z',
                  kind: '',
                  version: '2.2.6',
                  life: ''
                },
                'workload-status': {
                  status: 'unknown',
                  info: 'agent lost, see \'juju show-status-log kibana/0\'',
                  data: {},
                  since: '2017-12-11T14:45:41.336193748Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-version': '',
                machine: '0',
                'opened-ports': [
                  '80/tcp'
                ],
                'public-address': '45.188.149.21',
                charm: '',
                subordinates: null
              }
            },
            'meter-statuses': null,
            status: {
              status: 'blocked',
              info: 'waiting for relation to elasticsearch',
              data: {},
              since: '2017-12-11T14:45:41.336193748Z',
              kind: '',
              version: '',
              life: ''
            },
            'workload-version': '',
            'charm-version': '',
            'charm-profile': '',
            'endpoint-bindings': {
              '': 'alpha',
              rest: 'alpha',
              web: 'alpha'
            },
            'public-address': ''
          }
        },
        machines: {
          '0': {
            'agent-status': {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2018-01-07T17:00:12.014123408Z',
              kind: '',
              version: '2.2.6',
              life: ''
            },
            'instance-status': {
              status: 'running',
              info: 'RUNNING',
              data: {},
              since: '2017-12-11T14:44:11.955519375Z',
              kind: '',
              version: '',
              life: ''
            },
            'modification-status': {
              status: 'idle',
              info: '',
              data: {},
              since: '2019-05-02T04:57:41.707463421Z',
              kind: '',
              version: '',
              life: ''
            },
            'dns-name': '45.188.149.21',
            'ip-addresses': [
              '45.188.149.21',
              '10.128.0.2'
            ],
            'instance-id': 'juju-1e8469-0',
            'display-name': '',
            series: 'trusty',
            id: '0',
            'network-interfaces': {
              eth0: {
                'ip-addresses': [
                  '10.128.0.2'
                ],
                'mac-address': '42:01:0a:80:00:02',
                'is-up': true
              }
            },
            containers: {},
            constraints: '',
            hardware: 'arch=amd64 cores=1 cpu-power=138 mem=1700M root-disk=10240M availability-zone=us-central1-a',
            jobs: [
              'JobHostUnits'
            ],
            'has-vote': false,
            'wants-vote': false
          }
        },
        model: {
          name: 'test-model',
          type: 'iaas',
          'cloud-tag': 'cloud-google',
          region: 'us-central1',
          version: '2.2.6',
          'available-version': '',
          'model-status': {
            status: 'suspended',
            info: 'suspended since cloud credential is not valid',
            data: null,
            since: null,
            kind: '',
            version: '',
            life: ''
          },
          'meter-status': {
            color: '',
            message: ''
          },
          sla: 'unsupported'
        },
        offers: {},
        relations: null,
        uuid: '19b56b55-6373-4286-8c19-957fakee8469',
        info: {
          name: 'test-model',
          type: '',
          uuid: '19b56b55-6373-4286-8c19-957fakee8469',
          'controller-uuid': 'a030379a-940f-4760-8fcf-3062b41a04e7',
          'is-controller': false,
          'provider-type': 'gce',
          'default-series': 'xenial',
          'cloud-tag': 'cloud-google',
          'cloud-region': 'us-central1',
          'cloud-credential-tag': 'cloudcred-google_island@external_juju-test-185311',
          'owner-tag': 'user-island@external',
          life: 'alive',
          status: {
            status: 'available',
            info: '',
            since: '2019-02-25T08:54:04.872Z'
          },
          users: [
            {
              user: 'eggman@external',
              'display-name': '',
              'last-connection': '2020-11-19T18:44:35Z',
              access: 'read'
            }
          ],
          machines: [
            {
              id: '0',
              hardware: {
                arch: 'amd64',
                mem: 1700,
                'root-disk': 10240,
                cores: 1,
                'cpu-power': 138,
                'availability-zone': 'us-central1-a'
              },
              'instance-id': 'juju-1e8469-0',
              status: 'started'
            },
            {
              id: '0',
              hardware: {
                arch: 'amd64',
                mem: 1700,
                'root-disk': 10240,
                cores: 1,
                'cpu-power': 138,
                'availability-zone': 'us-central1-a'
              },
              'instance-id': 'juju-1e8469-0',
              status: 'started'
            }
          ],
          sla: null,
          'agent-version': '2.2.6'
        }
      },
      'e1e81a64-3385-4779-8643-05e3d5fake23': {
        annotations: {
          easyrsa: {
            'bundle-url': 'canonical-kubernetes/bundle',
            'gui-x': '-391.7386269569397',
            'gui-y': '383.9496307373047'
          },
          etcd: {
            'bundle-url': 'canonical-kubernetes/bundle',
            'gui-x': '316.3976135253906',
            'gui-y': '284.4418029785156'
          },
          flannel: {
            'bundle-url': 'canonical-kubernetes/bundle',
            'gui-x': '-376.8861770629883',
            'gui-y': '702.9707641601562'
          },
          'kubeapi-load-balancer': {
            'bundle-url': 'canonical-kubernetes/bundle',
            'gui-x': '-466.9883270263672',
            'gui-y': '-139.48319232463837'
          },
          'kubernetes-master': {
            'bundle-url': 'canonical-kubernetes/bundle',
            'gui-x': '-415.7405090332031',
            'gui-y': '1033.4071655273438'
          },
          'kubernetes-worker': {
            'bundle-url': 'canonical-kubernetes/bundle',
            'gui-x': '-1052.6283960342407',
            'gui-y': '974.5890502929688'
          }
        },
        applications: {
          easyrsa: {
            'charm-verion': '',
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
            'can-upgrade-to': 'cs:~containers/easyrsa-333',
            'subordinate-to': [],
            units: {
              'easyrsa/0': {
                'agent-status': {
                  status: 'allocating',
                  info: '',
                  data: {},
                  since: '2018-08-03T14:57:11.486692945Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-status': {
                  status: 'waiting',
                  info: 'waiting for machine',
                  data: {},
                  since: '2018-08-03T14:57:11.486692945Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-version': '',
                machine: '0',
                'opened-ports': null,
                'public-address': '',
                charm: '',
                subordinates: null
              }
            },
            'meter-statuses': null,
            status: {
              status: 'waiting',
              info: 'waiting for machine',
              data: {},
              since: '2018-08-03T14:57:11.486692945Z',
              kind: '',
              version: '',
              life: ''
            },
            'workload-version': '',
            'charm-version': '',
            'charm-profile': '',
            'endpoint-bindings': {
              '': 'alpha',
              client: 'alpha'
            },
            'public-address': ''
          },
          etcd: {
            'charm-verion': '',
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
            'can-upgrade-to': 'cs:~containers/etcd-540',
            'subordinate-to': [],
            units: {
              'etcd/0': {
                'agent-status': {
                  status: 'allocating',
                  info: '',
                  data: {},
                  since: '2018-08-03T14:57:11.492815459Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-status': {
                  status: 'waiting',
                  info: 'waiting for machine',
                  data: {},
                  since: '2018-08-03T14:57:11.492815459Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-version': '',
                machine: '3',
                'opened-ports': null,
                'public-address': '',
                charm: '',
                subordinates: null
              },
              'etcd/1': {
                'agent-status': {
                  status: 'allocating',
                  info: '',
                  data: {},
                  since: '2018-08-03T14:57:11.494089863Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-status': {
                  status: 'waiting',
                  info: 'waiting for machine',
                  data: {},
                  since: '2018-08-03T14:57:11.494089863Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-version': '',
                machine: '1',
                'opened-ports': null,
                'public-address': '',
                charm: '',
                subordinates: null
              },
              'etcd/2': {
                'agent-status': {
                  status: 'allocating',
                  info: '',
                  data: {},
                  since: '2018-08-03T14:57:11.500554837Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-status': {
                  status: 'waiting',
                  info: 'waiting for machine',
                  data: {},
                  since: '2018-08-03T14:57:11.500554837Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-version': '',
                machine: '2',
                'opened-ports': null,
                'public-address': '',
                charm: '',
                subordinates: null
              }
            },
            'meter-statuses': null,
            status: {
              status: 'waiting',
              info: 'waiting for machine',
              data: {},
              since: '2018-08-03T14:57:11.492815459Z',
              kind: '',
              version: '',
              life: ''
            },
            'workload-version': '',
            'charm-version': '',
            'charm-profile': '',
            'endpoint-bindings': {
              '': 'alpha',
              certificates: 'alpha',
              cluster: 'alpha',
              db: 'alpha',
              'nrpe-external-master': 'alpha',
              proxy: 'alpha'
            },
            'public-address': ''
          },
          flannel: {
            'charm-verion': '',
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
            'can-upgrade-to': '',
            'subordinate-to': [
              'kubernetes-master',
              'kubernetes-worker'
            ],
            units: null,
            'meter-statuses': null,
            status: {
              status: 'unknown',
              info: '',
              data: null,
              since: '2018-08-03T14:57:10.647465036Z',
              kind: '',
              version: '',
              life: ''
            },
            'workload-version': '',
            'charm-version': '',
            'charm-profile': '',
            'endpoint-bindings': {
              '': 'alpha',
              cni: 'alpha',
              etcd: 'alpha',
              'nrpe-external-master': 'alpha'
            },
            'public-address': ''
          },
          'kubeapi-load-balancer': {
            'charm-verion': '',
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
            'can-upgrade-to': 'cs:~containers/kubeapi-load-balancer-747',
            'subordinate-to': [],
            units: {
              'kubeapi-load-balancer/0': {
                'agent-status': {
                  status: 'allocating',
                  info: '',
                  data: {},
                  since: '2018-08-03T14:57:10.684642938Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-status': {
                  status: 'waiting',
                  info: 'waiting for machine',
                  data: {},
                  since: '2018-08-03T14:57:10.684642938Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-version': '',
                machine: '4',
                'opened-ports': null,
                'public-address': '',
                charm: '',
                subordinates: null
              }
            },
            'meter-statuses': null,
            status: {
              status: 'waiting',
              info: 'waiting for machine',
              data: {},
              since: '2018-08-03T14:57:10.684642938Z',
              kind: '',
              version: '',
              life: ''
            },
            'workload-version': '',
            'charm-version': '',
            'charm-profile': '',
            'endpoint-bindings': {
              '': 'alpha',
              apiserver: 'alpha',
              certificates: 'alpha',
              loadbalancer: 'alpha',
              'nrpe-external-master': 'alpha',
              website: 'alpha'
            },
            'public-address': ''
          },
          'kubernetes-master': {
            'charm-verion': '',
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
            'can-upgrade-to': 'cs:~containers/kubernetes-master-891',
            'subordinate-to': [],
            units: {
              'kubernetes-master/0': {
                'agent-status': {
                  status: 'allocating',
                  info: '',
                  data: {},
                  since: '2018-08-03T14:57:11.495349493Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-status': {
                  status: 'waiting',
                  info: 'waiting for machine',
                  data: {},
                  since: '2018-08-03T14:57:11.495349493Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-version': '',
                machine: '6',
                'opened-ports': null,
                'public-address': '',
                charm: '',
                subordinates: null
              },
              'kubernetes-master/1': {
                'agent-status': {
                  status: 'allocating',
                  info: '',
                  data: {},
                  since: '2018-08-03T14:57:11.495630036Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-status': {
                  status: 'waiting',
                  info: 'waiting for machine',
                  data: {},
                  since: '2018-08-03T14:57:11.495630036Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-version': '',
                machine: '5',
                'opened-ports': null,
                'public-address': '',
                charm: '',
                subordinates: null
              }
            },
            'meter-statuses': null,
            status: {
              status: 'waiting',
              info: 'waiting for machine',
              data: {},
              since: '2018-08-03T14:57:11.495349493Z',
              kind: '',
              version: '',
              life: ''
            },
            'workload-version': '',
            'charm-version': '',
            'charm-profile': '',
            'endpoint-bindings': {
              '': 'alpha',
              aws: 'alpha',
              'ceph-storage': 'alpha',
              certificates: 'alpha',
              'cluster-dns': 'alpha',
              cni: 'alpha',
              etcd: 'alpha',
              gcp: 'alpha',
              'kube-api-endpoint': 'alpha',
              'kube-control': 'alpha',
              loadbalancer: 'alpha',
              'nrpe-external-master': 'alpha',
              openstack: 'alpha'
            },
            'public-address': ''
          },
          'kubernetes-worker': {
            'charm-verion': '',
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
            'can-upgrade-to': 'cs:~containers/kubernetes-worker-704',
            'subordinate-to': [],
            units: {
              'kubernetes-worker/0': {
                'agent-status': {
                  status: 'allocating',
                  info: '',
                  data: {},
                  since: '2018-08-03T14:57:11.498056728Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-status': {
                  status: 'waiting',
                  info: 'waiting for machine',
                  data: {},
                  since: '2018-08-03T14:57:11.498056728Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-version': '',
                machine: '7',
                'opened-ports': null,
                'public-address': '',
                charm: '',
                subordinates: null
              },
              'kubernetes-worker/1': {
                'agent-status': {
                  status: 'allocating',
                  info: '',
                  data: {},
                  since: '2018-08-03T14:57:11.49892526Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-status': {
                  status: 'waiting',
                  info: 'waiting for machine',
                  data: {},
                  since: '2018-08-03T14:57:11.49892526Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-version': '',
                machine: '9',
                'opened-ports': null,
                'public-address': '',
                charm: '',
                subordinates: null
              },
              'kubernetes-worker/2': {
                'agent-status': {
                  status: 'allocating',
                  info: '',
                  data: {},
                  since: '2018-08-03T14:57:11.498056731Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-status': {
                  status: 'waiting',
                  info: 'waiting for machine',
                  data: {},
                  since: '2018-08-03T14:57:11.498056731Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-version': '',
                machine: '8',
                'opened-ports': null,
                'public-address': '',
                charm: '',
                subordinates: null
              }
            },
            'meter-statuses': null,
            status: {
              status: 'waiting',
              info: 'waiting for machine',
              data: {},
              since: '2018-08-03T14:57:11.498056728Z',
              kind: '',
              version: '',
              life: ''
            },
            'workload-version': '',
            'charm-version': '',
            'charm-profile': '',
            'endpoint-bindings': {
              '': 'alpha',
              aws: 'alpha',
              certificates: 'alpha',
              cni: 'alpha',
              dockerhost: 'alpha',
              gcp: 'alpha',
              'kube-api-endpoint': 'alpha',
              'kube-control': 'alpha',
              'kube-dns': 'alpha',
              nfs: 'alpha',
              'nrpe-external-master': 'alpha',
              openstack: 'alpha',
              'sdn-plugin': 'alpha'
            },
            'public-address': ''
          }
        },
        machines: {
          '0': {
            'agent-status': {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2018-08-03T15:04:03.342533231Z',
              kind: '',
              version: '',
              life: ''
            },
            'instance-status': {
              status: 'provisioning error',
              info: 'googleapi: Error 403: Project clean-algebra-206308 cannot accept requests to insert while in an inactive billing state.  Billing state may take several minutes to update., inactiveBillingState',
              data: {},
              since: '2018-08-03T15:04:03.342533231Z',
              kind: '',
              version: '',
              life: ''
            },
            'modification-status': {
              status: 'idle',
              info: '',
              data: {},
              since: '2019-05-02T04:57:41.707463421Z',
              kind: '',
              version: '',
              life: ''
            },
            'dns-name': '',
            'instance-id': 'pending',
            'display-name': '',
            series: 'xenial',
            id: '0',
            containers: {},
            constraints: '',
            hardware: '',
            jobs: [
              'JobHostUnits'
            ],
            'has-vote': false,
            'wants-vote': false
          },
          '1': {
            'agent-status': {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2018-08-03T15:10:57.825720441Z',
              kind: '',
              version: '',
              life: ''
            },
            'instance-status': {
              status: 'provisioning error',
              info: 'googleapi: Error 403: Project clean-algebra-206308 cannot accept requests to insert while in an inactive billing state.  Billing state may take several minutes to update., inactiveBillingState',
              data: {},
              since: '2018-08-03T15:10:57.825720441Z',
              kind: '',
              version: '',
              life: ''
            },
            'modification-status': {
              status: 'idle',
              info: '',
              data: {},
              since: '2019-05-02T04:57:41.707463421Z',
              kind: '',
              version: '',
              life: ''
            },
            'dns-name': '',
            'instance-id': 'pending',
            'display-name': '',
            series: 'xenial',
            id: '1',
            containers: {},
            constraints: '',
            hardware: '',
            jobs: [
              'JobHostUnits'
            ],
            'has-vote': false,
            'wants-vote': false
          },
          '2': {
            'agent-status': {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2018-08-03T15:24:46.395695414Z',
              kind: '',
              version: '',
              life: ''
            },
            'instance-status': {
              status: 'provisioning error',
              info: 'googleapi: Error 403: Project clean-algebra-206308 cannot accept requests to insert while in an inactive billing state.  Billing state may take several minutes to update., inactiveBillingState',
              data: {},
              since: '2018-08-03T15:24:46.395695414Z',
              kind: '',
              version: '',
              life: ''
            },
            'modification-status': {
              status: 'idle',
              info: '',
              data: {},
              since: '2019-05-02T04:57:41.707463421Z',
              kind: '',
              version: '',
              life: ''
            },
            'dns-name': '',
            'instance-id': 'pending',
            'display-name': '',
            series: 'xenial',
            id: '2',
            containers: {},
            constraints: '',
            hardware: '',
            jobs: [
              'JobHostUnits'
            ],
            'has-vote': false,
            'wants-vote': false
          },
          '3': {
            'agent-status': {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2018-08-03T15:17:51.995921268Z',
              kind: '',
              version: '',
              life: ''
            },
            'instance-status': {
              status: 'provisioning error',
              info: 'googleapi: Error 403: Project clean-algebra-206308 cannot accept requests to insert while in an inactive billing state.  Billing state may take several minutes to update., inactiveBillingState',
              data: {},
              since: '2018-08-03T15:17:51.995921268Z',
              kind: '',
              version: '',
              life: ''
            },
            'modification-status': {
              status: 'idle',
              info: '',
              data: {},
              since: '2019-05-02T04:57:41.707463421Z',
              kind: '',
              version: '',
              life: ''
            },
            'dns-name': '',
            'instance-id': 'pending',
            'display-name': '',
            series: 'xenial',
            id: '3',
            containers: {},
            constraints: '',
            hardware: '',
            jobs: [
              'JobHostUnits'
            ],
            'has-vote': false,
            'wants-vote': false
          },
          '4': {
            'agent-status': {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2018-08-03T15:25:02.214233178Z',
              kind: '',
              version: '',
              life: ''
            },
            'instance-status': {
              status: 'provisioning error',
              info: 'googleapi: Error 403: Project clean-algebra-206308 cannot accept requests to insert while in an inactive billing state.  Billing state may take several minutes to update., inactiveBillingState',
              data: {},
              since: '2018-08-03T15:25:02.214233178Z',
              kind: '',
              version: '',
              life: ''
            },
            'modification-status': {
              status: 'idle',
              info: '',
              data: {},
              since: '2019-05-02T04:57:41.707463421Z',
              kind: '',
              version: '',
              life: ''
            },
            'dns-name': '',
            'instance-id': 'pending',
            'display-name': '',
            series: 'xenial',
            id: '4',
            containers: {},
            constraints: '',
            hardware: '',
            jobs: [
              'JobHostUnits'
            ],
            'has-vote': false,
            'wants-vote': false
          },
          '5': {
            'agent-status': {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2018-08-03T15:24:46.123788547Z',
              kind: '',
              version: '',
              life: ''
            },
            'instance-status': {
              status: 'provisioning error',
              info: 'googleapi: Error 403: Project clean-algebra-206308 cannot accept requests to insert while in an inactive billing state.  Billing state may take several minutes to update., inactiveBillingState',
              data: {},
              since: '2018-08-03T15:24:46.123788547Z',
              kind: '',
              version: '',
              life: ''
            },
            'modification-status': {
              status: 'idle',
              info: '',
              data: {},
              since: '2019-05-02T04:57:41.707463421Z',
              kind: '',
              version: '',
              life: ''
            },
            'dns-name': '',
            'instance-id': 'pending',
            'display-name': '',
            series: 'xenial',
            id: '5',
            containers: {},
            constraints: '',
            hardware: '',
            jobs: [
              'JobHostUnits'
            ],
            'has-vote': false,
            'wants-vote': false
          },
          '6': {
            'agent-status': {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2018-08-03T15:24:46.085797114Z',
              kind: '',
              version: '',
              life: ''
            },
            'instance-status': {
              status: 'provisioning error',
              info: 'googleapi: Error 403: Project clean-algebra-206308 cannot accept requests to insert while in an inactive billing state.  Billing state may take several minutes to update., inactiveBillingState',
              data: {},
              since: '2018-08-03T15:24:46.085797114Z',
              kind: '',
              version: '',
              life: ''
            },
            'modification-status': {
              status: 'idle',
              info: '',
              data: {},
              since: '2019-05-02T04:57:41.707463421Z',
              kind: '',
              version: '',
              life: ''
            },
            'dns-name': '',
            'instance-id': 'pending',
            'display-name': '',
            series: 'xenial',
            id: '6',
            containers: {},
            constraints: '',
            hardware: '',
            jobs: [
              'JobHostUnits'
            ],
            'has-vote': false,
            'wants-vote': false
          },
          '7': {
            'agent-status': {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2018-08-03T15:24:45.91922474Z',
              kind: '',
              version: '',
              life: ''
            },
            'instance-status': {
              status: 'provisioning error',
              info: 'googleapi: Error 403: Project clean-algebra-206308 cannot accept requests to insert while in an inactive billing state.  Billing state may take several minutes to update., inactiveBillingState',
              data: {},
              since: '2018-08-03T15:24:45.91922474Z',
              kind: '',
              version: '',
              life: ''
            },
            'modification-status': {
              status: 'idle',
              info: '',
              data: {},
              since: '2019-05-02T04:57:41.707463421Z',
              kind: '',
              version: '',
              life: ''
            },
            'dns-name': '',
            'instance-id': 'pending',
            'display-name': '',
            series: 'xenial',
            id: '7',
            containers: {},
            constraints: '',
            hardware: '',
            jobs: [
              'JobHostUnits'
            ],
            'has-vote': false,
            'wants-vote': false
          },
          '8': {
            'agent-status': {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2018-08-03T15:24:46.062722784Z',
              kind: '',
              version: '',
              life: ''
            },
            'instance-status': {
              status: 'provisioning error',
              info: 'googleapi: Error 403: Project clean-algebra-206308 cannot accept requests to insert while in an inactive billing state.  Billing state may take several minutes to update., inactiveBillingState',
              data: {},
              since: '2018-08-03T15:24:46.062722784Z',
              kind: '',
              version: '',
              life: ''
            },
            'modification-status': {
              status: 'idle',
              info: '',
              data: {},
              since: '2019-05-02T04:57:41.707463421Z',
              kind: '',
              version: '',
              life: ''
            },
            'dns-name': '',
            'instance-id': 'pending',
            'display-name': '',
            series: 'xenial',
            id: '8',
            containers: {},
            constraints: '',
            hardware: '',
            jobs: [
              'JobHostUnits'
            ],
            'has-vote': false,
            'wants-vote': false
          },
          '9': {
            'agent-status': {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2018-08-03T15:24:46.276077785Z',
              kind: '',
              version: '',
              life: ''
            },
            'instance-status': {
              status: 'provisioning error',
              info: 'googleapi: Error 403: Project clean-algebra-206308 cannot accept requests to insert while in an inactive billing state.  Billing state may take several minutes to update., inactiveBillingState',
              data: {},
              since: '2018-08-03T15:24:46.276077785Z',
              kind: '',
              version: '',
              life: ''
            },
            'modification-status': {
              status: 'idle',
              info: '',
              data: {},
              since: '2019-05-02T04:57:41.707463421Z',
              kind: '',
              version: '',
              life: ''
            },
            'dns-name': '',
            'instance-id': 'pending',
            'display-name': '',
            series: 'xenial',
            id: '9',
            containers: {},
            constraints: '',
            hardware: '',
            jobs: [
              'JobHostUnits'
            ],
            'has-vote': false,
            'wants-vote': false
          }
        },
        model: {
          name: 'canonical-kubernetes',
          type: 'iaas',
          'cloud-tag': 'cloud-google',
          region: 'us-central1',
          version: '2.3.8',
          'available-version': '',
          'model-status': {
            status: 'available',
            info: '',
            data: {},
            since: '2020-10-05T08:53:11.003406707Z',
            kind: '',
            version: '',
            life: ''
          },
          'meter-status': {
            color: '',
            message: ''
          },
          sla: 'unsupported'
        },
        offers: {},
        relations: [],
        uuid: 'e1e81a64-3385-4779-8643-05e3d5fake23',
        info: {
          name: 'canonical-kubernetes',
          type: '',
          uuid: 'e1e81a64-3385-4779-8643-05e3d5fake23',
          'controller-uuid': 'a030379a-940f-4760-8fcf-3062b41a04e7',
          'is-controller': false,
          'provider-type': 'gce',
          'default-series': 'xenial',
          'cloud-tag': 'cloud-google',
          'cloud-region': 'us-central1',
          'cloud-credential-tag': 'cloudcred-google_pizza@external_clean-algebra-206308',
          'owner-tag': 'user-pizza@external',
          life: 'alive',
          status: {
            status: 'available',
            info: '',
            since: '2020-10-05T08:53:11.003Z'
          },
          users: [
            {
              user: 'eggman@external',
              'display-name': '',
              'last-connection': '2020-11-19T18:44:35Z',
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
          sla: null,
          'agent-version': '2.3.8'
        }
      },
      '348932aa-ac01-46d5-862b-d50fakee5fb7': {
        annotations: {},
        applications: {
          db: {
            'charm-verion': '',
            charm: 'cs:mysql-58',
            series: 'xenial',
            exposed: false,
            life: '',
            relations: {
              cluster: [
                'db'
              ],
              db: [
                'wordpress'
              ]
            },
            'can-upgrade-to': '',
            'subordinate-to': [],
            units: {
              'db/0': {
                'agent-status': {
                  status: 'idle',
                  info: '',
                  data: {},
                  since: '2020-10-08T18:55:42.08864909Z',
                  kind: '',
                  version: '2.8.3',
                  life: ''
                },
                'workload-status': {
                  status: 'active',
                  info: 'Ready',
                  data: {},
                  since: '2020-10-08T18:55:36.452228674Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-version': '5.7.31',
                machine: '1',
                'opened-ports': [
                  '3306/tcp'
                ],
                'public-address': '54.74.35.39',
                charm: '',
                subordinates: null,
                leader: true
              }
            },
            'meter-statuses': null,
            status: {
              status: 'active',
              info: 'Ready',
              data: {},
              since: '2020-10-08T18:55:36.452228674Z',
              kind: '',
              version: '',
              life: ''
            },
            'workload-version': '5.7.31',
            'charm-version': '',
            'charm-profile': '',
            'endpoint-bindings': {
              '': 'alpha',
              ceph: 'alpha',
              cluster: 'alpha',
              data: 'alpha',
              db: 'alpha',
              'db-admin': 'alpha',
              ha: 'alpha',
              'local-monitors': 'alpha',
              master: 'alpha',
              monitors: 'alpha',
              munin: 'alpha',
              'nrpe-external-master': 'alpha',
              'shared-db': 'alpha',
              slave: 'alpha'
            },
            'public-address': ''
          },
          wordpress: {
            'charm-verion': '90d781c',
            charm: 'cs:wordpress-0',
            series: 'bionic',
            exposed: true,
            life: '',
            relations: {
              db: [
                'db'
              ],
              loadbalancer: [
                'wordpress'
              ]
            },
            'can-upgrade-to': '',
            'subordinate-to': [],
            units: {
              'wordpress/0': {
                'agent-status': {
                  status: 'idle',
                  info: '',
                  data: {},
                  since: '2020-11-17T10:06:58.89242454Z',
                  kind: '',
                  version: '2.8.3',
                  life: ''
                },
                'workload-status': {
                  status: 'active',
                  info: '',
                  data: {},
                  since: '2020-10-08T18:56:19.212599437Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-version': '',
                machine: '0',
                'opened-ports': [
                  '80/tcp'
                ],
                'public-address': '34.244.188.119',
                charm: '',
                subordinates: null,
                leader: true
              }
            },
            'meter-statuses': null,
            status: {
              status: 'active',
              info: '',
              data: {},
              since: '2020-10-08T18:56:19.212599437Z',
              kind: '',
              version: '',
              life: ''
            },
            'workload-version': '',
            'charm-version': '90d781c',
            'charm-profile': '',
            'endpoint-bindings': {
              '': 'alpha',
              cache: 'alpha',
              db: 'alpha',
              loadbalancer: 'alpha',
              nfs: 'alpha',
              website: 'alpha'
            },
            'public-address': ''
          }
        },
        machines: {
          '0': {
            'agent-status': {
              status: 'started',
              info: '',
              data: {},
              since: '2020-11-17T10:06:58.434321383Z',
              kind: '',
              version: '2.8.3',
              life: ''
            },
            'instance-status': {
              status: 'running',
              info: 'running',
              data: {},
              since: '2020-10-08T18:52:49.072104727Z',
              kind: '',
              version: '',
              life: ''
            },
            'modification-status': {
              status: 'idle',
              info: '',
              data: {},
              since: '2020-10-08T18:52:23.746127293Z',
              kind: '',
              version: '',
              life: ''
            },
            'dns-name': '34.244.188.119',
            'ip-addresses': [
              '34.244.188.119',
              '172.31.33.26',
              '252.33.26.1'
            ],
            'instance-id': 'i-017cb0cc36ef1b9ae',
            'display-name': '',
            series: 'bionic',
            id: '0',
            'network-interfaces': {
              ens5: {
                'ip-addresses': [
                  '172.31.33.26'
                ],
                'mac-address': '0a:fb:5b:ba:97:35',
                gateway: '172.31.32.1',
                space: 'alpha',
                'is-up': true
              },
              'fan-252': {
                'ip-addresses': [
                  '252.33.26.1'
                ],
                'mac-address': 'fa:eb:43:a9:d1:34',
                space: 'alpha',
                'is-up': true
              }
            },
            containers: {},
            constraints: '',
            hardware: 'arch=amd64 cores=2 cpu-power=700 mem=1024M root-disk=8192M availability-zone=eu-west-1a',
            jobs: [
              'JobHostUnits'
            ],
            'has-vote': false,
            'wants-vote': false
          },
          '1': {
            'agent-status': {
              status: 'started',
              info: '',
              data: {},
              since: '2020-10-08T18:54:40.636763525Z',
              kind: '',
              version: '2.8.3',
              life: ''
            },
            'instance-status': {
              status: 'running',
              info: 'running',
              data: {},
              since: '2020-10-08T18:53:32.780967838Z',
              kind: '',
              version: '',
              life: ''
            },
            'modification-status': {
              status: 'idle',
              info: '',
              data: {},
              since: '2020-10-08T18:53:07.729749109Z',
              kind: '',
              version: '',
              life: ''
            },
            'dns-name': '54.74.35.39',
            'ip-addresses': [
              '54.74.35.39',
              '172.31.10.61',
              '252.10.61.1'
            ],
            'instance-id': 'i-0a047ba153766f994',
            'display-name': '',
            series: 'xenial',
            id: '1',
            'network-interfaces': {
              ens5: {
                'ip-addresses': [
                  '172.31.10.61'
                ],
                'mac-address': '02:fb:42:39:17:53',
                gateway: '172.31.0.1',
                space: 'alpha',
                'is-up': true
              },
              'fan-252': {
                'ip-addresses': [
                  '252.10.61.1'
                ],
                'mac-address': 'ce:04:b1:db:6b:21',
                space: 'alpha',
                'is-up': true
              }
            },
            containers: {},
            constraints: '',
            hardware: 'arch=amd64 cores=2 cpu-power=700 mem=1024M root-disk=8192M availability-zone=eu-west-1b',
            jobs: [
              'JobHostUnits'
            ],
            'has-vote': false,
            'wants-vote': false
          }
        },
        model: {
          name: 'october',
          type: 'iaas',
          'cloud-tag': 'cloud-aws',
          region: 'eu-west-1',
          version: '2.8.3',
          'available-version': '',
          'model-status': {
            status: 'available',
            info: '',
            data: {},
            since: '2020-10-08T18:48:53.757155063Z',
            kind: '',
            version: '',
            life: ''
          },
          'meter-status': {
            color: '',
            message: ''
          },
          sla: 'unsupported'
        },
        offers: {},
        relations: [
          {
            id: 0,
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
              since: '2020-11-17T10:06:58.350536124Z',
              kind: '',
              version: '',
              life: ''
            }
          },
          {
            id: 2,
            key: 'wordpress:db db:db',
            'interface': 'mysql',
            scope: 'global',
            endpoints: [
              {
                application: 'wordpress',
                name: 'db',
                role: 'requirer',
                subordinate: false
              },
              {
                application: 'db',
                name: 'db',
                role: 'provider',
                subordinate: false
              }
            ],
            status: {
              status: 'joined',
              info: '',
              data: {},
              since: '2020-11-17T10:06:58.21839989Z',
              kind: '',
              version: '',
              life: ''
            }
          },
          {
            id: 1,
            key: 'db:cluster',
            'interface': 'mysql-ha',
            scope: 'global',
            endpoints: [
              {
                application: 'db',
                name: 'cluster',
                role: 'peer',
                subordinate: false
              }
            ],
            status: {
              status: 'joined',
              info: '',
              data: {},
              since: '2020-10-08T18:55:16.036112994Z',
              kind: '',
              version: '',
              life: ''
            }
          }
        ],
        uuid: '348932aa-ac01-46d5-862b-d50fakee5fb7',
        info: {
          name: 'october',
          type: 'iaas',
          uuid: '348932aa-ac01-46d5-862b-d50fakee5fb7',
          'controller-uuid': 'a030379a-940f-4760-8fcf-3062b41a04e7',
          'is-controller': false,
          'provider-type': 'ec2',
          'default-series': 'bionic',
          'cloud-tag': 'cloud-aws',
          'cloud-region': 'eu-west-1',
          'cloud-credential-tag': 'cloudcred-aws_island@external_canonical-island',
          'owner-tag': 'user-island@external',
          life: 'alive',
          status: {
            status: 'available',
            info: '',
            since: '2020-10-08T18:48:53.757Z'
          },
          users: [
            {
              user: 'island@external',
              'display-name': 'island',
              'last-connection': '2020-11-19T16:45:13Z',
              access: 'admin'
            },
            {
              user: 'eggman@external',
              'display-name': '',
              'last-connection': '2020-11-19T18:44:35Z',
              access: 'admin'
            }
          ],
          machines: [
            {
              id: '0',
              hardware: {
                arch: 'amd64',
                mem: 1024,
                'root-disk': 8192,
                cores: 2,
                'cpu-power': 700,
                'availability-zone': 'eu-west-1a'
              },
              'instance-id': 'i-017cb0cc36ef1b9ae',
              status: 'started'
            },
            {
              id: '1',
              hardware: {
                arch: 'amd64',
                mem: 1024,
                'root-disk': 8192,
                cores: 2,
                'cpu-power': 700,
                'availability-zone': 'eu-west-1b'
              },
              'instance-id': 'i-0a047ba153766f994',
              status: 'started'
            }
          ],
          sla: null,
          'agent-version': '2.8.3'
        }
      },
      '2f995dee-392e-4459-8eb9-839c5fake0af': {
        annotations: {
          client: {
            bundleURL: 'hadoop-spark/bundle/63',
            'gui-x': '1250',
            'gui-y': '400'
          },
          failtester: {
            'gui-x': '1402.9388427734375',
            'gui-y': '740.81396484375'
          },
          ganglia: {
            bundleURL: 'hadoop-spark/bundle/63',
            'gui-x': '-232.57443284988403',
            'gui-y': '659.3654174804688'
          },
          'ganglia-node': {
            bundleURL: 'hadoop-spark/bundle/63',
            'gui-x': '252.667724609375',
            'gui-y': '224.1339111328125'
          },
          namenode: {
            bundleURL: 'hadoop-spark/bundle/63',
            'gui-x': '371.9180908203125',
            'gui-y': '917.3829956054688'
          },
          plugin: {
            bundleURL: 'hadoop-spark/bundle/63',
            'gui-x': '1000',
            'gui-y': '400'
          },
          resourcemanager: {
            bundleURL: 'hadoop-spark/bundle/63',
            'gui-x': '438.13909912109375',
            'gui-y': '-94.50727272033691'
          },
          rsyslog: {
            bundleURL: 'hadoop-spark/bundle/63',
            'gui-x': '1126.958251953125',
            'gui-y': '675.0570068359375'
          },
          'rsyslog-forwarder-ha': {
            bundleURL: 'hadoop-spark/bundle/63',
            'gui-x': '660.6805419921875',
            'gui-y': '466.98480224609375'
          },
          slave: {
            bundleURL: 'hadoop-spark/bundle/63',
            'gui-x': '-286.65693283081055',
            'gui-y': '286.1037902832031'
          },
          spark: {
            bundleURL: 'hadoop-spark/bundle/63',
            'gui-x': '928.4779052734375',
            'gui-y': '-153.2616786956787'
          }
        },
        applications: {
          client: {
            'charm-verion': '',
            charm: 'cs:hadoop-client-12',
            series: 'xenial',
            exposed: false,
            life: '',
            relations: {
              hadoop: [
                'plugin'
              ]
            },
            'can-upgrade-to': '',
            'subordinate-to': [],
            units: {
              'client/0': {
                'agent-status': {
                  status: 'allocating',
                  info: '',
                  data: {},
                  since: '2019-05-02T08:50:01.599306854Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-status': {
                  status: 'waiting',
                  info: 'waiting for machine',
                  data: {},
                  since: '2019-05-02T08:50:01.599306854Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-version': '',
                machine: '3',
                'opened-ports': null,
                'public-address': '',
                charm: '',
                subordinates: null
              }
            },
            'meter-statuses': null,
            status: {
              status: 'waiting',
              info: 'waiting for machine',
              data: {},
              since: '2019-05-02T08:50:01.599306854Z',
              kind: '',
              version: '',
              life: ''
            },
            'workload-version': '',
            'charm-version': '',
            'charm-profile': '',
            'endpoint-bindings': {
              '': 'alpha',
              giraph: 'alpha',
              hadoop: 'alpha',
              java: 'alpha',
              mahout: 'alpha'
            },
            'public-address': ''
          },
          failtester: {
            'charm-verion': '',
            charm: 'cs:~hatch/precise/failtester-7',
            series: 'precise',
            exposed: false,
            life: '',
            relations: {
              loopback: [
                'failtester'
              ]
            },
            'can-upgrade-to': '',
            'subordinate-to': [],
            units: {
              'failtester/0': {
                'agent-status': {
                  status: 'allocating',
                  info: '',
                  data: {},
                  since: '2019-05-08T15:44:26.445558131Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-status': {
                  status: 'waiting',
                  info: 'waiting for machine',
                  data: {},
                  since: '2019-05-08T15:44:26.445558131Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-version': '',
                machine: '5',
                'opened-ports': null,
                'public-address': '',
                charm: '',
                subordinates: null
              }
            },
            'meter-statuses': null,
            status: {
              status: 'waiting',
              info: 'waiting for machine',
              data: {},
              since: '2019-05-08T15:44:26.445558131Z',
              kind: '',
              version: '',
              life: ''
            },
            'workload-version': '',
            'charm-version': '',
            'charm-profile': '',
            'endpoint-bindings': {
              '': 'alpha',
              loopback: 'alpha',
              'prov-reltest': 'alpha',
              'req-reltest': 'alpha'
            },
            'public-address': ''
          },
          ganglia: {
            'charm-verion': '',
            charm: 'cs:ganglia-12',
            series: 'xenial',
            exposed: false,
            life: '',
            relations: {
              node: [
                'ganglia-node'
              ]
            },
            'can-upgrade-to': '',
            'subordinate-to': [],
            units: {
              'ganglia/0': {
                'agent-status': {
                  status: 'allocating',
                  info: '',
                  data: {},
                  since: '2019-05-02T08:50:01.583101402Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-status': {
                  status: 'waiting',
                  info: 'waiting for machine',
                  data: {},
                  since: '2019-05-02T08:50:01.583101402Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-version': '',
                machine: '3',
                'opened-ports': null,
                'public-address': '',
                charm: '',
                subordinates: null
              }
            },
            'meter-statuses': null,
            status: {
              status: 'waiting',
              info: 'waiting for machine',
              data: {},
              since: '2019-05-02T08:50:01.583101402Z',
              kind: '',
              version: '',
              life: ''
            },
            'workload-version': '',
            'charm-version': '',
            'charm-profile': '',
            'endpoint-bindings': {
              '': 'alpha',
              'ganglia-node': 'alpha',
              head: 'alpha',
              master: 'alpha',
              node: 'alpha',
              website: 'alpha'
            },
            'public-address': ''
          },
          'ganglia-node': {
            'charm-verion': '',
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
            'can-upgrade-to': '',
            'subordinate-to': [
              'namenode',
              'resourcemanager',
              'slave'
            ],
            units: null,
            'meter-statuses': null,
            status: {
              status: 'active',
              info: 'Unit is ready',
              data: {},
              since: '2019-05-02T08:53:08.746921025Z',
              kind: '',
              version: '',
              life: ''
            },
            'workload-version': '3.6.0',
            'charm-version': '',
            'charm-profile': '',
            'endpoint-bindings': {
              '': 'alpha',
              'juju-info': 'alpha',
              node: 'alpha'
            },
            'public-address': ''
          },
          namenode: {
            'charm-verion': '',
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
            'can-upgrade-to': '',
            'subordinate-to': [],
            units: {
              'namenode/0': {
                'agent-status': {
                  status: 'allocating',
                  info: '',
                  data: {},
                  since: '2019-05-02T08:50:02.392134936Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-status': {
                  status: 'waiting',
                  info: 'waiting for machine',
                  data: {},
                  since: '2019-05-02T08:50:02.392134936Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-version': '',
                machine: '2',
                'opened-ports': null,
                'public-address': '',
                charm: '',
                subordinates: null
              }
            },
            'meter-statuses': null,
            status: {
              status: 'waiting',
              info: 'waiting for machine',
              data: {},
              since: '2019-05-02T08:50:02.392134936Z',
              kind: '',
              version: '',
              life: ''
            },
            'workload-version': '',
            'charm-version': '',
            'charm-profile': '',
            'endpoint-bindings': {
              '': 'alpha',
              benchmark: 'alpha',
              datanode: 'alpha',
              java: 'alpha',
              namenode: 'alpha'
            },
            'public-address': ''
          },
          plugin: {
            'charm-verion': '',
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
            'can-upgrade-to': '',
            'subordinate-to': [
              'client',
              'spark'
            ],
            units: null,
            'meter-statuses': null,
            status: {
              status: 'unknown',
              info: '',
              data: null,
              since: '2019-05-02T08:50:01.593105388Z',
              kind: '',
              version: '',
              life: ''
            },
            'workload-version': '',
            'charm-version': '',
            'charm-profile': '',
            'endpoint-bindings': {
              '': 'alpha',
              'hadoop-plugin': 'alpha',
              namenode: 'alpha',
              resourcemanager: 'alpha'
            },
            'public-address': ''
          },
          resourcemanager: {
            'charm-verion': '',
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
            'can-upgrade-to': '',
            'subordinate-to': [],
            units: {
              'resourcemanager/0': {
                'agent-status': {
                  status: 'allocating',
                  info: '',
                  data: {},
                  since: '2019-05-02T08:50:02.39307821Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-status': {
                  status: 'waiting',
                  info: 'waiting for machine',
                  data: {},
                  since: '2019-05-02T08:50:02.39307821Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-version': '',
                machine: '2',
                'opened-ports': null,
                'public-address': '',
                charm: '',
                subordinates: null
              }
            },
            'meter-statuses': null,
            status: {
              status: 'waiting',
              info: 'waiting for machine',
              data: {},
              since: '2019-05-02T08:50:02.39307821Z',
              kind: '',
              version: '',
              life: ''
            },
            'workload-version': '',
            'charm-version': '',
            'charm-profile': '',
            'endpoint-bindings': {
              '': 'alpha',
              benchmark: 'alpha',
              java: 'alpha',
              namenode: 'alpha',
              nodemanager: 'alpha',
              resourcemanager: 'alpha'
            },
            'public-address': ''
          },
          rsyslog: {
            'charm-verion': '',
            charm: 'cs:~bigdata-dev/xenial/rsyslog-7',
            series: 'xenial',
            exposed: false,
            life: '',
            relations: {
              aggregator: [
                'rsyslog-forwarder-ha'
              ]
            },
            'can-upgrade-to': '',
            'subordinate-to': [],
            units: {
              'rsyslog/0': {
                'agent-status': {
                  status: 'allocating',
                  info: '',
                  data: {},
                  since: '2019-05-02T08:50:01.601456311Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-status': {
                  status: 'waiting',
                  info: 'waiting for machine',
                  data: {},
                  since: '2019-05-02T08:50:01.601456311Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-version': '',
                machine: '3',
                'opened-ports': null,
                'public-address': '',
                charm: '',
                subordinates: null
              }
            },
            'meter-statuses': null,
            status: {
              status: 'waiting',
              info: 'waiting for machine',
              data: {},
              since: '2019-05-02T08:50:01.601456311Z',
              kind: '',
              version: '',
              life: ''
            },
            'workload-version': '',
            'charm-version': '',
            'charm-profile': '',
            'endpoint-bindings': {
              '': 'alpha',
              aggregator: 'alpha',
              'nrpe-external-master': 'alpha'
            },
            'public-address': ''
          },
          'rsyslog-forwarder-ha': {
            'charm-verion': '',
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
            'can-upgrade-to': '',
            'subordinate-to': [
              'namenode',
              'resourcemanager',
              'slave'
            ],
            units: null,
            'meter-statuses': null,
            status: {
              status: 'unknown',
              info: '',
              data: null,
              since: '2019-05-02T08:50:00.793985036Z',
              kind: '',
              version: '',
              life: ''
            },
            'workload-version': '',
            'charm-version': '',
            'charm-profile': '',
            'endpoint-bindings': {
              '': 'alpha',
              'juju-info': 'alpha',
              'nrpe-external-master': 'alpha',
              syslog: 'alpha'
            },
            'public-address': ''
          },
          slave: {
            'charm-verion': '',
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
            'can-upgrade-to': '',
            'subordinate-to': [],
            units: {
              'slave/0': {
                'agent-status': {
                  status: 'allocating',
                  info: '',
                  data: {},
                  since: '2019-05-02T08:50:02.390200529Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-status': {
                  status: 'waiting',
                  info: 'waiting for machine',
                  data: {},
                  since: '2019-05-02T08:50:02.390200529Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-version': '',
                machine: '1',
                'opened-ports': null,
                'public-address': '',
                charm: '',
                subordinates: null
              },
              'slave/1': {
                'agent-status': {
                  status: 'lost',
                  info: 'agent is not communicating with the server',
                  data: {},
                  since: '2019-05-08T15:39:34.383035573Z',
                  kind: '',
                  version: '2.5.4',
                  life: ''
                },
                'workload-status': {
                  status: 'unknown',
                  info: 'agent lost, see \'juju show-status-log slave/1\'',
                  data: {},
                  since: '2019-05-02T08:52:34.762304661Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-version': '',
                machine: '0',
                'opened-ports': null,
                'public-address': '35.227.34.90',
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
                'agent-status': {
                  status: 'allocating',
                  info: '',
                  data: {},
                  since: '2019-05-02T08:50:02.395968975Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-status': {
                  status: 'waiting',
                  info: 'waiting for machine',
                  data: {},
                  since: '2019-05-02T08:50:02.395968975Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-version': '',
                machine: '4',
                'opened-ports': null,
                'public-address': '',
                charm: '',
                subordinates: null
              }
            },
            'meter-statuses': null,
            status: {
              status: 'blocked',
              info: 'missing required namenode and/or resourcemanager relation',
              data: {},
              since: '2019-05-02T08:52:34.762304661Z',
              kind: '',
              version: '',
              life: ''
            },
            'workload-version': '',
            'charm-version': '',
            'charm-profile': '',
            'endpoint-bindings': {
              '': 'alpha',
              java: 'alpha',
              namenode: 'alpha',
              resourcemanager: 'alpha'
            },
            'public-address': ''
          },
          spark: {
            'charm-verion': '',
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
            'can-upgrade-to': '',
            'subordinate-to': [],
            units: {
              'spark/0': {
                'agent-status': {
                  status: 'allocating',
                  info: '',
                  data: {},
                  since: '2019-05-02T08:50:02.39323708Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-status': {
                  status: 'waiting',
                  info: 'waiting for machine',
                  data: {},
                  since: '2019-05-02T08:50:02.39323708Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-version': '',
                machine: '3',
                'opened-ports': null,
                'public-address': '',
                charm: '',
                subordinates: null
              }
            },
            'meter-statuses': null,
            status: {
              status: 'waiting',
              info: 'waiting for machine',
              data: {},
              since: '2019-05-02T08:50:02.39323708Z',
              kind: '',
              version: '',
              life: ''
            },
            'workload-version': '',
            'charm-version': '',
            'charm-profile': '',
            'endpoint-bindings': {
              '': 'alpha',
              benchmark: 'alpha',
              client: 'alpha',
              giraph: 'alpha',
              hadoop: 'alpha',
              java: 'alpha',
              mahout: 'alpha',
              sparkpeers: 'alpha',
              zookeeper: 'alpha'
            },
            'public-address': ''
          }
        },
        machines: {
          '0': {
            'agent-status': {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2019-05-02T08:50:56.362225285Z',
              kind: '',
              version: '2.5.4',
              life: ''
            },
            'instance-status': {
              status: 'running',
              info: 'RUNNING',
              data: {},
              since: '2019-05-02T08:50:27.2171969Z',
              kind: '',
              version: '',
              life: ''
            },
            'modification-status': {
              status: 'idle',
              info: '',
              data: {},
              since: '2019-05-02T08:49:57.851714637Z',
              kind: '',
              version: '',
              life: ''
            },
            'dns-name': '35.227.34.90',
            'ip-addresses': [
              '35.227.34.90',
              '10.142.0.2',
              '252.0.32.1'
            ],
            'instance-id': 'juju-1590af-0',
            'display-name': '',
            series: 'xenial',
            id: '0',
            'network-interfaces': {
              ens4: {
                'ip-addresses': [
                  '10.142.0.2'
                ],
                'mac-address': '42:01:0a:8e:00:02',
                gateway: '10.142.0.1',
                'is-up': true
              },
              'fan-252': {
                'ip-addresses': [
                  '252.0.32.1'
                ],
                'mac-address': '3e:fe:b7:1a:1b:d4',
                space: 'alpha',
                'is-up': true
              }
            },
            containers: {},
            constraints: 'mem=7168M root-disk=32768M',
            hardware: 'arch=amd64 cores=8 cpu-power=2200 mem=7200M root-disk=32768M availability-zone=us-east1-b',
            jobs: [
              'JobHostUnits'
            ],
            'has-vote': false,
            'wants-vote': false
          },
          '1': {
            'agent-status': {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2019-05-02T09:07:20.615748104Z',
              kind: '',
              version: '',
              life: ''
            },
            'instance-status': {
              status: 'provisioning error',
              info: 'googleapi: Error 403: Quota \'CPUS\' exceeded. Limit: 8.0 in region us-east1., quotaExceeded',
              data: {},
              since: '2019-05-02T09:07:20.615748104Z',
              kind: '',
              version: '',
              life: ''
            },
            'modification-status': {
              status: 'idle',
              info: '',
              data: {},
              since: '2019-05-02T08:49:57.854378814Z',
              kind: '',
              version: '',
              life: ''
            },
            'dns-name': '',
            'instance-id': 'pending',
            'display-name': '',
            series: 'xenial',
            id: '1',
            containers: {},
            constraints: 'mem=7168M root-disk=32768M',
            hardware: '',
            jobs: [
              'JobHostUnits'
            ],
            'has-vote': false,
            'wants-vote': false
          },
          '2': {
            'agent-status': {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2019-05-02T09:07:19.184158233Z',
              kind: '',
              version: '',
              life: ''
            },
            'instance-status': {
              status: 'provisioning error',
              info: 'googleapi: Error 403: Quota \'CPUS\' exceeded. Limit: 8.0 in region us-east1., quotaExceeded',
              data: {},
              since: '2019-05-02T09:07:19.184158233Z',
              kind: '',
              version: '',
              life: ''
            },
            'modification-status': {
              status: 'idle',
              info: '',
              data: {},
              since: '2019-05-02T08:49:57.854438326Z',
              kind: '',
              version: '',
              life: ''
            },
            'dns-name': '',
            'instance-id': 'pending',
            'display-name': '',
            series: 'xenial',
            id: '2',
            containers: {},
            constraints: 'mem=7168M root-disk=32768M',
            hardware: '',
            jobs: [
              'JobHostUnits'
            ],
            'has-vote': false,
            'wants-vote': false
          },
          '3': {
            'agent-status': {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2019-05-02T09:01:44.062675291Z',
              kind: '',
              version: '',
              life: ''
            },
            'instance-status': {
              status: 'provisioning error',
              info: 'googleapi: Error 403: Quota \'CPUS\' exceeded. Limit: 8.0 in region us-east1., quotaExceeded',
              data: {},
              since: '2019-05-02T09:01:44.062675291Z',
              kind: '',
              version: '',
              life: ''
            },
            'modification-status': {
              status: 'idle',
              info: '',
              data: {},
              since: '2019-05-02T08:49:57.854449598Z',
              kind: '',
              version: '',
              life: ''
            },
            'dns-name': '',
            'instance-id': 'pending',
            'display-name': '',
            series: 'xenial',
            id: '3',
            containers: {},
            constraints: 'mem=7168M root-disk=32768M',
            hardware: '',
            jobs: [
              'JobHostUnits'
            ],
            'has-vote': false,
            'wants-vote': false
          },
          '4': {
            'agent-status': {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2019-05-02T08:55:59.390097467Z',
              kind: '',
              version: '',
              life: ''
            },
            'instance-status': {
              status: 'provisioning error',
              info: 'googleapi: Error 403: Quota \'CPUS\' exceeded. Limit: 8.0 in region us-east1., quotaExceeded',
              data: {},
              since: '2019-05-02T08:55:59.390097467Z',
              kind: '',
              version: '',
              life: ''
            },
            'modification-status': {
              status: 'idle',
              info: '',
              data: {},
              since: '2019-05-02T08:49:57.854495757Z',
              kind: '',
              version: '',
              life: ''
            },
            'dns-name': '',
            'instance-id': 'pending',
            'display-name': '',
            series: 'xenial',
            id: '4',
            containers: {},
            constraints: 'mem=7168M root-disk=32768M',
            hardware: '',
            jobs: [
              'JobHostUnits'
            ],
            'has-vote': false,
            'wants-vote': false
          },
          '5': {
            'agent-status': {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2019-05-08T15:44:30.519386476Z',
              kind: '',
              version: '',
              life: ''
            },
            'instance-status': {
              status: 'provisioning error',
              info: 'no matching agent binaries available',
              data: {},
              since: '2019-05-08T15:44:30.519386476Z',
              kind: '',
              version: '',
              life: ''
            },
            'modification-status': {
              status: 'idle',
              info: '',
              data: {},
              since: '2019-05-08T15:44:25.249619618Z',
              kind: '',
              version: '',
              life: ''
            },
            'dns-name': '',
            'instance-id': 'pending',
            'display-name': '',
            series: 'precise',
            id: '5',
            containers: {},
            constraints: '',
            hardware: '',
            jobs: [
              'JobHostUnits'
            ],
            'has-vote': false,
            'wants-vote': false
          }
        },
        model: {
          name: 'hadoopspark',
          type: 'iaas',
          'cloud-tag': 'cloud-google',
          region: 'us-east1',
          version: '2.5.4',
          'available-version': '',
          'model-status': {
            status: 'available',
            info: '',
            data: {},
            since: '2020-10-26T15:07:25.862538872Z',
            kind: '',
            version: '',
            life: ''
          },
          'meter-status': {
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
          }
        ],
        uuid: '2f995dee-392e-4459-8eb9-839c5fake0af',
        info: {
          name: 'hadoopspark',
          type: 'iaas',
          uuid: '2f995dee-392e-4459-8eb9-839c5fake0af',
          'controller-uuid': 'a030379a-940f-4760-8fcf-3062b41a04e7',
          'is-controller': false,
          'provider-type': 'gce',
          'default-series': 'bionic',
          'cloud-tag': 'cloud-google',
          'cloud-region': 'us-east1',
          'cloud-credential-tag': 'cloudcred-google_pizza@external_Algebra-json',
          'owner-tag': 'user-pizza@external',
          life: 'alive',
          status: {
            status: 'available',
            info: '',
            since: '2020-10-26T15:07:25.862Z'
          },
          users: [
            {
              user: 'eggman@external',
              'display-name': '',
              'last-connection': '2020-11-19T18:44:36Z',
              access: 'read'
            }
          ],
          machines: [
            {
              id: '0',
              hardware: {
                arch: 'amd64',
                mem: 7200,
                'root-disk': 32768,
                cores: 8,
                'cpu-power': 2200,
                'availability-zone': 'us-east1-b'
              },
              'instance-id': 'juju-1590af-0',
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
          sla: null,
          'agent-version': '2.5.4'
        }
      },
      '7ffe956a-06ac-4ae9-8aac-04ebafakeda5': {
        annotations: {
          easyrsa: {
            'bundle-url': 'canonical-kubernetes/bundle/218',
            'gui-x': '346.21875',
            'gui-y': '532.703125'
          },
          etcd: {
            'bundle-url': 'canonical-kubernetes/bundle/218',
            'gui-x': '1393.3487548828125',
            'gui-y': '596.7920532226562'
          },
          flannel: {
            'bundle-url': 'canonical-kubernetes/bundle/218',
            'gui-x': '353.0406494140625',
            'gui-y': '821.2684936523438'
          },
          'kubeapi-load-balancer': {
            'bundle-url': 'canonical-kubernetes/bundle/218',
            'gui-x': '469.95794677734375',
            'gui-y': '167.50721740722656'
          },
          'kubernetes-master': {
            'bundle-url': 'canonical-kubernetes/bundle/218',
            'gui-x': '926.0068969726562',
            'gui-y': '1103.1473999023438'
          },
          'kubernetes-worker': {
            'bundle-url': 'canonical-kubernetes/bundle/218',
            'gui-x': '-236.6238250732422',
            'gui-y': '879.2716064453125'
          }
        },
        applications: {
          easyrsa: {
            'charm-verion': '',
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
            'can-upgrade-to': 'cs:~containers/easyrsa-333',
            'subordinate-to': [],
            units: {
              'easyrsa/0': {
                'agent-status': {
                  status: 'allocating',
                  info: '',
                  data: {},
                  since: '2018-08-09T13:55:22.137703819Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-status': {
                  status: 'waiting',
                  info: 'waiting for machine',
                  data: {},
                  since: '2018-08-09T13:55:22.137703819Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-version': '',
                machine: '0',
                'opened-ports': null,
                'public-address': '',
                charm: '',
                subordinates: null
              }
            },
            'meter-statuses': null,
            status: {
              status: 'waiting',
              info: 'waiting for machine',
              data: {},
              since: '2018-08-09T13:55:22.137703819Z',
              kind: '',
              version: '',
              life: ''
            },
            'workload-version': '',
            'charm-version': '',
            'charm-profile': '',
            'endpoint-bindings': {
              '': 'alpha',
              client: 'alpha'
            },
            'public-address': ''
          },
          etcd: {
            'charm-verion': '',
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
            'can-upgrade-to': 'cs:~containers/etcd-540',
            'subordinate-to': [],
            units: {
              'etcd/0': {
                'agent-status': {
                  status: 'allocating',
                  info: '',
                  data: {},
                  since: '2018-08-09T13:55:22.135162949Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-status': {
                  status: 'waiting',
                  info: 'waiting for machine',
                  data: {},
                  since: '2018-08-09T13:55:22.135162949Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-version': '',
                machine: '2',
                'opened-ports': null,
                'public-address': '',
                charm: '',
                subordinates: null
              },
              'etcd/1': {
                'agent-status': {
                  status: 'allocating',
                  info: '',
                  data: {},
                  since: '2018-08-09T13:55:22.137396889Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-status': {
                  status: 'waiting',
                  info: 'waiting for machine',
                  data: {},
                  since: '2018-08-09T13:55:22.137396889Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-version': '',
                machine: '1',
                'opened-ports': null,
                'public-address': '',
                charm: '',
                subordinates: null
              },
              'etcd/2': {
                'agent-status': {
                  status: 'allocating',
                  info: '',
                  data: {},
                  since: '2018-08-09T13:55:22.139695377Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-status': {
                  status: 'waiting',
                  info: 'waiting for machine',
                  data: {},
                  since: '2018-08-09T13:55:22.139695377Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-version': '',
                machine: '3',
                'opened-ports': null,
                'public-address': '',
                charm: '',
                subordinates: null
              }
            },
            'meter-statuses': null,
            status: {
              status: 'waiting',
              info: 'waiting for machine',
              data: {},
              since: '2018-08-09T13:55:22.135162949Z',
              kind: '',
              version: '',
              life: ''
            },
            'workload-version': '',
            'charm-version': '',
            'charm-profile': '',
            'endpoint-bindings': {
              '': 'alpha',
              certificates: 'alpha',
              cluster: 'alpha',
              db: 'alpha',
              'nrpe-external-master': 'alpha',
              proxy: 'alpha'
            },
            'public-address': ''
          },
          flannel: {
            'charm-verion': '',
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
            'can-upgrade-to': '',
            'subordinate-to': [
              'kubernetes-master',
              'kubernetes-worker'
            ],
            units: null,
            'meter-statuses': null,
            status: {
              status: 'unknown',
              info: '',
              data: null,
              since: '2018-08-09T13:55:20.925255384Z',
              kind: '',
              version: '',
              life: ''
            },
            'workload-version': '',
            'charm-version': '',
            'charm-profile': '',
            'endpoint-bindings': {
              '': 'alpha',
              cni: 'alpha',
              etcd: 'alpha',
              'nrpe-external-master': 'alpha'
            },
            'public-address': ''
          },
          'kubeapi-load-balancer': {
            'charm-verion': '',
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
            'can-upgrade-to': 'cs:~containers/kubeapi-load-balancer-747',
            'subordinate-to': [],
            units: {
              'kubeapi-load-balancer/0': {
                'agent-status': {
                  status: 'allocating',
                  info: '',
                  data: {},
                  since: '2018-08-09T13:55:20.927448824Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-status': {
                  status: 'waiting',
                  info: 'waiting for machine',
                  data: {},
                  since: '2018-08-09T13:55:20.927448824Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-version': '',
                machine: '4',
                'opened-ports': null,
                'public-address': '',
                charm: '',
                subordinates: null
              }
            },
            'meter-statuses': null,
            status: {
              status: 'waiting',
              info: 'waiting for machine',
              data: {},
              since: '2018-08-09T13:55:20.927448824Z',
              kind: '',
              version: '',
              life: ''
            },
            'workload-version': '',
            'charm-version': '',
            'charm-profile': '',
            'endpoint-bindings': {
              '': 'alpha',
              apiserver: 'alpha',
              certificates: 'alpha',
              loadbalancer: 'alpha',
              'nrpe-external-master': 'alpha',
              website: 'alpha'
            },
            'public-address': ''
          },
          'kubernetes-master': {
            'charm-verion': '',
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
            'can-upgrade-to': 'cs:~containers/kubernetes-master-891',
            'subordinate-to': [],
            units: {
              'kubernetes-master/0': {
                'agent-status': {
                  status: 'allocating',
                  info: '',
                  data: {},
                  since: '2018-08-09T13:55:22.136584916Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-status': {
                  status: 'waiting',
                  info: 'waiting for machine',
                  data: {},
                  since: '2018-08-09T13:55:22.136584916Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-version': '',
                machine: '6',
                'opened-ports': null,
                'public-address': '',
                charm: '',
                subordinates: null
              },
              'kubernetes-master/1': {
                'agent-status': {
                  status: 'allocating',
                  info: '',
                  data: {},
                  since: '2018-08-09T13:55:22.139816412Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-status': {
                  status: 'waiting',
                  info: 'waiting for machine',
                  data: {},
                  since: '2018-08-09T13:55:22.139816412Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-version': '',
                machine: '7',
                'opened-ports': null,
                'public-address': '',
                charm: '',
                subordinates: null
              }
            },
            'meter-statuses': null,
            status: {
              status: 'waiting',
              info: 'waiting for machine',
              data: {},
              since: '2018-08-09T13:55:22.136584916Z',
              kind: '',
              version: '',
              life: ''
            },
            'workload-version': '',
            'charm-version': '',
            'charm-profile': '',
            'endpoint-bindings': {
              '': 'alpha',
              aws: 'alpha',
              'ceph-storage': 'alpha',
              certificates: 'alpha',
              'cluster-dns': 'alpha',
              cni: 'alpha',
              etcd: 'alpha',
              gcp: 'alpha',
              'kube-api-endpoint': 'alpha',
              'kube-control': 'alpha',
              loadbalancer: 'alpha',
              'nrpe-external-master': 'alpha',
              openstack: 'alpha'
            },
            'public-address': ''
          },
          'kubernetes-worker': {
            'charm-verion': '',
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
            'can-upgrade-to': 'cs:~containers/kubernetes-worker-704',
            'subordinate-to': [],
            units: {
              'kubernetes-worker/0': {
                'agent-status': {
                  status: 'allocating',
                  info: '',
                  data: {},
                  since: '2018-08-09T13:55:22.137454811Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-status': {
                  status: 'waiting',
                  info: 'waiting for machine',
                  data: {},
                  since: '2018-08-09T13:55:22.137454811Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-version': '',
                machine: '8',
                'opened-ports': null,
                'public-address': '',
                charm: '',
                subordinates: null
              },
              'kubernetes-worker/1': {
                'agent-status': {
                  status: 'allocating',
                  info: '',
                  data: {},
                  since: '2018-08-09T13:55:22.139324175Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-status': {
                  status: 'waiting',
                  info: 'waiting for machine',
                  data: {},
                  since: '2018-08-09T13:55:22.139324175Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-version': '',
                machine: '5',
                'opened-ports': null,
                'public-address': '',
                charm: '',
                subordinates: null
              },
              'kubernetes-worker/2': {
                'agent-status': {
                  status: 'allocating',
                  info: '',
                  data: {},
                  since: '2018-08-09T13:55:22.139704369Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-status': {
                  status: 'waiting',
                  info: 'waiting for machine',
                  data: {},
                  since: '2018-08-09T13:55:22.139704369Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-version': '',
                machine: '9',
                'opened-ports': null,
                'public-address': '',
                charm: '',
                subordinates: null
              }
            },
            'meter-statuses': null,
            status: {
              status: 'waiting',
              info: 'waiting for machine',
              data: {},
              since: '2018-08-09T13:55:22.137454811Z',
              kind: '',
              version: '',
              life: ''
            },
            'workload-version': '',
            'charm-version': '',
            'charm-profile': '',
            'endpoint-bindings': {
              '': 'alpha',
              aws: 'alpha',
              certificates: 'alpha',
              cni: 'alpha',
              dockerhost: 'alpha',
              gcp: 'alpha',
              'kube-api-endpoint': 'alpha',
              'kube-control': 'alpha',
              'kube-dns': 'alpha',
              nfs: 'alpha',
              'nrpe-external-master': 'alpha',
              openstack: 'alpha',
              'sdn-plugin': 'alpha'
            },
            'public-address': ''
          }
        },
        machines: {
          '0': {
            'agent-status': {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2018-08-09T14:05:36.995856277Z',
              kind: '',
              version: '',
              life: ''
            },
            'instance-status': {
              status: 'provisioning error',
              info: 'googleapi: Error 403: Project clean-algebra-206308 cannot accept requests to insert while in an inactive billing state.  Billing state may take several minutes to update., inactiveBillingState',
              data: {},
              since: '2018-08-09T14:05:36.995856277Z',
              kind: '',
              version: '',
              life: ''
            },
            'modification-status': {
              status: 'idle',
              info: '',
              data: {},
              since: '2019-05-02T07:58:10.050960196Z',
              kind: '',
              version: '',
              life: ''
            },
            'dns-name': '',
            'instance-id': 'pending',
            'display-name': '',
            series: 'xenial',
            id: '0',
            containers: {},
            constraints: '',
            hardware: '',
            jobs: [
              'JobHostUnits'
            ],
            'has-vote': false,
            'wants-vote': false
          },
          '1': {
            'agent-status': {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2018-08-09T14:10:50.324486164Z',
              kind: '',
              version: '',
              life: ''
            },
            'instance-status': {
              status: 'provisioning error',
              info: 'googleapi: Error 403: Project clean-algebra-206308 cannot accept requests to insert while in an inactive billing state.  Billing state may take several minutes to update., inactiveBillingState',
              data: {},
              since: '2018-08-09T14:10:50.324486164Z',
              kind: '',
              version: '',
              life: ''
            },
            'modification-status': {
              status: 'idle',
              info: '',
              data: {},
              since: '2019-05-02T07:58:10.050960196Z',
              kind: '',
              version: '',
              life: ''
            },
            'dns-name': '',
            'instance-id': 'pending',
            'display-name': '',
            series: 'xenial',
            id: '1',
            containers: {},
            constraints: '',
            hardware: '',
            jobs: [
              'JobHostUnits'
            ],
            'has-vote': false,
            'wants-vote': false
          },
          '2': {
            'agent-status': {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2018-08-09T14:00:23.860656135Z',
              kind: '',
              version: '',
              life: ''
            },
            'instance-status': {
              status: 'provisioning error',
              info: 'googleapi: Error 403: Project clean-algebra-206308 cannot accept requests to insert while in an inactive billing state.  Billing state may take several minutes to update., inactiveBillingState',
              data: {},
              since: '2018-08-09T14:00:23.860656135Z',
              kind: '',
              version: '',
              life: ''
            },
            'modification-status': {
              status: 'idle',
              info: '',
              data: {},
              since: '2019-05-02T07:58:10.050960196Z',
              kind: '',
              version: '',
              life: ''
            },
            'dns-name': '',
            'instance-id': 'pending',
            'display-name': '',
            series: 'xenial',
            id: '2',
            containers: {},
            constraints: '',
            hardware: '',
            jobs: [
              'JobHostUnits'
            ],
            'has-vote': false,
            'wants-vote': false
          },
          '3': {
            'agent-status': {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2018-08-09T14:16:01.2522526Z',
              kind: '',
              version: '',
              life: ''
            },
            'instance-status': {
              status: 'provisioning error',
              info: 'googleapi: Error 403: Project clean-algebra-206308 cannot accept requests to insert while in an inactive billing state.  Billing state may take several minutes to update., inactiveBillingState',
              data: {},
              since: '2018-08-09T14:16:01.2522526Z',
              kind: '',
              version: '',
              life: ''
            },
            'modification-status': {
              status: 'idle',
              info: '',
              data: {},
              since: '2019-05-02T07:58:10.050960196Z',
              kind: '',
              version: '',
              life: ''
            },
            'dns-name': '',
            'instance-id': 'pending',
            'display-name': '',
            series: 'xenial',
            id: '3',
            containers: {},
            constraints: '',
            hardware: '',
            jobs: [
              'JobHostUnits'
            ],
            'has-vote': false,
            'wants-vote': false
          },
          '4': {
            'agent-status': {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2018-08-09T14:16:01.715668487Z',
              kind: '',
              version: '',
              life: ''
            },
            'instance-status': {
              status: 'provisioning error',
              info: 'googleapi: Error 403: Project clean-algebra-206308 cannot accept requests to insert while in an inactive billing state.  Billing state may take several minutes to update., inactiveBillingState',
              data: {},
              since: '2018-08-09T14:16:01.715668487Z',
              kind: '',
              version: '',
              life: ''
            },
            'modification-status': {
              status: 'idle',
              info: '',
              data: {},
              since: '2019-05-02T07:58:10.050960196Z',
              kind: '',
              version: '',
              life: ''
            },
            'dns-name': '',
            'instance-id': 'pending',
            'display-name': '',
            series: 'xenial',
            id: '4',
            containers: {},
            constraints: '',
            hardware: '',
            jobs: [
              'JobHostUnits'
            ],
            'has-vote': false,
            'wants-vote': false
          },
          '5': {
            'agent-status': {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2018-08-09T14:16:01.506721754Z',
              kind: '',
              version: '',
              life: ''
            },
            'instance-status': {
              status: 'provisioning error',
              info: 'googleapi: Error 403: Project clean-algebra-206308 cannot accept requests to insert while in an inactive billing state.  Billing state may take several minutes to update., inactiveBillingState',
              data: {},
              since: '2018-08-09T14:16:01.506721754Z',
              kind: '',
              version: '',
              life: ''
            },
            'modification-status': {
              status: 'idle',
              info: '',
              data: {},
              since: '2019-05-02T07:58:10.050960196Z',
              kind: '',
              version: '',
              life: ''
            },
            'dns-name': '',
            'instance-id': 'pending',
            'display-name': '',
            series: 'xenial',
            id: '5',
            containers: {},
            constraints: '',
            hardware: '',
            jobs: [
              'JobHostUnits'
            ],
            'has-vote': false,
            'wants-vote': false
          },
          '6': {
            'agent-status': {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2018-08-09T14:16:02.10797808Z',
              kind: '',
              version: '',
              life: ''
            },
            'instance-status': {
              status: 'provisioning error',
              info: 'googleapi: Error 403: Project clean-algebra-206308 cannot accept requests to insert while in an inactive billing state.  Billing state may take several minutes to update., inactiveBillingState',
              data: {},
              since: '2018-08-09T14:16:02.10797808Z',
              kind: '',
              version: '',
              life: ''
            },
            'modification-status': {
              status: 'idle',
              info: '',
              data: {},
              since: '2019-05-02T07:58:10.050960196Z',
              kind: '',
              version: '',
              life: ''
            },
            'dns-name': '',
            'instance-id': 'pending',
            'display-name': '',
            series: 'xenial',
            id: '6',
            containers: {},
            constraints: '',
            hardware: '',
            jobs: [
              'JobHostUnits'
            ],
            'has-vote': false,
            'wants-vote': false
          },
          '7': {
            'agent-status': {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2018-08-09T14:16:01.314430932Z',
              kind: '',
              version: '',
              life: ''
            },
            'instance-status': {
              status: 'provisioning error',
              info: 'googleapi: Error 403: Project clean-algebra-206308 cannot accept requests to insert while in an inactive billing state.  Billing state may take several minutes to update., inactiveBillingState',
              data: {},
              since: '2018-08-09T14:16:01.314430932Z',
              kind: '',
              version: '',
              life: ''
            },
            'modification-status': {
              status: 'idle',
              info: '',
              data: {},
              since: '2019-05-02T07:58:10.050960196Z',
              kind: '',
              version: '',
              life: ''
            },
            'dns-name': '',
            'instance-id': 'pending',
            'display-name': '',
            series: 'xenial',
            id: '7',
            containers: {},
            constraints: '',
            hardware: '',
            jobs: [
              'JobHostUnits'
            ],
            'has-vote': false,
            'wants-vote': false
          },
          '8': {
            'agent-status': {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2018-08-09T14:16:01.695221375Z',
              kind: '',
              version: '',
              life: ''
            },
            'instance-status': {
              status: 'provisioning error',
              info: 'googleapi: Error 403: Project clean-algebra-206308 cannot accept requests to insert while in an inactive billing state.  Billing state may take several minutes to update., inactiveBillingState',
              data: {},
              since: '2018-08-09T14:16:01.695221375Z',
              kind: '',
              version: '',
              life: ''
            },
            'modification-status': {
              status: 'idle',
              info: '',
              data: {},
              since: '2019-05-02T07:58:10.050960196Z',
              kind: '',
              version: '',
              life: ''
            },
            'dns-name': '',
            'instance-id': 'pending',
            'display-name': '',
            series: 'xenial',
            id: '8',
            containers: {},
            constraints: '',
            hardware: '',
            jobs: [
              'JobHostUnits'
            ],
            'has-vote': false,
            'wants-vote': false
          },
          '9': {
            'agent-status': {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2018-08-09T14:16:01.775689302Z',
              kind: '',
              version: '',
              life: ''
            },
            'instance-status': {
              status: 'provisioning error',
              info: 'googleapi: Error 403: Project clean-algebra-206308 cannot accept requests to insert while in an inactive billing state.  Billing state may take several minutes to update., inactiveBillingState',
              data: {},
              since: '2018-08-09T14:16:01.775689302Z',
              kind: '',
              version: '',
              life: ''
            },
            'modification-status': {
              status: 'idle',
              info: '',
              data: {},
              since: '2019-05-02T07:58:10.050960196Z',
              kind: '',
              version: '',
              life: ''
            },
            'dns-name': '',
            'instance-id': 'pending',
            'display-name': '',
            series: 'xenial',
            id: '9',
            containers: {},
            constraints: '',
            hardware: '',
            jobs: [
              'JobHostUnits'
            ],
            'has-vote': false,
            'wants-vote': false
          }
        },
        model: {
          name: 'mymodel',
          type: 'iaas',
          'cloud-tag': 'cloud-google',
          region: 'us-east1',
          version: '2.3.8',
          'available-version': '',
          'model-status': {
            status: 'available',
            info: '',
            data: {},
            since: '2020-10-26T15:07:30.142112869Z',
            kind: '',
            version: '',
            life: ''
          },
          'meter-status': {
            color: '',
            message: ''
          },
          sla: 'unsupported'
        },
        offers: {},
        relations: [
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
          }
        ],
        uuid: '7ffe956a-06ac-4ae9-8aac-04ebafakeda5',
        info: {
          name: 'mymodel',
          type: '',
          uuid: '7ffe956a-06ac-4ae9-8aac-04ebafakeda5',
          'controller-uuid': 'a030379a-940f-4760-8fcf-3062b41a04e7',
          'is-controller': false,
          'provider-type': 'gce',
          'default-series': 'xenial',
          'cloud-tag': 'cloud-google',
          'cloud-region': 'us-east1',
          'cloud-credential-tag': 'cloudcred-google_pizza@external_clean-algebra-206308',
          'owner-tag': 'user-pizza@external',
          life: 'alive',
          status: {
            status: 'available',
            info: '',
            since: '2020-10-26T15:07:30.142Z'
          },
          users: [
            {
              user: 'eggman@external',
              'display-name': '',
              'last-connection': '2020-11-19T18:44:36Z',
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
          sla: null,
          'agent-version': '2.3.8'
        }
      },
      'd291b9ed-1e66-4023-84fe-57130e1fake2': {
        annotations: {
          easyrsa: {
            bundleURL: 'canonical-kubernetes/bundle/296',
            'gui-x': '416.28399658203125',
            'gui-y': '446.5785217285156'
          },
          etcd: {
            bundleURL: 'canonical-kubernetes/bundle/296',
            'gui-x': '1183.6000366210938',
            'gui-y': '376.20233154296875'
          },
          failtester: {
            'gui-x': '1305.05078125',
            'gui-y': '859.5794067382812'
          },
          flannel: {
            bundleURL: 'canonical-kubernetes/bundle/296',
            'gui-x': '401.2279968261719',
            'gui-y': '758.408935546875'
          },
          'kubeapi-load-balancer': {
            bundleURL: 'canonical-kubernetes/bundle/296',
            'gui-x': '490.363037109375',
            'gui-y': '-7.314292907714844'
          },
          'kubernetes-master': {
            bundleURL: 'canonical-kubernetes/bundle/296',
            'gui-x': '830.272216796875',
            'gui-y': '1105.6325073242188'
          },
          'kubernetes-worker': {
            bundleURL: 'canonical-kubernetes/bundle/296',
            'gui-x': '-269.43985748291016',
            'gui-y': '648.170654296875'
          }
        },
        applications: {
          easyrsa: {
            'charm-verion': '',
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
            'can-upgrade-to': 'cs:~containers/easyrsa-333',
            'subordinate-to': [],
            units: {
              'easyrsa/0': {
                'agent-status': {
                  status: 'lost',
                  info: 'agent is not communicating with the server',
                  data: {},
                  since: '2018-10-08T15:00:12.484889109Z',
                  kind: '',
                  version: '2.4.3',
                  life: ''
                },
                'workload-status': {
                  status: 'unknown',
                  info: 'agent lost, see \'juju show-status-log easyrsa/0\'',
                  data: {},
                  since: '2018-10-08T14:53:25.862204883Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-version': '3.0.1',
                machine: '2',
                'opened-ports': null,
                'public-address': '35.184.243.254',
                charm: '',
                subordinates: null
              }
            },
            'meter-statuses': null,
            status: {
              status: 'active',
              info: 'Certificate Authority connected.',
              data: {},
              since: '2018-10-08T14:53:25.862204883Z',
              kind: '',
              version: '',
              life: ''
            },
            'workload-version': '3.0.1',
            'charm-version': '',
            'charm-profile': '',
            'endpoint-bindings': {
              '': 'alpha',
              client: 'alpha'
            },
            'public-address': ''
          },
          etcd: {
            'charm-verion': '',
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
            'can-upgrade-to': 'cs:~containers/etcd-540',
            'subordinate-to': [],
            units: {
              'etcd/0': {
                'agent-status': {
                  status: 'lost',
                  info: 'agent is not communicating with the server',
                  data: {},
                  since: '2018-10-08T14:58:19.860896464Z',
                  kind: '',
                  version: '2.4.3',
                  life: ''
                },
                'workload-status': {
                  status: 'unknown',
                  info: 'agent lost, see \'juju show-status-log etcd/0\'',
                  data: {},
                  since: '2018-10-08T14:55:13.827371195Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-version': '3.2.10',
                machine: '9',
                'opened-ports': [
                  '2379/tcp'
                ],
                'public-address': '104.154.116.14',
                charm: '',
                subordinates: null
              },
              'etcd/1': {
                'agent-status': {
                  status: 'lost',
                  info: 'agent is not communicating with the server',
                  data: {},
                  since: '2018-10-08T14:58:20.769354636Z',
                  kind: '',
                  version: '2.4.3',
                  life: ''
                },
                'workload-status': {
                  status: 'unknown',
                  info: 'agent lost, see \'juju show-status-log etcd/1\'',
                  data: {},
                  since: '2018-10-08T14:55:13.993780984Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-version': '3.2.10',
                machine: '1',
                'opened-ports': [
                  '2379/tcp'
                ],
                'public-address': '35.239.243.48',
                charm: '',
                subordinates: null
              },
              'etcd/2': {
                'agent-status': {
                  status: 'lost',
                  info: 'agent is not communicating with the server',
                  data: {},
                  since: '2018-10-08T14:58:19.840816673Z',
                  kind: '',
                  version: '2.4.3',
                  life: ''
                },
                'workload-status': {
                  status: 'unknown',
                  info: 'agent lost, see \'juju show-status-log etcd/2\'',
                  data: {},
                  since: '2018-10-08T14:53:54.357715664Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-version': '3.2.10',
                machine: '3',
                'opened-ports': [
                  '2379/tcp'
                ],
                'public-address': '35.224.252.29',
                charm: '',
                subordinates: null
              }
            },
            'meter-statuses': null,
            status: {
              status: 'active',
              info: 'Healthy with 3 known peers',
              data: {},
              since: '2018-10-08T14:55:13.827371195Z',
              kind: '',
              version: '',
              life: ''
            },
            'workload-version': '3.2.10',
            'charm-version': '',
            'charm-profile': '',
            'endpoint-bindings': {
              '': 'alpha',
              certificates: 'alpha',
              cluster: 'alpha',
              db: 'alpha',
              'nrpe-external-master': 'alpha',
              proxy: 'alpha'
            },
            'public-address': ''
          },
          failtester: {
            'charm-verion': '',
            charm: 'cs:~hatch/precise/failtester-7',
            series: 'precise',
            exposed: false,
            life: '',
            relations: {
              loopback: [
                'failtester'
              ]
            },
            'can-upgrade-to': '',
            'subordinate-to': [],
            units: {
              'failtester/0': {
                'agent-status': {
                  status: 'allocating',
                  info: '',
                  data: {},
                  since: '2019-05-08T16:13:17.522547252Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-status': {
                  status: 'waiting',
                  info: 'waiting for machine',
                  data: {},
                  since: '2019-05-08T16:13:17.522547252Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-version': '',
                machine: '10',
                'opened-ports': null,
                'public-address': '',
                charm: '',
                subordinates: null
              }
            },
            'meter-statuses': null,
            status: {
              status: 'waiting',
              info: 'waiting for machine',
              data: {},
              since: '2019-05-08T16:13:17.522547252Z',
              kind: '',
              version: '',
              life: ''
            },
            'workload-version': '',
            'charm-version': '',
            'charm-profile': '',
            'endpoint-bindings': {
              '': 'alpha',
              loopback: 'alpha',
              'prov-reltest': 'alpha',
              'req-reltest': 'alpha'
            },
            'public-address': ''
          },
          flannel: {
            'charm-verion': '',
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
            'can-upgrade-to': 'cs:~containers/flannel-506',
            'subordinate-to': [
              'kubernetes-master',
              'kubernetes-worker'
            ],
            units: null,
            'meter-statuses': null,
            status: {
              status: 'active',
              info: 'Flannel subnet 10.1.93.1/24',
              data: {},
              since: '2018-10-08T14:53:59.331400946Z',
              kind: '',
              version: '',
              life: ''
            },
            'workload-version': '0.10.0',
            'charm-version': '',
            'charm-profile': '',
            'endpoint-bindings': {
              '': 'alpha',
              cni: 'alpha',
              etcd: 'alpha',
              'nrpe-external-master': 'alpha'
            },
            'public-address': ''
          },
          'kubeapi-load-balancer': {
            'charm-verion': '',
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
            'can-upgrade-to': 'cs:~containers/kubeapi-load-balancer-747',
            'subordinate-to': [],
            units: {
              'kubeapi-load-balancer/0': {
                'agent-status': {
                  status: 'lost',
                  info: 'agent is not communicating with the server',
                  data: {},
                  since: '2018-10-08T15:00:13.008776633Z',
                  kind: '',
                  version: '2.4.3',
                  life: ''
                },
                'workload-status': {
                  status: 'unknown',
                  info: 'agent lost, see \'juju show-status-log kubeapi-load-balancer/0\'',
                  data: {},
                  since: '2018-10-11T10:20:25.7858764Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-version': '1.14.0',
                machine: '0',
                'opened-ports': [
                  '443/tcp'
                ],
                'public-address': '35.184.25.213',
                charm: '',
                subordinates: null
              }
            },
            'meter-statuses': null,
            status: {
              status: 'active',
              info: 'Loadbalancer ready.',
              data: {},
              since: '2018-10-11T10:20:25.7858764Z',
              kind: '',
              version: '',
              life: ''
            },
            'workload-version': '1.14.0',
            'charm-version': '',
            'charm-profile': '',
            'endpoint-bindings': {
              '': 'alpha',
              apiserver: 'alpha',
              certificates: 'alpha',
              loadbalancer: 'alpha',
              'nrpe-external-master': 'alpha',
              website: 'alpha'
            },
            'public-address': ''
          },
          'kubernetes-master': {
            'charm-verion': '',
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
            'can-upgrade-to': 'cs:~containers/kubernetes-master-891',
            'subordinate-to': [],
            units: {
              'kubernetes-master/0': {
                'agent-status': {
                  status: 'lost',
                  info: 'agent is not communicating with the server',
                  data: {},
                  since: '2018-10-08T15:05:52.650156718Z',
                  kind: '',
                  version: '2.4.3',
                  life: ''
                },
                'workload-status': {
                  status: 'unknown',
                  info: 'agent lost, see \'juju show-status-log kubernetes-master/0\'',
                  data: {},
                  since: '2018-10-08T15:04:40.737693566Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-version': '1.12.0',
                machine: '5',
                'opened-ports': [
                  '6443/tcp'
                ],
                'public-address': '35.239.136.24',
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
                'agent-status': {
                  status: 'lost',
                  info: 'agent is not communicating with the server',
                  data: {},
                  since: '2018-10-08T15:09:24.889459894Z',
                  kind: '',
                  version: '2.4.3',
                  life: ''
                },
                'workload-status': {
                  status: 'unknown',
                  info: 'agent lost, see \'juju show-status-log kubernetes-master/1\'',
                  data: {},
                  since: '2018-10-08T15:09:24.141608099Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-version': '1.12.0',
                machine: '7',
                'opened-ports': [
                  '6443/tcp'
                ],
                'public-address': '35.225.168.246',
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
            'meter-statuses': null,
            status: {
              status: 'active',
              info: 'Kubernetes master running.',
              data: {},
              since: '2018-10-08T15:04:40.737693566Z',
              kind: '',
              version: '',
              life: ''
            },
            'workload-version': '1.12.0',
            'charm-version': '',
            'charm-profile': '',
            'endpoint-bindings': {
              '': 'alpha',
              aws: 'alpha',
              azure: 'alpha',
              'ceph-storage': 'alpha',
              certificates: 'alpha',
              'cluster-dns': 'alpha',
              cni: 'alpha',
              etcd: 'alpha',
              gcp: 'alpha',
              'kube-api-endpoint': 'alpha',
              'kube-control': 'alpha',
              loadbalancer: 'alpha',
              'nrpe-external-master': 'alpha',
              openstack: 'alpha',
              vsphere: 'alpha'
            },
            'public-address': ''
          },
          'kubernetes-worker': {
            'charm-verion': '',
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
            'can-upgrade-to': 'cs:~containers/kubernetes-worker-704',
            'subordinate-to': [],
            units: {
              'kubernetes-worker/0': {
                'agent-status': {
                  status: 'lost',
                  info: 'agent is not communicating with the server',
                  data: {},
                  since: '2018-10-08T15:04:44.254710784Z',
                  kind: '',
                  version: '2.4.3',
                  life: ''
                },
                'workload-status': {
                  status: 'unknown',
                  info: 'agent lost, see \'juju show-status-log kubernetes-worker/0\'',
                  data: {},
                  since: '2018-10-08T14:59:31.586068084Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-version': '1.12.0',
                machine: '4',
                'opened-ports': [
                  '80/tcp',
                  '443/tcp'
                ],
                'public-address': '35.232.127.235',
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
                'agent-status': {
                  status: 'lost',
                  info: 'agent is not communicating with the server',
                  data: {},
                  since: '2018-10-08T15:04:44.210102952Z',
                  kind: '',
                  version: '2.4.3',
                  life: ''
                },
                'workload-status': {
                  status: 'unknown',
                  info: 'agent lost, see \'juju show-status-log kubernetes-worker/1\'',
                  data: {},
                  since: '2018-10-08T15:01:33.267424296Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-version': '1.12.0',
                machine: '8',
                'opened-ports': [
                  '80/tcp',
                  '443/tcp'
                ],
                'public-address': '35.188.63.154',
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
                'agent-status': {
                  status: 'lost',
                  info: 'agent is not communicating with the server',
                  data: {},
                  since: '2018-10-10T13:16:02.808134741Z',
                  kind: '',
                  version: '2.4.3',
                  life: ''
                },
                'workload-status': {
                  status: 'unknown',
                  info: 'agent lost, see \'juju show-status-log kubernetes-worker/2\'',
                  data: {},
                  since: '2018-10-08T15:04:50.976444251Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-version': '1.12.0',
                machine: '6',
                'opened-ports': [
                  '80/tcp',
                  '443/tcp'
                ],
                'public-address': '35.188.207.247',
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
            'meter-statuses': null,
            status: {
              status: 'active',
              info: 'Kubernetes worker running.',
              data: {},
              since: '2018-10-08T14:59:31.586068084Z',
              kind: '',
              version: '',
              life: ''
            },
            'workload-version': '1.12.0',
            'charm-version': '',
            'charm-profile': '',
            'endpoint-bindings': {
              '': 'alpha',
              aws: 'alpha',
              azure: 'alpha',
              certificates: 'alpha',
              cni: 'alpha',
              dockerhost: 'alpha',
              gcp: 'alpha',
              'kube-api-endpoint': 'alpha',
              'kube-control': 'alpha',
              'kube-dns': 'alpha',
              nfs: 'alpha',
              'nrpe-external-master': 'alpha',
              openstack: 'alpha',
              'sdn-plugin': 'alpha',
              vsphere: 'alpha'
            },
            'public-address': ''
          }
        },
        machines: {
          '0': {
            'agent-status': {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2018-10-08T14:15:24.799890838Z',
              kind: '',
              version: '2.4.3',
              life: ''
            },
            'instance-status': {
              status: 'running',
              info: 'RUNNING',
              data: {},
              since: '2018-10-08T14:11:44.670960211Z',
              kind: '',
              version: '',
              life: ''
            },
            'modification-status': {
              status: 'idle',
              info: '',
              data: {},
              since: '2019-05-02T04:57:41.707463421Z',
              kind: '',
              version: '',
              life: ''
            },
            'dns-name': '35.184.25.213',
            'ip-addresses': [
              '35.184.25.213',
              '10.128.0.2',
              '252.0.32.1'
            ],
            'instance-id': 'juju-17a0b2-0',
            'display-name': '',
            series: 'bionic',
            id: '0',
            'network-interfaces': {
              ens4: {
                'ip-addresses': [
                  '10.128.0.2'
                ],
                'mac-address': '42:01:0a:80:00:02',
                gateway: '10.128.0.1',
                'is-up': true
              },
              'fan-252': {
                'ip-addresses': [
                  '252.0.32.1'
                ],
                'mac-address': '42:93:b1:d6:6b:13',
                space: 'alpha',
                'is-up': true
              }
            },
            containers: {},
            constraints: '',
            hardware: 'arch=amd64 cores=1 cpu-power=138 mem=1700M root-disk=10240M availability-zone=us-central1-a',
            jobs: [
              'JobHostUnits'
            ],
            'has-vote': false,
            'wants-vote': false
          },
          '1': {
            'agent-status': {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2018-10-08T14:16:33.09323003Z',
              kind: '',
              version: '2.4.3',
              life: ''
            },
            'instance-status': {
              status: 'running',
              info: 'RUNNING',
              data: {},
              since: '2018-10-08T14:13:14.188017622Z',
              kind: '',
              version: '',
              life: ''
            },
            'modification-status': {
              status: 'idle',
              info: '',
              data: {},
              since: '2019-05-02T04:57:41.707463421Z',
              kind: '',
              version: '',
              life: ''
            },
            'dns-name': '35.239.243.48',
            'ip-addresses': [
              '35.239.243.48',
              '10.128.0.8',
              '252.0.128.1'
            ],
            'instance-id': 'juju-17a0b2-1',
            'display-name': '',
            series: 'bionic',
            id: '1',
            'network-interfaces': {
              ens4: {
                'ip-addresses': [
                  '10.128.0.8'
                ],
                'mac-address': '42:01:0a:80:00:08',
                gateway: '10.128.0.1',
                'is-up': true
              },
              'fan-252': {
                'ip-addresses': [
                  '252.0.128.1'
                ],
                'mac-address': '42:f8:ca:c3:a1:15',
                space: 'alpha',
                'is-up': true
              }
            },
            containers: {},
            constraints: '',
            hardware: 'arch=amd64 cores=1 cpu-power=138 mem=1700M root-disk=10240M availability-zone=us-central1-a',
            jobs: [
              'JobHostUnits'
            ],
            'has-vote': false,
            'wants-vote': false
          },
          '2': {
            'agent-status': {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2018-10-08T14:17:04.802970819Z',
              kind: '',
              version: '2.4.3',
              life: ''
            },
            'instance-status': {
              status: 'running',
              info: 'RUNNING',
              data: {},
              since: '2018-10-08T14:12:47.935117603Z',
              kind: '',
              version: '',
              life: ''
            },
            'modification-status': {
              status: 'idle',
              info: '',
              data: {},
              since: '2019-05-02T04:57:41.707463421Z',
              kind: '',
              version: '',
              life: ''
            },
            'dns-name': '35.184.243.254',
            'ip-addresses': [
              '35.184.243.254',
              '10.128.0.4',
              '252.0.64.1'
            ],
            'instance-id': 'juju-17a0b2-2',
            'display-name': '',
            series: 'bionic',
            id: '2',
            'network-interfaces': {
              ens4: {
                'ip-addresses': [
                  '10.128.0.4'
                ],
                'mac-address': '42:01:0a:80:00:04',
                gateway: '10.128.0.1',
                'is-up': true
              },
              'fan-252': {
                'ip-addresses': [
                  '252.0.64.1'
                ],
                'mac-address': 'ae:82:80:fe:cc:b2',
                space: 'alpha',
                'is-up': true
              }
            },
            containers: {},
            constraints: '',
            hardware: 'arch=amd64 cores=1 cpu-power=138 mem=1700M root-disk=10240M availability-zone=us-central1-b',
            jobs: [
              'JobHostUnits'
            ],
            'has-vote': false,
            'wants-vote': false
          },
          '3': {
            'agent-status': {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2018-10-08T14:16:39.687870834Z',
              kind: '',
              version: '2.4.3',
              life: ''
            },
            'instance-status': {
              status: 'running',
              info: 'RUNNING',
              data: {},
              since: '2018-10-08T14:13:14.18800033Z',
              kind: '',
              version: '',
              life: ''
            },
            'modification-status': {
              status: 'idle',
              info: '',
              data: {},
              since: '2019-05-02T04:57:41.707463421Z',
              kind: '',
              version: '',
              life: ''
            },
            'dns-name': '35.224.252.29',
            'ip-addresses': [
              '35.224.252.29',
              '10.128.0.6',
              '252.0.96.1'
            ],
            'instance-id': 'juju-17a0b2-3',
            'display-name': '',
            series: 'bionic',
            id: '3',
            'network-interfaces': {
              ens4: {
                'ip-addresses': [
                  '10.128.0.6'
                ],
                'mac-address': '42:01:0a:80:00:06',
                gateway: '10.128.0.1',
                'is-up': true
              },
              'fan-252': {
                'ip-addresses': [
                  '252.0.96.1'
                ],
                'mac-address': 'e2:9f:ca:04:d8:a5',
                space: 'alpha',
                'is-up': true
              }
            },
            containers: {},
            constraints: '',
            hardware: 'arch=amd64 cores=1 cpu-power=138 mem=1700M root-disk=10240M availability-zone=us-central1-b',
            jobs: [
              'JobHostUnits'
            ],
            'has-vote': false,
            'wants-vote': false
          },
          '4': {
            'agent-status': {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2018-10-08T14:17:12.490336938Z',
              kind: '',
              version: '2.4.3',
              life: ''
            },
            'instance-status': {
              status: 'running',
              info: 'RUNNING',
              data: {},
              since: '2018-10-08T14:13:14.187392339Z',
              kind: '',
              version: '',
              life: ''
            },
            'modification-status': {
              status: 'idle',
              info: '',
              data: {},
              since: '2019-05-02T04:57:41.707463421Z',
              kind: '',
              version: '',
              life: ''
            },
            'dns-name': '35.232.127.235',
            'ip-addresses': [
              '35.232.127.235',
              '10.128.0.11',
              '252.0.176.1'
            ],
            'instance-id': 'juju-17a0b2-4',
            'display-name': '',
            series: 'bionic',
            id: '4',
            'network-interfaces': {
              ens4: {
                'ip-addresses': [
                  '10.128.0.11'
                ],
                'mac-address': '42:01:0a:80:00:0b',
                gateway: '10.128.0.1',
                'is-up': true
              },
              'fan-252': {
                'ip-addresses': [
                  '252.0.176.1'
                ],
                'mac-address': 'ae:8c:2e:9e:c8:1a',
                space: 'alpha',
                'is-up': true
              }
            },
            containers: {},
            constraints: '',
            hardware: 'arch=amd64 cores=1 cpu-power=138 mem=1700M root-disk=10240M availability-zone=us-central1-c',
            jobs: [
              'JobHostUnits'
            ],
            'has-vote': false,
            'wants-vote': false
          },
          '5': {
            'agent-status': {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2018-10-08T14:17:00.187538906Z',
              kind: '',
              version: '2.4.3',
              life: ''
            },
            'instance-status': {
              status: 'running',
              info: 'RUNNING',
              data: {},
              since: '2018-10-08T14:13:18.308584698Z',
              kind: '',
              version: '',
              life: ''
            },
            'modification-status': {
              status: 'idle',
              info: '',
              data: {},
              since: '2019-05-02T04:57:41.707463421Z',
              kind: '',
              version: '',
              life: ''
            },
            'dns-name': '35.239.136.24',
            'ip-addresses': [
              '35.239.136.24',
              '10.128.0.10',
              '252.0.160.1'
            ],
            'instance-id': 'juju-17a0b2-5',
            'display-name': '',
            series: 'bionic',
            id: '5',
            'network-interfaces': {
              ens4: {
                'ip-addresses': [
                  '10.128.0.10'
                ],
                'mac-address': '42:01:0a:80:00:0a',
                gateway: '10.128.0.1',
                'is-up': true
              },
              'fan-252': {
                'ip-addresses': [
                  '252.0.160.1'
                ],
                'mac-address': 'c2:84:fe:56:14:18',
                space: 'alpha',
                'is-up': true
              }
            },
            containers: {},
            constraints: '',
            hardware: 'arch=amd64 cores=1 cpu-power=138 mem=1700M root-disk=10240M availability-zone=us-central1-a',
            jobs: [
              'JobHostUnits'
            ],
            'has-vote': false,
            'wants-vote': false
          },
          '6': {
            'agent-status': {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2018-10-08T14:16:14.161622566Z',
              kind: '',
              version: '2.4.3',
              life: ''
            },
            'instance-status': {
              status: 'running',
              info: 'RUNNING',
              data: {},
              since: '2018-10-08T14:12:15.818963831Z',
              kind: '',
              version: '',
              life: ''
            },
            'modification-status': {
              status: 'idle',
              info: '',
              data: {},
              since: '2019-05-02T04:57:41.707463421Z',
              kind: '',
              version: '',
              life: ''
            },
            'dns-name': '35.188.207.247',
            'ip-addresses': [
              '35.188.207.247',
              '10.128.0.3',
              '252.0.48.1'
            ],
            'instance-id': 'juju-17a0b2-6',
            'display-name': '',
            series: 'bionic',
            id: '6',
            'network-interfaces': {
              ens4: {
                'ip-addresses': [
                  '10.128.0.3'
                ],
                'mac-address': '42:01:0a:80:00:03',
                gateway: '10.128.0.1',
                'is-up': true
              },
              'fan-252': {
                'ip-addresses': [
                  '252.0.48.1'
                ],
                'mac-address': '8e:af:90:57:9a:59',
                space: 'alpha',
                'is-up': true
              }
            },
            containers: {},
            constraints: '',
            hardware: 'arch=amd64 cores=1 cpu-power=138 mem=1700M root-disk=10240M availability-zone=us-central1-a',
            jobs: [
              'JobHostUnits'
            ],
            'has-vote': false,
            'wants-vote': false
          },
          '7': {
            'agent-status': {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2018-10-08T14:17:15.039999764Z',
              kind: '',
              version: '2.4.3',
              life: ''
            },
            'instance-status': {
              status: 'running',
              info: 'RUNNING',
              data: {},
              since: '2018-10-08T14:13:14.187669425Z',
              kind: '',
              version: '',
              life: ''
            },
            'modification-status': {
              status: 'idle',
              info: '',
              data: {},
              since: '2019-05-02T04:57:41.707463421Z',
              kind: '',
              version: '',
              life: ''
            },
            'dns-name': '35.225.168.246',
            'ip-addresses': [
              '35.225.168.246',
              '10.128.0.7',
              '252.0.112.1'
            ],
            'instance-id': 'juju-17a0b2-7',
            'display-name': '',
            series: 'bionic',
            id: '7',
            'network-interfaces': {
              ens4: {
                'ip-addresses': [
                  '10.128.0.7'
                ],
                'mac-address': '42:01:0a:80:00:07',
                gateway: '10.128.0.1',
                'is-up': true
              },
              'fan-252': {
                'ip-addresses': [
                  '252.0.112.1'
                ],
                'mac-address': 'e6:0d:97:91:6f:36',
                space: 'alpha',
                'is-up': true
              }
            },
            containers: {},
            constraints: '',
            hardware: 'arch=amd64 cores=1 cpu-power=138 mem=1700M root-disk=10240M availability-zone=us-central1-b',
            jobs: [
              'JobHostUnits'
            ],
            'has-vote': false,
            'wants-vote': false
          },
          '8': {
            'agent-status': {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2018-10-08T14:16:48.17982928Z',
              kind: '',
              version: '2.4.3',
              life: ''
            },
            'instance-status': {
              status: 'running',
              info: 'RUNNING',
              data: {},
              since: '2018-10-08T14:13:14.187532588Z',
              kind: '',
              version: '',
              life: ''
            },
            'modification-status': {
              status: 'idle',
              info: '',
              data: {},
              since: '2019-05-02T04:57:41.707463421Z',
              kind: '',
              version: '',
              life: ''
            },
            'dns-name': '35.188.63.154',
            'ip-addresses': [
              '35.188.63.154',
              '10.128.0.5',
              '252.0.80.1'
            ],
            'instance-id': 'juju-17a0b2-8',
            'display-name': '',
            series: 'bionic',
            id: '8',
            'network-interfaces': {
              ens4: {
                'ip-addresses': [
                  '10.128.0.5'
                ],
                'mac-address': '42:01:0a:80:00:05',
                gateway: '10.128.0.1',
                'is-up': true
              },
              'fan-252': {
                'ip-addresses': [
                  '252.0.80.1'
                ],
                'mac-address': 'b6:4f:ff:07:f5:29',
                space: 'alpha',
                'is-up': true
              }
            },
            containers: {},
            constraints: '',
            hardware: 'arch=amd64 cores=1 cpu-power=138 mem=1700M root-disk=10240M availability-zone=us-central1-b',
            jobs: [
              'JobHostUnits'
            ],
            'has-vote': false,
            'wants-vote': false
          },
          '9': {
            'agent-status': {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2018-10-08T14:17:05.646888979Z',
              kind: '',
              version: '2.4.3',
              life: ''
            },
            'instance-status': {
              status: 'running',
              info: 'RUNNING',
              data: {},
              since: '2018-10-08T14:13:14.187978395Z',
              kind: '',
              version: '',
              life: ''
            },
            'modification-status': {
              status: 'idle',
              info: '',
              data: {},
              since: '2019-05-02T04:57:41.707463421Z',
              kind: '',
              version: '',
              life: ''
            },
            'dns-name': '104.154.116.14',
            'ip-addresses': [
              '104.154.116.14',
              '10.128.0.9',
              '252.0.144.1'
            ],
            'instance-id': 'juju-17a0b2-9',
            'display-name': '',
            series: 'bionic',
            id: '9',
            'network-interfaces': {
              ens4: {
                'ip-addresses': [
                  '10.128.0.9'
                ],
                'mac-address': '42:01:0a:80:00:09',
                gateway: '10.128.0.1',
                'is-up': true
              },
              'fan-252': {
                'ip-addresses': [
                  '252.0.144.1'
                ],
                'mac-address': 'da:ed:5a:9b:e6:78',
                space: 'alpha',
                'is-up': true
              }
            },
            containers: {},
            constraints: '',
            hardware: 'arch=amd64 cores=1 cpu-power=138 mem=1700M root-disk=10240M availability-zone=us-central1-c',
            jobs: [
              'JobHostUnits'
            ],
            'has-vote': false,
            'wants-vote': false
          },
          '10': {
            'agent-status': {
              status: 'pending',
              info: '',
              data: {},
              since: '2019-05-08T16:13:16.312096379Z',
              kind: '',
              version: '',
              life: ''
            },
            'instance-status': {
              status: 'pending',
              info: '',
              data: {},
              since: '2019-05-08T16:13:16.312096379Z',
              kind: '',
              version: '',
              life: ''
            },
            'modification-status': {
              status: 'idle',
              info: '',
              data: {},
              since: '2019-05-08T16:13:16.312096379Z',
              kind: '',
              version: '',
              life: ''
            },
            'dns-name': '',
            'instance-id': 'pending',
            'display-name': '',
            series: 'precise',
            id: '10',
            containers: {},
            constraints: '',
            hardware: '',
            jobs: [
              'JobHostUnits'
            ],
            'has-vote': false,
            'wants-vote': false
          }
        },
        model: {
          name: 'mymodel4',
          type: 'iaas',
          'cloud-tag': 'cloud-google',
          region: 'us-central1',
          version: '2.4.3',
          'available-version': '',
          'model-status': {
            status: 'available',
            info: '',
            data: {},
            since: '2020-10-05T08:53:25.49578656Z',
            kind: '',
            version: '',
            life: ''
          },
          'meter-status': {
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
        uuid: 'd291b9ed-1e66-4023-84fe-57130e1fake2',
        info: {
          name: 'mymodel4',
          type: '',
          uuid: 'd291b9ed-1e66-4023-84fe-57130e1fake2',
          'controller-uuid': 'a030379a-940f-4760-8fcf-3062b41a04e7',
          'is-controller': false,
          'provider-type': 'gce',
          'default-series': 'bionic',
          'cloud-tag': 'cloud-google',
          'cloud-region': 'us-central1',
          'cloud-credential-tag': 'cloudcred-google_pizza@external_clean-algebra-206308',
          'owner-tag': 'user-pizza@external',
          life: 'alive',
          status: {
            status: 'available',
            info: '',
            since: '2020-10-05T08:53:25.495Z'
          },
          users: [
            {
              user: 'eggman@external',
              'display-name': '',
              'last-connection': '2020-11-19T18:44:37Z',
              access: 'read'
            }
          ],
          machines: [
            {
              id: '0',
              hardware: {
                arch: 'amd64',
                mem: 1700,
                'root-disk': 10240,
                cores: 1,
                'cpu-power': 138,
                'availability-zone': 'us-central1-a'
              },
              'instance-id': 'juju-17a0b2-0',
              status: 'started'
            },
            {
              id: '1',
              hardware: {
                arch: 'amd64',
                mem: 1700,
                'root-disk': 10240,
                cores: 1,
                'cpu-power': 138,
                'availability-zone': 'us-central1-a'
              },
              'instance-id': 'juju-17a0b2-1',
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
                'root-disk': 10240,
                cores: 1,
                'cpu-power': 138,
                'availability-zone': 'us-central1-b'
              },
              'instance-id': 'juju-17a0b2-2',
              status: 'started'
            },
            {
              id: '3',
              hardware: {
                arch: 'amd64',
                mem: 1700,
                'root-disk': 10240,
                cores: 1,
                'cpu-power': 138,
                'availability-zone': 'us-central1-b'
              },
              'instance-id': 'juju-17a0b2-3',
              status: 'started'
            },
            {
              id: '4',
              hardware: {
                arch: 'amd64',
                mem: 1700,
                'root-disk': 10240,
                cores: 1,
                'cpu-power': 138,
                'availability-zone': 'us-central1-c'
              },
              'instance-id': 'juju-17a0b2-4',
              status: 'started'
            },
            {
              id: '5',
              hardware: {
                arch: 'amd64',
                mem: 1700,
                'root-disk': 10240,
                cores: 1,
                'cpu-power': 138,
                'availability-zone': 'us-central1-a'
              },
              'instance-id': 'juju-17a0b2-5',
              status: 'started'
            },
            {
              id: '6',
              hardware: {
                arch: 'amd64',
                mem: 1700,
                'root-disk': 10240,
                cores: 1,
                'cpu-power': 138,
                'availability-zone': 'us-central1-a'
              },
              'instance-id': 'juju-17a0b2-6',
              status: 'started'
            },
            {
              id: '7',
              hardware: {
                arch: 'amd64',
                mem: 1700,
                'root-disk': 10240,
                cores: 1,
                'cpu-power': 138,
                'availability-zone': 'us-central1-b'
              },
              'instance-id': 'juju-17a0b2-7',
              status: 'started'
            },
            {
              id: '8',
              hardware: {
                arch: 'amd64',
                mem: 1700,
                'root-disk': 10240,
                cores: 1,
                'cpu-power': 138,
                'availability-zone': 'us-central1-b'
              },
              'instance-id': 'juju-17a0b2-8',
              status: 'started'
            },
            {
              id: '9',
              hardware: {
                arch: 'amd64',
                mem: 1700,
                'root-disk': 10240,
                cores: 1,
                'cpu-power': 138,
                'availability-zone': 'us-central1-c'
              },
              'instance-id': 'juju-17a0b2-9',
              status: 'started'
            }
          ],
          sla: null,
          'agent-version': '2.4.3'
        }
      },
      '5f612488-b60b-4256-814a-ba1fake7db23': {
        annotations: {
          mediawiki: {
            bundleURL: 'mymodel-2018-11-13',
            'gui-x': '1556.82177734375',
            'gui-y': '-2251.9531803131104'
          },
          mysql: {
            bundleURL: 'mymodel-2018-11-13',
            'gui-x': '2186.3283081054688',
            'gui-y': '-2254.820378303528'
          }
        },
        applications: {
          mediawiki: {
            'charm-verion': '',
            charm: 'cs:trusty/mediawiki-3',
            series: 'trusty',
            exposed: true,
            life: '',
            relations: {
              db: [
                'mysql'
              ]
            },
            'can-upgrade-to': 'cs:trusty/mediawiki-19',
            'subordinate-to': [],
            units: {
              'mediawiki/0': {
                'agent-status': {
                  status: 'lost',
                  info: 'agent is not communicating with the server',
                  data: {},
                  since: '2018-11-13T14:37:48.474814666Z',
                  kind: '',
                  version: '2.4.5',
                  life: ''
                },
                'workload-status': {
                  status: 'unknown',
                  info: 'agent lost, see \'juju show-status-log mediawiki/0\'',
                  data: {},
                  since: '2018-11-13T14:37:24.047363172Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-version': '',
                machine: '3',
                'opened-ports': [
                  '80/tcp'
                ],
                'public-address': '35.233.19.171',
                charm: '',
                subordinates: null
              }
            },
            'meter-statuses': null,
            status: {
              status: 'unknown',
              info: '',
              data: null,
              since: '2018-11-13T14:34:37.138938633Z',
              kind: '',
              version: '',
              life: ''
            },
            'workload-version': '',
            'charm-version': '',
            'charm-profile': '',
            'endpoint-bindings': {
              '': 'alpha',
              cache: 'alpha',
              db: 'alpha',
              slave: 'alpha',
              website: 'alpha'
            },
            'public-address': ''
          },
          mysql: {
            'charm-verion': '',
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
            'can-upgrade-to': 'cs:trusty/mysql-58',
            'subordinate-to': [],
            units: {
              'mysql/0': {
                'agent-status': {
                  status: 'lost',
                  info: 'agent is not communicating with the server',
                  data: {},
                  since: '2018-11-13T14:41:02.016347783Z',
                  kind: '',
                  version: '2.4.5',
                  life: ''
                },
                'workload-status': {
                  status: 'unknown',
                  info: 'agent lost, see \'juju show-status-log mysql/0\'',
                  data: {},
                  since: '2018-11-13T14:37:34.207651081Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-version': '',
                machine: '4',
                'opened-ports': null,
                'public-address': '35.240.53.197',
                charm: '',
                subordinates: null
              }
            },
            'meter-statuses': null,
            status: {
              status: 'unknown',
              info: '',
              data: null,
              since: '2018-11-13T14:34:37.178177152Z',
              kind: '',
              version: '',
              life: ''
            },
            'workload-version': '',
            'charm-version': '',
            'charm-profile': '',
            'endpoint-bindings': {
              '': 'alpha',
              ceph: 'alpha',
              cluster: 'alpha',
              data: 'alpha',
              db: 'alpha',
              'db-admin': 'alpha',
              ha: 'alpha',
              'local-monitors': 'alpha',
              master: 'alpha',
              monitors: 'alpha',
              munin: 'alpha',
              'nrpe-external-master': 'alpha',
              'shared-db': 'alpha',
              slave: 'alpha'
            },
            'public-address': ''
          }
        },
        machines: {
          '1': {
            'agent-status': {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2018-11-13T14:37:10.907031705Z',
              kind: '',
              version: '2.4.5',
              life: ''
            },
            'instance-status': {
              status: 'running',
              info: 'RUNNING',
              data: {},
              since: '2018-11-13T14:35:48.407691975Z',
              kind: '',
              version: '',
              life: ''
            },
            'modification-status': {
              status: 'idle',
              info: '',
              data: {},
              since: '2019-05-02T04:57:41.707463421Z',
              kind: '',
              version: '',
              life: ''
            },
            'dns-name': '35.240.42.59',
            'ip-addresses': [
              '35.240.42.59',
              '10.132.0.4',
              '252.0.64.1'
            ],
            'instance-id': 'juju-a7db23-1',
            'display-name': '',
            series: 'xenial',
            id: '1',
            'network-interfaces': {
              ens4: {
                'ip-addresses': [
                  '10.132.0.4'
                ],
                'mac-address': '42:01:0a:84:00:04',
                gateway: '10.132.0.1',
                'is-up': true
              },
              'fan-252': {
                'ip-addresses': [
                  '252.0.64.1'
                ],
                'mac-address': '92:2b:a1:fb:6a:1c',
                space: 'alpha',
                'is-up': true
              }
            },
            containers: {},
            constraints: '',
            hardware: 'arch=amd64 cores=1 cpu-power=138 mem=1700M root-disk=10240M availability-zone=europe-west1-d',
            jobs: [
              'JobHostUnits'
            ],
            'has-vote': false,
            'wants-vote': false
          },
          '2': {
            'agent-status': {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2018-11-13T14:37:29.766013507Z',
              kind: '',
              version: '2.4.5',
              life: ''
            },
            'instance-status': {
              status: 'running',
              info: 'RUNNING',
              data: {},
              since: '2018-11-13T14:35:52.917791812Z',
              kind: '',
              version: '',
              life: ''
            },
            'modification-status': {
              status: 'idle',
              info: '',
              data: {},
              since: '2019-05-02T04:57:41.707463421Z',
              kind: '',
              version: '',
              life: ''
            },
            'dns-name': '35.241.229.233',
            'ip-addresses': [
              '35.241.229.233',
              '10.132.0.5',
              '252.0.80.1'
            ],
            'instance-id': 'juju-a7db23-2',
            'display-name': '',
            series: 'xenial',
            id: '2',
            'network-interfaces': {
              ens4: {
                'ip-addresses': [
                  '10.132.0.5'
                ],
                'mac-address': '42:01:0a:84:00:05',
                gateway: '10.132.0.1',
                'is-up': true
              },
              'fan-252': {
                'ip-addresses': [
                  '252.0.80.1'
                ],
                'mac-address': '4a:2a:63:74:e2:f2',
                space: 'alpha',
                'is-up': true
              }
            },
            containers: {},
            constraints: '',
            hardware: 'arch=amd64 cores=1 cpu-power=138 mem=1700M root-disk=10240M availability-zone=europe-west1-b',
            jobs: [
              'JobHostUnits'
            ],
            'has-vote': false,
            'wants-vote': false
          },
          '3': {
            'agent-status': {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2018-11-13T14:36:39.42882555Z',
              kind: '',
              version: '2.4.5',
              life: ''
            },
            'instance-status': {
              status: 'running',
              info: 'RUNNING',
              data: {},
              since: '2018-11-13T14:35:22.612821332Z',
              kind: '',
              version: '',
              life: ''
            },
            'modification-status': {
              status: 'idle',
              info: '',
              data: {},
              since: '2019-05-02T04:57:41.707463421Z',
              kind: '',
              version: '',
              life: ''
            },
            'dns-name': '35.233.19.171',
            'ip-addresses': [
              '35.233.19.171',
              '10.132.0.3'
            ],
            'instance-id': 'juju-a7db23-3',
            'display-name': '',
            series: 'trusty',
            id: '3',
            'network-interfaces': {
              eth0: {
                'ip-addresses': [
                  '10.132.0.3'
                ],
                'mac-address': '42:01:0a:84:00:03',
                gateway: '10.132.0.1',
                'is-up': true
              }
            },
            containers: {},
            constraints: '',
            hardware: 'arch=amd64 cores=1 cpu-power=138 mem=1700M root-disk=10240M availability-zone=europe-west1-c',
            jobs: [
              'JobHostUnits'
            ],
            'has-vote': false,
            'wants-vote': false
          },
          '4': {
            'agent-status': {
              status: 'down',
              info: 'agent is not communicating with the server',
              data: {},
              since: '2018-11-13T14:36:30.506826465Z',
              kind: '',
              version: '2.4.5',
              life: ''
            },
            'instance-status': {
              status: 'running',
              info: 'RUNNING',
              data: {},
              since: '2018-11-13T14:35:10.16538196Z',
              kind: '',
              version: '',
              life: ''
            },
            'modification-status': {
              status: 'idle',
              info: '',
              data: {},
              since: '2019-05-02T04:57:41.707463421Z',
              kind: '',
              version: '',
              life: ''
            },
            'dns-name': '35.240.53.197',
            'ip-addresses': [
              '35.240.53.197',
              '10.132.0.2'
            ],
            'instance-id': 'juju-a7db23-4',
            'display-name': '',
            series: 'trusty',
            id: '4',
            'network-interfaces': {
              eth0: {
                'ip-addresses': [
                  '10.132.0.2'
                ],
                'mac-address': '42:01:0a:84:00:02',
                gateway: '10.132.0.1',
                'is-up': true
              }
            },
            containers: {},
            constraints: '',
            hardware: 'arch=amd64 cores=1 cpu-power=138 mem=1700M root-disk=10240M availability-zone=europe-west1-b',
            jobs: [
              'JobHostUnits'
            ],
            'has-vote': false,
            'wants-vote': false
          }
        },
        model: {
          name: 'testing',
          type: 'iaas',
          'cloud-tag': 'cloud-google',
          region: 'europe-west1',
          version: '2.4.5',
          'available-version': '',
          'model-status': {
            status: 'available',
            info: '',
            data: {},
            since: '2020-10-05T08:53:31.747135969Z',
            kind: '',
            version: '',
            life: ''
          },
          'meter-status': {
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
        uuid: '5f612488-b60b-4256-814a-ba1fake7db23',
        info: {
          name: 'testing',
          type: 'iaas',
          uuid: '5f612488-b60b-4256-814a-ba1fake7db23',
          'controller-uuid': 'a030379a-940f-4760-8fcf-3062b41a04e7',
          'is-controller': false,
          'provider-type': 'gce',
          'default-series': 'bionic',
          'cloud-tag': 'cloud-google',
          'cloud-region': 'europe-west1',
          'cloud-credential-tag': 'cloudcred-google_pizza@external_clean-algebra-206308',
          'owner-tag': 'user-pizza@external',
          life: 'alive',
          status: {
            status: 'available',
            info: '',
            since: '2020-10-05T08:53:31.747Z'
          },
          users: [
            {
              user: 'eggman@external',
              'display-name': '',
              'last-connection': '2020-11-19T18:44:37Z',
              access: 'read'
            }
          ],
          machines: [
            {
              id: '1',
              hardware: {
                arch: 'amd64',
                mem: 1700,
                'root-disk': 10240,
                cores: 1,
                'cpu-power': 138,
                'availability-zone': 'europe-west1-d'
              },
              'instance-id': 'juju-a7db23-1',
              status: 'started'
            },
            {
              id: '2',
              hardware: {
                arch: 'amd64',
                mem: 1700,
                'root-disk': 10240,
                cores: 1,
                'cpu-power': 138,
                'availability-zone': 'europe-west1-b'
              },
              'instance-id': 'juju-a7db23-2',
              status: 'started'
            },
            {
              id: '3',
              hardware: {
                arch: 'amd64',
                mem: 1700,
                'root-disk': 10240,
                cores: 1,
                'cpu-power': 138,
                'availability-zone': 'europe-west1-c'
              },
              'instance-id': 'juju-a7db23-3',
              status: 'started'
            },
            {
              id: '4',
              hardware: {
                arch: 'amd64',
                mem: 1700,
                'root-disk': 10240,
                cores: 1,
                'cpu-power': 138,
                'availability-zone': 'europe-west1-b'
              },
              'instance-id': 'juju-a7db23-4',
              status: 'started'
            }
          ],
          sla: null,
          'agent-version': '2.4.5'
        }
      },
      'fb7f06ff-2144-4be3-86c9-6fe44fake1b9': {
        annotations: {},
        applications: {
          elasticsearch: {
            'charm-verion': 'ab8ae89',
            charm: 'cs:elasticsearch-39',
            series: 'bionic',
            exposed: false,
            life: '',
            relations: {
              peer: [
                'elasticsearch'
              ]
            },
            'can-upgrade-to': '',
            'subordinate-to': [],
            units: {},
            'meter-statuses': null,
            status: {
              status: 'unknown',
              info: '',
              data: null,
              since: '2020-01-24T19:32:17.575398705Z',
              kind: '',
              version: '',
              life: ''
            },
            'workload-version': '',
            'charm-version': 'ab8ae89',
            'charm-profile': '',
            'endpoint-bindings': {
              '': 'alpha',
              client: 'alpha',
              data: 'alpha',
              logs: 'alpha',
              'nrpe-external-master': 'alpha',
              peer: 'alpha'
            },
            'public-address': ''
          },
          kibana: {
            'charm-verion': 'a264969',
            charm: 'cs:kibana-22',
            series: 'xenial',
            exposed: false,
            life: '',
            relations: {},
            'can-upgrade-to': '',
            'subordinate-to': [],
            units: {},
            'meter-statuses': null,
            status: {
              status: 'unknown',
              info: '',
              data: null,
              since: '2020-01-24T19:32:23.591928336Z',
              kind: '',
              version: '',
              life: ''
            },
            'workload-version': '',
            'charm-version': 'a264969',
            'charm-profile': '',
            'endpoint-bindings': {
              '': 'alpha',
              rest: 'alpha',
              web: 'alpha'
            },
            'public-address': ''
          },
          munin: {
            'charm-verion': '',
            charm: 'cs:trusty/munin-1',
            series: 'trusty',
            exposed: false,
            life: '',
            relations: {},
            'can-upgrade-to': '',
            'subordinate-to': [],
            units: {},
            'meter-statuses': null,
            status: {
              status: 'unknown',
              info: '',
              data: null,
              since: '2020-01-24T19:32:38.519666772Z',
              kind: '',
              version: '',
              life: ''
            },
            'workload-version': '',
            'charm-version': '',
            'charm-profile': '',
            'endpoint-bindings': {
              '': 'alpha',
              munin: 'alpha',
              website: 'alpha'
            },
            'public-address': ''
          },
          mysql: {
            'charm-verion': '',
            charm: 'cs:mysql-58',
            series: 'xenial',
            exposed: false,
            life: '',
            relations: {
              cluster: [
                'mysql'
              ]
            },
            'can-upgrade-to': '',
            'subordinate-to': [],
            units: {},
            'meter-statuses': null,
            status: {
              status: 'unknown',
              info: '',
              data: null,
              since: '2020-01-24T19:32:12.834313312Z',
              kind: '',
              version: '',
              life: ''
            },
            'workload-version': '',
            'charm-version': '',
            'charm-profile': '',
            'endpoint-bindings': {
              '': 'alpha',
              ceph: 'alpha',
              cluster: 'alpha',
              data: 'alpha',
              db: 'alpha',
              'db-admin': 'alpha',
              ha: 'alpha',
              'local-monitors': 'alpha',
              master: 'alpha',
              monitors: 'alpha',
              munin: 'alpha',
              'nrpe-external-master': 'alpha',
              'shared-db': 'alpha',
              slave: 'alpha'
            },
            'public-address': ''
          },
          prometheus: {
            'charm-verion': '',
            charm: 'cs:prometheus-7',
            series: 'trusty',
            exposed: false,
            life: '',
            relations: {},
            'can-upgrade-to': '',
            'subordinate-to': [],
            units: {},
            'meter-statuses': null,
            status: {
              status: 'unknown',
              info: '',
              data: null,
              since: '2020-01-24T19:32:31.486249196Z',
              kind: '',
              version: '',
              life: ''
            },
            'workload-version': '',
            'charm-version': '',
            'charm-profile': '',
            'endpoint-bindings': {
              '': 'alpha',
              'alertmanager-service': 'alpha',
              'blackbox-exporter': 'alpha',
              'grafana-source': 'alpha',
              'nrpe-external-master': 'alpha',
              scrape: 'alpha',
              'snmp-exporter': 'alpha',
              target: 'alpha',
              website: 'alpha'
            },
            'public-address': ''
          },
          rsyslog: {
            'charm-verion': '',
            charm: 'cs:rsyslog-14',
            series: 'bionic',
            exposed: false,
            life: '',
            relations: {},
            'can-upgrade-to': '',
            'subordinate-to': [],
            units: {},
            'meter-statuses': null,
            status: {
              status: 'unknown',
              info: '',
              data: null,
              since: '2020-01-24T19:33:55.747672765Z',
              kind: '',
              version: '',
              life: ''
            },
            'workload-version': '',
            'charm-version': '',
            'charm-profile': '',
            'endpoint-bindings': {
              '': 'alpha',
              aggregator: 'alpha',
              'nrpe-external-master': 'alpha'
            },
            'public-address': ''
          },
          wordpress: {
            'charm-verion': '90d781c',
            charm: 'cs:wordpress-0',
            series: 'bionic',
            exposed: false,
            life: '',
            relations: {
              loadbalancer: [
                'wordpress'
              ]
            },
            'can-upgrade-to': '',
            'subordinate-to': [],
            units: {},
            'meter-statuses': null,
            status: {
              status: 'unknown',
              info: '',
              data: null,
              since: '2020-01-24T19:32:07.226825961Z',
              kind: '',
              version: '',
              life: ''
            },
            'workload-version': '',
            'charm-version': '90d781c',
            'charm-profile': '',
            'endpoint-bindings': {
              '': 'alpha',
              cache: 'alpha',
              db: 'alpha',
              loadbalancer: 'alpha',
              nfs: 'alpha',
              website: 'alpha'
            },
            'public-address': ''
          }
        },
        machines: {},
        model: {
          name: 'all-unplaced',
          type: 'iaas',
          'cloud-tag': 'cloud-google',
          region: 'us-central1',
          version: '2.8.3',
          'available-version': '',
          'model-status': {
            status: 'available',
            info: '',
            data: {},
            since: '2020-10-05T08:53:18.164536214Z',
            kind: '',
            version: '',
            life: ''
          },
          'meter-status': {
            color: '',
            message: ''
          },
          sla: 'unsupported'
        },
        offers: {},
        relations: [
          {
            id: 0,
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
              status: 'joining',
              info: '',
              data: {},
              since: '2020-01-24T19:32:07.235452513Z',
              kind: '',
              version: '',
              life: ''
            }
          },
          {
            id: 1,
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
              since: '2020-01-24T19:32:12.841833507Z',
              kind: '',
              version: '',
              life: ''
            }
          },
          {
            id: 2,
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
              since: '2020-01-24T19:32:17.583564687Z',
              kind: '',
              version: '',
              life: ''
            }
          }
        ],
        uuid: 'fb7f06ff-2144-4be3-86c9-6fe44fake1b9',
        info: {
          name: 'all-unplaced',
          type: 'iaas',
          uuid: 'fb7f06ff-2144-4be3-86c9-6fe44fake1b9',
          'controller-uuid': 'a030379a-940f-4760-8fcf-3062b41a04e7',
          'is-controller': false,
          'provider-type': 'gce',
          'default-series': 'bionic',
          'cloud-tag': 'cloud-google',
          'cloud-region': 'us-central1',
          'cloud-credential-tag': 'cloudcred-google_eggman@external_juju',
          'owner-tag': 'user-eggman@external',
          life: 'alive',
          status: {
            status: 'available',
            info: '',
            since: '2020-10-05T08:53:18.164Z'
          },
          users: [
            {
              user: 'eggman@external',
              'display-name': 'eggman',
              'last-connection': '2020-11-19T18:44:37Z',
              access: 'admin'
            },
            {
              user: 'dots@external',
              'display-name': '',
              'last-connection': '2020-11-19T16:30:25Z',
              access: 'read'
            }
          ],
          machines: [],
          sla: null,
          'agent-version': '2.8.3'
        }
      },
      '57650e3c-815f-4540-89df-81fdfakeb7ef': {
        annotations: {
          easyrsa: {
            bundleURL: 'canonical-kubernetes/bundle/254',
            'gui-x': '450',
            'gui-y': '550'
          },
          elasticsearch: {
            bundleURL: 'elasticsearch-cluster/bundle/17',
            'gui-x': '1104',
            'gui-y': '52'
          },
          etcd: {
            bundleURL: 'canonical-kubernetes/bundle/254',
            'gui-x': '818',
            'gui-y': '563'
          },
          flannel: {
            bundleURL: 'canonical-kubernetes/bundle/254',
            'gui-x': '450',
            'gui-y': '750'
          },
          kibana: {
            bundleURL: 'elasticsearch-cluster/bundle/17',
            'gui-x': '1106',
            'gui-y': '371'
          },
          'kubeapi-load-balancer': {
            bundleURL: 'canonical-kubernetes/bundle/254',
            'gui-x': '450',
            'gui-y': '250'
          },
          'kubernetes-master': {
            bundleURL: 'canonical-kubernetes/bundle/254',
            'gui-x': '800',
            'gui-y': '850'
          },
          'kubernetes-worker': {
            bundleURL: 'canonical-kubernetes/bundle/254',
            'gui-x': '100',
            'gui-y': '850'
          },
          rsyslog: {
            'gui-x': '824',
            'gui-y': '213'
          }
        },
        applications: {
          easyrsa: {
            'charm-verion': '',
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
            'can-upgrade-to': '',
            'subordinate-to': [],
            units: {},
            'meter-statuses': null,
            status: {
              status: 'unknown',
              info: '',
              data: null,
              since: '2018-09-04T21:13:51.680343033Z',
              kind: '',
              version: '',
              life: ''
            },
            'workload-version': '',
            'charm-version': '',
            'charm-profile': '',
            'endpoint-bindings': {
              '': 'alpha',
              client: 'alpha'
            },
            'public-address': ''
          },
          elasticsearch: {
            'charm-verion': '',
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
            'can-upgrade-to': '',
            'subordinate-to': [],
            units: {},
            'meter-statuses': null,
            status: {
              status: 'unknown',
              info: '',
              data: null,
              since: '2018-09-04T19:24:40.602296842Z',
              kind: '',
              version: '',
              life: ''
            },
            'workload-version': '',
            'charm-version': '',
            'charm-profile': '',
            'endpoint-bindings': {
              '': 'alpha',
              client: 'alpha',
              data: 'alpha',
              logs: 'alpha',
              'nrpe-external-master': 'alpha',
              peer: 'alpha'
            },
            'public-address': ''
          },
          etcd: {
            'charm-verion': '',
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
            'can-upgrade-to': '',
            'subordinate-to': [],
            units: {},
            'meter-statuses': null,
            status: {
              status: 'unknown',
              info: '',
              data: null,
              since: '2018-09-04T21:13:51.68483125Z',
              kind: '',
              version: '',
              life: ''
            },
            'workload-version': '',
            'charm-version': '',
            'charm-profile': '',
            'endpoint-bindings': {
              '': 'alpha',
              certificates: 'alpha',
              cluster: 'alpha',
              db: 'alpha',
              'nrpe-external-master': 'alpha',
              proxy: 'alpha'
            },
            'public-address': ''
          },
          flannel: {
            'charm-verion': '',
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
            'can-upgrade-to': '',
            'subordinate-to': [
              'kubernetes-master',
              'kubernetes-worker'
            ],
            units: null,
            'meter-statuses': null,
            status: {
              status: 'unknown',
              info: '',
              data: null,
              since: '2018-09-04T21:13:51.680475374Z',
              kind: '',
              version: '',
              life: ''
            },
            'workload-version': '',
            'charm-version': '',
            'charm-profile': '',
            'endpoint-bindings': {
              '': 'alpha',
              cni: 'alpha',
              etcd: 'alpha',
              'nrpe-external-master': 'alpha'
            },
            'public-address': ''
          },
          kibana: {
            'charm-verion': '',
            charm: 'cs:trusty/kibana-14',
            series: 'trusty',
            exposed: false,
            life: '',
            relations: {
              rest: [
                'elasticsearch'
              ]
            },
            'can-upgrade-to': '',
            'subordinate-to': [],
            units: {},
            'meter-statuses': null,
            status: {
              status: 'unknown',
              info: '',
              data: null,
              since: '2018-09-04T19:24:40.602193361Z',
              kind: '',
              version: '',
              life: ''
            },
            'workload-version': '',
            'charm-version': '',
            'charm-profile': '',
            'endpoint-bindings': {
              '': 'alpha',
              rest: 'alpha',
              web: 'alpha'
            },
            'public-address': ''
          },
          'kubeapi-load-balancer': {
            'charm-verion': '',
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
            'can-upgrade-to': '',
            'subordinate-to': [],
            units: {},
            'meter-statuses': null,
            status: {
              status: 'unknown',
              info: '',
              data: null,
              since: '2018-09-04T21:13:51.08177152Z',
              kind: '',
              version: '',
              life: ''
            },
            'workload-version': '',
            'charm-version': '',
            'charm-profile': '',
            'endpoint-bindings': {
              '': 'alpha',
              apiserver: 'alpha',
              certificates: 'alpha',
              loadbalancer: 'alpha',
              'nrpe-external-master': 'alpha',
              website: 'alpha'
            },
            'public-address': ''
          },
          'kubernetes-master': {
            'charm-verion': '',
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
            'can-upgrade-to': '',
            'subordinate-to': [],
            units: {},
            'meter-statuses': null,
            status: {
              status: 'unknown',
              info: '',
              data: null,
              since: '2018-09-04T21:13:51.681160931Z',
              kind: '',
              version: '',
              life: ''
            },
            'workload-version': '',
            'charm-version': '',
            'charm-profile': '',
            'endpoint-bindings': {
              '': 'alpha',
              aws: 'alpha',
              'ceph-storage': 'alpha',
              certificates: 'alpha',
              'cluster-dns': 'alpha',
              cni: 'alpha',
              etcd: 'alpha',
              gcp: 'alpha',
              'kube-api-endpoint': 'alpha',
              'kube-control': 'alpha',
              loadbalancer: 'alpha',
              'nrpe-external-master': 'alpha',
              openstack: 'alpha',
              vsphere: 'alpha'
            },
            'public-address': ''
          },
          'kubernetes-worker': {
            'charm-verion': '',
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
            'can-upgrade-to': '',
            'subordinate-to': [],
            units: {},
            'meter-statuses': null,
            status: {
              status: 'unknown',
              info: '',
              data: null,
              since: '2018-09-04T21:13:51.680988946Z',
              kind: '',
              version: '',
              life: ''
            },
            'workload-version': '',
            'charm-version': '',
            'charm-profile': '',
            'endpoint-bindings': {
              '': 'alpha',
              aws: 'alpha',
              certificates: 'alpha',
              cni: 'alpha',
              dockerhost: 'alpha',
              gcp: 'alpha',
              'kube-api-endpoint': 'alpha',
              'kube-control': 'alpha',
              'kube-dns': 'alpha',
              nfs: 'alpha',
              'nrpe-external-master': 'alpha',
              openstack: 'alpha',
              'sdn-plugin': 'alpha',
              vsphere: 'alpha'
            },
            'public-address': ''
          },
          rsyslog: {
            'charm-verion': '',
            charm: 'cs:trusty/rsyslog-10',
            series: 'trusty',
            exposed: false,
            life: '',
            relations: {},
            'can-upgrade-to': '',
            'subordinate-to': [],
            units: {},
            'meter-statuses': null,
            status: {
              status: 'unknown',
              info: '',
              data: null,
              since: '2018-09-04T19:24:40.602281437Z',
              kind: '',
              version: '',
              life: ''
            },
            'workload-version': '',
            'charm-version': '',
            'charm-profile': '',
            'endpoint-bindings': {
              '': 'alpha',
              aggregator: 'alpha'
            },
            'public-address': ''
          }
        },
        machines: {},
        model: {
          name: 'group-test',
          type: 'iaas',
          'cloud-tag': 'cloud-google',
          region: 'us-central1',
          version: '2.8.3',
          'available-version': '',
          'model-status': {
            status: 'available',
            info: '',
            data: {},
            since: '2020-10-05T08:53:16.787051924Z',
            kind: '',
            version: '',
            life: ''
          },
          'meter-status': {
            color: '',
            message: ''
          },
          sla: 'unsupported'
        },
        offers: {},
        relations: [
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
          }
        ],
        uuid: '57650e3c-815f-4540-89df-81fdfakeb7ef',
        info: {
          name: 'group-test',
          type: '',
          uuid: '57650e3c-815f-4540-89df-81fdfakeb7ef',
          'controller-uuid': 'a030379a-940f-4760-8fcf-3062b41a04e7',
          'is-controller': false,
          'provider-type': 'gce',
          'default-series': 'bionic',
          'cloud-tag': 'cloud-google',
          'cloud-region': 'us-central1',
          'cloud-credential-tag': 'cloudcred-google_eggman@external_admin',
          'owner-tag': 'user-eggman@external',
          life: 'alive',
          status: {
            status: 'available',
            info: '',
            since: '2020-10-05T08:53:16.787Z'
          },
          users: [
            {
              user: 'cristinadresch@external',
              'display-name': '',
              'last-connection': '2020-11-18T15:06:16Z',
              access: 'read'
            },
            {
              user: 'eggman@external',
              'display-name': 'eggman',
              'last-connection': '2020-11-19T18:44:38Z',
              access: 'admin'
            },
            {
              user: 'lyubomir-popov@external',
              'display-name': '',
              'last-connection': '2020-11-19T11:22:04Z',
              access: 'read'
            },
            {
              user: 'spencerbygraves@external',
              'display-name': '',
              'last-connection': '2020-11-19T16:10:58Z',
              access: 'read'
            },
            {
              user: 'dots@external',
              'display-name': '',
              'last-connection': '2020-11-19T16:30:25Z',
              access: 'read'
            }
          ],
          machines: [],
          sla: null,
          'agent-version': '2.8.3'
        }
      },
      'eb211d71-d838-4e7f-8828-8cb5fake217e': {
        annotations: {},
        applications: {},
        machines: {},
        model: {
          name: 'foo',
          type: 'iaas',
          'cloud-tag': 'cloud-aws',
          region: 'eu-west-1',
          version: '2.8.3',
          'available-version': '',
          'model-status': {
            status: 'available',
            info: '',
            data: {},
            since: '2020-10-05T04:55:50.955893289Z',
            kind: '',
            version: '',
            life: ''
          },
          'meter-status': {
            color: '',
            message: ''
          },
          sla: 'unsupported'
        },
        offers: {},
        relations: null,
        uuid: 'eb211d71-d838-4e7f-8828-8cb5fake217e',
        info: {
          name: 'foo',
          type: 'iaas',
          uuid: 'eb211d71-d838-4e7f-8828-8cb5fake217e',
          'controller-uuid': 'a030379a-940f-4760-8fcf-3062b41a04e7',
          'is-controller': false,
          'provider-type': 'ec2',
          'default-series': 'bionic',
          'cloud-tag': 'cloud-aws',
          'cloud-region': 'eu-west-1',
          'cloud-credential-tag': 'cloudcred-aws_eggman@external_base',
          'owner-tag': 'user-eggman@external',
          life: 'alive',
          status: {
            status: 'available',
            info: '',
            since: '2020-10-05T04:55:50.955Z'
          },
          users: [
            {
              user: 'eggman@external',
              'display-name': 'eggman',
              'last-connection': '2020-11-19T18:44:39Z',
              access: 'admin'
            }
          ],
          machines: [],
          sla: null,
          'agent-version': '2.8.3'
        }
      },
      'c2d8a696-e2eb-4021-8ab0-12220fake62a': {
        annotations: {},
        applications: {
          cockroachdb: {
            'charm-verion': 'f092c0f',
            charm: 'local:bionic/cockroachdb-0',
            series: 'bionic',
            exposed: false,
            life: '',
            relations: {
              cluster: [
                'cockroachdb'
              ]
            },
            'can-upgrade-to': '',
            'subordinate-to': [],
            units: {},
            'meter-statuses': null,
            status: {
              status: 'unknown',
              info: '',
              data: null,
              since: '2020-06-30T17:37:20.874440055Z',
              kind: '',
              version: '',
              life: ''
            },
            'workload-version': '',
            'charm-version': 'f092c0f',
            'charm-profile': '',
            'endpoint-bindings': {
              '': 'alpha',
              cluster: 'alpha',
              db: 'alpha',
              'proxy-listen-tcp': 'alpha'
            },
            'public-address': ''
          }
        },
        machines: {},
        model: {
          name: 'local-test',
          type: 'iaas',
          'cloud-tag': 'cloud-aws',
          region: 'us-east-1',
          version: '2.8.3',
          'available-version': '',
          'model-status': {
            status: 'available',
            info: '',
            data: {},
            since: '2020-10-05T06:53:07.977309332Z',
            kind: '',
            version: '',
            life: ''
          },
          'meter-status': {
            color: '',
            message: ''
          },
          sla: 'unsupported'
        },
        offers: {},
        relations: [
          {
            id: 0,
            key: 'cockroachdb:cluster',
            'interface': 'cockroachdb-peer',
            scope: 'global',
            endpoints: [
              {
                application: 'cockroachdb',
                name: 'cluster',
                role: 'peer',
                subordinate: false
              }
            ],
            status: {
              status: 'joining',
              info: '',
              data: {},
              since: '2020-06-30T17:37:20.877272231Z',
              kind: '',
              version: '',
              life: ''
            }
          }
        ],
        uuid: 'c2d8a696-e2eb-4021-8ab0-12220fake62a',
        info: {
          name: 'local-test',
          type: 'iaas',
          uuid: 'c2d8a696-e2eb-4021-8ab0-12220fake62a',
          'controller-uuid': 'a030379a-940f-4760-8fcf-3062b41a04e7',
          'is-controller': false,
          'provider-type': 'ec2',
          'default-series': 'bionic',
          'cloud-tag': 'cloud-aws',
          'cloud-region': 'us-east-1',
          'cloud-credential-tag': 'cloudcred-aws_eggman@external_base',
          'owner-tag': 'user-eggman@external',
          life: 'alive',
          status: {
            status: 'available',
            info: '',
            since: '2020-10-05T06:53:07.977Z'
          },
          users: [
            {
              user: 'island@external',
              'display-name': '',
              'last-connection': '2020-11-19T16:43:56Z',
              access: 'read'
            },
            {
              user: 'eggman@external',
              'display-name': 'eggman',
              'last-connection': '2020-11-19T18:44:39Z',
              access: 'admin'
            }
          ],
          machines: [],
          sla: null,
          'agent-version': '2.8.3'
        }
      },
      'e6782960-fb0b-460e-82a1-64eefakea39b': {
        annotations: {
          elasticsearch: {
            bundleURL: 'elasticsearch-cluster/bundle/17',
            'gui-x': '1104',
            'gui-y': '52'
          },
          kibana: {
            bundleURL: 'elasticsearch-cluster/bundle/17',
            'gui-x': '1106',
            'gui-y': '371'
          }
        },
        applications: {
          elasticsearch: {
            'charm-verion': '',
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
            'can-upgrade-to': '',
            'subordinate-to': [],
            units: {},
            'meter-statuses': null,
            status: {
              status: 'unknown',
              info: '',
              data: null,
              since: '2019-10-03T13:46:03.467910559Z',
              kind: '',
              version: '',
              life: ''
            },
            'workload-version': '',
            'charm-version': '',
            'charm-profile': '',
            'endpoint-bindings': {
              '': 'alpha',
              client: 'alpha',
              data: 'alpha',
              logs: 'alpha',
              'nrpe-external-master': 'alpha',
              peer: 'alpha'
            },
            'public-address': ''
          },
          kibana: {
            'charm-verion': '',
            charm: 'cs:trusty/kibana-14',
            series: 'trusty',
            exposed: false,
            life: '',
            relations: {
              rest: [
                'elasticsearch'
              ]
            },
            'can-upgrade-to': '',
            'subordinate-to': [],
            units: {},
            'meter-statuses': null,
            status: {
              status: 'unknown',
              info: '',
              data: null,
              since: '2019-10-03T13:46:03.467826196Z',
              kind: '',
              version: '',
              life: ''
            },
            'workload-version': '',
            'charm-version': '',
            'charm-profile': '',
            'endpoint-bindings': {
              '': 'alpha',
              rest: 'alpha',
              web: 'alpha'
            },
            'public-address': ''
          }
        },
        machines: {},
        model: {
          name: 'new-search-aggregate',
          type: 'iaas',
          'cloud-tag': 'cloud-google',
          region: 'us-central1',
          version: '2.8.3',
          'available-version': '',
          'model-status': {
            status: 'available',
            info: '',
            data: {},
            since: '2020-10-05T08:53:23.255546922Z',
            kind: '',
            version: '',
            life: ''
          },
          'meter-status': {
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
              since: '2020-06-01T19:30:48.646568376Z',
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
              since: '2020-06-01T19:30:48.584642069Z',
              kind: '',
              version: '',
              life: ''
            }
          }
        ],
        uuid: 'e6782960-fb0b-460e-82a1-64eefakea39b',
        info: {
          name: 'new-search-aggregate',
          type: 'iaas',
          uuid: 'e6782960-fb0b-460e-82a1-64eefakea39b',
          'controller-uuid': 'a030379a-940f-4760-8fcf-3062b41a04e7',
          'is-controller': false,
          'provider-type': 'gce',
          'default-series': 'bionic',
          'cloud-tag': 'cloud-google',
          'cloud-region': 'us-central1',
          'cloud-credential-tag': 'cloudcred-google_eggman@external_jujuongce',
          'owner-tag': 'user-eggman@external',
          life: 'alive',
          status: {
            status: 'available',
            info: '',
            since: '2020-10-05T08:53:23.255Z'
          },
          users: [
            {
              user: 'island@external',
              'display-name': '',
              'last-connection': '2020-11-19T16:43:56Z',
              access: 'read'
            },
            {
              user: 'blr@external',
              'display-name': '',
              'last-connection': '2020-04-23T21:29:28Z',
              access: 'read'
            },
            {
              user: 'pizza@external',
              'display-name': '',
              'last-connection': '2020-11-18T15:46:02Z',
              access: 'read'
            },
            {
              user: 'eggman@external',
              'display-name': 'eggman',
              'last-connection': '2020-11-19T18:44:39Z',
              access: 'admin'
            },
            {
              user: 'dots@external',
              'display-name': '',
              'last-connection': '2020-11-19T16:30:25Z',
              access: 'read'
            }
          ],
          machines: [],
          sla: null,
          'agent-version': '2.8.3'
        }
      },
      '2446d278-7928-4c50-811b-563efaked991': {
        annotations: {},
        applications: {},
        machines: {},
        model: {
          name: 'test1',
          type: 'iaas',
          'cloud-tag': 'cloud-google',
          region: 'us-east1',
          version: '2.8.3',
          'available-version': '',
          'model-status': {
            status: 'available',
            info: '',
            data: {},
            since: '2020-10-26T15:07:32.661025231Z',
            kind: '',
            version: '',
            life: ''
          },
          'meter-status': {
            color: '',
            message: ''
          },
          sla: 'unsupported'
        },
        offers: {},
        relations: null,
        uuid: '2446d278-7928-4c50-811b-563efaked991',
        info: {
          name: 'test1',
          type: 'iaas',
          uuid: '2446d278-7928-4c50-811b-563efaked991',
          'controller-uuid': 'a030379a-940f-4760-8fcf-3062b41a04e7',
          'is-controller': false,
          'provider-type': 'gce',
          'default-series': 'bionic',
          'cloud-tag': 'cloud-google',
          'cloud-region': 'us-east1',
          'cloud-credential-tag': 'cloudcred-google_eggman@external_juju',
          'owner-tag': 'user-eggman@external',
          life: 'alive',
          status: {
            status: 'available',
            info: '',
            since: '2020-10-26T15:07:32.661Z'
          },
          users: [
            {
              user: 'eggman@external',
              'display-name': 'eggman',
              'last-connection': '2020-11-19T18:44:40Z',
              access: 'admin'
            }
          ],
          machines: [],
          sla: null,
          'agent-version': '2.8.3'
        }
      },
      '930f4bb0-070a-462a-8d4e-19d97fake8f2': {
        annotations: {
          logstash: {
            'gui-x': '1040',
            'gui-y': '292.29491924311225'
          },
          munin: {
            'gui-x': '640',
            'gui-y': '292.29491924311225'
          },
          prometheus: {
            'gui-x': '440',
            'gui-y': '638.7050807568877'
          }
        },
        applications: {
          elasticsearch: {
            'charm-verion': 'ab8ae89',
            charm: 'cs:elasticsearch-39',
            series: 'bionic',
            exposed: false,
            life: '',
            relations: {
              peer: [
                'elasticsearch'
              ]
            },
            'can-upgrade-to': '',
            'subordinate-to': [],
            units: {},
            'meter-statuses': null,
            status: {
              status: 'unknown',
              info: '',
              data: null,
              since: '2020-01-23T21:27:32.329152688Z',
              kind: '',
              version: '',
              life: ''
            },
            'workload-version': '',
            'charm-version': 'ab8ae89',
            'charm-profile': '',
            'endpoint-bindings': {
              '': 'alpha',
              client: 'alpha',
              data: 'alpha',
              logs: 'alpha',
              'nrpe-external-master': 'alpha',
              peer: 'alpha'
            },
            'public-address': ''
          },
          kibana: {
            'charm-verion': 'a264969',
            charm: 'cs:kibana-22',
            series: 'xenial',
            exposed: false,
            life: '',
            relations: {},
            'can-upgrade-to': '',
            'subordinate-to': [],
            units: {},
            'meter-statuses': null,
            status: {
              status: 'unknown',
              info: '',
              data: null,
              since: '2020-01-23T21:27:36.529058775Z',
              kind: '',
              version: '',
              life: ''
            },
            'workload-version': '',
            'charm-version': 'a264969',
            'charm-profile': '',
            'endpoint-bindings': {
              '': 'alpha',
              rest: 'alpha',
              web: 'alpha'
            },
            'public-address': ''
          },
          logstash: {
            'charm-verion': '9940e45',
            charm: 'cs:logstash-5',
            series: 'xenial',
            exposed: false,
            life: '',
            relations: {},
            'can-upgrade-to': '',
            'subordinate-to': [],
            units: {},
            'meter-statuses': null,
            status: {
              status: 'unknown',
              info: '',
              data: null,
              since: '2020-01-23T20:05:53.450038215Z',
              kind: '',
              version: '',
              life: ''
            },
            'workload-version': '',
            'charm-version': '9940e45',
            'charm-profile': '',
            'endpoint-bindings': {
              '': 'alpha',
              beat: 'alpha',
              client: 'alpha',
              elasticsearch: 'alpha',
              java: 'alpha'
            },
            'public-address': ''
          },
          munin: {
            'charm-verion': '',
            charm: 'cs:trusty/munin-1',
            series: 'trusty',
            exposed: false,
            life: '',
            relations: {},
            'can-upgrade-to': '',
            'subordinate-to': [],
            units: {},
            'meter-statuses': null,
            status: {
              status: 'unknown',
              info: '',
              data: null,
              since: '2020-01-23T20:06:18.518200887Z',
              kind: '',
              version: '',
              life: ''
            },
            'workload-version': '',
            'charm-version': '',
            'charm-profile': '',
            'endpoint-bindings': {
              '': 'alpha',
              munin: 'alpha',
              website: 'alpha'
            },
            'public-address': ''
          },
          prometheus: {
            'charm-verion': '',
            charm: 'cs:prometheus-7',
            series: 'trusty',
            exposed: false,
            life: '',
            relations: {},
            'can-upgrade-to': '',
            'subordinate-to': [],
            units: {},
            'meter-statuses': null,
            status: {
              status: 'unknown',
              info: '',
              data: null,
              since: '2020-01-23T20:06:12.321136882Z',
              kind: '',
              version: '',
              life: ''
            },
            'workload-version': '',
            'charm-version': '',
            'charm-profile': '',
            'endpoint-bindings': {
              '': 'alpha',
              'alertmanager-service': 'alpha',
              'blackbox-exporter': 'alpha',
              'grafana-source': 'alpha',
              'nrpe-external-master': 'alpha',
              scrape: 'alpha',
              'snmp-exporter': 'alpha',
              target: 'alpha',
              website: 'alpha'
            },
            'public-address': ''
          }
        },
        machines: {},
        model: {
          name: 'unplaced',
          type: 'iaas',
          'cloud-tag': 'cloud-google',
          region: 'us-central1',
          version: '2.8.3',
          'available-version': '',
          'model-status': {
            status: 'available',
            info: '',
            data: {},
            since: '2020-10-05T08:53:26.889235336Z',
            kind: '',
            version: '',
            life: ''
          },
          'meter-status': {
            color: '',
            message: ''
          },
          sla: 'unsupported'
        },
        offers: {},
        relations: [
          {
            id: 1,
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
              since: '2020-01-23T21:27:32.336368829Z',
              kind: '',
              version: '',
              life: ''
            }
          }
        ],
        uuid: '930f4bb0-070a-462a-8d4e-19d97fake8f2',
        info: {
          name: 'unplaced',
          type: 'iaas',
          uuid: '930f4bb0-070a-462a-8d4e-19d97fake8f2',
          'controller-uuid': 'a030379a-940f-4760-8fcf-3062b41a04e7',
          'is-controller': false,
          'provider-type': 'gce',
          'default-series': 'bionic',
          'cloud-tag': 'cloud-google',
          'cloud-region': 'us-central1',
          'cloud-credential-tag': 'cloudcred-google_eggman@external_juju',
          'owner-tag': 'user-eggman@external',
          life: 'alive',
          status: {
            status: 'available',
            info: '',
            since: '2020-10-05T08:53:26.889Z'
          },
          users: [
            {
              user: 'eggman@external',
              'display-name': 'eggman',
              'last-connection': '2020-11-19T18:44:40Z',
              access: 'admin'
            },
            {
              user: 'lyubomir-popov@external',
              'display-name': '',
              'last-connection': '2020-11-19T11:22:04Z',
              access: 'read'
            }
          ],
          machines: [],
          sla: null,
          'agent-version': '2.8.3'
        }
      },
      '06b11eb5-abd6-48f3-8910-b54cfake5e60': {
        annotations: {
          grafana: {
            'gui-x': '600',
            'gui-y': '300'
          },
          haproxy: {
            'gui-x': '330',
            'gui-y': '333'
          },
          mysql: {
            'gui-x': '380',
            'gui-y': '88'
          }
        },
        applications: {
          grafana: {
            'charm-verion': '',
            charm: 'cs:~prometheus-charmers/grafana-3',
            series: 'xenial',
            exposed: true,
            life: '',
            relations: {},
            'can-upgrade-to': 'cs:~prometheus-charmers/grafana-38',
            'subordinate-to': [],
            units: {
              'grafana/0': {
                'agent-status': {
                  status: 'idle',
                  info: '',
                  data: {},
                  since: '2020-10-26T15:07:48.746939145Z',
                  kind: '',
                  version: '2.8.3',
                  life: ''
                },
                'workload-status': {
                  status: 'active',
                  info: 'Started grafana-server',
                  data: {},
                  since: '2020-10-05T08:41:02.930871546Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-version': '',
                machine: '6',
                'opened-ports': [
                  '3000/tcp'
                ],
                'public-address': '104.196.135.3',
                charm: '',
                subordinates: null,
                leader: true
              }
            },
            'meter-statuses': null,
            status: {
              status: 'active',
              info: 'Started grafana-server',
              data: {},
              since: '2020-10-05T08:41:02.930871546Z',
              kind: '',
              version: '',
              life: ''
            },
            'workload-version': '',
            'charm-version': '',
            'charm-profile': '',
            'endpoint-bindings': {
              '': 'alpha',
              'grafana-source': 'alpha',
              'nrpe-external-master': 'alpha',
              website: 'alpha'
            },
            'public-address': ''
          },
          haproxy: {
            'charm-verion': '',
            charm: 'cs:haproxy-40',
            series: 'xenial',
            exposed: true,
            life: '',
            relations: {
              peer: [
                'haproxy'
              ]
            },
            'can-upgrade-to': 'cs:haproxy-60',
            'subordinate-to': [],
            units: {
              'haproxy/0': {
                'agent-status': {
                  status: 'idle',
                  info: '',
                  data: {},
                  since: '2020-11-19T18:40:12.759163573Z',
                  kind: '',
                  version: '2.8.3',
                  life: ''
                },
                'workload-status': {
                  status: 'error',
                  info: 'hook failed: "config-changed"',
                  data: {},
                  since: '2020-11-19T18:40:12.759163573Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-version': '',
                machine: '1',
                'opened-ports': [
                  '80/tcp'
                ],
                'public-address': '34.75.252.140',
                charm: '',
                subordinates: null,
                leader: true
              }
            },
            'meter-statuses': null,
            status: {
              status: 'error',
              info: 'hook failed: "config-changed"',
              data: {
                hook: 'config-changed'
              },
              since: '2020-11-19T18:40:12.759163573Z',
              kind: '',
              version: '',
              life: ''
            },
            'workload-version': '',
            'charm-version': '',
            'charm-profile': '',
            'endpoint-bindings': {
              '': 'alpha',
              'local-monitors': 'alpha',
              munin: 'alpha',
              'nrpe-external-master': 'alpha',
              peer: 'alpha',
              reverseproxy: 'alpha',
              statistics: 'alpha',
              website: 'alpha'
            },
            'public-address': ''
          },
          mysql: {
            'charm-verion': '',
            charm: 'cs:mysql-57',
            series: 'xenial',
            exposed: true,
            life: '',
            relations: {
              cluster: [
                'mysql'
              ]
            },
            'can-upgrade-to': 'cs:mysql-58',
            'subordinate-to': [],
            units: {
              'mysql/0': {
                'agent-status': {
                  status: 'idle',
                  info: '',
                  data: {},
                  since: '2020-10-26T15:08:17.483832621Z',
                  kind: '',
                  version: '2.8.3',
                  life: ''
                },
                'workload-status': {
                  status: 'active',
                  info: 'Ready',
                  data: {},
                  since: '2020-10-05T08:41:21.19174506Z',
                  kind: '',
                  version: '',
                  life: ''
                },
                'workload-version': '5.7.19',
                machine: '9',
                'opened-ports': [
                  '3306/tcp'
                ],
                'public-address': '35.237.46.199',
                charm: '',
                subordinates: null,
                leader: true
              }
            },
            'meter-statuses': null,
            status: {
              status: 'active',
              info: 'Ready',
              data: {},
              since: '2020-10-05T08:41:21.19174506Z',
              kind: '',
              version: '',
              life: ''
            },
            'workload-version': '5.7.19',
            'charm-version': '',
            'charm-profile': '',
            'endpoint-bindings': {
              '': 'alpha',
              ceph: 'alpha',
              cluster: 'alpha',
              data: 'alpha',
              db: 'alpha',
              'db-admin': 'alpha',
              ha: 'alpha',
              'local-monitors': 'alpha',
              master: 'alpha',
              monitors: 'alpha',
              munin: 'alpha',
              'nrpe-external-master': 'alpha',
              'shared-db': 'alpha',
              slave: 'alpha'
            },
            'public-address': ''
          }
        },
        machines: {
          '1': {
            'agent-status': {
              status: 'started',
              info: '',
              data: {},
              since: '2020-10-26T15:07:49.968845115Z',
              kind: '',
              version: '2.8.3',
              life: ''
            },
            'instance-status': {
              status: 'running',
              info: 'RUNNING',
              data: {},
              since: '2017-03-09T20:40:24.303597554Z',
              kind: '',
              version: '',
              life: ''
            },
            'modification-status': {
              status: 'idle',
              info: '',
              data: {},
              since: '2019-05-02T07:58:10.050960196Z',
              kind: '',
              version: '',
              life: ''
            },
            'dns-name': '34.75.252.140',
            'ip-addresses': [
              '34.75.252.140',
              '10.142.0.3'
            ],
            'instance-id': 'juju-905e60-1',
            'display-name': '',
            series: 'xenial',
            id: '1',
            'network-interfaces': {
              ens4: {
                'ip-addresses': [
                  '10.142.0.3'
                ],
                'mac-address': '42:01:0a:8e:00:03',
                gateway: '10.142.0.1',
                'is-up': true
              }
            },
            containers: {},
            constraints: '',
            hardware: 'arch=amd64 cores=1 cpu-power=138 mem=1700M root-disk=10240M availability-zone=us-east1-c',
            jobs: [
              'JobHostUnits'
            ],
            'has-vote': false,
            'wants-vote': false
          },
          '6': {
            'agent-status': {
              status: 'started',
              info: '',
              data: {},
              since: '2020-10-26T15:07:19.956166665Z',
              kind: '',
              version: '2.8.3',
              life: ''
            },
            'instance-status': {
              status: 'running',
              info: 'RUNNING',
              data: {},
              since: '2017-08-08T18:34:53.07539597Z',
              kind: '',
              version: '',
              life: ''
            },
            'modification-status': {
              status: 'idle',
              info: '',
              data: {},
              since: '2019-05-02T07:58:10.050960196Z',
              kind: '',
              version: '',
              life: ''
            },
            'dns-name': '104.196.135.3',
            'ip-addresses': [
              '104.196.135.3',
              '10.142.0.5'
            ],
            'instance-id': 'juju-905e60-6',
            'display-name': '',
            series: 'xenial',
            id: '6',
            'network-interfaces': {
              ens4: {
                'ip-addresses': [
                  '10.142.0.5'
                ],
                'mac-address': '42:01:0a:8e:00:05',
                gateway: '10.142.0.1',
                'is-up': true
              }
            },
            containers: {},
            constraints: '',
            hardware: 'arch=amd64 cores=1 cpu-power=138 mem=1700M root-disk=10240M availability-zone=us-east1-b',
            jobs: [
              'JobHostUnits'
            ],
            'has-vote': false,
            'wants-vote': false
          },
          '9': {
            'agent-status': {
              status: 'started',
              info: '',
              data: {},
              since: '2020-10-26T15:07:19.686071748Z',
              kind: '',
              version: '2.8.3',
              life: ''
            },
            'instance-status': {
              status: 'running',
              info: 'RUNNING',
              data: {},
              since: '2017-08-10T18:36:41.667407283Z',
              kind: '',
              version: '',
              life: ''
            },
            'modification-status': {
              status: 'idle',
              info: '',
              data: {},
              since: '2019-05-02T07:58:10.050960196Z',
              kind: '',
              version: '',
              life: ''
            },
            'dns-name': '35.237.46.199',
            'ip-addresses': [
              '35.237.46.199',
              '10.142.0.7'
            ],
            'instance-id': 'juju-905e60-9',
            'display-name': '',
            series: 'xenial',
            id: '9',
            'network-interfaces': {
              ens4: {
                'ip-addresses': [
                  '10.142.0.7'
                ],
                'mac-address': '42:01:0a:8e:00:07',
                gateway: '10.142.0.1',
                'is-up': true
              }
            },
            containers: {},
            constraints: '',
            hardware: 'arch=amd64 cores=1 cpu-power=138 mem=1700M root-disk=10240M availability-zone=us-east1-d',
            jobs: [
              'JobHostUnits'
            ],
            'has-vote': false,
            'wants-vote': false
          },
          '10': {
            'agent-status': {
              status: 'started',
              info: '',
              data: {},
              since: '2020-10-26T15:07:37.501067542Z',
              kind: '',
              version: '2.7.6',
              life: ''
            },
            'instance-status': {
              status: 'running',
              info: 'RUNNING',
              data: {},
              since: '2020-04-23T14:12:50.368766501Z',
              kind: '',
              version: '',
              life: ''
            },
            'modification-status': {
              status: 'idle',
              info: '',
              data: {},
              since: '2020-04-23T14:12:26.014033618Z',
              kind: '',
              version: '',
              life: ''
            },
            'dns-name': '34.73.118.115',
            'ip-addresses': [
              '34.73.118.115',
              '10.142.0.52'
            ],
            'instance-id': 'juju-905e60-10',
            'display-name': '',
            series: 'eoan',
            id: '10',
            'network-interfaces': {
              ens4: {
                'ip-addresses': [
                  '10.142.0.52'
                ],
                'mac-address': '42:01:0a:8e:00:34',
                gateway: '10.142.0.1',
                'is-up': true
              }
            },
            containers: {},
            constraints: 'mem=16384M',
            hardware: 'arch=amd64 cores=4 cpu-power=1100 mem=26000M root-disk=10240M availability-zone=us-east1-b',
            jobs: [
              'JobHostUnits'
            ],
            'has-vote': false,
            'wants-vote': false
          }
        },
        model: {
          name: 'juju-kpi',
          type: 'iaas',
          'cloud-tag': 'cloud-google',
          region: 'us-east1',
          version: '2.8.3',
          'available-version': '',
          'model-status': {
            status: 'available',
            info: '',
            data: {},
            since: '2020-10-26T15:07:57.762760916Z',
            kind: '',
            version: '',
            life: ''
          },
          'meter-status': {
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
              since: '2020-10-26T15:08:12.110832551Z',
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
              since: '2020-10-26T15:08:17.338992544Z',
              kind: '',
              version: '',
              life: ''
            }
          }
        ],
        uuid: '06b11eb5-abd6-48f3-8910-b54cfake5e60',
        info: {
          name: 'juju-kpi',
          type: '',
          uuid: '06b11eb5-abd6-48f3-8910-b54cfake5e60',
          'controller-uuid': 'a030379a-940f-4760-8fcf-3062b41a04e7',
          'is-controller': false,
          'provider-type': 'gce',
          'default-series': 'xenial',
          'cloud-tag': 'cloud-google',
          'cloud-region': 'us-east1',
          'cloud-credential-tag': 'cloudcred-google_bike@external_google-bot',
          'owner-tag': 'user-bike@external',
          life: 'alive',
          status: {
            status: 'available',
            info: '',
            since: '2020-10-26T15:07:57.762Z'
          },
          users: [
            {
              user: 'eggman@external',
              'display-name': '',
              'last-connection': '2020-11-19T18:44:41Z',
              access: 'read'
            }
          ],
          machines: [
            {
              id: '1',
              hardware: {
                arch: 'amd64',
                mem: 1700,
                'root-disk': 10240,
                cores: 1,
                'cpu-power': 138,
                'availability-zone': 'us-east1-c'
              },
              'instance-id': 'juju-905e60-1',
              status: 'started'
            },
            {
              id: '6',
              hardware: {
                arch: 'amd64',
                mem: 1700,
                'root-disk': 10240,
                cores: 1,
                'cpu-power': 138,
                'availability-zone': 'us-east1-b'
              },
              'instance-id': 'juju-905e60-6',
              status: 'started'
            },
            {
              id: '9',
              hardware: {
                arch: 'amd64',
                mem: 1700,
                'root-disk': 10240,
                cores: 1,
                'cpu-power': 138,
                'availability-zone': 'us-east1-d'
              },
              'instance-id': 'juju-905e60-9',
              status: 'started'
            },
            {
              id: '1',
              hardware: {
                arch: 'amd64',
                mem: 1700,
                'root-disk': 10240,
                cores: 1,
                'cpu-power': 138,
                'availability-zone': 'us-east1-c'
              },
              'instance-id': 'juju-905e60-1',
              status: 'started'
            },
            {
              id: '10',
              hardware: {
                arch: 'amd64',
                mem: 26000,
                'root-disk': 10240,
                cores: 4,
                'cpu-power': 1100,
                'availability-zone': 'us-east1-b'
              },
              'instance-id': 'juju-905e60-10',
              status: 'started'
            },
            {
              id: '6',
              hardware: {
                arch: 'amd64',
                mem: 1700,
                'root-disk': 10240,
                cores: 1,
                'cpu-power': 138,
                'availability-zone': 'us-east1-b'
              },
              'instance-id': 'juju-905e60-6',
              status: 'started'
            },
            {
              id: '9',
              hardware: {
                arch: 'amd64',
                mem: 1700,
                'root-disk': 10240,
                cores: 1,
                'cpu-power': 138,
                'availability-zone': 'us-east1-d'
              },
              'instance-id': 'juju-905e60-9',
              status: 'started'
            }
          ],
          sla: null,
          'agent-version': '2.8.3'
        }
      }
    },
    controllers: {
      'wss://jimm.jujucharms.com/api': [
        {
          path: 'admin/jaas',
          Public: true,
          uuid: 'a030379a-940f-4760-8fcf-3062b41a04e7',
          version: '2.8.3'
        },
        {
          path: 'admins/1-eu-west-1-aws-jaas',
          location: {
            cloud: 'aws',
            region: 'eu-west-1'
          },
          Public: true,
          uuid: '086f0bf8-da79-4ad4-8d73-890721332c8b',
          version: '2.6.10'
        },
      ]
    }
  },
  ui: {
    userMenuActive: false
  }
}
