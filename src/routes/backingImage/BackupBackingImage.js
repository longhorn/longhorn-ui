import React, { useEffect, useState, useRef } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Row, Col } from 'antd'
import cx from 'classnames'
import { Filter } from '../../components/index'
import BackupBackingImageList from './BackupBackingImageList'
import BackupBackingImageBulkActions from './BackupBackingImageBulkActions'
import RestoreBackupBackingImageModal from './RestoreBackupBackingImageModal'
import { filterBackupBackingImage } from './utils'
import styles from './BackupBackingImage.less'

const BackupBackingImage = ({ backingImage, loading, dispatch, location, className }) => {
  const containerRef = useRef(null)
  const actionBarRef = useRef(null)
  const [tableBodyHeight, setTableBodyHeight] = useState(0)

  useEffect(() => {
    const calculateTableBodyHeight = () => {
      if (containerRef.current) {
        const containerHeight = containerRef.current.getBoundingClientRect().height || 0
        const actionBarHeight = actionBarRef.current.getBoundingClientRect().height || 0
        const tableHeaderHeight = document.querySelector('.ant-table-thead')?.getBoundingClientRect().height || 0
        const paginationHeight = 48
        const containerPadding = 24

        const tableBodyHeightValue = containerHeight - actionBarHeight - tableHeaderHeight - paginationHeight - containerPadding
        setTableBodyHeight(tableBodyHeightValue)
      }
    }

    calculateTableBodyHeight()
    window.addEventListener('resize', calculateTableBodyHeight)

    return () => {
      window.removeEventListener('resize', calculateTableBodyHeight)
    }
  }, [])


  const {
    bbiSelectedRows,
    bbiData = [],
    bbiSearchField = '',
    bbiSearchValue = '',
    bbiSelected,
    restoreBackupBackingImageModalVisible,
  } = backingImage

  const backupBackingImage = filterBackupBackingImage(bbiData, bbiSearchField, bbiSearchValue)

  const backupBackingImageBulkActionsProps = {
    bbiSelectedRows,
    deleteBackupBackingImages(records) {
      dispatch({
        type: 'backingImage/bulkDeleteBackupBackingImage',
        payload: records,
      })
    },
  }

  const backupBackingImageFilterProps = {
    location,
    defaultField: 'name',
    fieldOption: [
      { value: 'name', name: 'Name' },
      { value: 'state', name: 'State' },
      { value: 'url', name: 'URL' },
    ],
    onSearch(filter) {
      dispatch({
        type: 'backingImage/setSearchFilter',
        payload: {
          bbiSearchField: filter.field,
          bbiSearchValue: filter.value,
        },
      })
    },
  }

  const backupBackingImageListProps = {
    dataSource: backupBackingImage,
    height: tableBodyHeight,
    loading,
    deleteBackupBackingImage(record) {
      dispatch({
        type: 'backingImage/deleteBackupBackingImage',
        payload: record,
      })
    },
    restoreBackingImage(record) {
      dispatch({
        type: 'backingImage/showRestoreBackingImage',
        payload: {
          bbiSelected: record,
        },
      })
    },
    rowSelection: {
      selectedRowKeys: bbiSelectedRows.map(item => item.id),
      onChange(_, records) {
        dispatch({
          type: 'backingImage/changeSelection',
          payload: {
            bbiSelectedRows: records,
          },
        })
      },
    },
  }

  const restoreBBiModalProps = {
    item: bbiSelected,
    visible: restoreBackupBackingImageModalVisible,
    onOk(item, params) {
      dispatch({
        type: 'backingImage/restoreBackingImage',
        payload: {
          item,
          params,
        },
      })
    },
    onCancel() {
      dispatch({
        type: 'backingImage/hideRestoreBackingImageModal',
      })
    },
  }

  return (
    <>
      <div id="backupBackingImageTable" ref={containerRef} className={cx(styles.container, className)}>
        <div ref={actionBarRef} className={styles.row}>
          <Row gutter={24}>
            <Col lg={17} md={15} sm={24} xs={24}>
              <BackupBackingImageBulkActions {...backupBackingImageBulkActionsProps} />
            </Col>
            <Col lg={7} md={9} sm={24} xs={24}>
              <Filter key="bbiFilter" {...backupBackingImageFilterProps} />
            </Col>
          </Row>
        </div>
        <BackupBackingImageList {...backupBackingImageListProps} />
      </div>
      {restoreBackupBackingImageModalVisible && <RestoreBackupBackingImageModal {...restoreBBiModalProps} />}
    </>
  )
}

BackupBackingImage.propTypes = {
  backingImage: PropTypes.object,
  loading: PropTypes.bool,
  location: PropTypes.object,
  dispatch: PropTypes.func,
  className: PropTypes.string,
}

export default connect(({
  backingImage,
  loading,
  dispatch
}) => ({
  backingImage,
  loading: loading.models.backingImage,
  dispatch
}))(BackupBackingImage)
