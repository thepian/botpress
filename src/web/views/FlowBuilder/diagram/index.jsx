import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import classnames from 'classnames'
import axios from 'axios'
import _ from 'lodash'

const {
  DiagramWidget,
  DiagramEngine,
  DefaultNodeFactory,
  DefaultLinkFactory,
  DiagramModel,
  DefaultNodeModel,
  DefaultPortModel,
  LinkModel
} = require('storm-react-diagrams')

import { StandardNodeModel, StandardWidgetFactory } from './nodes/StandardNode'

const style = require('./style.scss')

export default class FlowBuilder extends Component {
  constructor(props) {
    super(props)
    this.state = {}

    this.diagramEngine = new DiagramEngine()

    this.diagramEngine.registerNodeFactory(new DefaultNodeFactory())
    this.diagramEngine.registerNodeFactory(new StandardWidgetFactory())

    this.diagramEngine.registerLinkFactory(new DefaultLinkFactory())

    this.setModel()
  }

  setTranslation(x = 0, y = 0) {
    this.activeModel.setOffset(x, y)
    this.diagramWidget.fireAction()
    this.diagramWidget.forceUpdate()
  }

  serialize() {
    return this.activeModel.serializeDiagram()
  }

  setModel() {
    this.activeModel = new DiagramModel()
    this.activeModel.setGridSize(25)
    this.diagramEngine.setDiagramModel(this.activeModel)

    const currentFlow = this.props.currentFlow
    if (!currentFlow) {
      return
    }

    const nodes = currentFlow.nodes.map(node => {
      const model = new StandardNodeModel(node)
      model.x = node.x
      model.y = node.y
      return model
    })

    nodes.forEach(node => this.activeModel.addNode(node))
  }

  componentDidUpdate() {
    this.setModel()
  }

  getSelectedNode() {
    return _.first(this.activeModel.getSelectedItems() || [], { selected: true })
  }

  componentDidMount() {
    ReactDOM.findDOMNode(this.diagramWidget).addEventListener('mousedown', ::this.onDiagramClick)
    ReactDOM.findDOMNode(this.diagramWidget).addEventListener('click', ::this.onDiagramClick)
  }

  shouldComponentUpdate(nextProps, nextState) {
    return true
  }

  componentWillUnmount() {
    ReactDOM.findDOMNode(this.diagramWidget).removeEventListener('mousedown', ::this.onDiagramClick)
    ReactDOM.findDOMNode(this.diagramWidget).removeEventListener('click', ::this.onDiagramClick)
  }

  onDiagramClick() {
    const selectedNode = this.getSelectedNode()
    const currentNode = this.props.currentFlowNode

    // No node selected
    if (!selectedNode && currentNode) {
      return this.props.switchFlowNode(null)
    }

    // Selected a new node
    if (selectedNode && (!currentNode || selectedNode.id !== currentNode.id)) {
      this.props.switchFlowNode(selectedNode.id)
    }
  }

  render() {
    return <DiagramWidget ref={w => (this.diagramWidget = w)} diagramEngine={this.diagramEngine} />
  }
}