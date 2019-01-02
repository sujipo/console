/* eslint-disable no-undef, no-unused-vars */

import * as React from 'react';
import * as _ from 'lodash-es';

import { createModalLauncher, ModalTitle, ModalBody, ModalSubmitFooter } from '../factory/modal';
import { PromiseComponent } from '../utils';
import { ClusterServiceVersionKind, SubscriptionKind } from '../cloud-services';
import { K8sKind, K8sResourceKind } from '../../module/k8s';
import { ClusterServiceVersionModel, SubscriptionModel } from '../../models';

export class DisableApplicationModal extends PromiseComponent {
  public state: DisableApplicationModalState;

  constructor(public props: DisableApplicationModalProps) {
    super(props);
    this.state.deleteCSV = true;
  }

  private submit(event): void {
    event.preventDefault();

    const {subscription, k8sKill} = this.props;
    const deleteOptions = {kind: 'DeleteOptions', apiVersion: 'v1', propagationPolicy: 'Foreground'};
    const killPromises = [k8sKill(SubscriptionModel, subscription, {}, deleteOptions)]
      .concat(_.get(this.props.subscription, 'status.installedCSV') && this.state.deleteCSV
        ? k8sKill(ClusterServiceVersionModel, {metadata: {name: subscription.status.installedCSV, namespace: subscription.metadata.namespace}} as ClusterServiceVersionKind, {}, deleteOptions)
        : []);

    this.handlePromise(Promise.all(killPromises)).then(() => this.props.close());
  }

  render() {
    const {name} = this.props.subscription.spec;

    return <form onSubmit={this.submit.bind(this)} name="form" className="co-catalog-install-modal">
      <ModalTitle className="modal-header">删除订阅</ModalTitle>
      <ModalBody>
        <div>
          <p>
            即将从<i>{this.props.subscription.metadata.namespace}</i>中删除<b>{name}</b>订阅，操作员将不再接收更新。
          </p>
        </div>
        <div>
          <label className="co-delete-modal-checkbox-label">
            <input type="checkbox" checked={this.state.deleteCSV} onChange={() => this.setState({deleteCSV: !this.state.deleteCSV})} />
            &nbsp;&nbsp; <strong>还可以从选择的名称空间中完全删除<b>{name}</b>操作员。</strong>
          </label>
        </div>
      </ModalBody>
      <ModalSubmitFooter inProgress={this.state.inProgress} errorMessage={this.state.errorMessage} cancel={this.props.cancel.bind(this)} submitText="移除" />
    </form>;
  }
}

export const createDisableApplicationModal: (props: ModalProps) => {result: Promise<void>} = createModalLauncher(DisableApplicationModal);

export type DisableApplicationModalProps = {
  cancel: (e: Event) => void;
  close: () => void;
  k8sKill: (kind: K8sKind, resource: K8sResourceKind, options: any, json: any) => Promise<any>;
  subscription: SubscriptionKind;
};

export type DisableApplicationModalState = {
  inProgress: boolean;
  errorMessage: string;
  deleteCSV: boolean;
};

type ModalProps = Omit<DisableApplicationModalProps, 'cancel' | 'close'>;
