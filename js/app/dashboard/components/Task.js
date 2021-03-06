import React from 'react'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next'
import moment from 'moment'
import { ContextMenuTrigger } from 'react-contextmenu'

import { setCurrentTask, toggleTask, selectTask } from '../redux/actions'

moment.locale($('html').attr('lang'))

class Task extends React.Component {

  constructor(props) {
    super(props)

    this.onClick = this.onClick.bind(this)
    this.onDoubleClick = this.onDoubleClick.bind(this)
    this.prevent = false
  }

  renderStatusIcon() {

    const { assigned, task } = this.props

    if (assigned) {
      if (task.status === 'TODO') {
        return (
          <a
            href="#"
            className="task__icon task__icon--right"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              this.props.onRemove(task)
            }}
            data-toggle="tooltip" data-placement="right" title={ this.props.t('ADMIN_DASHBOARD_UNASSIGN_TASK', { id: task.id }) }
          ><i className="fa fa-times"></i></a>
        )
      }
      if (task.status === 'DONE') {
        return (
          <span className="task__icon task__icon--right">
            <i className="fa fa-check"></i>
          </span>
        )
      }
      if (task.status === 'FAILED') {
        return (
          <span className="task__icon task__icon--right">
            <i className="fa fa-warning"></i>
          </span>
        )
      }
    }
  }

  // @see https://css-tricks.com/snippets/javascript/bind-different-events-to-click-and-double-click/

  onClick(e) {
    const multiple = (e.ctrlKey || e.metaKey)
    this.timer = setTimeout(() => {
      if (!this.prevent) {
        const { toggleTask, task } = this.props
        toggleTask(task, multiple)
      }
      this.prevent = false
    }, 250)
  }

  onDoubleClick(e) {
    clearTimeout(this.timer)
    this.prevent = true

    const { task } = this.props
    this.props.setCurrentTask(task)
  }

  renderLinkedIcon() {

    const { assigned } = this.props
    const classNames = ['task__icon']
    classNames.push(assigned ? 'task__icon--left' : 'task__icon--right')

  }

  renderTags() {
    const { task } = this.props

    return (
      <span className="task__tags">
        { task.tags.map(tag => (
          <i key={ tag.slug } className="fa fa-circle" style={{ color: tag.color }}></i>
        )) }
      </span>
    )
  }

  render() {

    const { task, selected } = this.props

    const classNames = [
      'list-group-item',
      'list-group-item--' + task.type.toLowerCase(),
      'list-group-item--' + task.status.toLowerCase(),
      'task__draggable'
    ]

    let taskAttributes = {}
    if (task.previous) {
      taskAttributes = Object.assign(taskAttributes, { 'data-previous': task.previous })
    }
    if (task.next) {
      taskAttributes = Object.assign(taskAttributes, { 'data-next': task.next })
    }

    if (selected) {
      classNames.push('task__highlighted')
    }

    const customerName =  task.address.firstName ?  [task.address.firstName, task.address.lastName, task.address.streetAddress].join(' ') : null,
      addressName = task.address.name || customerName || task.address.streetAddress

    const contextMenuTriggerAttrs = {
      ...taskAttributes,
      style: {
        display: 'block',
        borderLeft: `6px solid ${task.deliveryColor}`
      },
      key: task['@id'],
      className: classNames.join(' '),
      'data-task-id': task['@id'],
      onDoubleClick: this.onDoubleClick,
      onClick: this.onClick,
      onContextMenu: () => this.props.selectTask(task)
    }

    // Don't return the task object directly, to avoid stripping the "id" prop
    const collect = (props) => ({ task: props.task })

    return (
      <ContextMenuTrigger renderTag="span" id="dashboard"
        task={ task }
        collect={ collect }
        attributes={ contextMenuTriggerAttrs }>
        <i className={ 'task__icon task__icon--type fa fa-' + (task.type === 'PICKUP' ? 'cube' : 'arrow-down') }></i>
        <span>
          { this.props.t('ADMIN_DASHBOARD_TASK_CAPTION', {
            id: task.id,
            address: addressName,
            date: moment(task.doneBefore).format('LT')
          }) }
        </span>
        { this.renderTags() }
        { this.renderLinkedIcon() }
        { this.renderStatusIcon() }
      </ContextMenuTrigger>
    )

  }
}

function mapStateToProps(state, ownProps) {
  return {
    selected: -1 !== state.selectedTasks.indexOf(ownProps.task),
  }
}

function mapDispatchToProps (dispatch) {
  return {
    setCurrentTask: (task) => dispatch(setCurrentTask(task)),
    toggleTask: (task, multiple) => dispatch(toggleTask(task, multiple)),
    selectTask: (task) => dispatch(selectTask(task)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Task))
