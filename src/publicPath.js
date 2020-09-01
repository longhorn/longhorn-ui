/* eslint-disable */
const pathname = window.location.pathname

window.__pathname_prefix__ = pathname

//For custom Column(init column)
let column = window.sessionStorage.getItem('customColumnList');
let columnArr = [
	'state',
	'id',
	'size',
	'created',
	'kubernetesStatus',
	'namespace',
	'WorkloadNameAndPodName',
	'recurringJobs',
	'lastBackupAt',
	'actualSize',
]

if (column) {
  columnArr = JSON.parse(column)
}

window.__column__ = columnArr
