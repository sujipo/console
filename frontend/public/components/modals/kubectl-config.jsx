import * as React from 'react';
import {saveAs} from 'file-saver';

import { k8sVersion } from '../../module/status';
import { createModalLauncher, ModalTitle, ModalBody, ModalFooter, ModalSubmitFooter } from '../factory/modal';
import { PromiseComponent } from '../utils';
import {coFetch} from '../../co-fetch';


const getVerificationCode = () => {
  window.open('api/tectonic/kubectl/code');
};

const getConfiguration = code => {
  return coFetch('api/tectonic/kubectl/config', {
    method: 'POST',
    body: `code=${encodeURIComponent(code)}`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
  }).then(res => res.text());
};

const downloadConfiguration = config => {
  const blob = new Blob([config], { type: 'text/yaml;charset=utf-8' });
  saveAs(blob, `kube-config-${window.SERVER_FLAGS.clusterName}`);
};

const steps = {
  GET_VERIFICATION_CODE: 1,
  VERIFY_CODE: 2,
  DOWNLOAD_CONFIGURATION: 3
};

class KubectlConfigModal extends PromiseComponent {
  constructor(props) {
    super(props);

    this.state = Object.assign(this.state, {
      step: steps.GET_VERIFICATION_CODE,
      configuration: null,
      verificationCode: null,
      kubectlLinuxUrl: null,
      kubectlMacUrl: null,
      kubectlWinUrl: null
    });

    this._updateCode = this._updateCode.bind(this);
    this._verifyCode = this._verifyCode.bind(this);
    this._closeModal = this._closeModal.bind(this);
    this._getVerificationCode = this._getVerificationCode.bind(this);
    this._downloadConfiguration = () => downloadConfiguration(this.state.configuration);
  }

  componentDidMount() {
    super.componentDidMount();
    this._setKubectlUrls();
  }

  _getVerificationCode(event) {
    event.preventDefault();

    getVerificationCode();
    this.setState({
      step: steps.VERIFY_CODE
    });
  }

  _closeModal(event) {
    this.props.cancel(event);
  }

  _verifyCode(event) {
    event.preventDefault();

    this.handlePromise(
      getConfiguration(this.state.verificationCode)
    ).then((configuration) => {
      this.setState({
        step: steps.DOWNLOAD_CONFIGURATION,
        configuration
      });
      this.props.callback();
    });
  }

  _updateCode(event) {
    this.setState({
      verificationCode: event.target.value
    });
  }

  _setKubectlUrls() {
    k8sVersion()
      .then((resp) => {
        if (!this.isMounted_) {
          return;
        }

        const prefix = `https://storage.googleapis.com/kubernetes-release/release/${resp.gitVersion.split('+')[0]}`;
        const postfix = '/amd64/kubectl';

        this.setState({
          kubectlMacUrl: `${prefix}/bin/darwin${postfix}`,
          kubectlLinuxUrl: `${prefix}/bin/linux${postfix}`,
          kubectlWinUrl: `${prefix}/bin/windows${postfix}.exe`
        });
      });
  }

  render() {
    return <div className="co-p-kubectl-config">

      {/*step 1: get verification code*/}
      { this.state.step === steps.GET_VERIFICATION_CODE && <form onSubmit={this._getVerificationCode} name="get-verification-code">
        <ModalTitle>设置kubectl</ModalTitle>
        <ModalBody>
          <p>构造将为您生成一个kubectl配置文件。首先，我们需要生成一组离线凭证。</p>
          <p>你的身份将在配置生成前被认证</p>
        </ModalBody>
        <ModalSubmitFooter errorMessage={this.state.errorMessage} inProgress={this.state.inProgress} submitText="核对身份" cancel={this.props.cancel} />
      </form> }

      {/*step 2: verify code*/}
      { this.state.step === steps.VERIFY_CODE && <form onSubmit={this._verifyCode} name="enter-verification-code">
        <ModalTitle>下载kubectl配置</ModalTitle>
        <ModalBody>
          <p>从前面的屏幕输入代码来生成凭证:</p>
          <div className="row co-m-form-row">
            <div className="col-sm-6">
              <input autoComplete="off" autoCorrect="off" autoCapitalize="off" autoFocus={true} spellCheck={false}
                type="text" className="form-control" placeholder="Verification Code" required={true} onChange={this._updateCode} />
            </div>
          </div>
        </ModalBody>
        <ModalSubmitFooter errorMessage={this.state.errorMessage} inProgress={this.state.inProgress} submitText="生成配置" cancel={this.props.cancel} />
      </form> }

      {/*step 3: download configuration*/}
      { this.state.step === steps.DOWNLOAD_CONFIGURATION && <div>
        <ModalTitle>下载kubectl配置</ModalTitle>
        <ModalBody>
          <p>
            <button type="button" className="btn btn-block btn-link co-btn--download" onClick={this._downloadConfiguration}>
              <i className="fa fa-download"></i>&nbsp;下载配置
            </button>
          </p>
          <p>1. Download the kubectl binary for <a href={this.state.kubectlMacUrl} target="_blank">Mac</a> or <a href={this.state.kubectlLinuxUrl} target="_blank">Linux</a> or <a href={this.state.kubectlWinUrl} target="_blank">Windows</a></p>
          <p>2. Place the configuration file at <code>~/.kube/config</code></p>
          <p>3. Done! Interact with the cluster, i.e. <code>kubectl get namespaces</code></p>
        </ModalBody>
        <ModalFooter errorMessage={this.state.errorMessage} inProgress={this.state.inProgress}>
          <button type="button" className="btn btn-primary" onClick={this._closeModal}>我完成了</button>
        </ModalFooter>
      </div> }

    </div>;
  }
}

export const kubectlConfigModal = createModalLauncher(KubectlConfigModal);
