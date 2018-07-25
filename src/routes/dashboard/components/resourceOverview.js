import React, { PropTypes } from 'react'
import { Spin, Card, Row, Col } from 'antd'
import { formatMib } from '../../../utils/formater'
import ResourceChart from './resourceChart'
import ResourceDetail from './resourceDetail'

function ResourceOverview({ host, volume, loading }) {
  const { host: hostLoading, volume: volumeLoading } = loading.models
  // Total storage (everything)
  // a. Total Storage = sum(node.MaximumStorage)
  const computeTotalSpace = () => {
    return host.data.reduce((total, currentNode) => {
      return total + Object.values(currentNode.disks).reduce((totalSpace, currentDisk) => {
        return totalSpace + currentDisk.storageMaximum
      }, 0)
    }, 0)
  }
  // Disabled storage (grey)
  // a. Disabled storage = sum(disabledNodes.MaximumStorage) and sum(enabledNodes.disabledDisks.MaximumStorage)
  const computeDisabledSpace = () => {
    return host.data.reduce((total, currentNode) => {
      if (currentNode.allowScheduling === false) {
        return total + Object.values(currentNode.disks).reduce((totalSpace, currentDisk) => {
          return totalSpace + currentDisk.storageMaximum
        }, 0)
      }
      return total + Object.values(currentNode.disks).filter(d => d.allowScheduling === false).reduce((totalSpace, currentDisk) => {
        return totalSpace + currentDisk.storageMaximum
      }, 0)
    }, 0)
  }
  // Reserved storage (yellow)
  // a. Reserved storage = sum(enabledNodes.enabledDisks.ReservedStorage)
  const computeReservedSpace = () => {
    return host.data.filter(n => n.allowScheduling === true).reduce((total, currentNode) => {
      return total + Object.values(currentNode.disks).filter(d => d.allowScheduling === true).reduce((reservedSpace, currentDisk) => {
        return reservedSpace + currentDisk.storageReserved
      }, 0)
    }, 0)
  }
  // Available (green)
  // a. AvailableForSchedulingStorage = sum(enabledNodes.enabledDisks.AvailableStorage - enabledNodes.enabledDisks.ReservedStorage)
  const computeAvailabeSpace = () => {
    return host.data.filter(n => n.allowScheduling === true).reduce((total, currentNode) => {
      return total + Object.values(currentNode.disks).filter(d => d.allowScheduling === true).reduce((availabeSpace, currentDisk) => {
        return availabeSpace + (currentDisk.storageAvailable - currentDisk.storageReserved)
      }, 0)
    }, 0)
  }
  // Used (blue)
  // a. UsedStorage = sum(enabledNodes.enabledDisk.MaximumStorage - enabledNodes.enabledDisks.AvailableStorage)
  const computeUsedSpace = () => {
    return host.data.filter(n => n.allowScheduling === true).reduce((total, currentNode) => {
      return total + Object.values(currentNode.disks).filter(d => d.allowScheduling === true).reduce((usedSpace, currentDisk) => {
        return usedSpace + (currentDisk.storageMaximum - currentDisk.storageAvailable)
      }, 0)
    }, 0)
  }
  const storageSpaceInfo = {
    totalSpace: computeTotalSpace(),
    disabledSpace: computeDisabledSpace(),
    resevedSpace: computeReservedSpace(),
    availableSpace: computeAvailabeSpace(),
    usedSpace: computeUsedSpace(),
  }
  const volumeInfo = {
    total: volume.data.length,
    // Healthy (green)
    // a. Volume.State == attached && volume.Robustness == Healthy
    healthy: volume.data.filter(item => item.state === 'attached' && item.robustness === 'healthy').length,
    // In Progress (blue)
    // a. (Volume.State != attached and volume.State != detached) or (volume.State == attached && volume.Robustness != Healthy && volume.Robustness != Degraded)
    inProgress: volume.data.filter(item => (item.state !== 'attached' && item.state !== 'detached') || (item.state === 'attached' && item.robustness !== 'healthy' && item.robustness !== 'degraded')).length,
    // Degraded (yellow)
    // a. Volume.State == attached && volume.Robustness == Degraded
    degraded: volume.data.filter(item => item.state === 'attached' && item.robustness === 'degraded').length,
    // Detached (grey)
    // a. Volume.State == detached && volume.Robustness != Fault
    detached: volume.data.filter((item) => item.state === 'detached' && item.robustness !== 'faulted').length,
    // Fault (red)
    // a. Volume.State == detached && volume.Robustness == Fault
    faulted: volume.data.filter((item) => item.state === 'detached' && item.robustness === 'faulted').length,
  }

  const nodeInfo = {
    // Total. The total number of nodes.
    total: host.data.length,
    // Schedulable (green)
    // a. Node.Status == UP, and Node.AllowScheduling == true, and (ANY of the node.disk.AllowScheduling == true, and ANY of THOSE disk.state == Schedulable).
    schedulable: host.data.filter(node => node.state === 'up' && node.allowScheduling === true && (Object.values(node.disks).some(d => d.allowScheduling === true) && Object.values(node.disks).some(d => d.state === 'schedulable'))).length,
    // Unschedulable (yellow)
    // a. Node.Status == UP, and Node.AllowScheduling == true, and (ANY of the node.disk.AllowScheduling == true, but ALL of THOSE disks.State == Unschedulable).
    unschedulable: host.data.filter(node => node.state === 'up' && node.allowScheduling === true && Object.values(node.disks).every(d => d.allowScheduling === true && d.state === 'unscheduable')).length,
    // Scheduling disabled (grey)
    // a. Node.Status == UP, and (either node.AllowScheduling == false, or ALL of the disk.AllowScheduling == false)
    schedulingDisabled: host.data.filter(node => node.state === 'up' && (node.allowScheduling === false || Object.values(node.disks).every(d => d.allowScheduling === false))).length,
    // Down (red)
    // Node.Status == Down.
    down: host.data.filter(item => item.state === 'down').length,
  }

  const storageSpaceInfoColors = ['#27AE5F', '#78C9CF', '#F1C40F', '#dee1e3']
  const storageSpaceInfoData = [
    { name: 'Available storage', value: storageSpaceInfo.availableSpace },
    { name: 'Used storage', value: storageSpaceInfo.usedSpace },
    { name: 'Reserved storage', value: storageSpaceInfo.resevedSpace },
    { name: 'Disabled storage', value: storageSpaceInfo.disabledSpace },
  ]
  const storageSpaceInfoDetails = [
    { name: 'Available', value: formatMib(storageSpaceInfo.availableSpace), color: storageSpaceInfoColors[0] },
    { name: 'Used', value: formatMib(storageSpaceInfo.usedSpace), color: storageSpaceInfoColors[1] },
    { name: 'Reserved', value: formatMib(storageSpaceInfo.resevedSpace), color: storageSpaceInfoColors[2] },
    { name: 'Disabled', value: formatMib(storageSpaceInfo.disabledSpace), color: storageSpaceInfoColors[3] },
  ]
  const storageSpaceInfoTotal = { name: 'Total', value: formatMib(storageSpaceInfo.totalSpace) }
  const storageSpaceChartProps = {
    title: formatMib(storageSpaceInfo.availableSpace),
    subTitle: 'Storage Available',
    colors: storageSpaceInfoColors,
    data: storageSpaceInfoData,
    loading: hostLoading,
  }
  const storageSpaceDetailProps = {
    data: storageSpaceInfoDetails,
    total: storageSpaceInfoTotal,
  }

  const volumeInfoColors = ['#27AE5F', '#78C9CF', '#F1C40F', '#F15354', '#dee1e3']
  const volumeInfoData = [
    { name: 'Healthy', value: volumeInfo.healthy },
    { name: 'In Progress', value: volumeInfo.inProgress },
    { name: 'Degraded', value: volumeInfo.degraded },
    { name: 'Faulted', value: volumeInfo.faulted },
    { name: 'Detached', value: volumeInfo.detached },
  ]
  const volumeDetails = [
    { name: 'Healthy', value: volumeInfo.healthy, color: volumeInfoColors[0] },
    { name: 'In Progress', value: volumeInfo.inProgress, color: volumeInfoColors[1] },
    { name: 'Degraded', value: volumeInfo.degraded, color: volumeInfoColors[2] },
    { name: 'Fault', value: volumeInfo.faulted, color: volumeInfoColors[3] },
    { name: 'Detached', value: volumeInfo.detached, color: volumeInfoColors[4] },
  ]
  const volumeInfoTotal = { name: 'Total', value: volumeInfo.total }
  const volumeInfoChartProps = {
    title: volumeInfo.total,
    subTitle: volumeInfo.total > 1 ? 'Volumes' : 'Volume',
    colors: volumeInfoColors,
    data: volumeInfoData,
    loading: volumeLoading,
  }
  const volumeInfoDetailProps = {
    data: volumeDetails,
    total: volumeInfoTotal,
  }

  const nodeInfoColors = ['#27AE5F', '#F1C40F', '#dee1e3', '#F15354']
  const nodeInfoData = [
    { name: 'Schedulable', value: nodeInfo.schedulable },
    { name: 'Unschedulable', value: nodeInfo.unschedulable },
    { name: 'Disabled', value: nodeInfo.schedulingDisabled },
    { name: 'Down', value: nodeInfo.down },
  ]
  const nodeDetails = [
    { name: 'Schedulable', value: nodeInfo.schedulable, color: nodeInfoColors[0] },
    { name: 'Unschedulable', value: nodeInfo.unschedulable, color: nodeInfoColors[1] },
    { name: 'Scheduling disabled', value: nodeInfo.schedulingDisabled, color: nodeInfoColors[2] },
    { name: 'Down', value: nodeInfo.down, color: nodeInfoColors[3] },
  ]
  const nodeInfoTotal = { name: 'Total', value: nodeInfo.total }
  const nodeInfoChartProps = {
    title: nodeInfo.total,
    subTitle: nodeInfo.total > 1 ? 'Nodes' : 'Node',
    colors: nodeInfoColors,
    data: nodeInfoData,
    loading: hostLoading,
  }
  const nodeInfoDetailProps = {
    data: nodeDetails,
    total: nodeInfoTotal,
  }
  return (
    <Card bordered={false}>
      <Spin spinning={hostLoading || volumeLoading}>
        <Row gutter={24}>
          <Col lg={8} md={8}>
            <ResourceChart {...volumeInfoChartProps} />
            <ResourceDetail {...volumeInfoDetailProps} />
          </Col>
          <Col lg={8} md={8}>
          <ResourceChart {...storageSpaceChartProps} />
          <ResourceDetail {...storageSpaceDetailProps} />
          </Col>
          <Col lg={8} md={8}>
          <ResourceChart {...nodeInfoChartProps} />
          <ResourceDetail {...nodeInfoDetailProps} />
          </Col>
        </Row>
      </Spin>
    </Card>
  )
}

ResourceOverview.propTypes = {
  host: PropTypes.object,
  volume: PropTypes.object,
  loading: PropTypes.object,
}

export default ResourceOverview
