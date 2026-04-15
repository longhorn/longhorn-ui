import React from 'react'
import PropTypes from 'prop-types'
import { Spin } from 'antd'
import ReactResizeDetector from 'react-resize-detector'
import { formatMib } from '../../../utils/formatter'
import ResourceChart from './resourceChart'
import ResourceDetail from './resourceDetail'
import styles from './resourceOverview.less'
import { healthyVolume, inProgressVolume, degradedVolume, detachedVolume, faultedVolume, schedulableNode, unschedulableNode, schedulingDisabledNode, downNode } from '../../../utils/filter'
import { nodeStatusColorMap } from '../../../utils/status'
import { withTranslation } from 'react-i18next'

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
    const rw = Math.min((width / 4) - 40, 440)
    if (rw > 240) {
      this.setState({
        ...this.state,
        resourceWidth: rw,
      })
    }
  }

  render() {
    const { host, volume, loading, onVolumeClick = f => f, onNodeClick = f => f, t } = this.props
    const { host: hostLoading, volume: volumeLoading } = loading.models
    this.hostLoading = hostLoading
    this.volumeLoading = volumeLoading

    let hasBlockDiskType = host?.data.some((currentNode) => {
      return Object.values(currentNode.disks).some((currentDisk) => {
        return currentDisk.diskType === 'block'
      })
    })
    // Total storage (everything)
    // a. Total Storage = sum(node.MaximumStorage)
    const computeTotalSpace = (blockDiskType) => {
      return host.data.reduce((total, currentNode) => {
        return total + Object.values(currentNode.disks).reduce((totalSpace, currentDisk) => {
          if (currentDisk.diskType === blockDiskType || !currentDisk.diskType) {
            return totalSpace + currentDisk.storageMaximum
          }
          return totalSpace
        }, 0)
      }, 0)
    }
    // Disabled storage (grey)
    // a. Disabled storage = sum(disabledNodes.MaximumStorage) and sum(enabledNodes.disabledDisks.MaximumStorage)
    const computeDisabledSpace = (blockDiskType) => {
      return host.data.reduce((total, currentNode) => {
        if (currentNode.allowScheduling === false) {
          return total + Object.values(currentNode.disks).reduce((totalSpace, currentDisk) => {
            if (currentDisk.diskType === blockDiskType || !currentDisk.diskType) {
              return totalSpace + currentDisk.storageMaximum
            }
            return totalSpace
          }, 0)
        }
        return total + Object.values(currentNode.disks).filter(d => d.allowScheduling === false).reduce((totalSpace, currentDisk) => {
          if (currentDisk.diskType === blockDiskType || !currentDisk.diskType) {
            return totalSpace + currentDisk.storageMaximum
          }
          return totalSpace
        }, 0)
      }, 0)
    }
    // Reserved storage (yellow)
    // a. Reserved storage = sum(enabledNodes.enabledDisks.ReservedStorage)
    const computeReservedSpace = (blockDiskType) => {
      return host.data.filter(n => n.allowScheduling === true).reduce((total, currentNode) => {
        return total + Object.values(currentNode.disks).filter(d => d.allowScheduling === true).reduce((reservedSpace, currentDisk) => {
          if (currentDisk.diskType === blockDiskType || !currentDisk.diskType) {
            return reservedSpace + currentDisk.storageReserved
          }
          return reservedSpace
        }, 0)
      }, 0)
    }
    // Available (green)
    // a. AvailableForSchedulingStorage = sum(enabledNodes.enabledDisks.AvailableStorage - enabledNodes.enabledDisks.ReservedStorage)
    const computeSchedulableSpace = (blockDiskType) => {
      const result = host.data.filter(n => n.allowScheduling === true).reduce((total, currentNode) => {
        return total + Object.values(currentNode.disks).filter(d => d.allowScheduling === true).reduce((availabeSpace, currentDisk) => {
          if (currentDisk.diskType === blockDiskType || !currentDisk.diskType) {
            return availabeSpace + (currentDisk.storageAvailable - currentDisk.storageReserved)
          }
          return availabeSpace
        }, 0)
      }, 0)
      return result < 0 ? 0 : result
    }
    // Used (blue)
    // a. UsedStorage = sum(enabledNodes.enabledDisk.MaximumStorage - enabledNodes.enabledDisks.AvailableStorage)
    const computeUsedSpace = (blockDiskType) => {
      return host.data.filter(n => n.allowScheduling === true).reduce((total, currentNode) => {
        return total + Object.values(currentNode.disks).filter(d => d.allowScheduling === true).reduce((usedSpace, currentDisk) => {
          if (currentDisk.diskType === blockDiskType || !currentDisk.diskType) {
            return usedSpace + (currentDisk.storageMaximum - currentDisk.storageAvailable)
          }
          return usedSpace
        }, 0)
      }, 0)
    }
    const storageSpaceInfo = {
      totalSpace: computeTotalSpace('filesystem'),
      disabledSpace: computeDisabledSpace('filesystem'),
      resevedSpace: computeReservedSpace('filesystem'),
      schedulableSpace: computeSchedulableSpace('filesystem'),
      usedSpace: computeUsedSpace('filesystem'),
    }
    const storageBlockSpaceInfo = {
      totalSpace: computeTotalSpace('block'),
      disabledSpace: computeDisabledSpace('block'),
      resevedSpace: computeReservedSpace('block'),
      schedulableSpace: computeSchedulableSpace('block'),
      usedSpace: computeUsedSpace('block'),
    }
    const volumeInfo = {
      total: volume.data.length,
      healthy: healthyVolume(volume.data).length,
      inProgress: inProgressVolume(volume.data).length,
      degraded: degradedVolume(volume.data).length,
      detached: detachedVolume(volume.data).length,
      faulted: faultedVolume(volume.data).length,
    }

    // We do not represent autoEvicting in the resource overview. autoEvicting nodes are also unschedulable.
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
      { name: t('resource.storage.schedulableStorage'), value: storageSpaceInfo.schedulableSpace },
      { name: t('resource.storage.reservedStorage'), value: storageSpaceInfo.resevedSpace },
      { name: t('resource.storage.usedStorage'), value: storageSpaceInfo.usedSpace },
      { name: t('resource.storage.disabledStorage'), value: storageSpaceInfo.disabledSpace },
    ]
    const storageBlockSpaceInfoData = [
      { name: t('resource.storage.schedulableStorage'), value: storageBlockSpaceInfo.schedulableSpace },
      { name: t('resource.storage.reservedStorage'), value: storageBlockSpaceInfo.resevedSpace },
      { name: t('resource.storage.usedStorage'), value: storageBlockSpaceInfo.usedSpace },
      { name: t('resource.storage.disabledStorage'), value: storageBlockSpaceInfo.disabledSpace },
    ]
    const storageSpaceInfoDetails = [
      { name: t('resource.storage.schedulable'), value: formatMib(storageSpaceInfo.schedulableSpace), color: storageSpaceInfoColors[0] },
      { name: t('resource.storage.reserved'), value: formatMib(storageSpaceInfo.resevedSpace), color: storageSpaceInfoColors[1] },
      { name: t('resource.storage.used'), value: formatMib(storageSpaceInfo.usedSpace), color: storageSpaceInfoColors[2] },
      { name: t('resource.storage.disabled'), value: formatMib(storageSpaceInfo.disabledSpace), color: storageSpaceInfoColors[3] },
    ]
    const storageBlockSpaceInfoDetails = [
      { name: t('resource.storage.schedulable'), value: formatMib(storageBlockSpaceInfo.schedulableSpace), color: storageSpaceInfoColors[0] },
      { name: t('resource.storage.reserved'), value: formatMib(storageBlockSpaceInfo.resevedSpace), color: storageSpaceInfoColors[1] },
      { name: t('resource.storage.used'), value: formatMib(storageBlockSpaceInfo.usedSpace), color: storageSpaceInfoColors[2] },
      { name: t('resource.storage.disabled'), value: formatMib(storageBlockSpaceInfo.disabledSpace), color: storageSpaceInfoColors[3] },
    ]
    const storageSpaceInfoTotal = { name: t('common.total'), value: formatMib(storageSpaceInfo.totalSpace) }
    const storageBlockSpaceInfoTotal = { name: t('common.total'), value: formatMib(storageBlockSpaceInfo.totalSpace) }
    this.storageSpaceChartProps = {
      title: formatMib(storageSpaceInfo.schedulableSpace),
      subTitle: t('resource.storage.schedulableStorage'),
      colors: storageSpaceInfoColors,
      data: storageSpaceInfoData,
      loading: hostLoading,
      empty: t('resource.storage.empty'),
      width: this.state.resourceWidth,
    }
    this.storageBlockSpaceChartProps = {
      title: formatMib(storageBlockSpaceInfo.schedulableSpace),
      subTitle: t('resource.storage.blockTitle'),
      colors: storageSpaceInfoColors,
      data: storageBlockSpaceInfoData,
      loading: hostLoading,
      empty: t('resource.storage.empty'),
      width: this.state.resourceWidth,
    }
    this.storageSpaceDetailProps = {
      data: storageSpaceInfoDetails,
      total: storageSpaceInfoTotal,
      width: this.state.resourceWidth,
    }
    this.storageBlockSpaceDetailProps = {
      data: storageBlockSpaceInfoDetails,
      total: storageBlockSpaceInfoTotal,
      width: this.state.resourceWidth,
    }

    const volumeInfoColors = ['#27AE5F', '#F1C40F', '#78C9CF', '#F15354', '#dee1e3']
    const volumeInfoData = [
      { key: 'healthy', name: t('resource.volume.healthy'), value: volumeInfo.healthy },
      { key: 'degraded', name: t('resource.volume.degraded'), value: volumeInfo.degraded },
      { key: 'inProgress', name: t('resource.volume.inProgress'), value: volumeInfo.inProgress },
      { key: 'faulted', name: t('resource.volume.faulted'), value: volumeInfo.faulted },
      { key: 'detached', name: t('resource.volume.detached'), value: volumeInfo.detached },
    ]
    const volumeDetails = [
      { key: 'healthy', name: t('resource.volume.healthy'), value: volumeInfo.healthy, color: volumeInfoColors[0] },
      { key: 'degraded', name: t('resource.volume.degraded'), value: volumeInfo.degraded, color: volumeInfoColors[1] },
      { key: 'inProgress', name: t('resource.volume.inProgress'), value: volumeInfo.inProgress, color: volumeInfoColors[2] },
      { key: 'faulted', name: t('resource.volume.faulted'), value: volumeInfo.faulted, color: volumeInfoColors[3] },
      { key: 'detached', name: t('resource.volume.detached'), value: volumeInfo.detached, color: volumeInfoColors[4] },
    ]
    const volumeInfoTotal = { name: t('common.total'), value: volumeInfo.total }
    this.volumeInfoChartProps = {
      title: volumeInfo.total,
      subTitle: volumeInfo.total > 1 ? t('resource.volume.plural') : t('resource.volume.single'),
      colors: volumeInfoColors,
      data: volumeInfoData,
      loading: volumeLoading,
      onClick: onVolumeClick,
      clickable: true,
      empty: t('resource.volume.empty'),
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

    // We do not represent autoEvicting in the resource overview. autoEvicting nodes are also unschedulable.
    const nodeInfoColors = [nodeStatusColorMap.schedulable.color, nodeStatusColorMap.unschedulable.color, nodeStatusColorMap.down.color, nodeStatusColorMap.disabled.color]
    const nodeInfoData = [
      { key: 'schedulable', name: t('resource.node.schedulable'), value: nodeInfo.schedulable },
      { key: 'unschedulable', name: t('resource.node.unschedulable'), value: nodeInfo.unschedulable },
      { key: 'down', name: t('resource.node.down'), value: nodeInfo.down },
      { key: 'schedulingDisabled', name: t('resource.node.disabled'), value: nodeInfo.schedulingDisabled },
    ]
    const nodeDetails = [
      { key: 'schedulable', name: t('resource.node.schedulable'), value: nodeInfo.schedulable, color: nodeInfoColors[0] },
      { key: 'unschedulable', name: t('resource.node.unschedulable'), value: nodeInfo.unschedulable, color: nodeInfoColors[1] },
      { key: 'down', name: t('resource.node.down'), value: nodeInfo.down, color: nodeInfoColors[2] },
      { key: 'schedulingDisabled', name: t('resource.node.disabled'), value: nodeInfo.schedulingDisabled, color: nodeInfoColors[3] },
    ]
    const nodeInfoTotal = { name: t('common.total'), value: nodeInfo.total }
    this.nodeInfoChartProps = {
      title: nodeInfo.total,
      subTitle: nodeInfo.total > 1 ? t('resource.node.plural') : t('resource.node.single'),
      colors: nodeInfoColors,
      data: nodeInfoData,
      loading: hostLoading,
      onClick: onNodeClick,
      clickable: true,
      empty: t('resource.node.empty'),
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
            { hasBlockDiskType && <div>
              <ResourceChart {...this.storageBlockSpaceChartProps} />
              <ResourceDetail {...this.storageBlockSpaceDetailProps} />
            </div> }
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
  t: PropTypes.func,
  host: PropTypes.object,
  volume: PropTypes.object,
  loading: PropTypes.object,
  onVolumeClick: PropTypes.func,
  onNodeClick: PropTypes.func,
}

export default withTranslation()(ResourceOverview)
