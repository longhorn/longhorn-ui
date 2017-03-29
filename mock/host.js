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
        },
        {
          id: 2,
          state: 'Activated',
          name: 'HostnameTwo',
          ip: '104.198.15.51',
          total: '2T',
          used: '61G',
        },
        {
          id: 3,
          state: 'Activated',
          name: 'HostnameThree',
          ip: '104.198.43.13',
          total: '2T',
          used: '61G',
        },
        {
          id: 4,
          state: 'Activated',
          name: 'HostnameFour',
          ip: '104.198.42.42',
          total: '2T',
          used: '61G',
        },
        {
          id: 5,
          state: 'Activated',
          name: 'HostnameFive',
          ip: '104.198.76.115',
          total: '2T',
          used: '61G',
        },
      ],
    })
  },
}
