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
    key: 'backupAndRestore',
    name: 'Backup and Restore',
    icon: 'cloud-sync',
    child: [
      {
        show: true,
        key: 'backup',
        name: 'Backup',
        icon: 'copy',
      },
      {
        show: true,
        key: 'backupTarget',
        name: 'Backup Target',
        icon: 'cloud-server',
      },
      {
        show: true,
        key: 'systemBackups',
        name: 'System Backup',
        icon: 'file-sync',
      },
    ],
  },
  {
    key: 'advanced',
    name: 'Advanced',
    icon: 'bars',
    child: [
      {
        show: true,
        key: 'backingImage',
        name: 'Backing Image',
        icon: 'file-image',
      },
      {
        show: true,
        key: 'orphanedData',
        name: 'Orphan Resources',
        icon: 'profile',
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
        key: 'instanceManager',
        name: 'Instance Manager Image',
        icon: 'apartment',
      },
    ],
  },
  {
    key: 'setting',
    name: 'Setting',
    icon: 'setting',
  },
]
