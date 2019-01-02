/* eslint-disable no-undef, no-unused-vars */

import * as React from 'react';
import * as _ from 'lodash-es';
import { match, Link } from 'react-router-dom';
import { safeLoad } from 'js-yaml';

import { List, ListHeader, ColHead, DetailsPage, ListPage } from '../factory';
import { MsgBox, ResourceLink, ResourceCog, navFactory, Cog, ResourceSummary, LoadingInline, SectionHeading } from '../utils';
import { SubscriptionKind, SubscriptionState, Package, InstallPlanApproval, ClusterServiceVersionKind, olmNamespace } from './index';
import { referenceForModel, k8sKill, k8sUpdate, ConfigMapKind } from '../../module/k8s';
import { SubscriptionModel, ClusterServiceVersionModel, CatalogSourceModel, ConfigMapModel, InstallPlanModel } from '../../models';
import { createDisableApplicationModal } from '../modals/disable-application-modal';
import { createSubscriptionChannelModal } from '../modals/subscription-channel-modal';
import { createInstallPlanApprovalModal } from '../modals/installplan-approval-modal';

export const SubscriptionHeader: React.SFC<SubscriptionHeaderProps> = (props) => <ListHeader>
  <ColHead {...props} className="col-xs-6 col-sm-4 col-md-3" sortField="metadata.name">名称</ColHead>
  <ColHead {...props} className="col-xs-6 col-sm-4 col-md-3" sortField="metadata.namespace">命名空间</ColHead>
  <ColHead {...props} className="hidden-xs col-sm-4 col-md-3 col-lg-2">状态</ColHead>
  <ColHead {...props} className="hidden-xs hidden-sm col-md-3 col-lg-2">通道</ColHead>
  <ColHead {...props} className="hidden-xs hidden-sm hidden-md col-lg-2">批准策略</ColHead>
</ListHeader>;

const subscriptionState = (state: SubscriptionState) => {
  switch (state) {
    case SubscriptionState.SubscriptionStateUpgradeAvailable: return <span><i className="fa fa-exclamation-triangle text-warning" /> Upgrade available</span>;
    case SubscriptionState.SubscriptionStateUpgradePending: return <span><i className="fa fa-spin fa-circle-o-notch co-catalog-spinner--downloading" /> Upgrading</span>;
    case SubscriptionState.SubscriptionStateAtLatest: return <span><i className="fa fa-check-circle" style={{color: '#2ec98e'}} /> Up to date</span>;
    default: return <span className={_.isEmpty(state) && 'text-muted'}>{state || 'Unknown'}</span>;
  }
};

const menuActions = [
  Cog.factory.Edit,
  (kind, obj) => ({
    label: 'Remove Subscription...',
    callback: () => createDisableApplicationModal({k8sKill, subscription: obj}),
  }),
  (kind, obj) => ({
    label: `View ${ClusterServiceVersionModel.kind}...`,
    href: `/k8s/ns/${obj.metadata.namespace}/${ClusterServiceVersionModel.plural}/${_.get(obj.status, 'installedCSV')}`,
  })
];

export const SubscriptionRow: React.SFC<SubscriptionRowProps> = (props) => {
  return <div className="row co-resource-list__item">
    <div className="col-xs-6 col-sm-4 col-md-3 co-resource-link-wrapper">
      <ResourceCog actions={_.get(props.obj.status, 'installedCSV') ? menuActions : menuActions.slice(0, -1)} kind={referenceForModel(SubscriptionModel)} resource={props.obj} />
      <ResourceLink kind={referenceForModel(SubscriptionModel)} name={props.obj.metadata.name} namespace={props.obj.metadata.namespace} title={props.obj.metadata.name} />
    </div>
    <div className="col-xs-6 col-sm-4 col-md-3">
      <ResourceLink kind="Namespace" name={props.obj.metadata.namespace} title={props.obj.metadata.namespace} displayName={props.obj.metadata.namespace} />
    </div>
    <div className="hidden-xs col-sm-4 col-md-3 col-lg-2">
      {subscriptionState(_.get(props.obj.status, 'state'))}
    </div>
    <div className="hidden-xs hidden-sm col-md-3 col-lg-2">
      {props.obj.spec.channel || 'default'}
    </div>
    <div className="hidden-xs hidden-sm hidden-md col-lg-2">
      {props.obj.spec.installPlanApproval || 'Automatic'}
    </div>
  </div>;
};

export const SubscriptionsList: React.SFC<SubscriptionsListProps> = (props) => <List
  {...props}
  Row={SubscriptionRow}
  Header={SubscriptionHeader}
  EmptyMsg={() => <MsgBox title="没有发现订阅" detail="每个名称空间都可以订阅包的单个通道以进行自动更新。" />} />;

export const SubscriptionsPage: React.SFC<SubscriptionsPageProps> = (props) => <ListPage
  {...props}
  kind={referenceForModel(SubscriptionModel)}
  title="订阅"
  showTitle={true}
  canCreate={true}
  createProps={{to: props.namespace ? `/k8s/ns/${props.namespace}/${CatalogSourceModel.plural}` : `/k8s/all-namespaces/${CatalogSourceModel.plural}`}}
  createButtonText="创建订阅"
  ListComponent={SubscriptionsList}
  filterLabel="订阅通过软件包" />;

export const SubscriptionDetails: React.SFC<SubscriptionDetailsProps> = (props) => {
  const {obj, installedCSV, pkg} = props;
  const catalogNS = obj.spec.sourceNamespace || olmNamespace;

  return <div className="co-m-pane__body">
    <SectionHeading text="订阅概述" />
    <div className="co-m-pane__body-group">
      <SubscriptionUpdates pkg={pkg} obj={obj} installedCSV={installedCSV} />
    </div>
    <div className="co-m-pane__body-group">
      <div className="row">
        <div className="col-sm-6">
          <ResourceSummary resource={obj} showNodeSelector={false} showPodSelector={false} showAnnotations={false} />
        </div>
        <div className="col-sm-6">
          <dl className="co-m-pane__details">
            <dt>Installed Version</dt>
            <dd>
              { _.get(obj.status, 'installedCSV') && installedCSV
                ? <ResourceLink kind={referenceForModel(ClusterServiceVersionModel)} name={obj.status.installedCSV} namespace={obj.metadata.namespace} title={obj.status.installedCSV} />
                : 'None' }
            </dd>
            <dt>Starting Version</dt>
            <dd>{obj.spec.startingCSV || 'None'}</dd>
            <dt>Catalog</dt>
            <dd>
              <ResourceLink kind={referenceForModel(CatalogSourceModel)} name={obj.spec.source} namespace={catalogNS} title={obj.spec.source} />
            </dd>
          </dl>
        </div>
      </div>
    </div>
  </div>;
};

export class SubscriptionUpdates extends React.Component<SubscriptionUpdatesProps, SubscriptionUpdatesState> {
  constructor(props) {
    super(props);
    this.state = {
      waitingForUpdate: false,
      installPlanApproval: _.get(props.obj, 'spec.installPlanApproval'),
      channel: _.get(props.obj, 'spec.channel'),
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const stillWaiting = prevState.waitingForUpdate
      && (_.get(nextProps, 'obj.spec.channel') === prevState.channel && _.get(nextProps, 'obj.spec.installPlanApproval') === prevState.installPlanApproval);

    return stillWaiting
      ? null
      : {waitingForUpdate: false, channel: _.get(nextProps, 'obj.spec.channel'), installPlanApproval: _.get(nextProps, 'obj.spec.installPlanApproval')};
  }

  render() {
    const {obj, pkg, installedCSV} = this.props;

    const k8sUpdateAndWait = (...args) => k8sUpdate(...args).then(() => this.setState({waitingForUpdate: true}));
    const channelModal = () => createSubscriptionChannelModal({subscription: obj, pkg, k8sUpdate: k8sUpdateAndWait});
    const approvalModal = () => createInstallPlanApprovalModal({obj, k8sUpdate: k8sUpdateAndWait});

    return <div className="co-detail-table">
      <div className="co-detail-table__row row">
        <div className="co-detail-table__section col-sm-3">
          <dl className="co-m-pane__details">
            <dt className="co-detail-table__section-header">通道</dt>
            <dd>{ this.state.waitingForUpdate
              ? <LoadingInline />
              : <a className="co-m-modal-link" onClick={() => channelModal()}>{obj.spec.channel || 'default'}</a>
            }</dd>
          </dl>
        </div>
        <div className="co-detail-table__section col-sm-3">
          <dl className="co-m-pane__details">
            <dt className="co-detail-table__section-header">批准</dt>
            <dd>{ this.state.waitingForUpdate
              ? <LoadingInline />
              : <a className="co-m-modal-link" onClick={() => approvalModal()}>{obj.spec.installPlanApproval || 'Automatic'}</a>
            }</dd>
          </dl>
        </div>
        <div className="co-detail-table__section co-detail-table__section--last col-sm-6">
          <dl className="co-m-pane__details">
            <dt className="co-detail-table__section-header">升级状态</dt>
            <dd>{subscriptionState(_.get(obj.status, 'state'))}</dd>
          </dl>
          <div className="co-detail-table__bracket"></div>
          <div className="co-detail-table__breakdown">
            { _.get(obj.status, 'installedCSV') && installedCSV
              ? <Link to={`/k8s/ns/${obj.metadata.namespace}/${ClusterServiceVersionModel.plural}/${_.get(obj.status, 'installedCSV')}`}>1 已安装</Link>
              : <span>0 已安装</span> }
            { _.get(obj.status, 'state') === SubscriptionState.SubscriptionStateUpgradePending && _.get(obj.status, 'installplan')
              ? <Link to={`/k8s/ns/${obj.metadata.namespace}/${InstallPlanModel.plural}/${_.get(obj.status, 'installplan.name')}`}>1 安装中</Link>
              : <span>0 安装中</span> }
          </div>
        </div>
      </div>
    </div>;
  }
}

export const SubscriptionDetailsPage: React.SFC<SubscriptionDetailsPageProps> = (props) => {
  type PkgFor = (configMap: ConfigMapKind[]) => (obj: SubscriptionKind) => Package;
  const pkgFor: PkgFor = configMaps => obj => configMaps.filter(cm => _.get(cm.data, 'packages') !== undefined)
    .map(cm => safeLoad(cm.data.packages) as Package[])
    .reduce((allPackages, packages) => [...allPackages, ...packages], [])
    .find((pkg: Package) => pkg.packageName === obj.spec.name);

  type InstalledCSV = (clusterServiceVersions?: ClusterServiceVersionKind[]) => (obj: SubscriptionKind) => ClusterServiceVersionKind;
  const installedCSV: InstalledCSV = clusterServiceVersions => obj => clusterServiceVersions.find(csv => csv.metadata.name === _.get(obj, 'status.installedCSV'));

  type DetailsProps = {
    localConfigMaps?: ConfigMapKind[];
    globalConfigMaps?: ConfigMapKind[];
    clusterServiceVersions?: ClusterServiceVersionKind[];
    obj: SubscriptionKind;
  };

  return <DetailsPage
    {...props}
    namespace={props.match.params.ns}
    kind={referenceForModel(SubscriptionModel)}
    name={props.match.params.name}
    pages={[
      navFactory.details((detailsProps: DetailsProps) => <SubscriptionDetails
        obj={detailsProps.obj}
        pkg={pkgFor(detailsProps.localConfigMaps.concat(detailsProps.globalConfigMaps || []))(detailsProps.obj)}
        installedCSV={installedCSV(detailsProps.clusterServiceVersions)(detailsProps.obj)}
      />),
      navFactory.editYaml(),
    ]}
    resources={[
      {kind: ConfigMapModel.kind, namespace: olmNamespace, isList: true, prop: 'globalConfigMaps'},
      {kind: ConfigMapModel.kind, namespace: props.namespace, isList: true, prop: 'localConfigMaps'},
      {kind: referenceForModel(ClusterServiceVersionModel), namespace: props.namespace, isList: true, prop: 'clusterServiceVersions'},
    ]}
    menuActions={menuActions} />;
};

export type SubscriptionsPageProps = {
  namespace?: string;
  match?: match<{ns?: string}>;
};

export type SubscriptionsListProps = {
  loaded: boolean;
  loadError?: string;
  data: (SubscriptionKind)[];
};

export type SubscriptionHeaderProps = {

};

export type SubscriptionRowProps = {
  obj: SubscriptionKind;
};

export type SubscriptionUpdatesProps = {
  obj: SubscriptionKind;
  pkg: Package;
  installedCSV?: ClusterServiceVersionKind;
};

export type SubscriptionUpdatesState = {
  waitingForUpdate: boolean;
  channel: string;
  installPlanApproval: InstallPlanApproval;
};

export type SubscriptionDetailsProps = {
  obj: SubscriptionKind;
  pkg: Package;
  installedCSV?: ClusterServiceVersionKind;
};

export type SubscriptionDetailsPageProps = {
  match: match<{ns: string, name: string}>;
  namespace: string;
};

SubscriptionHeader.displayName = 'SubscriptionHeader';
SubscriptionRow.displayName = 'SubscriptionRow';
SubscriptionsList.displayName = 'SubscriptionsList';
SubscriptionsPage.displayName = 'SubscriptionsPage';
SubscriptionDetails.displayName = 'SubscriptionDetails';
SubscriptionDetailsPage.displayName = 'SubscriptionDetailsPage';
