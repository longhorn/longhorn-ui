import React from 'react'
import PropTypes from 'prop-types'
import { Tag, Input, Tooltip, Icon } from 'antd'

class DistTag extends React.Component {
  state = {
    tags: this.props.tags ? this.props.tags : [],
    inputVisible: false,
    inputValue: '',
  };

  handleClose = removedTag => {
    const tags = this.state.tags.filter(tag => tag !== removedTag)
    this.props.changeTags(tags)
    this.setState({ tags })
  };

  showInput = () => {
    this.setState({ inputVisible: true }, () => this.input.focus())
  };

  handleInputChange = e => {
    this.setState({ inputValue: e.target.value })
  };

  handleInputConfirm = () => {
    const { inputValue } = this.state
    let { tags } = this.state
    if (inputValue && tags.indexOf(inputValue) === -1) {
      tags = [...tags, inputValue]
    }

    this.props.changeTags(tags)
    this.setState({
      tags,
      inputVisible: false,
      inputValue: '',
    })
  };

  /* eslint no-return-assign: "off" */
  saveInputRef = input => (this.input = input)

  render() {
    const { tags } = this.state
    const { inputVisible, inputValue } = this.state
    return (
      <div>
        {tags.map((tag) => {
          const isLongTag = tag.length > 20
          const tagElem = (
            <Tag color={this.props.nodeBoolean ? 'rgb(39, 174, 95)' : '#108eb9'} key={tag} closable onClose={() => this.handleClose(tag)}>
              {isLongTag ? `${tag.slice(0, 20)}...` : tag}
            </Tag>
          )
          return isLongTag ? (
            <Tooltip title={tag} key={tag}>
              {tagElem}
            </Tooltip>
          ) : (
            tagElem
          )
        })}
        {inputVisible && (
          <Input
            ref={this.saveInputRef}
            type="text"
            size="small"
            style={{ width: 78 }}
            value={inputValue}
            onChange={this.handleInputChange}
            onBlur={this.handleInputConfirm}
            onPressEnter={this.handleInputConfirm}
          />
        )}
        {!inputVisible && (
          <Tag onClick={this.showInput} style={{ background: '#fff', borderStyle: 'dashed' }}>
            <Icon type="plus" /> {this.props.nodeBoolean ? 'New Node Tag' : 'New Disk Tag'}
          </Tag>
        )}
      </div>
    )
  }
}

DistTag.propTypes = {
  tags: PropTypes.array,
  changeTags: PropTypes.func,
  nodeBoolean: PropTypes.bool,
}

export default DistTag
