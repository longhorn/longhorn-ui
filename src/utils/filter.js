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

// Schedulable (green)
// a. Node.Status == UP, and Node.AllowScheduling == true, and (ANY of the node.disk.AllowScheduling == true, and ANY of THOSE disk.state == Schedulable).
export function schedulableNode(data) { return data.filter(node => node.state === 'up' && node.allowScheduling === true && (Object.values(node.disks).some(d => d.allowScheduling === true) && Object.values(node.disks).some(d => d.state === 'schedulable'))) }
// Unschedulable (yellow)
// a. Node.Status == UP, and Node.AllowScheduling == true, and (ANY of the node.disk.AllowScheduling == true, but ALL of THOSE disks.State == Unschedulable).
export function unschedulableNode(data) { return data.filter(node => node.state === 'up' && node.allowScheduling === true && Object.values(node.disks).every(d => d.allowScheduling === true && d.state === 'unscheduable')) }
// Scheduling disabled (grey)
// a. Node.Status == UP, and (either node.AllowScheduling == false, or ALL of the disk.AllowScheduling == false)
export function schedulingDisabledNode(data) { return data.filter(node => node.state === 'up' && (node.allowScheduling === false || Object.values(node.disks).every(d => d.allowScheduling === false))) }
// Down (red)
// Node.Status == Down.
export function downNode(data) { return data.filter(item => item.state === 'down') }

export function filterVolume(data, field, value) {
  if (field === 'host') {
    return data.filter(item => item.controllers.some(c => c.hostId.indexOf(value) > -1))
  }
  return data.filter(item => (item[field] || '').indexOf(value) > -1)
}

export function filterNode(data, field, value) {
  return data.filter(item => (item[field] || '').indexOf(value) > -1)
}
