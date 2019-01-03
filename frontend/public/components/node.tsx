import * as _ from 'lodash-es';
import * as React from 'react';
import { isNodeReady, makeNodeSchedulable } from '../module/k8s/node';
import { ResourceEventStream } from './events';
import { ColHead, DetailsPage, List, ListHeader, ListPage, ResourceRow } from './factory';
import { configureUnschedulableModal } from './modals';
import { PodsPage } from './pod';
import { Cog, navFactory, LabelList, ResourceCog, SectionHeading, ResourceLink, Timestamp, units, cloudProviderNames, cloudProviderID, pluralize, containerLinuxUpdateOperator } from './utils';
import { Line, requirePrometheus } from './graphs';
import { NodeModel } from '../models';
import { CamelCaseWrap } from './utils/camel-case-wrap';

const MarkAsUnschedulable = (kind, obj) => ({
  label: '标记为不可调度',
  hidden: _.get(obj, 'spec.unschedulable'),
  callback: () => configureUnschedulableModal({resource: obj}),
});

const MarkAsSchedulable = (kind, obj) => ({
  label: '标记为可调度',
  hidden: !_.get(obj, 'spec.unschedulable', false),
  callback: () => makeNodeSchedulable(obj),
});

const menuActions = [MarkAsSchedulable, MarkAsUnschedulable, Cog.factory.ModifyLabels, Cog.factory.ModifyAnnotations, Cog.factory.Edit];

const NodeCog = ({node}) => <ResourceCog actions={menuActions} kind="Node" resource={node} />;

const NodeIPList = ({ips, expand = false}) => <div>
  {_.sortBy(ips, ['type']).map((ip, i) => <div key={i} className="co-node-ip">
    {(expand || ip.type === 'InternalIP') && <p>
      <span className="co-ip-type">{ip.type.replace(/([a-z])([A-Z])/g, '$1 $2')}: </span>
      <span className="co-ip-addr">{ip.address}</span>
    </p>}
  </div>)}
</div>;

const Header = props => {
  if (!props.data) {
    return null;
  }
  return <ListHeader>
    <ColHead {...props} className="col-xs-4" sortField="metadata.name">节点名称</ColHead>
    <ColHead {...props} className="col-sm-2 col-xs-4" sortFunc="nodeReadiness">状态</ColHead>
    <ColHead {...props} className="col-sm-3 col-xs-4" sortFunc="nodeUpdateStatus">操作系统更新</ColHead>
    <ColHead {...props} className="col-sm-3 hidden-xs" sortField="status.addresses">节点地址</ColHead>
  </ListHeader>;
};

const HeaderSearch = props => <ListHeader>
  <ColHead {...props} className="col-lg-2 col-md-3 col-sm-4 col-xs-5" sortField="metadata.name">节点名称</ColHead>
  <ColHead {...props} className="col-md-2 hidden-sm hidden-xs" sortFunc="nodeReadiness">状态</ColHead>
  <ColHead {...props} className="col-sm-5 col-xs-7" sortField="metadata.labels">节点标签</ColHead>
  <ColHead {...props} className="col-md-2 col-sm-3 hidden-xs" sortField="status.addresses">节点地址</ColHead>
</ListHeader>;

const NodeStatus = ({node}) => isNodeReady(node) ? <span className="node-ready"><i className="fa fa-check"></i> 就绪</span> : <span className="node-not-ready"><i className="fa fa-minus-circle"></i> 未就绪</span>;

const NodeCLUpdateStatus = ({node}) => {
  const updateStatus = containerLinuxUpdateOperator.getUpdateStatus(node);
  const newVersion = containerLinuxUpdateOperator.getNewVersion(node);
  const lastCheckedDate = containerLinuxUpdateOperator.getLastCheckedTime(node);

  return <div>
    {updateStatus ? <span>{updateStatus.className && <span><i className={updateStatus.className}></i>&nbsp;&nbsp;</span>}{updateStatus.text}</span> : null}
    {!_.isEmpty(newVersion) && !containerLinuxUpdateOperator.isSoftwareUpToDate(node) &&
      <div>
        <small className="">Container Linux {containerLinuxUpdateOperator.getVersion(node)} &#10141; {newVersion}</small>
      </div>}
    {lastCheckedDate && containerLinuxUpdateOperator.isSoftwareUpToDate(node) &&
      <div>
        <small className="">Last checked on <div className="co-inline-block">{<Timestamp timestamp={lastCheckedDate} isUnix={true} />}</div></small>
      </div>}
  </div>;
};

const NodeCLStatusRow = ({node}) => {
  const updateStatus = containerLinuxUpdateOperator.getUpdateStatus(node);
  return updateStatus ? <span>{updateStatus.className && <span><i className={updateStatus.className}></i>&nbsp;&nbsp;</span>}{updateStatus.text}</span> : null;
};

const NodeRow = ({obj: node, expand}) => {
  const isOperatorInstalled = containerLinuxUpdateOperator.isOperatorInstalled(node);

  return <ResourceRow obj={node}>
    <div className="col-xs-4 co-resource-link-wrapper">
      <NodeCog node={node} />
      <ResourceLink kind="Node" name={node.metadata.name} title={node.metadata.uid} />
    </div>
    <div className="col-sm-2 col-xs-4"><NodeStatus node={node} /></div>
    <div className="col-sm-3 col-xs-4">
      {isOperatorInstalled ? <NodeCLStatusRow node={node} /> : <span className="text-muted">没有配置</span>}
    </div>
    <div className="col-sm-3 hidden-xs"><NodeIPList ips={node.status.addresses} expand={expand} /></div>
    {expand && <div className="col-xs-12">
      <LabelList kind="Node" labels={node.metadata.labels} />
    </div>}
  </ResourceRow>;
};

const NodeRowSearch = ({obj: node}) => <div className="row co-resource-list__item">
  <div className="col-lg-2 col-md-3 col-sm-4 col-xs-5">
    <NodeCog node={node} />
    <ResourceLink kind="Node" name={node.metadata.name} title={node.metadata.uid} />
  </div>
  <div className="col-md-2 hidden-sm hidden-xs">
    <NodeStatus node={node} />
  </div>
  <div className="col-sm-5 col-xs-7">
    <LabelList kind="Node" labels={node.metadata.labels} expand={false} />
  </div>
  <div className="col-md-2 col-sm-3 hidden-xs">
    <NodeIPList ips={node.status.addresses} />
  </div>
</div>;

// We have different list layouts for the Nodes page list and the Search page list
const NodesList = props => <List {...props} Header={Header} Row={NodeRow} />;
export const NodesListSearch = props => <List {...props} Header={HeaderSearch} Row={NodeRowSearch} kind="node" />;

const dropdownFilters = [{
  type: 'node-status',
  items: {
    all: '状态: 所有',
    ready: '状态: 就绪',
    notReady: '状态: 未就绪',
  },
  title: '就绪状态',
}];
export const NodesPage = props => <ListPage {...props} ListComponent={NodesList} dropdownFilters={dropdownFilters} canExpand={true} />;

const NodeGraphs = requirePrometheus(({node}) => {
  const nodeIp = _.find<{type: string, address: string}>(node.status.addresses, {type: 'InternalIP'});
  const ipQuery = nodeIp && `{instance=~'.*${nodeIp.address}.*'}`;
  const memoryLimit = units.dehumanize(node.status.allocatable.memory, 'binaryBytesWithoutB').value;
  const integerLimit = input => parseInt(input, 10);

  return <React.Fragment>
    <div className="row">
      <div className="col-md-4">
        <Line title="RAM" query={ipQuery && `node_memory_Active${ipQuery}`} units="binaryBytes" limit={memoryLimit} />
      </div>
      <div className="col-md-4">
        <Line title="CPU" query={ipQuery && `instance:node_cpu:rate:sum${ipQuery}`} units="numeric" limit={integerLimit(node.status.allocatable.cpu)} />
      </div>
      <div className="col-md-4">
        <Line title="Number of Pods" query={ipQuery && `kubelet_running_pod_count${ipQuery}`} units="numeric" limit={integerLimit(node.status.allocatable.pods)} />
      </div>
      <div className="col-md-4">
        <Line title="Network In" query={ipQuery && `instance:node_network_receive_bytes:rate:sum${ipQuery}`} units="decimalBytes" />
      </div>
      <div className="col-md-4">
        <Line title="Network Out" query={ipQuery && `instance:node_network_transmit_bytes:rate:sum${ipQuery}`} units="decimalBytes" />
      </div>
      <div className="col-md-4">
        <Line title="Filesystem" query={ipQuery && `instance:node_filesystem_usage:sum${ipQuery}`} units="decimalBytes" />
      </div>
    </div>

    <br />
  </React.Fragment>;
});

const Details = ({obj: node}) => {
  return <React.Fragment>
    <div className="co-m-pane__body">
      <SectionHeading text="节点概述" />
      <NodeGraphs node={node} />
      <div className="row">
        <div className="col-md-6 col-xs-12">
          <dl className="co-m-pane__details">
            <dt>节点名称</dt>
            <dd>{node.metadata.name || '-'}</dd>
            <dt>外部ID</dt>
            <dd>{_.get(node, 'spec.externalID', '-')}</dd>
            <dt>节点地址</dt>
            <dd><NodeIPList ips={_.get(node, 'status.addresses')} expand={true} /></dd>
            <dt>节点标签</dt>
            <dd><LabelList kind="Node" labels={node.metadata.labels} /></dd>
            <dt>注释</dt>
            <dd><a className="co-m-modal-link" onClick={Cog.factory.ModifyAnnotations(NodeModel, node).callback}>{pluralize(_.size(node.metadata.annotations), '注释')}</a></dd>
            <dt>提供者ID</dt>
            <dd>{cloudProviderNames([cloudProviderID(node)])}</dd>
            {_.has(node, 'spec.unschedulable') && <dt>不可调度</dt>}
            {_.has(node, 'spec.unschedulable') && <dd className="text-capitalize">{_.get(node, 'spec.unschedulable', '-').toString()}
            </dd>}
            <dt>创建时间</dt>
            <dd><Timestamp timestamp={node.metadata.creationTimestamp} /></dd>
          </dl>
        </div>
        <div className="col-md-6 col-xs-12">
          <dl className="co-m-pane__details">
            <dt>操作系统</dt>
            <dd className="text-capitalize">{_.get(node, 'status.nodeInfo.operatingSystem', '-')}</dd>
            <dt>架构</dt>
            <dd className="text-uppercase">{_.get(node, 'status.nodeInfo.architecture', '-')}</dd>
            <dt>内核版本</dt>
            <dd>{_.get(node, 'status.nodeInfo.kernelVersion', '-')}</dd>
            <dt>引导ID</dt>
            <dd>{_.get(node, 'status.nodeInfo.bootID', '-')}</dd>
            <dt>容器运行时间</dt>
            <dd>{_.get(node, 'status.nodeInfo.containerRuntimeVersion', '-')}</dd>
            <dt>Kubelet版本</dt>
            <dd>{_.get(node, 'status.nodeInfo.kubeletVersion', '-')}</dd>
            <dt>Kube-Proxy版本</dt>
            <dd>{_.get(node, 'status.nodeInfo.kubeProxyVersion', '-')}</dd>
          </dl>
        </div>
      </div>
    </div>

    { containerLinuxUpdateOperator.isOperatorInstalled(node) && <div className="co-m-pane__body">
      <SectionHeading text="容器Linux" />
      <div className="row">
        <div className="col-md-6 col-xs-12">
          <dl className="co-m-pane__details">
            <dt>当前版本</dt>
            <dd>{containerLinuxUpdateOperator.getVersion(node)}</dd>
            <dt>通道</dt>
            <dd className="text-capitalize">{containerLinuxUpdateOperator.getChannel(node)}</dd>
          </dl>
        </div>
        <div className="col-md-6 col-xs-12">
          <dl className="co-m-pane__details">
            <dt>更新状态</dt>
            <dd><NodeCLUpdateStatus node={node} /></dd>
          </dl>
        </div>
      </div>
    </div> }

    <div className="co-m-pane__body">
      <SectionHeading text="节点条件" />
      <div className="co-table-container">
        <table className="table">
          <thead>
            <tr>
              <th>类别</th>
              <th>状态</th>
              <th>原因</th>
              <th>更新</th>
              <th>变化</th>
            </tr>
          </thead>
          <tbody>
            {_.map(node.status.conditions, (c, i) => <tr key={i}>
              <td><CamelCaseWrap value={c.type} /></td>
              <td>{c.status || '-'}</td>
              <td><CamelCaseWrap value={c.reason} /></td>
              <td><Timestamp timestamp={c.lastHeartbeatTime} /></td>
              <td><Timestamp timestamp={c.lastTransitionTime} /></td>
            </tr>)}
          </tbody>
        </table>
      </div>
    </div>

    <div className="co-m-pane__body">
      <SectionHeading text="镜像" />
      <div className="co-table-container">
        <table className="table">
          <thead>
            <tr>
              <th>名称</th>
              <th>大小</th>
            </tr>
          </thead>
          <tbody>
            {_.map(node.status.images, (image, i) => <tr key={i}>
              <td>{image.names.find(name => !name.includes('@')) || image.names[0]}</td>
              <td>{units.humanize(image.sizeBytes, 'decimalBytes', true).string || '-'}</td>
            </tr>)}
          </tbody>
        </table>
      </div>
    </div>
  </React.Fragment>;
};

const {details, editYaml, events, pods} = navFactory;

const pages = [
  details(Details),
  editYaml(),
  pods(({obj}) => <PodsPage showTitle={false} fieldSelector={`spec.nodeName=${obj.metadata.name}`} />),
  events(ResourceEventStream),
];
export const NodesDetailsPage = props => <DetailsPage
  {...props}
  menuActions={menuActions}
  pages={pages}
/>;
