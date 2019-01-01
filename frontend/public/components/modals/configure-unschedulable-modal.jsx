import * as React from 'react';
import * as PropTypes from 'prop-types';

import { makeNodeUnschedulable } from '../../module/k8s/node';
import {createModalLauncher, ModalTitle, ModalBody, ModalSubmitFooter} from '../factory/modal';
import {PromiseComponent} from '../utils';

class UnscheduleNodeModal extends PromiseComponent {
  constructor(props) {
    super(props);
    this._submit = this._submit.bind(this);
    this._cancel = this.props.cancel.bind(this);
  }

  _submit(event) {
    event.preventDefault();

    this.handlePromise(makeNodeUnschedulable(this.props.resource))
      .then(this.props.close)
      .catch((error) => {
        throw error;
      });
  }

  render() {
    return <form onSubmit={this._submit} name="form">
      <ModalTitle>标记为不可调度</ModalTitle>
      <ModalBody>
        不可调度节点不能接受新的分离舱。这对于计划维护或准备退役节点非常有用。
      </ModalBody>
      <ModalSubmitFooter errorMessage={this.state.errorMessage} inProgress={this.state.inProgress} submitText="Mark Unschedulable" cancel={this._cancel} />
    </form>;
  }
}

UnscheduleNodeModal.propTypes = {
  resource: PropTypes.object.isRequired,
};

export const configureUnschedulableModal = createModalLauncher(UnscheduleNodeModal);
