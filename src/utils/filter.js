// Healthy (green)
// a. Volume.State == attached && volume.Robustness == Healthy
export function healthyVolume(data) { return data.filter(item => item.state === 'attached' && item.robustness === 'healthy') }
// In Progress (blue)
// a. (Volume.State != attached and volume.State != detached) or (volume.State == attached && volume.Robustness != Healthy && volume.Robustness != Degraded)
export function inProgressVolume(data) { return data.filter(item => (item.state !== 'attached' && item.state !== 'detached') || (item.state === 'attached' && item.robustness !== 'healthy' && item.robustness !== 'degraded')) }
// Degraded (yellow)
// a. Volume.State == attached && volume.Robustness == Degraded
export function degradedVolume(data) { return data.filter(item => item.state === 'attached' && item.robustness === 'degraded') }
// Detached (grey)
// a. Volume.State == detached && volume.Robustness != Fault
export function detachedVolume(data) { return data.filter((item) => item.state === 'detached' && item.robustness !== 'faulted') }
// Fault (red)
// a. Volume.State == detached && volume.Robustness == Fault
export function faultedVolume(data) { return data.filter((item) => item.state === 'detached' && item.robustness === 'faulted') }

const isSchedulable = (node) => node.conditions && node.conditions.Schedulable && node.conditions.Schedulable.status.toLowerCase() === 'true'
                                                && node.conditions.Ready && node.conditions.Ready.status.toLowerCase() === 'true'
                                                && node.allowScheduling === true
                                                && (Object.values(node.disks).some(d => d.allowScheduling === true) && Object.values(node.disks).some(d => d.conditions && d.conditions.Schedulable.status.toLowerCase() === 'true'))
const isUnschedulable = (node) => (node.conditions && node.allowScheduling === true && Object.values(node.disks).every(d => d.allowScheduling === false || (d.conditions && d.conditions.Schedulable && d.conditions.Schedulable.status.toLowerCase() === 'false') || (d.conditions && d.conditions.Ready && d.conditions.Ready.status.toLowerCase() === 'false'))) || (node.conditions && node.conditions.Schedulable && node.conditions.Schedulable.status.toLowerCase() === 'false')
const isAutoEvicting = (node) => node.conditions && node.conditions.Ready && node.conditions.Ready.status.toLowerCase() === 'true'
                                                 && node.conditions.Schedulable && node.conditions.Schedulable.status.toLowerCase() === 'false'
                                                 && node.allowScheduling === true
                                                 && node.autoEvicting === true
const isDisabled = (node) => node.conditions && node.conditions.Ready && node.conditions.Ready.status.toLowerCase() === 'true'
                                             && (node.allowScheduling === false || Object.values(node.disks).every(d => d.allowScheduling === false))
const isDown = (node) => node.conditions && node.conditions.Ready && node.conditions.Ready.status.toLowerCase() === 'false'

export const diskStatusColorMap = {
  ready: { color: '#27AE5F', bg: 'rgba(39,174,95,.05)' }, // green
  starting: { color: '#F1C40F', bg: 'rgba(241,196,15,.05)' }, // yellow
  pending: { color: '#F1C40F', bg: 'rgba(241,196,15,.05)' }, // yellow
  'in-progress': { color: '#F1C40F', bg: 'rgba(241,196,15,.05)' }, // yellow
  'ready-for-transfer': { color: '#F1C40F', bg: 'rgba(241,196,15,.05)' }, // yellow
  'failed-and-cleanup': { color: '#F15354', bg: 'rgba(241,83,84,.05)' }, // red
  failed: { color: '#F15354', bg: 'rgba(241,83,84,.05)' }, // red
}

export const nodeStatusColorMap = {
  schedulable: { color: '#27AE5F', bg: 'rgba(39,174,95,.05)' }, // green
  unschedulable: { color: '#F1C40F', bg: 'rgba(241,196,15,.05)' }, // yellow
  // autoEvicting nodes are a subset of unschedulable nodes. We use the same color to represent both.
  autoEvicting: { color: '#F1C40F', bg: 'rgba(241,196,15,.05)' }, // yellow
  down: { color: '#F15354', bg: 'rgba(241,83,84,.1)' }, // red
  disabled: { color: '#dee1e3', bg: 'rgba(222,225,227,.05)' }, // grey
  unknown: { color: '#F15354', bg: 'rgba(241,83,84,.05)' }, // red
}
export function getNodeStatus(node) {
  // autoEvicting nodes are a subset of unschedulable nodes and the autoEvicting status takes precedence for display.
  const p = [{ key: 'down', name: 'Down', determine: isDown }, { key: 'disabled', name: 'Disabled', determine: isDisabled }, { key: 'autoEvicting', name: 'AutoEvicting', determine: isAutoEvicting }, { key: 'unschedulable', name: 'Unschedulable', determine: isUnschedulable }, { key: 'schedulable', name: 'Schedulable', determine: isSchedulable }]
  for (let i = 0; i < p.length; i++) {
    if (p[i].determine(node)) {
      return { key: p[i].key, name: p[i].name }
    }
  }
  return { key: 'unknown', name: 'Unknown' }
}

// Schedulable (green)
// Node is Ready and Schedulable by condition. Node is Schedulable by policy. At least one disk is schedulable by policy and condition.
export function schedulableNode(data) { return data.filter(node => isSchedulable(node)) }
// Unschedulable (yellow)
// Node is Ready by condition. Node is Schedulable by policy. Either node is not Schedulable by condition or all disks are not Ready or not Schedulable by condition.
export function unschedulableNode(data) { return data.filter(node => (isUnschedulable(node) && !isDisabled(node) && !isDown(node))) }
// AutoEvicting (also yellow)
// Node is Ready but not Schedulable by condition. Node is Schedulable by policy. Node is AutoEvicting.
export function autoEvictingNode(data) { return data.filter(node => (isAutoEvicting(node))) }
// Scheduling disabled (grey)
// Node is Ready by condition. Either node is not Schedulable by policy or all disks are not Schedulable by policy.
export function schedulingDisabledNode(data) { return data.filter(node => isDisabled(node)) }
// Down (red)
// Node is not ready by condition.
export function downNode(data) { return data.filter(node => isDown(node)) }

function filterData(data, field, value) {
  return data.filter(item => (item[field] || '').toLowerCase().indexOf(value.toLowerCase()) > -1)
}

function validReplicas(replicas) {
  return replicas.filter(item => item.failedAt === '')
}

export function isVolumeImageUpgradable(volume, defaultImage) {
  // v2 engine does not support upgrade
  if (volume.dataEngine === 'v2') return false

  const robustness = volume.robustness.toLowerCase() === 'unknown' ? '' : volume.robustness.hyphenToHump()
  const state = volume.state.toLowerCase()
  return volume.currentImage !== '' && defaultImage && defaultImage.image !== volume.currentImage && ((state === 'attached' && robustness === 'healthy') || (state === 'detached' && robustness !== 'faulted'))
}

export function isVolumeSchedule(volume) {
  return volume.recurringJobs && volume.recurringJobs.length > 0
}

export function isVolumeReplicaNotRedundancy(volume) {
  const totalReplicas = validReplicas(volume.replicas)
  const numberOfReplicas = totalReplicas && totalReplicas.length
  const volumeNodeReplicas = totalReplicas.reduce((total, current) => {
    const replicas = total[current.hostId] || []
    replicas.push(current)
    total[current.hostId] = replicas
    return total
  }, {})
  return Object.keys(volumeNodeReplicas).length === 1 && numberOfReplicas > 1 && totalReplicas.every(item => item.hostId !== '')
}

export function isVolumeRelicaLimited(volume) {
  const totalReplicas = validReplicas(volume.replicas)
  const numberOfReplicas = totalReplicas && totalReplicas.length
  const volumeNodeReplicas = totalReplicas.reduce((total, current) => {
    const replicas = total[current.hostId] || []
    replicas.push(current)
    total[current.hostId] = replicas
    return total
  }, {})
  const keyLen = Object.keys(volumeNodeReplicas).length
  return keyLen > 0 && numberOfReplicas > 0 && keyLen < numberOfReplicas && totalReplicas.every(item => item.hostId !== '')
}

export function isVolumeRelicaRedundancy(volume) {
  const numberOfReplicas = volume.numberOfReplicas
  const totalReplicas = validReplicas(volume.replicas)
  const volumeNodeReplicas = totalReplicas.reduce((total, current) => {
    const replicas = total[current.hostId] || []
    replicas.push(current)
    total[current.hostId] = replicas
    return total
  }, {})
  return Object.keys(volumeNodeReplicas).length === numberOfReplicas
}

export function filterVolume(data, field, value) {
  if (field === 'host') {
    return data.filter(item => item.controllers.some(c => c.hostId.indexOf(value) > -1))
  }
  if (field === 'replicaNodeRedundancy') {
    if (value === 'no') {
      return data.filter(item => isVolumeReplicaNotRedundancy(item))
    } else if (value === 'yes') {
      return data.filter(item => isVolumeRelicaRedundancy(item))
    } else if (value === 'limited') {
      return data.filter(item => isVolumeRelicaLimited(item))
    }
    return data
  }
  if (field === 'namespace') {
    return data.filter(item => item && item.kubernetesStatus && item.kubernetesStatus.namespace.indexOf(value) > -1)
  }

  if (field === 'pvName') {
    return data.filter(item => item && item.kubernetesStatus && item.kubernetesStatus.pvName.indexOf(value) > -1)
  }

  if (field === 'pvcName') {
    return data.filter(item => item && item.kubernetesStatus && item.kubernetesStatus.pvcName.indexOf(value) > -1)
  }

  if (field === 'DiskTag') {
    return data.filter(item => (item.diskSelector || []).some((ele) => ele.toLowerCase().indexOf(value.toLowerCase()) > -1))
  }

  if (field === 'NodeTag') {
    return data.filter(item => (item.nodeSelector || []).some((ele) => ele.toLowerCase().indexOf(value.toLowerCase()) > -1))
  }

  return filterData(data, field, value)
}

export function filterNode(data, field, value) {
  if (field === 'DiskTag') {
    data.forEach((item) => {
      item.diskTagsFrontEnd = []
      if (item.disks) {
        (Object.keys(item.disks) || []).forEach((key) => {
          (item.disks[key].tags || []).forEach((tag) => {
            item.diskTagsFrontEnd.push(tag)
          })
        })
      }
    })

    return data.filter(item => (item.diskTagsFrontEnd || []).some((ele) => ele.toLowerCase().indexOf(value.toLowerCase()) > -1))
  } else if (field === 'NodeTag') {
    return data.filter(item => (item.tags || []).some((ele) => ele.toLowerCase().indexOf(value.toLowerCase()) > -1))
  } else {
    return filterData(data, field, value)
  }
}

export function filterEngineImage(data, field, value) {
  return filterData(data, field, value)
}
