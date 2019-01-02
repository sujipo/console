import * as React from 'react';

import { k8sCreate, referenceFor } from '../../module/k8s';
import { NamespaceModel, ProjectRequestModel, NetworkPolicyModel } from '../../models';
import { createModalLauncher, ModalTitle, ModalBody, ModalSubmitFooter } from '../factory/modal';
import { history, PromiseComponent, resourceObjPath, SelectorInput } from '../utils';

const allow = 'allow';
const deny = 'deny';

const defaultDeny = {
  'apiVersion': 'networking.k8s.io/v1',
  'kind': 'NetworkPolicy',
  'spec': {
    'podSelector': null
  }
};

class CreateNamespaceModal extends PromiseComponent {
  constructor(props) {
    super(props);
    this.state.np = allow;
  }

  handleChange (e) {
    const name = e.target.name;
    const value = e.target.value;
    this.setState({
      [name]: value
    });
  }

  createNamespace() {
    const {name, labels} = this.state;
    const namespace = {
      metadata: {
        name,
        labels: SelectorInput.objectify(labels),
      },
    };
    return k8sCreate(NamespaceModel, namespace);
  }

  createProject() {
    const {name, displayName, description} = this.state;
    const project = {
      metadata: {
        name,
      },
      displayName,
      description,
    };
    return k8sCreate(ProjectRequestModel, project);
  }

  _submit(event) {
    event.preventDefault();

    let promise = this.props.createProject ? this.createProject() : this.createNamespace();
    if (this.state.np === deny) {
      promise = promise.then(ns => {
        const policy = Object.assign({}, defaultDeny, {metadata: {namespace: ns.metadata.name, name: 'default-deny'}});
        return k8sCreate(NetworkPolicyModel, policy);
      });
    }

    this.handlePromise(promise).then(obj => {
      this.props.close();
      history.push(resourceObjPath(obj, referenceFor(obj)));
    });
  }

  onLabels (labels) {
    this.setState({labels});
  }

  render() {
    const label = this.props.createProject ? '项目' : '命名空间';
    return <form onSubmit={this._submit.bind(this)} name="form" className="co-p-new-user-modal">
      <ModalTitle>创建新的{label}</ModalTitle>
      <ModalBody>
        <div className="form-group">
          <label htmlFor="input-name" className="control-label">名称</label>
          <div className="modal-body__field">
            <input id="input-name" name="name" type="text" className="form-control" onChange={this.handleChange.bind(this)} value={this.state.name || ''} autoFocus required />
          </div>
        </div>
        {this.props.createProject && <div className="form-group">
          <label htmlFor="input-display-name" className="control-label">显示名称</label>
          <div className="modal-body__field">
            <input id="input-display-name" name="displayName" type="text" className="form-control" onChange={this.handleChange.bind(this)} value={this.state.displayName || ''} />
          </div>
        </div>}
        {this.props.createProject && <div className="form-group">
          <label htmlFor="input-description" className="control-label">描述</label>
          <div className="modal-body__field">
            <textarea id="input-description" name="description" className="form-control" onChange={this.handleChange.bind(this)} value={this.state.description || ''} />
          </div>
        </div>}
        {!this.props.createProject && <div className="form-group">
          <label htmlFor="tags-input" className="control-label">标签</label>
          <div className="modal-body__field">
            <SelectorInput labelClassName="co-text-namespace" onChange={this.onLabels.bind(this)} tags={[]} />
          </div>
        </div>}
        {!this.props.createProject && <div className="form-group">
          <label htmlFor="network-policy" className="control-label">默认网络政策</label>
          <div className="modal-body__field ">
            <select id="network-policy" onChange={e => this.setState({np: e.target.value})} value={this.state.np} className="form-control">
              <option value={allow}>没有限制(默认)</option>
              <option value={deny}>拒绝所有入境通信。</option>
            </select>
          </div>
        </div>}
      </ModalBody>
      <ModalSubmitFooter errorMessage={this.state.errorMessage} inProgress={this.state.inProgress} submitText={`创建${label}`} cancel={this.props.cancel.bind(this)} />
    </form>;
  }
}

export const createNamespaceModal = createModalLauncher(CreateNamespaceModal);
export const createProjectModal = createModalLauncher(props => <CreateNamespaceModal {...props} createProject={true} />);
