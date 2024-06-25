import React from 'react'
import PropTypes from 'prop-types'
import { Button, Modal } from 'antd'
import { hasReadyBackingDisk, diskStatusColorMap } from '../../utils/status'

const confirm = Modal.confirm


function bulkActions({ selectedRows, deleteBackingImages, downloadSelectedBackingImages }) {
  const handleClick = (action) => {
    const count = selectedRows.length
    switch (action) {
      case 'delete':
        confirm({
          width: 'fit-content',
          okType: 'danger',
          okText: 'Delete',
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
      default:
        // show nothing
    }
  }

  const allActions = [
    { key: 'delete', name: 'Delete', disabled() { return selectedRows.length === 0 } },
    { key: 'download', name: 'Download', disabled() { return (selectedRows.length === 0 || selectedRows.every(row => !hasReadyBackingDisk(row))) } },
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
}

export default bulkActions
