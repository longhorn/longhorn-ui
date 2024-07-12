import React from 'react'
import PropTypes from 'prop-types'
import { Button, Modal } from 'antd'
import { hasReadyBackingDisk, diskStatusColorMap } from '../../utils/status'

const confirm = Modal.confirm


function bulkActions({ selectedRows, backupProps, deleteBackingImages, downloadSelectedBackingImages, backupSelectedBackingImages }) {
  const { backupTargetAvailable } = backupProps

  const handleClick = (action) => {
    const count = selectedRows.length
    switch (action) {
      case 'delete':
        confirm({
          width: 'fit-content',
          okText: 'Delete',
          okType: 'danger',
          title: (<>
                    <p>Are you sure to delete below {count} backing {count === 1 ? 'image' : 'images' } ?</p>
                    <ul>
                      {selectedRows.map(item => <li>{item.name}</li>)},
                    </ul>
                  </>),
          onOk() {
            deleteBackingImages(selectedRows)
          },
        })
        break
      case 'download': {
        const downloadableImages = selectedRows.filter(row => hasReadyBackingDisk(row))
        const readyColor = diskStatusColorMap.ready
        const readyTextStyle = {
          display: 'inline-block',
          width: 'max-content',
          padding: '0 4px',
          marginRight: '5px',
          color: '#27AE5F',
          border: `1px solid ${readyColor.color}`,
          backgroundColor: readyColor.bg,
          textTransform: 'capitalize',
        }
        confirm({
          okText: 'Download',
          width: 'fit-content',
          title: (<>
                    <p>Below backing {count === 1 ? 'image' : 'images' } with <strong style={readyTextStyle}>Ready</strong> status disk will be downloaded</p>
                    <ul>
                      {downloadableImages.map(item => <li>{item.name}</li>)}
                    </ul>
                    <p>Note. You need allow <strong>Automatic Downloads</strong> permission<br />in browser settings to download multiple files at once.</p>
                  </>),
          onOk() {
            downloadSelectedBackingImages(downloadableImages)
          },
        })
        break
      }
      case 'backup': {
        const backupImages = selectedRows.filter(row => hasReadyBackingDisk(row))
        const readyColor = diskStatusColorMap.ready
        const readyTextStyle = {
          display: 'inline-block',
          width: 'max-content',
          padding: '0 4px',
          marginRight: '5px',
          color: '#27AE5F',
          border: `1px solid ${readyColor.color}`,
          backgroundColor: readyColor.bg,
          textTransform: 'capitalize',
        }
        confirm({
          okText: 'Backup',
          width: 'fit-content',
          title: (<>
                    <p>Are you sure to backup below <strong style={readyTextStyle}>Ready</strong> status backing {count === 1 ? 'image' : 'images'} ?</p>
                    <ul>
                      {backupImages.map(item => <li key={item.name}>{item.name}</li>)}
                    </ul>
                  </>),
          onOk() {
            backupSelectedBackingImages(backupImages)
          },
        })
        break
      }
      default:
    }
  }

  const allActions = [
    { key: 'delete', name: 'Delete', disabled() { return selectedRows.length === 0 } },
    { key: 'download', name: 'Download', disabled() { return (selectedRows.length === 0 || selectedRows.every(row => !hasReadyBackingDisk(row))) } },
    { key: 'backup', name: 'Back Up', disabled() { return selectedRows.length === 0 || backupTargetAvailable === false || selectedRows.every(row => !hasReadyBackingDisk(row)) } },
  ]

  return (
    <div style={{ display: 'flex' }}>
      { allActions.map(item => {
        return (
          <div key={item.key} style={{ marginRight: '10px' }}>
            <Button size="large" type="primary" disabled={item.disabled()} onClick={() => handleClick(item.key)}>{ item.name }</Button>
          </div>
        )
      }) }
    </div>
  )
}

bulkActions.propTypes = {
  selectedRows: PropTypes.array,
  deleteBackingImages: PropTypes.func,
  downloadSelectedBackingImages: PropTypes.func,
  backupSelectedBackingImages: PropTypes.func,
  backupProps: PropTypes.object,
}

export default bulkActions
