module.exports = {
  'GET /v1/host'(req, res) {
    res.json({
      type: 'collection',
      data: [
        {
          id: 1,
          state: 'Activated',
          name: 'HostnameOne',
          ip: '104.198.40.11',
          total: '2T',
          used: '61G',
          replicas: [
            {
              status: 'Healthy',
              name: 'Replica 1',
              used: '61GB',
              volume: 'Vol2',
              created: '4:10PM 3/14/17',
            },
            {
              status: 'Healthy',
              name: 'Replica 2',
              used: '1T',
              volume: 'Vol3',
              created: '4:10PM 3/14/17',
            },
            {
              status: 'Healthy',
              name: 'Replica 3',
              used: '2T',
              volume: 'Vol4',
              created: '4:10PM 3/14/17',
            },
          ],
        },
        {
          id: 2,
          state: 'Activated',
          name: 'HostnameTwo',
          ip: '104.198.15.51',
          total: '2T',
          used: '61G',
          replicas: [
            {
              status: 'Healthy',
              name: 'Replica 1',
              used: '61GB',
              volume: 'Vol2',
              created: '4:10PM 3/14/17',
            },
            {
              status: 'Healthy',
              name: 'Replica 2',
              used: '1T',
              volume: 'Vol3',
              created: '4:10PM 3/14/17',
            },
            {
              status: 'Healthy',
              name: 'Replica 3',
              used: '2T',
              volume: 'Vol4',
              created: '4:10PM 3/14/17',
            },
          ],
        },
        {
          id: 3,
          state: 'Activated',
          name: 'HostnameThree',
          ip: '104.198.43.13',
          total: '2T',
          used: '61G',
          replicas: [
            {
              status: 'Healthy',
              name: 'Replica 1',
              used: '61GB',
              volume: 'Vol2',
              created: '4:10PM 3/14/17',
            },
            {
              status: 'Healthy',
              name: 'Replica 2',
              used: '1T',
              volume: 'Vol3',
              created: '4:10PM 3/14/17',
            },
            {
              status: 'Healthy',
              name: 'Replica 3',
              used: '2T',
              volume: 'Vol4',
              created: '4:10PM 3/14/17',
            },
          ],
        },
        {
          id: 4,
          state: 'Activated',
          name: 'HostnameFour',
          ip: '104.198.42.42',
          total: '2T',
          used: '61G',
          replicas: [
            {
              status: 'Healthy',
              name: 'Replica 1',
              used: '61GB',
              volume: 'Vol2',
              created: '4:10PM 3/14/17',
            },
          ],
        },
        {
          id: 5,
          state: 'Activated',
          name: 'HostnameFive',
          ip: '104.198.76.115',
          total: '2T',
          used: '61G',
          replicas: [
            {
              status: 'Healthy',
              name: 'Replica 1',
              used: '61GB',
              volume: 'Vol2',
              created: '4:10PM 3/14/17',
            },
            {
              status: 'Healthy',
              name: 'Replica 3',
              used: '2T',
              volume: 'Vol4',
              created: '4:10PM 3/14/17',
            },
          ],
        },
      ],
    })
  },
}
