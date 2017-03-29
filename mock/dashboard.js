import { color } from '../src/utils/theme'

module.exports = {
  'GET /v1/dashboard'(req, res) {
    res.json({
      numbers: [
        {
          icon: 'laptop',
          color: color.green,
          title: 'Hosts',
          number: 5,
        }, {
          icon: 'hdd',
          color: color.blue,
          title: 'Disks',
          number: 25,
        }, {
          icon: 'database',
          color: color.purple,
          title: 'Volumes',
          number: 114,
        }, {
          icon: 'camera-o',
          color: color.red,
          title: 'Snapshots',
          number: 46,
        },
      ],
    })
  },
}
