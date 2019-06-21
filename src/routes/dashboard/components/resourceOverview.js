import React from 'react'
import PropTypes from 'prop-types'
import { Spin } from 'antd'
import ReactResizeDetector from 'react-resize-detector'
import { formatMib } from '../../../utils/formater'
import ResourceChart from './resourceChart'
import ResourceDetail from './resourceDetail'
import styles from './resourceOverview.less'
import { nodeStatusColorMap, healthyVolume, inProgressVolume, degradedVolume, detachedVolume, faultedVolume, schedulableNode, unschedulableNode, schedulingDisabledNode, downNode } from '../../../utils/filter'

class ResourceOverview extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      volumeActiveIndex: -1,
      nodeActiveIndex: -1,
      resourceWidth: 300,
    }
  }

  handleResize = (width) => {
    const rw = Math.min((width / 3) - 60, 440)
    if (rw > 300) {
      this.setState({
        ...this.state,
        resourceWidth: rw,
      })
    }
  }

  render() {
    const { host, volume, loading, onVolumeClick = f => f, onNodeClick = f => f } = this.props
    const { host: hostLoading, volume: volumeLoading } = loading.models
    this.hostLoading = hostLoading
    this.volumeLoading = volumeLoading
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
    const computeSchedulableSpace = () => {
      const result = host.data.filter(n => n.allowScheduling === true).reduce((total, currentNode) => {
        return total + Object.values(currentNode.disks).filter(d => d.allowScheduling === true).reduce((availabeSpace, currentDisk) => {
          return availabeSpace + (currentDisk.storageAvailable - currentDisk.storageReserved)
        }, 0)
      }, 0)
      return result < 0 ? 0 : result
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
      schedulableSpace: computeSchedulableSpace(),
      usedSpace: computeUsedSpace(),
    }
    const volumeInfo = {
      total: volume.data.length,
      healthy: healthyVolume(volume.data).length,
      inProgress: inProgressVolume(volume.data).length,
      degraded: degradedVolume(volume.data).length,
      detached: detachedVolume(volume.data).length,
      faulted: faultedVolume(volume.data).length,
    }

    const nodeInfo = {
      // Total. The total number of nodes.
      total: host.data.length,
      schedulable: schedulableNode(host.data).length,
      unschedulable: unschedulableNode(host.data).length,
      schedulingDisabled: schedulingDisabledNode(host.data).length,
      down: downNode(host.data).length,
    }

    const storageSpaceInfoColors = ['#27AE5F', '#F1C40F', '#78C9CF', '#dee1e3']
    const storageSpaceInfoData = [
      { name: 'Schedulable storage', value: storageSpaceInfo.schedulableSpace },
      { name: 'Reserved storage', value: storageSpaceInfo.resevedSpace },
      { name: 'Used storage', value: storageSpaceInfo.usedSpace },
      { name: 'Disabled storage', value: storageSpaceInfo.disabledSpace },
    ]
    const storageSpaceInfoDetails = [
      { name: 'Schedulable', value: formatMib(storageSpaceInfo.schedulableSpace), color: storageSpaceInfoColors[0] },
      { name: 'Reserved', value: formatMib(storageSpaceInfo.resevedSpace), color: storageSpaceInfoColors[1] },
      { name: 'Used', value: formatMib(storageSpaceInfo.usedSpace), color: storageSpaceInfoColors[2] },
      { name: 'Disabled', value: formatMib(storageSpaceInfo.disabledSpace), color: storageSpaceInfoColors[3] },
    ]
    const storageSpaceInfoTotal = { name: 'Total', value: formatMib(storageSpaceInfo.totalSpace) }
    this.storageSpaceChartProps = {
      title: formatMib(storageSpaceInfo.schedulableSpace),
      subTitle: 'Storage Schedulable',
      colors: storageSpaceInfoColors,
      data: storageSpaceInfoData,
      loading: hostLoading,
      empty: 'No Storage',
      width: this.state.resourceWidth,
    }
    this.storageSpaceDetailProps = {
      data: storageSpaceInfoDetails,
      total: storageSpaceInfoTotal,
      width: this.state.resourceWidth,
    }

    const volumeInfoColors = ['#27AE5F', '#F1C40F', '#78C9CF', '#F15354', '#dee1e3']
    const volumeInfoData = [
      { key: 'healthy', name: 'Healthy', value: volumeInfo.healthy },
      { key: 'degraded', name: 'Degraded', value: volumeInfo.degraded },
      { key: 'inProgress', name: 'In Progress', value: volumeInfo.inProgress },
      { key: 'faulted', name: 'Faulted', value: volumeInfo.faulted },
      { key: 'detached', name: 'Detached', value: volumeInfo.detached },
    ]
    const volumeDetails = [
      { key: 'healthy', name: 'Healthy', value: volumeInfo.healthy, color: volumeInfoColors[0] },
      { key: 'degraded', name: 'Degraded', value: volumeInfo.degraded, color: volumeInfoColors[1] },
      { key: 'inProgress', name: 'In Progress', value: volumeInfo.inProgress, color: volumeInfoColors[2] },
      { key: 'faulted', name: 'Fault', value: volumeInfo.faulted, color: volumeInfoColors[3] },
      { key: 'detached', name: 'Detached', value: volumeInfo.detached, color: volumeInfoColors[4] },
    ]
    const volumeInfoTotal = { name: 'Total', value: volumeInfo.total }
    this.volumeInfoChartProps = {
      title: volumeInfo.total,
      subTitle: volumeInfo.total > 1 ? 'Volumes' : 'Volume',
      colors: volumeInfoColors,
      data: volumeInfoData,
      loading: volumeLoading,
      onClick: onVolumeClick,
      clickable: true,
      empty: 'No Volume',
      activeIndex: this.state.volumeActiveIndex,
      width: this.state.resourceWidth,
    }
    this.volumeInfoDetailProps = {
      data: volumeDetails,
      total: volumeInfoTotal,
      onClick: onVolumeClick,
      clickable: true,
      width: this.state.resourceWidth,
      onMouseEnter: (d, index) => {
        this.setState({ ...this.state, volumeActiveIndex: index })
      },
      onMouseLeave: () => {
        this.setState({ ...this.state, volumeActiveIndex: -1 })
      },
    }

    const nodeInfoColors = [nodeStatusColorMap.schedulable.color, nodeStatusColorMap.unschedulable.color, nodeStatusColorMap.down.color, nodeStatusColorMap.disabled.color]
    const nodeInfoData = [
      { key: 'schedulable', name: 'Schedulable', value: nodeInfo.schedulable },
      { key: 'unschedulable', name: 'Unschedulable', value: nodeInfo.unschedulable },
      { key: 'down', name: 'Down', value: nodeInfo.down },
      { key: 'schedulingDisabled', name: 'Disabled', value: nodeInfo.schedulingDisabled },
    ]
    const nodeDetails = [
      { key: 'schedulable', name: 'Schedulable', value: nodeInfo.schedulable, color: nodeInfoColors[0] },
      { key: 'unschedulable', name: 'Unschedulable', value: nodeInfo.unschedulable, color: nodeInfoColors[1] },
      { key: 'down', name: 'Down', value: nodeInfo.down, color: nodeInfoColors[2] },
      { key: 'schedulingDisabled', name: 'Disabled', value: nodeInfo.schedulingDisabled, color: nodeInfoColors[3] },
    ]
    const nodeInfoTotal = { name: 'Total', value: nodeInfo.total }
    this.nodeInfoChartProps = {
      title: nodeInfo.total,
      subTitle: nodeInfo.total > 1 ? 'Nodes' : 'Node',
      colors: nodeInfoColors,
      data: nodeInfoData,
      loading: hostLoading,
      onClick: onNodeClick,
      clickable: true,
      empty: 'No Node',
      activeIndex: this.state.nodeActiveIndex,
      width: this.state.resourceWidth,
    }
    this.nodeInfoDetailProps = {
      data: nodeDetails,
      total: nodeInfoTotal,
      onClick: onNodeClick,
      clickable: true,
      width: this.state.resourceWidth,
      onMouseEnter: (d, index) => {
        this.setState({ ...this.state, nodeActiveIndex: index })
      },
      onMouseLeave: () => {
        this.setState({ ...this.state, nodeActiveIndex: -1 })
      },
    }
    return (
        <Spin spinning={this.hostLoading || this.volumeLoading}>
          <div className={styles.overview}>
            <div>
              <ResourceChart {...this.volumeInfoChartProps} />
              <ResourceDetail {...this.volumeInfoDetailProps} />
            </div>
            <div>
            <ResourceChart {...this.storageSpaceChartProps} />
            <ResourceDetail {...this.storageSpaceDetailProps} />
            </div>
            <div>
            <ResourceChart {...this.nodeInfoChartProps} />
            <ResourceDetail {...this.nodeInfoDetailProps} />
            </div>
            <ReactResizeDetector handleWidth onResize={this.handleResize} />
          </div>
        </Spin>
    )
  }
}

ResourceOverview.propTypes = {
  host: PropTypes.object,
  volume: PropTypes.object,
  loading: PropTypes.object,
  onVolumeClick: PropTypes.func,
  onNodeClick: PropTypes.func,
}

export default ResourceOverview
