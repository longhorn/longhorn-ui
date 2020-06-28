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

const isSchedulable = (node) => node.conditions && node.conditions.Schedulable.status.toLowerCase() === 'true' && node.conditions.Ready.status.toLowerCase() === 'true' && node.allowScheduling === true && (Object.values(node.disks).some(d => d.allowScheduling === true) && Object.values(node.disks).some(d => d.conditions && d.conditions.Schedulable.status.toLowerCase() === 'true'))
const isDisabled = (node) => node.conditions && node.conditions.Ready.status.toLowerCase() === 'true' && (node.allowScheduling === false || Object.values(node.disks).every(d => d.allowScheduling === false))
const isUnschedulable = (node) => (node.conditions && node.allowScheduling === true && Object.values(node.disks).every(d => d.allowScheduling === false || (d.conditions && d.conditions.Schedulable && d.conditions.Schedulable.status.toLowerCase() === 'false') || (d.conditions && d.conditions.Ready && d.conditions.Ready.status.toLowerCase() === 'false'))) || (node.conditions && node.conditions.Schedulable && node.conditions.Schedulable.status.toLowerCase() === 'false')
const isDown = (node) => node.conditions && node.conditions.Ready.status.toLowerCase() === 'false'
export const nodeStatusColorMap = {
  schedulable: { color: '#27AE5F', bg: 'rgba(39,174,95,.05)' },
  unschedulable: { color: '#F1C40F', bg: 'rgba(241,196,15,.05)' },
  down: { color: '#F15354', bg: 'rgba(241,83,84,.1)' },
  disabled: { color: '#dee1e3', bg: 'rgba(222,225,227,.05)' },
  unknown: { color: '#F15354', bg: 'rgba(241,83,84,.05)' },
}
export function getNodeStatus(node) {
  const p = [{ key: 'down', name: 'Down', determine: isDown }, { key: 'disabled', name: 'Disabled', determine: isDisabled }, { key: 'unschedulable', name: 'Unschedulable', determine: isUnschedulable }, { key: 'schedulable', name: 'Schedulable', determine: isSchedulable }]
  for (let i = 0; i < p.length; i++) {
    if (p[i].determine(node)) {
      return { key: p[i].key, name: p[i].name }
    }
  }
  return { key: 'unknown', name: 'Unknown' }
}

// Schedulable (green)
// a. Node.Status == UP, and Node.AllowScheduling == true, and (ANY of the node.disk.AllowScheduling == true, and ANY of THOSE disk.state == Schedulable).
export function schedulableNode(data) { return data.filter(node => isSchedulable(node)) }
// Unschedulable (yellow)
// a. Node.Status == UP, and Node.AllowScheduling == true, and (ANY of the node.disk.AllowScheduling == true, but ALL of THOSE disks.State == Unschedulable).
export function unschedulableNode(data) { return data.filter(node => (isUnschedulable(node) && !isDisabled(node) && !isDown(node))) }
// Scheduling disabled (grey)
// a. Node.Status == UP, and (either node.AllowScheduling == false, or ALL of the disk.AllowScheduling == false)
export function schedulingDisabledNode(data) { return data.filter(node => isDisabled(node)) }
// Down (red)
// Node.Status == Down.
export function downNode(data) { return data.filter(node => isDown(node)) }

function filterData(data, field, value) {
  return data.filter(item => (item[field] || '').toLowerCase().indexOf(value.toLowerCase()) > -1)
}

function validReplicas(replicas) {
  return replicas.filter(item => item.failedAt === '')
}

export function isVolumeImageUpgradable(volume, defaultImage) {
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
