import * as React from 'react';
import * as PropTypes from 'prop-types';

import { k8sPatch } from '../../module/k8s';
import { ChannelOperatorConfigModel, AppVersionModel } from '../../models';
import { LoadingInline, OperatorState } from '../utils';
import { SafetyFirst } from '../safety-first';

export class DetailStatus extends SafetyFirst {
  constructor(props) {
    super(props);
    this.state = {
      outdated: false
    };
  }

  componentWillReceiveProps() {
    this.setState({
      outdated: false
    });
  }

  _doAction(kind, field, value) {
    this.setState({
      outdated: true
    });

    let k8skind, resource;
    if (kind === 'config') {
      k8skind = ChannelOperatorConfigModel;
      resource = this.props.config;
    } else if (kind === 'app-version') {
      k8skind = AppVersionModel;
      resource = { metadata: { namespace: 'tectonic-system', name: 'tectonic-cluster' } };
    }

    const patch = [{ op: 'replace', path: `/${field}`, value: value }];
    k8sPatch(k8skind, resource, patch)
      .catch((error) => {
        this.setState({
          outdated: false
        });
        throw error;
      });
  }

  _actionButton() {
    if (this.props.config) {
      if (this.state.outdated) {
        return <button className="co-cluster-updates__action-button btn" disabled={true}><LoadingInline /></button>;
      }

      if (this.props.channelState === 'Paused' || this.props.channelState === 'Pausing') {
        return <button className="co-cluster-updates__action-button btn btn-default" onClick={this._doAction.bind(this, 'app-version', 'spec/paused', false)}>恢复更新</button>;
      } else if (this.props.channelState === 'UpdateAvailable') {
        return <button className="co-cluster-updates__action-button btn btn-primary" onClick={this._doAction.bind(this, 'config', 'triggerUpdate', true)}>开始更新</button>;
      } else if (this.props.channelState === 'Requested') {
        return <button className="co-cluster-updates__action-button btn btn-default" onClick={this._doAction.bind(this, 'config', 'triggerUpdate', false)}>请求取消</button>;
      } else if (this.props.channelState === 'Updating') {
        // Updating + already paused is covered above, so we can assume updating + not paused
        return <button className="co-cluster-updates__action-button btn btn-default" onClick={this._doAction.bind(this, 'app-version', 'spec/paused', true)}>暂停更新</button>;
      } else if (this.props.channelState === 'UpToDate') {
        if (this.props.config.triggerUpdateCheck) {
          return <button className="co-cluster-updates__action-button btn" disabled={true}><LoadingInline /></button>;
        }
        return <button className="co-cluster-updates__action-button btn btn-default" onClick={this._doAction.bind(this, 'config', 'triggerUpdateCheck', true)}>检查更新</button>;
      } else if (this.props.channelState === 'Failed') {
        return <button className="co-cluster-updates__action-button btn btn-default" onClick={this._doAction.bind(this, 'config', 'triggerUpdate', true)}>重试更新</button>;
      }
    }
  }

  render() {
    return <span>
      {<OperatorState opState={this.props.channelState} version={this.props.version} /> || <LoadingInline />}
      {this._actionButton()}
    </span>;
  }
}
DetailStatus.propTypes = {
  config: PropTypes.object,
  channelState: PropTypes.string,
  version: PropTypes.string,
};
