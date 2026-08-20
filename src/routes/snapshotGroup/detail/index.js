import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { routerRedux } from 'dva/router'
import { Row, Col, Table, Tag, Alert, Card, Modal } from 'antd'
import { DropOption, LinkTo } from '../../../components'
import { formatDate } from '../../../utils/formatDate'
import { phaseTextColor } from '../SnapshotGroupList'
const confirm = Modal.confirm

class SnapshotGroupDetail extends React.Component {
  componentDidMount() {
    const { name } = this.props.match.params
    this.props.dispatch({ type: 'snapshotGroup/get', payload: { name } })
  }

  getGroup() {
    const { name } = this.props.match.params
    const { data, selected } = this.props.snapshotGroup
    return (data || []).find(item => item.name === name) || selected || {}
  }

  handleDelete = (group) => {
    const { dispatch } = this.props
    confirm({
      width: 'fit-content',
      okText: 'Delete',
      okType: 'danger',
      title: (
        <div>
          <p>Are you sure you want to delete snapshot group <strong>{group.name}</strong> ?</p>
          <p>The member snapshots of this group will be deleted along with the group.</p>
        </div>
      ),
      onOk() {
        dispatch({ type: 'snapshotGroup/delete', payload: group })
        dispatch(routerRedux.push({ pathname: '/snapshotGroup' }))
      },
    })
  }

  handleMenuClick = (event, group) => {
    switch (event.key) {
      case 'delete':
        this.handleDelete(group)
        break
      default:
    }
  }

  render() {
    const group = this.getGroup()
    const spec = group.spec || group
    const status = group.status || group
    const phase = group.degraded ? 'Degraded' : (status.phase || 'InProgress')
    const members = status.members || spec.members || []
    const labels = spec.labels || {}
    const matchLabels = spec.volumeSelector?.matchLabels || {}
    const selectionMode = spec.volumeSelector ? 'Label selector' : 'Volumes'

    const columns = [
      {
        title: 'Volume',
        dataIndex: 'volumeName',
        key: 'volumeName',
        width: 240,
        render: text => <LinkTo to={{ pathname: `/volume/${text}` }}>{text}</LinkTo>,
      },
      { title: 'Snapshot', dataIndex: 'snapshotName', key: 'snapshotName', width: 260 },
      {
        title: 'Ready',
        dataIndex: 'readyToUse',
        key: 'readyToUse',
        width: 90,
        render: text => <span style={{ color: text ? '#27ae60' : '#e74c3c' }}>{text ? 'true' : 'false'}</span>,
      },
      { title: 'Created', dataIndex: 'creationTime', key: 'creationTime', width: 180, render: text => formatDate(text) },
      {
        title: 'Error',
        dataIndex: 'error',
        key: 'error',
        render: text => (text ? <span style={{ color: '#f5222d' }}>{text}</span> : ''),
      },
    ]

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 24 }}>
        <Col className="out-container-button" md={{ offset: 16, span: 8 }} style={{ marginBottom: 16, textAlign: 'right' }}>
          <DropOption
            menuOptions={[{ key: 'delete', name: 'Delete Group' }]}
            onMenuClick={(e) => this.handleMenuClick(e, group)}
          />
        </Col>

        {group.degraded && (
          <Alert
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
            message="Degraded"
            description="A member snapshot was deleted or became unusable after the group became Ready. The group no longer represents a complete point-in-time set."
          />
        )}
        {status.error && (
          <Alert type="error" showIcon style={{ marginBottom: 16 }} message={status.error} />
        )}

        <Row gutter={24} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Col xs={24} style={{ marginBottom: 16 }}>
            <Card bordered={false}>
              <Row gutter={24} style={{ marginBottom: 16 }}>
                <Col span={8}><strong>Status:</strong> <span style={{ color: phaseTextColor[phase] || 'inherit' }}>{phase}</span></Col>
                <Col span={8}><strong>Deadline:</strong> {spec.deadlineSeconds != null ? `${spec.deadlineSeconds}s` : '-'}</Col>
                <Col span={8}><strong>Creation time:</strong> {status.creationTime || '-'}</Col>
              </Row>
              <Row gutter={24} style={{ marginBottom: 16 }}>
                <Col span={8}><strong>Selection:</strong> {selectionMode}</Col>
                {spec.volumeSelector && (
                  <Col span={8}>
                    <strong>Label selector: </strong>
                    {Object.keys(matchLabels).map(key => <Tag key={key}>{key}={matchLabels[key]}</Tag>)}
                  </Col>
                )}
                {Object.keys(labels).length > 0 && (
                  <Col span={8}>
                    <strong>Engine labels: </strong>
                    {Object.keys(labels).map(key => <Tag key={key}>{key}={labels[key]}</Tag>)}
                  </Col>
                )}
              </Row>
            </Card>
          </Col>

          <Col xs={24} style={{ flex: 1, marginBottom: 16 }}>
            <Card bordered={false} style={{ height: '100%' }}>
              <Table
                bordered={false}
                columns={columns}
                dataSource={members}
                rowKey={record => record.snapshotName || record.volumeName}
                pagination={false}
              />
            </Card>
          </Col>
        </Row>
      </div>
    )
  }
}

SnapshotGroupDetail.propTypes = {
  dispatch: PropTypes.func,
  match: PropTypes.object,
  snapshotGroup: PropTypes.object,
}

export default connect(({ snapshotGroup }) => ({ snapshotGroup }))(SnapshotGroupDetail)
