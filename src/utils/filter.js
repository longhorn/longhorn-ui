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

const isSchedulable = (node) => node.conditions.Ready.status.toLowerCase() === 'true' && node.allowScheduling === true && (Object.values(node.disks).some(d => d.allowScheduling === true) && Object.values(node.disks).some(d => d.conditions.Schedulable.status.toLowerCase() === 'true'))
const isUnschedulable = (node) => node.conditions.Ready.status.toLowerCase() === 'true' && node.allowScheduling === true && Object.values(node.disks).every(d => d.allowScheduling === true && d.conditions.Schedulable.status.toLowerCase() === 'false')
const isDisabled = (node) => node.conditions.Ready.status.toLowerCase() === 'true' && (node.allowScheduling === false || Object.values(node.disks).every(d => d.allowScheduling === false))
const isDown = (node) => node.conditions.Ready.status.toLowerCase() === 'false'
export const nodeStatusColorMap = {
  schedulable: '#27AE5F',
  unschedulable: '#F1C40F',
  down: '#F15354',
  disabled: '#dee1e3',
  unknown: '',
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
export function unschedulableNode(data) { return data.filter(node => isUnschedulable(node)) }
// Scheduling disabled (grey)
// a. Node.Status == UP, and (either node.AllowScheduling == false, or ALL of the disk.AllowScheduling == false)
export function schedulingDisabledNode(data) { return data.filter(node => isDisabled(node)) }
// Down (red)
// Node.Status == Down.
export function downNode(data) { return data.filter(node => isDown(node)) }

export function filterVolume(data, field, value) {
  if (field === 'host') {
    return data.filter(item => item.controllers.some(c => c.hostId.indexOf(value) > -1))
  }
  return data.filter(item => (item[field] || '').indexOf(value) > -1)
}

export function filterNode(data, field, value) {
  return data.filter(item => (item[field] || '').indexOf(value) > -1)
}
