import * as React from 'react';
import * as _ from 'lodash-es';

import { DeploymentModel } from '../models';
import { configureUpdateStrategyModal } from './modals';
import { DetailsPage, List, ListPage, WorkloadListHeader, WorkloadListRow } from './factory';
import { Cog, DeploymentPodCounts, SectionHeading, LoadingInline, navFactory, Overflow, pluralize, ResourceSummary } from './utils';
import { Conditions } from './conditions';
import { EnvironmentPage } from './environment';
import { ResourceEventStream } from './events';
import { formatDuration } from './utils/datetime';

const {ModifyCount, EditEnvironment, common} = Cog.factory;

const UpdateStrategy = (kind, deployment) => ({
  label: '编辑更新策略',
  callback: () => configureUpdateStrategyModal({deployment}),
});

const menuActions = [
  ModifyCount,
  UpdateStrategy,
  EditEnvironment,
  ...common,
];

const ContainerRow = ({container}) => {
  const resourceLimits = _.get(container, 'resources.limits');
  const ports = _.get(container, 'ports');
  return <div className="row">
    <div className="col-xs-6 col-sm-4 col-md-3">
      {container.name}
    </div>
    <Overflow className="col-xs-6 col-sm-4 col-md-3" value={container.image} />
    <div className="col-sm-4 col-md-3 hidden-xs">{_.map(resourceLimits, (v, k) => `${k}: ${v}`).join(', ') || '-'}</div>
    <Overflow className="col-md-3 hidden-xs hidden-sm" value={_.map(ports, port => `${port.containerPort}/${port.protocol}`).join(', ')} />
  </div>;
};

export const ContainerTable = ({containers}) => <div className="co-m-table-grid co-m-table-grid--bordered">
  <div className="row co-m-table-grid__head">
    <div className="col-xs-6 col-sm-4 col-md-3">名称</div>
    <div className="col-xs-6 col-sm-4 col-md-3">镜像</div>
    <div className="col-sm-4 col-md-3 hidden-xs">资源限制</div>
    <div className="col-md-3 hidden-xs hidden-sm">端口</div>
  </div>
  <div className="co-m-table-grid__body">
    {_.map(containers, (c, i) => <ContainerRow key={i} container={c} />)}
  </div>
</div>;

const DeploymentDetails = ({obj: deployment}) => {
  const isRecreate = (deployment.spec.strategy.type === 'Recreate');
  const progressDeadlineSeconds = _.get(deployment, 'spec.progressDeadlineSeconds');

  return <React.Fragment>
    <div className="co-m-pane__body">
      <SectionHeading text="部署概述" />
      <DeploymentPodCounts resource={deployment} resourceKind={DeploymentModel} />
      <div className="co-m-pane__body-group">
        <div className="row">
          <div className="col-sm-6">
            <ResourceSummary resource={deployment}>
              <dt>状态</dt>
              <dd>{deployment.status.availableReplicas === deployment.status.updatedReplicas ? <span>活跃</span> : <div><span className="co-icon-space-r"><LoadingInline /></span> 更新</div>}</dd>
            </ResourceSummary>
          </div>
          <div className="col-sm-6">
            <dl className="co-m-pane__details">
              <dt>更新策略</dt>
              <dd>{deployment.spec.strategy.type || 'RollingUpdate'}</dd>
              {isRecreate || <dt>最大不可用</dt>}
              {isRecreate || <dd>{deployment.spec.strategy.rollingUpdate.maxUnavailable || 1} of {pluralize(deployment.spec.replicas, 'pod')}</dd>}
              {isRecreate || <dt>最大激增</dt>}
              {isRecreate || <dd>{deployment.spec.strategy.rollingUpdate.maxSurge || 1} 大于 {pluralize(deployment.spec.replicas, 'pod')}</dd>}
              {progressDeadlineSeconds && <dt>处理截止期限</dt>}
              {progressDeadlineSeconds && <dd>{/* Convert to ms for formatDuration */ formatDuration(progressDeadlineSeconds * 1000)}</dd>}
              <dt>最小就绪秒数</dt>
              <dd>{deployment.spec.minReadySeconds ? pluralize(deployment.spec.minReadySeconds, 'second') : 'Not Configured'}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
    <div className="co-m-pane__body">
      <SectionHeading text="容器" />
      <ContainerTable containers={deployment.spec.template.spec.containers} />
    </div>
    <div className="co-m-pane__body">
      <SectionHeading text="条件" />
      <Conditions conditions={deployment.status.conditions} />
    </div>
  </React.Fragment>;
};

const envPath = ['spec','template','spec','containers'];
const environmentComponent = (props) => <EnvironmentPage
  obj={props.obj}
  rawEnvData={props.obj.spec.template.spec.containers}
  envPath={envPath}
  readOnly={false}
/>;

const {details, editYaml, pods, envEditor, events} = navFactory;
const DeploymentsDetailsPage = props => <DetailsPage
  {...props}
  menuActions={menuActions}
  pages={[details(DeploymentDetails), editYaml(), pods(), envEditor(environmentComponent), events(ResourceEventStream)]}
/>;

const Row = props => <WorkloadListRow {...props} kind="Deployment" actions={menuActions} />;
const DeploymentsList = props => <List {...props} Header={WorkloadListHeader} Row={Row} />;
const DeploymentsPage = props => <ListPage canCreate={true} ListComponent={DeploymentsList} {...props} />;

export {DeploymentsList, DeploymentsPage, DeploymentsDetailsPage};
