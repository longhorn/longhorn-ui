module.exports = {
  'GET /v1/backup'(req, res) {
    res.json({
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
    })
  },
}
