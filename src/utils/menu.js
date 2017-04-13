module.exports = [
  {
    key: 'dashboard',
    name: 'Dashboard',
    icon: 'bar-chart',
  },
  {
    key: 'host',
    name: 'Host',
    icon: 'laptop',
  },
  {
    key: 'volume',
    name: 'Volume',
    icon: 'database',
    child: [
      {
        key: 'detail',
        name: 'Detail',
      },
    ],
  },
  {
    key: 'backup',
    name: 'Backup',
    icon: 'copy',
  },
  {
    key: 'setting',
    name: 'Setting',
    icon: 'setting',
  },
]
