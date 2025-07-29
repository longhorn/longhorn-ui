module.exports = [
  {
    key: 'dashboard',
    name: 'Dashboard',
  },
  {
    key: 'node',
    name: 'Nodes',
  },
  {
    key: 'volume',
    name: 'Volumes',
    child: [
      {
        key: 'detail',
        name: 'Detail',
      },
    ],
  },
  {
    key: 'recurringJob',
    name: 'Recurring Jobs',
  },
  {
    key: 'backupAndRestore',
    name: 'Backup and Restore',
    child: [
      {
        show: true,
        key: 'backup',
        name: 'Backups',
      },
      {
        show: true,
        key: 'backupTarget',
        name: 'Backup Targets',
      },
      {
        show: true,
        key: 'systemBackups',
        name: 'System Backups',
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
        name: 'Backing Images',
      },
      {
        show: true,
        key: 'orphanedData',
        name: 'Orphan Resources',
      },
      {
        show: true,
        key: 'engineimage',
        name: 'Engine Images',
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
        name: 'Instance Manager Images',
      },
    ],
  },
  {
    key: 'setting',
    name: 'Settings',
  },
]
