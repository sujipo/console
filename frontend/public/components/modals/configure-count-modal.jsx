import * as _ from 'lodash-es';
import * as React from 'react';
import * as PropTypes from 'prop-types';

import { k8sPatch } from '../../module/k8s';
import { createModalLauncher, ModalTitle, ModalBody, ModalSubmitFooter } from '../factory/modal';
import { PromiseComponent, NumberSpinner } from '../utils';

class ConfigureCountModal extends PromiseComponent {
  constructor(props) {
    super(props);

    const getPath = this.props.path.substring(1).replace('/', '.');
    this.state = Object.assign(this.state, {
      value: _.get(this.props.resource, getPath) || this.props.defaultValue
    });

    this._change = this._change.bind(this);
    this._submit = this._submit.bind(this);
    this._cancel = this.props.cancel.bind(this);
    this._changeValueBy = this._changeValueBy.bind(this);
  }

  _change(event) {
    const value = event.target.value;
    this.setState({value});
  }

  _changeValueBy(operation) {
    this.setState({
      value: _.toInteger(this.state.value) + operation
    });
  }

  _invalidateState(isInvalid, count) {
    if (this.props.invalidateState) {
      this.props.invalidateState(isInvalid, count);
    }
  }

  _submit(event) {
    event.preventDefault();

    const patch = [{ op: 'replace', path: this.props.path, value: _.toInteger(this.state.value) }];

    this._invalidateState(true, _.toInteger(this.state.value));
    this.handlePromise(
      k8sPatch(this.props.resourceKind, this.props.resource, patch)
    )
      .then(this.props.close)
      .catch((error) => {
        this._invalidateState(false);
        throw error;
      });
  }

  render() {
    return <form onSubmit={this._submit} name="form">
      <ModalTitle>{this.props.title}</ModalTitle>
      <ModalBody>
        <p>{this.props.message}</p>
        <NumberSpinner className="form-control" value={this.state.value} onChange={this._change} changeValueBy={this._changeValueBy} autoFocus required />
      </ModalBody>
      <ModalSubmitFooter errorMessage={this.state.errorMessage} inProgress={this.state.inProgress} submitText={this.props.buttonText} cancel={this._cancel} />
    </form>;
  }
}
ConfigureCountModal.propTypes = {
  buttonText: PropTypes.node.isRequired,
  cancel: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
  defaultValue: PropTypes.number.isRequired,
  path: PropTypes.string.isRequired,
  resource: PropTypes.object.isRequired,
  resourceKind: PropTypes.object.isRequired,
  title: PropTypes.node.isRequired
};

export const configureCountModal = createModalLauncher(ConfigureCountModal);

export const configureReplicaCountModal = (props) => {
  return configureCountModal(_.defaults({}, {
    defaultValue: 0,
    title: '编辑数量',
    message: `${props.resourceKind.labelPlural} 保持期望的健康Pod数量。`,
    path: '/spec/replicas',
    buttonText: 'Save Desired Count'
  }, props));
};

export const configureJobParallelismModal = (props) => {
  return configureCountModal(_.defaults({}, {
    defaultValue: 1,
    title: '编辑并行性',
    message: `${props.resourceKind.labelPlural} 创建一个或多个Pod，并确保指定数量的Pod成功终止。当成功完成指定数量的任务时，任务就完成了。`,
    path: '/spec/parallelism',
    buttonText: 'Save Desired Parallelism'
  }, props));
};

export const configureClusterSizeModal = (props) => {
  return configureCountModal(_.defaults({}, {
    defaultValue: 0,
    title: '编辑集群大小',
    message: `${props.resourceKind.labelPlural} 保持期望的健康Pod数量。`,
    path: '/spec/size',
    buttonText: 'Save Cluster Size'
  }, props));
};

