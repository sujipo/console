import * as React from 'react';
import * as PropTypes from 'prop-types';

import { k8sKill } from '../../module/k8s';
import { createModalLauncher, ModalTitle, ModalBody, ModalSubmitFooter } from '../factory/modal';
import { history, PromiseComponent} from '../utils';

class DeleteNamespaceModal extends PromiseComponent {
  constructor(props) {
    super(props);
    this.state = Object.assign(this.state, {isTypedNsMatching: false});
    this._submit = this._submit.bind(this);
    this._close = props.close.bind(this);
    this._cancel = props.cancel.bind(this);
    this._matchTypedNamespace = this._matchTypedNamespace.bind(this);
  }

  _matchTypedNamespace(e) {
    this.setState({ isTypedNsMatching: e.target.value === this.props.resource.metadata.name });
  }

  _submit(event) {
    event.preventDefault();
    this.handlePromise(k8sKill(this.props.kind, this.props.resource)).then(() => {
      this._close();
      history.push(`/k8s/cluster/${this.props.kind.path}`);
    });
  }

  render() {
    return <form onSubmit={this._submit} name="form">
      <ModalTitle>删除{this.props.kind.label}</ModalTitle>
      <ModalBody>
        <p>这一行动无法撤消。它将销毁已删除名称空间中的所有pod、服务和其他对象。</p>
        <p>在下面输入 <strong>{this.props.resource.metadata.name}</strong> 确认删除:</p>
        <input type="text" className="form-control" onKeyUp={this._matchTypedNamespace} placeholder="Enter name" autoFocus={true} />
      </ModalBody>
      <ModalSubmitFooter submitText={`删除${this.props.kind.label}`} submitDisabled={!this.state.isTypedNsMatching} cancel={this._cancel} errorMessage={this.state.errorMessage} inProgress={this.state.inProgress} />
    </form>;
  }
}

DeleteNamespaceModal.propTypes = {
  kind: PropTypes.object,
  resource: PropTypes.object,
};

export const deleteNamespaceModal = createModalLauncher(DeleteNamespaceModal);
