export default {
  'GET /v1/backup': {
    type: 'collection',
    data: [
      {
        id: 'BackupID1',
        snapshot: 'Snapshot1',
        timestamp: '11:06AM 3/24/2017',
        size: '500GB',
        created: '4:10PM 3/14/17',
      },
      {
        id: 'BackupID2',
        snapshot: 'Snapshot2',
        timestamp: '11:06AM 3/24/2017',
        size: '500GB',
        created: '4:10PM 3/14/17',
      },
      {
        id: 'BackupID3',
        snapshot: 'Snapshot3',
        timestamp: '11:06AM 3/24/2017',
        size: '500GB',
        created: '4:10PM 3/14/17',
      },
      {
        id: 'BackupID4',
        snapshot: 'Snapshot4',
        timestamp: '11:06AM 3/24/2017',
        size: '500GB',
        created: '4:10PM 3/14/17',
      },
    ],
  },
  'GET /v1/settings': {"data":[{"actions":{},"id":"backupTarget","links":{"self":"http://54.223.25.181:9500/v1/settings/backupTarget"},"name":"backupTarget","type":"setting","value":"vfs:///var/lib/longhorn/backups/default"},{"actions":{},"id":"longhornImage","links":{"self":"http://54.223.25.181:9500/v1/settings/longhornImage"},"name":"longhornImage","type":"setting","value":"rancher/longhorn:latest"}],"links":{"self":"http://54.223.25.181:9500/v1/settings"},"resourceType":"setting","type":"collection"},
  'GET /v1/hosts': {"data":[{"actions":{},"address":"172.17.0.2:9500","id":"1855b313-afd7-4280-8159-0b0003799125","links":{"self":"http://54.223.25.181:9500/v1/hosts/1855b313-afd7-4280-8159-0b0003799125"},"name":"7bd760eca456","type":"host","uuid":"1855b313-afd7-4280-8159-0b0003799125"},{"actions":{},"address":"172.17.0.2:9500","id":"75af1511-7078-48e3-a14b-1b4c7307bc0f","links":{"self":"http://54.223.25.181:9500/v1/hosts/75af1511-7078-48e3-a14b-1b4c7307bc0f"},"name":"5c983ce6c5e4","type":"host","uuid":"75af1511-7078-48e3-a14b-1b4c7307bc0f"},{"actions":{},"address":"172.17.0.6:9500","id":"d7c419e3-ae14-4115-a060-3f201395a17b","links":{"self":"http://54.223.25.181:9500/v1/hosts/d7c419e3-ae14-4115-a060-3f201395a17b"},"name":"9833f6cae4dc","type":"host","uuid":"d7c419e3-ae14-4115-a060-3f201395a17b"}],"links":{"self":"http://54.223.25.181:9500/v1/hosts"},"resourceType":"host","type":"collection"},
  'GET /v1/dashboard': {
    numbers: [
      {
        icon: 'laptop',
        color: '#64ea91',
        title: 'Hosts',
        number: 5,
      }, {
        icon: 'hdd',
        color: '#8fc9fb',
        title: 'Disks',
        number: 25,
      }, {
        icon: 'database',
        color: '#d897eb',
        title: 'Volumes',
        number: 114,
      }, {
        icon: 'camera-o',
        color: '#f69899',
        title: 'Snapshots',
        number: 46,
      },
    ],
  },
  'GET /v1/volumes': { "createTypes": { "volume": "http://54.223.25.181:9500/v1/volumes" }, "data": [{ "actions": { "attach": "http://54.223.25.181:9500/v1/volumes/logan?action=attach" }, "id": "logan", "links": { "self": "http://54.223.25.181:9500/v1/volumes/logan" }, "longhornImage": "rancher/longhorn:latest", "name": "logan", "numberOfReplicas": 2, "replicas": [{ "address": "172.17.0.7", "hostId": "d7c419e3-ae14-4115-a060-3f201395a17b", "name": "logan-replica-6b52250d-4e44-40ca", "running": true }, { "address": "172.17.0.2", "hostId": "d7c419e3-ae14-4115-a060-3f201395a17b", "name": "logan-replica-dbfaa09a-dd07-4762", "running": true }], "size": "10737418240", "staleReplicaTimeout": 20, "state": "detached", "type": "volume" }], "links": { "self": "http://54.223.25.181:9500/v1/volumes" }, "resourceType": "volume", "type": "collection" }
};
