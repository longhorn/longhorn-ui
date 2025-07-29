module.exports = [
  {
    key: 'dashboard',
    name: 'Dashboard',
  },
  {
    key: 'node',
    name: 'Node',
  },
  {
    key: 'volume',
    name: 'Volume',
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
  },
  {
    key: 'backupAndRestore',
    name: 'Backup and Restore',
    child: [
      {
        show: true,
        key: 'backup',
        name: 'Backup',
      },
      {
        show: true,
        key: 'backupTarget',
        name: 'Backup Target',
      },
      {
        show: true,
        key: 'systemBackups',
        name: 'System Backup',
      },
    ],
  },
  {
    key: 'advanced',
    name: 'Advanced',
    child: [
      {
        show: true,
        key: 'backingImage',
        name: 'Backing Image',
      },
      {
        show: true,
        key: 'orphanedData',
        name: 'Orphan Resources',
      },
      {
        show: true,
        key: 'engineimage',
        name: 'Engine Image',
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
      },
    ],
  },
  {
    key: 'setting',
    name: 'Settings',
  },
]
