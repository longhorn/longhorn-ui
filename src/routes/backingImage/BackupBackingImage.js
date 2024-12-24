import React, { useEffect, useState, useRef } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Row, Col } from 'antd'
import cx from 'classnames'
import queryString from 'query-string'
import { routerRedux } from 'dva/router'
import { Filter } from '../../components/index'
import BackupBackingImageList from './BackupBackingImageList'
import BackupBackingImageBulkActions from './BackupBackingImageBulkActions'
import RestoreBackupBackingImageModal from './RestoreBackupBackingImageModal'
import { filterBackupBackingImage } from './utils'
import styles from './BackupBackingImage.less'

function BackupBackingImage({
  backingImage,
  loading,
  dispatch,
  location = {},
  className,
  persistFilterInURL = false,
  v1DataEngineEnabled = true,
  v2DataEngineEnabled = false
}) {
  const { pathname, hash, search } = location

  const containerRef = useRef(null)
  const actionBarRef = useRef(null)
  const [tableBodyHeight, setTableBodyHeight] = useState(0)
  const [bbiSearchField, setBbiSearchField] = useState('')
  const [bbiSearchValue, setBbiSearchValue] = useState('')

  // calculate table body height
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

  // get search filter from URL query params
  useEffect(() => {
    const { field = '', value = '' } = queryString.parse(search) || {}

    setBbiSearchField(field)
    setBbiSearchValue(value)
  }, [search])

  const {
    bbiSelectedRows,
    bbiData = [],
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
      { value: 'backupTargetName', name: 'Backup Target' },
    ],
    onSearch(filter) {
      const { field, value } = filter

      if (persistFilterInURL) {
        const trimmedValue = value?.trim()
        const params = (field && trimmedValue)
          ? { ...queryString.parse(search), field, value: trimmedValue }
          : {}

        dispatch(routerRedux.push({
          pathname,
          hash,
          search: queryString.stringify(params)
        }))
      } else {
        setBbiSearchField(filter.field)
        setBbiSearchValue(filter.value)
      }
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
    v1DataEngineEnabled,
    v2DataEngineEnabled,
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
      {<RestoreBackupBackingImageModal {...restoreBBiModalProps} />}
    </>
  )
}

BackupBackingImage.propTypes = {
  backingImage: PropTypes.object,
  loading: PropTypes.bool,
  location: PropTypes.object,
  dispatch: PropTypes.func,
  className: PropTypes.string,
  persistFilterInURL: PropTypes.bool,
  v1DataEngineEnabled: PropTypes.bool,
  v2DataEngineEnabled: PropTypes.bool,
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
