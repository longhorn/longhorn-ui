/* eslint-disable */
const pathname = window.location.pathname

window.__pathname_prefix__ = pathname

//For custom Column(init column)
let column = window.sessionStorage.getItem('customColumnList')
let pageSizeCollection = window.sessionStorage.getItem('pageSizeCollection')
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
	'dataEngine',
]
let pageSizeCollectionObject = {
  volumePageSize: 10,
  backupPageSize: 10,
  backupDetailPageSize: 10,
  hostPageSize: 10,
  instanceManagerSize: 10,
  orphanedDataSize: 10,
}
if (column) {
  columnArr = JSON.parse(column)
}
if (pageSizeCollection) {
  pageSizeCollectionObject = JSON.parse(pageSizeCollection)
}
window.__column__ = columnArr
window.__page_size_object__ = pageSizeCollectionObject
