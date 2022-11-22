module.exports = [
  {
    key: 'dashboard',
    name: 'Dashboard',
    icon: 'bar-chart',
  },
  {
    key: 'node',
    name: 'Node',
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
    key: 'recurringJob',
    name: 'Recurring Job',
    icon: 'history',
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
    child: [
      {
        show: true,
        key: 'setting',
        name: 'General',
        icon: 'setting',
      },
      {
        show: true,
        key: 'engineimage',
        name: 'Engine Image',
        icon: 'api',
        child: [
          {
            key: 'detail',
            name: 'Detail',
          },
        ],
      },
      {
        show: true,
        key: 'orphanedData',
        name: 'Orphaned Data',
        icon: 'profile',
      },
      {
        show: true,
        key: 'backingImage',
        name: 'Backing Image',
        icon: 'file-image',
      },
      {
        show: true,
        key: 'instanceManager',
        name: 'Instance Manager Image',
        icon: 'apartment',
      },
      {
        show: true,
        key: 'systemBackups',
        name: 'System Backup',
        icon: 'file-sync',
      },
    ],
  },
]
