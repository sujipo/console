import * as _ from 'lodash-es';
import * as React from 'react';
import * as PropTypes from 'prop-types';

import { k8sPatch } from '../../module/k8s';
import { ChannelOperatorConfigModel } from '../../models';
import { createModalLauncher, ModalTitle, ModalBody, ModalSubmitFooter } from '../factory/modal';
import { PromiseComponent, Dropdown } from '../utils';

class ConfigureOperatorChannel extends PromiseComponent {
  constructor(props) {
    super(props);

    this.state = Object.assign(this.state, {
      value: _.get(this.props.config, 'channel').toString()
    });

    this._change = this._change.bind(this);
    this._submit = this._submit.bind(this);
    this._cancel = this.props.cancel.bind(this);
  }

  _change(value) {
    this.setState({ value });
  }

  _submit(event) {
    event.preventDefault();
    const patch = [{ op: 'replace', path: '/channel', value: this.state.value }];

    this.handlePromise(
      k8sPatch(ChannelOperatorConfigModel, this.props.config, patch)
    ).then(this.props.close);
  }

  render() {
    const items = {
      'tectonic-1.9-preproduction': 'Tectonic-1.9-preproduction',
      'tectonic-1.9-production': 'Tectonic-1.9-production',
    };
    return <form onSubmit={this._submit} name="form">
      <ModalTitle>更新通道</ModalTitle>
      <ModalBody>
        <div className="co-m-form-row">
          <div>
            <p>选择一个反映你想要的构造版本的通道。 <a href="https://coreos.com/tectonic/releases/" target="_blank" rel="noopener noreferrer">阅读发布说明</a>以获取更多信息。</p>
            <p>关键的安全更新将始终交付给任何脆弱的通道。</p>
          </div>
        </div>
        <div className="row co-m-form-row">
          <div className="col-xs-5">
            <Dropdown className="co-cluster-channel-dropdown" title={_.capitalize(this.state.value)} items={items} onChange={this._change} />
          </div>
        </div>
      </ModalBody>
      <ModalSubmitFooter
        errorMessage={this.state.errorMessage}
        inProgress={this.state.inProgress}
        submitText="保存通道"
        cancel={this._cancel} />
    </form>;
  }
}
ConfigureOperatorChannel.propTypes = {
  cancel: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
  config: PropTypes.object.isRequired,
  callbacks: PropTypes.object.isRequired,
  valueType: PropTypes.string
};

export const configureOperatorChannelModal = createModalLauncher(ConfigureOperatorChannel);
