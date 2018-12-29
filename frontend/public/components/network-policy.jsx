import * as _ from 'lodash-es';
import * as React from 'react';
import { Link } from 'react-router-dom';

import { FLAGS, connectToFlags } from '../features';
import { ColHead, DetailsPage, List, ListHeader, ListPage } from './factory';
import { Cog, navFactory, ResourceCog, SectionHeading, ResourceLink, ResourceSummary, Selector, helpLink, HELP_TOPICS } from './utils';

const menuActions = [Cog.factory.ModifyLabels, Cog.factory.ModifyAnnotations, Cog.factory.Edit, Cog.factory.Delete];

const Header = props => <ListHeader>
  <ColHead {...props} className="col-xs-4" sortField="metadata.name">名称</ColHead>
  <ColHead {...props} className="col-xs-3" sortField="metadata.namespace">命名空间</ColHead>
  <ColHead {...props} className="col-xs-5" sortField="spec.podSelector">Pod选择器</ColHead>
</ListHeader>;

const kind = 'NetworkPolicy';
const Row = ({obj: np}) => <div className="row co-resource-list__item">
  <div className="col-xs-4 co-resource-link-wrapper">
    <ResourceCog actions={menuActions} kind={kind} resource={np} />
    <ResourceLink kind={kind} name={np.metadata.name} namespace={np.metadata.namespace} title={np.metadata.name} />
  </div>
  <div className="col-xs-3 co-break-word">
    <ResourceLink kind={'Namespace'} name={np.metadata.namespace} title={np.metadata.namespace} />
  </div>

  <div className="col-xs-5 co-break-word">
    {
      _.isEmpty(np.spec.podSelector) ?
        <Link to={`/search/ns/${np.metadata.namespace}?kind=Pod`}>{`All pods within ${np.metadata.namespace}`}</Link> :
        <Selector selector={np.spec.podSelector} namespace={np.metadata.namespace} />
    }
  </div>
</div>;

const NetworkPoliciesList = props => <List {...props} Header={Header} Row={Row} />;
export const NetworkPoliciesPage = props => <ListPage {...props} ListComponent={NetworkPoliciesList} kind={kind} canCreate={true} />;


const IngressHeader = () => <div className="row co-m-table-grid__head">
  <div className="col-xs-4">target pods</div>
  <div className="col-xs-5">from</div>
  <div className="col-xs-3">to ports</div>
</div>;

const IngressRow = ({ingress, namespace, podSelector}) => {
  const podSelectors = [];
  const nsSelectors = [];
  let i = 0;

  const style = {margin: '5px 0'};
  _.each(ingress.from, ({namespaceSelector, podSelector: ps}) => {
    if (namespaceSelector) {
      nsSelectors.push(<div key={i++} style={style}><Selector selector={namespaceSelector} kind="Namespace" /></div>);
    } else {
      podSelectors.push(<div key={i++} style={style}><Selector selector={ps} namespace={namespace} /></div>);
    }
  });
  return <div className="row co-resource-list__item">
    <div className="col-xs-4">
      <div>
        <span className="text-muted">Pod选择器:</span>
      </div>
      <div style={style}>
        <Selector selector={podSelector} namespace={namespace} />
      </div>
    </div>
    <div className="col-xs-5">
      <div>
        { !podSelectors.length ? null :
          <div>
            <span className="text-muted">Pod选择器:</span>
            {podSelectors}
          </div>
        }
        { !nsSelectors.length ? null :
          <div style={{paddingTop: podSelectors.length ? 10 : 0}}>
            <span className="text-muted">NS选择器:</span>
            {nsSelectors}
          </div>
        }
      </div>
    </div>
    <div className="col-xs-3">
      {
        _.map(ingress.ports, (port, k) => <p key={k}>{port.protocol}/{port.port}</p>)
      }
    </div>
  </div>;
};

const Details_ = ({flags, obj: np}) => {
  const networkPolicyDocs = flags[FLAGS.OPENSHIFT]
    ? helpLink(HELP_TOPICS.NETWORK_POLICY_GUIDE)
    : 'https://kubernetes.io/docs/concepts/services-networking/network-policies/';
  return <React.Fragment>
    <div className="co-m-pane__body">
      <SectionHeading text="Namespace Overview" />
      <ResourceSummary resource={np} podSelector={'spec.podSelector'} showNodeSelector={false} />
    </div>
    <div className="co-m-pane__body">
      <SectionHeading text="Ingress Rules" />
      <p className="co-m-pane__explanation">
        Pod默认接受所有流量。
        它们可以通过网络策略进行隔离，这些策略指定了白名单的入口规则。
        当Pod由网络策略选择时，它将拒绝通过网络策略显式不允许的所有流量。
        更多细节请参阅<a target="_blank" rel="noopener noreferrer" href={networkPolicyDocs}>网络政策文档</a>。
      </p>
      {
        _.isEmpty(_.get(np, 'spec.ingress[0]', [])) ?
          `All traffic is allowed to Pods in ${np.metadata.namespace}.` :
          <div className="co-m-table-grid co-m-table-grid--bordered">
            <IngressHeader />
            <div className="co-m-table-grid__body">
              { _.map(np.spec.ingress, (ingress, i) => <IngressRow key={i} ingress={ingress} podSelector={np.spec.podSelector} namespace={np.metadata.namespace} />) }
            </div>
          </div>
      }
    </div>
  </React.Fragment>;
};

const Details = connectToFlags(FLAGS.OPENSHIFT)(Details_);

export const NetworkPoliciesDetailsPage = props => <DetailsPage
  {...props}
  menuActions={menuActions}
  pages={[navFactory.details(Details), navFactory.editYaml()]}
/>;
