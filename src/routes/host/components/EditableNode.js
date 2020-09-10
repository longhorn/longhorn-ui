import React from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import { Form, Radio, Icon, Tooltip } from 'antd'
import styles from './EditableDiskItem.less'
import DistTag from './TagComponent.js'

const FormItem = Form.Item
const RadioGroup = Radio.Group

class EditableDiskList extends React.Component {
  render() {
    const { form, node } = this.props
    const { getFieldDecorator } = form

    return (
      <Form>
        <div style={{ display: 'flex' }}>
          <div className={styles.formItem} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '15px 30px' }}>
            <div className={styles.label}>
              Node Scheduling
            </div>
            <div className={styles.control} style={{ width: '210px' }}>
              <FormItem style={{ margin: '3px 0px 0px 0px' }}>
                {getFieldDecorator('nodeAllowScheduling', {
                  initialValue: node.allowScheduling,
                })(
                  <RadioGroup>
                    <Radio value>Enable</Radio>
                    <Radio value={false}>Disable</Radio>
                  </RadioGroup>
                )}
              </FormItem>
            </div>
          </div>
          <div className={styles.formItem} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '15px 30px' }}>
            <div className={styles.label}>
              Eviction Requested
            </div>
            <div className={styles.control} style={{ width: '210px' }}>
              <FormItem style={{ margin: '3px 0px 0px 0px' }}>
                {getFieldDecorator('evictionRequested', {
                  initialValue: node.evictionRequested,
                })(
                  <RadioGroup>
                    <Radio value={true}>True</Radio>
                    <Radio value={false}>False</Radio>
                  </RadioGroup>
                )}
              </FormItem>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex' }}>
          <div className={styles.formItem} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '15px 30px' }}>
            <div className={styles.label}>
              Conditions
            </div>
            <div className={styles.control} style={{ width: '690px', lineHeight: '40px', display: 'flex' }}>
              {node && node.conditions && Object.keys(node.conditions).map((key) => {
                let title = (<div>
                  {node.conditions[key] && node.conditions[key].lastProbeTime && node.conditions[key].lastProbeTime ? <div style={{ marginBottom: 5 }}>Last Probe Time: {moment(node.conditions[key].lastProbeTime).fromNow()}</div> : ''}
                  {node.conditions[key] && node.conditions[key].lastTransitionTime && node.conditions[key].lastTransitionTime ? <div style={{ marginBottom: 5 }}>Last Transition Time: {moment(node.conditions[key].lastTransitionTime).fromNow()}</div> : ''}
                  {node.conditions[key] && node.conditions[key].message && node.conditions[key].message ? <div style={{ marginBottom: 5 }}>Message: {node.conditions[key].message}</div> : ''}
                  {node.conditions[key] && node.conditions[key].reason && node.conditions[key].reason ? <div style={{ marginBottom: 5 }}>Reason: {node.conditions[key].reason}</div> : ''}
                  {node.conditions[key] && node.conditions[key].status && node.conditions[key].status ? <div style={{ marginBottom: 5 }}>Status: {node.conditions[key].status}</div> : ''}
                </div>)
                return (<Tooltip key={key} title={title}><div style={{ marginRight: 40 }}>
                    {node.conditions[key].status && node.conditions[key].status.toLowerCase() === 'true' ? <Icon className="healthy" style={{ marginRight: 5 }} type="check-circle" /> : <Icon className="faulted" style={{ marginRight: 5 }} type="exclamation-circle" /> }
                    {node.conditions[key].type}
                  </div></Tooltip>)
              })}
             </div>
          </div>
        </div>
        <div style={{ display: 'flex' }}>
          <div className={styles.formItem} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '15px 30px' }}>
            <div className={styles.label}>
              Node Tags
            </div>
            <div className={styles.control} style={{ width: '500px', lineHeight: '40px' }}>
              <div>
                {getFieldDecorator('tags', {
                  initialValue: node.tags,
                })(<DistTag nodeBoolean={true} tags={node.tags} changeTags={(tags) => { form.setFieldsValue({ tags }) }} />)}
              </div>
            </div>
          </div>
        </div>
      </Form>
    )
  }
}

EditableDiskList.propTypes = {
  form: PropTypes.object,
  node: PropTypes.object,
  disks: PropTypes.array,
}

export default EditableDiskList
