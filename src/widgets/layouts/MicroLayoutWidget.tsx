import * as React from 'react';
import * as _ from 'lodash';
import { WorkspaceNodeModel } from '../../models/node/WorkspaceNodeModel';
import { WorkspaceEngine } from '../../WorkspaceEngine';
import { DraggableWidget } from '../DraggableWidget';
import { FloatingPanelWidget } from '../FloatingPanelWidget';
import * as PropTypes from 'prop-types';
import { BaseWidget, BaseWidgetProps } from '@projectstorm/react-core';
import { WorkspacePanelFactory } from '../../WorkspacePanelFactory';

export interface MicroLayoutWidgetProps extends BaseWidgetProps {
	node: WorkspaceNodeModel;
	engine: WorkspaceEngine;
}

export class MicroLayoutWidget extends BaseWidget<MicroLayoutWidgetProps> {
	div: HTMLDivElement;
	buttons: { [id: string]: HTMLDivElement };

	static contextTypes = {
		workspace: PropTypes.any
	};

	constructor(props: MicroLayoutWidgetProps) {
		super('srw-micro-layout', props);
		this.buttons = {};
	}

	getFloatingModel() {
		return (
			<FloatingPanelWidget
				relativeElement={this.buttons[this.props.node.floatingModel.id]}
				model={this.props.node.floatingModel}
				engine={this.props.engine}
			/>
		);
	}

	componentDidMount() {
		if (this.props.node.floatingModel) {
			this.forceUpdate();
		}
	}

	render() {
		return (
			<div
				{...this.getProps()}
				ref={ref => {
					this.div = ref;
				}}>
				{_.map(this.props.node.getFlattened(), child => {
					let selected = this.props.node.floatingModel && this.props.node.floatingModel.id === child.id;
					return (
						<div
							key={child.id}
							className="srw-micro-layout__button"
							ref={ref => {
								this.buttons[child.id] = ref;
							}}>
							<DraggableWidget
								fullscreenEnabled={false}
								onClick={() => {
									if (selected) {
										this.props.node.setFloatingModel(null);
									} else {
										this.props.node.setFloatingModel(child);
									}
									this.props.engine.fireRepaintListeners();
								}}
								engine={this.props.engine}
								model={child}>
								{this.props.engine.getFactory<WorkspacePanelFactory>(child).generateMicroButton({
									model: child,
									selected: selected,
									engine: this.props.engine
								})}
							</DraggableWidget>
						</div>
					);
				})}
				{// is rendered into a react portal
				this.props.node.floatingModel && this.getFloatingModel()}
			</div>
		);
	}
}
