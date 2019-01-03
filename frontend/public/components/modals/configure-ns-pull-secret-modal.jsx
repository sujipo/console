import * as _ from 'lodash-es';
import * as React from 'react';
import * as PropTypes from 'prop-types';

import { k8sPatch, k8sCreate } from '../../module/k8s';
import { SecretModel } from '../../models';
import { createModalLauncher, ModalTitle, ModalBody, ModalSubmitFooter } from '../factory/modal';
import { PromiseComponent, ResourceIcon } from '../utils';
import { CONST } from '../../const';

const parseExisitingPullSecret = (pullSecret) => {
  let invalidData = false;
  let invalidJson = false;
  let username, email, password, address;

  try {
    const existingData = pullSecret && window.atob(pullSecret.data[CONST.PULL_SECRET_DATA]);

    if (existingData) {
      const data = JSON.parse(existingData);

      if (!data || !data.auths) {
        throw 'Invalid data';
      }

      const keys = Object.keys(data.auths);

      if (keys.length > 1) {
        // multiple auths are stored in this one secret.
        // we'll display the first secret, but upon saving, the
        // others will get erased
        invalidData = true;
      } else if (keys.length < 1) {
        throw 'Invalid data';
      }
      address = keys[0];
      email = data.auths[address].email;
      const auth = window.atob(data.auths[address].auth);
      const authParts = auth.split(':');

      if (authParts.length === 1) {
        username = '';
        password = authParts[0];
      } else if (authParts.length === 2) {
        username = authParts[0];
        password = authParts[1];
      } else {
        throw 'Invalid data';
      }
    }
  } catch (error) {
    invalidData = true;
  }

  return {username, password, email, address, invalidData, invalidJson };
};

const generateSecretData = (formData) => {
  const config = {
    auths: {}
  };

  let authParts = [];

  if (_.trim(formData.username).length >= 1) {
    authParts.push(formData.username);
  }
  authParts.push(formData.password);

  config.auths[formData.address] = {
    auth:  window.btoa(authParts.join(':')),
    email: formData.email
  };

  return window.btoa(JSON.stringify(config));
};

class ConfigureNamespacePullSecret extends PromiseComponent {
  constructor(props) {
    super(props);

    this._submit = this._submit.bind(this);
    this._cancel = this.props.cancel.bind(this);

    this._onMethodChange = this._onMethodChange.bind(this);
    this._onFileChange = this._onFileChange.bind(this);

    this.state = Object.assign(this.state, {
      method: 'form',
      fileData: null,
      invalidJson: false
    });
  }

  _onMethodChange(event) {
    this.setState({ method: event.target.value });
  }

  _onFileChange(event) {
    this.setState({ invalidJson: false, fileData: null });

    const file = event.target.files[0];
    if (!file || file.type !== 'application/json') {
      this.setState({ invalidJson: true });
      return;
    }

    const reader = new FileReader();
    reader.onload = e => {
      const input = e.target.result;
      try {
        JSON.parse(input);
      } catch (error) {
        this.setState({ invalidJson: true });
        return;
      }
      this.setState({ fileData: input });
    };
    reader.readAsText(file, 'UTF-8');
  }

  _submit(event) {
    event.preventDefault();
    const {namespace, pullSecret} = this.props;

    let promise;
    let secretData;

    if (this.state.method === 'upload') {
      secretData = window.btoa(this.state.fileData);
    } else {
      const elements = event.target.elements;
      const formData = {
        username: elements['namespace-pull-secret-username'].value,
        password: elements['namespace-pull-secret-password'].value,
        email: elements['namespace-pull-secret-email'].value || '',
        address: elements['namespace-pull-secret-address'].value,
      };
      secretData = generateSecretData(formData);
    }

    if (pullSecret) {
      const patch = [{
        op: 'replace',
        path: `/data/${CONST.PULL_SECRET_DATA}`,
        value: secretData
      }];
      promise = k8sPatch(SecretModel, pullSecret, patch);
    } else {
      const data = {};
      data[CONST.PULL_SECRET_DATA] = secretData;

      const secret = {
        metadata: {
          name: event.target.elements['namespace-pull-secret-name'].value,
          namespace: namespace.metadata.name
        },
        data: data,
        type: CONST.PULL_SECRET_TYPE
      };
      promise = k8sCreate(SecretModel, secret);
    }

    this.handlePromise(promise).then(this.props.close);
  }

  render() {
    const {namespace, pullSecret} = this.props;

    const existingData = parseExisitingPullSecret(pullSecret);

    return <form onSubmit={this._submit} name="form">
      <ModalTitle>默认拉取私密</ModalTitle>
      <ModalBody>
        <p>
        指定用于在此名称空间内验证和下载容器的默认凭据。除非pod引用特定的拉取私密，否则这些凭据将是默认凭据。
        </p>

        {existingData.invalidData && <p className="alert alert-danger"><span className="pficon pficon-error-circle-o"></span>存在默认的拉取私密，但无法解析。保存它将覆盖它。</p>}

        <div className="row co-m-form-row">
          <div className="col-xs-3">
            <label>命名空间</label>
          </div>
          <div className="col-xs-9">
            <ResourceIcon kind="Namespace" className="co-m-resource-icon--align-left" /> &nbsp;{namespace.metadata.name}
          </div>
        </div>

        <div className="row co-m-form-row">
          <div className="col-xs-3">
            <label htmlFor="namespace-pull-secret-name">私密名称</label>
          </div>
          { pullSecret ?
            <div className="col-xs-9">
              <ResourceIcon kind="Secret" className="co-m-resource-icon--align-left" />
                &nbsp;{_.get(pullSecret, 'metadata.name')}
            </div> : <div className="col-xs-9">
              <input type="text" className="form-control" id="namespace-pull-secret-name" required />
              <p className="help-block text-muted">友好的名称，以帮助您在未来管理它</p>
            </div>
          }
        </div>

        <div className="row co-m-form-row form-group">
          <div className="col-xs-3">
            <label>方法</label>
          </div>
          <div className="col-xs-9">
            <div className="radio">
              <label className="control-label">
                <input type="radio" id="namespace-pull-secret-method--form"
                  checked={this.state.method === 'form'}
                  onChange={this._onMethodChange} value="form" />
                  输入用户名/密码
              </label>
            </div>
            <div className="radio">
              <label className="control-label">
                <input type="radio"
                  checked={this.state.method === 'upload'}
                  onChange={this._onMethodChange}
                  id="namespace-pull-secret-method--upload" value="upload" />
                上传 Docker config.json
              </label>
            </div>
          </div>
        </div>

        { this.state.method === 'form' && <div>
          <div className="row co-m-form-row">
            <div className="col-xs-3">
              <label htmlFor="namespace-pull-secret-address">注册地址</label>
            </div>
            <div className="col-xs-9">
              <input type="text" className="form-control" id="namespace-pull-secret-address" defaultValue={existingData.address} placeholder="quay.io" required />
            </div>
          </div>
          <div className="row co-m-form-row">
            <div className="col-xs-3">
              <label htmlFor="namespace-pull-secret-email">电子邮件</label>
            </div>
            <div className="col-xs-9">
              <input type="email" className="form-control" defaultValue={existingData.email} id="namespace-pull-secret-email" />
              <p className="help-block text-muted">可选，取决于注册表提供程序</p>
            </div>
          </div>
          <div className="row co-m-form-row">
            <div className="col-xs-3">
              <label htmlFor="namespace-pull-secret-username">用户名</label>
            </div>
            <div className="col-xs-9">
              <input type="text" defaultValue={existingData.username} className="form-control" id="namespace-pull-secret-username" required />
            </div>
          </div>
          <div className="row co-m-form-row">
            <div className="col-xs-3">
              <label htmlFor="namespace-pull-secret-password">密码</label>
            </div>
            <div className="col-xs-9">
              <input type="text" defaultValue={existingData.password} className="form-control" id="namespace-pull-secret-password" required />
            </div>
          </div>
        </div> }

        { this.state.method === 'upload' && <div>
          <div className="row co-m-form-row">
            <div className="col-xs-3">
              <label htmlFor="namespace-pull-secret-file">文件上传</label>
            </div>
            <div className="col-xs-9">
              <input type="file" id="namespace-pull-secret-file" onChange={this._onFileChange} />
              <p className="help-block etext-muted">正确配置JSON格式的Docker配置文件。将base64编码后上传。</p>
            </div>
          </div>
          { this.state.invalidJson || existingData.invalidJson && <div className="row co-m-form-row">
            <div className="col-xs-9 col-sm-offset-3">
              <div className="alert alert-danger"><span className="pficon pficon-error-circle-o"></span>无效的格式。上传的文件格式不正确。</div>
            </div>
          </div> }
          { this.state.fileData &&<div className="row co-m-form-row">
            <div className="col-xs-9 col-sm-offset-3">
              <pre className="co-pre-wrap">{this.state.fileData}</pre>
            </div>
          </div> }
        </div> }

      </ModalBody>
      <ModalSubmitFooter errorMessage={this.state.errorMessage} inProgress={this.state.inProgress} submitText="保存私密" cancel={this._cancel} />
    </form>;
  }
}

ConfigureNamespacePullSecret.propTypes = {
  namespace: PropTypes.object.isRequired,
  pullSecret: PropTypes.object
};

export const configureNamespacePullSecretModal = createModalLauncher(ConfigureNamespacePullSecret);
