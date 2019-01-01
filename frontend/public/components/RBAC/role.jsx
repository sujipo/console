import * as _ from 'lodash-es';
import * as React from 'react';
import * as fuzzy from 'fuzzysearch';
// import { Link } from 'react-router-dom';

import { ColHead, DetailsPage, List, ListHeader, MultiListPage, ResourceRow, TextFilter } from '../factory';
import { Cog, SectionHeading, MsgBox, navFactory, ResourceCog, ResourceLink, Timestamp } from '../utils';
import { BindingName, BindingsList, RulesList } from './index';
import { flatten as bindingsFlatten } from './bindings';
import { flagPending, connectToFlags, FLAGS } from '../../features';

export const isSystemRole = role => _.startsWith(role.metadata.name, 'system:');

// const addHref = (name, ns) => ns ? `/k8s/ns/${ns}/roles/${name}/add-rule` : `/k8s/cluster/clusterroles/${name}/add-rule`;

export const roleKind = role => role.metadata.namespace ? 'Role' : 'ClusterRole';

const menuActions = [
  // This page is temporarily disabled until we update the safe resources list.
  // (kind, role) => ({
  //   label: 'Add Rule...',
  //   href: addHref(role.metadata.name, role.metadata.namespace),
  // }),
  (kind, role) => ({
    label: 'Add Role Binding...',
    href: `/k8s/cluster/rolebindings/new?rolekind=${roleKind(role)}&rolename=${role.metadata.name}`,
  }),
  Cog.factory.Edit,
  Cog.factory.Delete,
];

const Header = props => <ListHeader>
  <ColHead {...props} className="col-xs-6" sortField="metadata.name">名称</ColHead>
  <ColHead {...props} className="col-xs-6" sortField="metadata.namespace">命名空间</ColHead>
</ListHeader>;

const Row = ({obj: role}) => <div className="row co-resource-list__item">
  <div className="col-xs-6 co-resource-link-wrapper">
    <ResourceCog actions={menuActions} kind={roleKind(role)} resource={role} />
    <ResourceLink kind={roleKind(role)} name={role.metadata.name} namespace={role.metadata.namespace} />
  </div>
  <div className="col-xs-6 co-break-word">
    {role.metadata.namespace ? <ResourceLink kind="Namespace" name={role.metadata.namespace} /> : 'all'}
  </div>
</div>;

class Details extends React.Component {
  constructor (props) {
    super(props);
    this.state = {};
    this.changeFilter = e => this.setState({ruleFilter: e.target.value});
  }

  render () {
    const ruleObj = this.props.obj;
    const {creationTimestamp, name, namespace} = ruleObj.metadata;
    const {ruleFilter} = this.state;

    let rules = ruleObj.rules;
    if (ruleFilter) {
      const fuzzyCaseInsensitive = (a, b) => fuzzy(_.toLower(a), _.toLower(b));
      const searchKeys = ['nonResourceURLs', 'resources', 'verbs'];
      rules = rules.filter(rule => searchKeys.some(k => _.some(rule[k], v => fuzzyCaseInsensitive(ruleFilter, v))));
    }

    return <div>
      <div className="co-m-pane__body">
        <SectionHeading text="角色概览" />
        <div className="row">
          <div className="col-xs-6">
            <dl className="co-m-pane__details">
              <dt>角色名称</dt>
              <dd>{name}</dd>
              {namespace && <div>
                <dt>命名空间</dt>
                <dd><ResourceLink kind="Namespace" name={namespace} /></dd>
              </div>}
            </dl>
          </div>
          <div className="col-xs-6">
            <dl className="co-m-pane__details">
              <dt>创建时间</dt>
              <dd><Timestamp timestamp={creationTimestamp} /></dd>
            </dl>
          </div>
        </div>
      </div>
      <div className="co-m-pane__body">
        <SectionHeading text="规则" />
        <div className="co-m-pane__filter-bar co-m-pane__filter-bar--alt">
          {/* This page is temporarily disabled until we update the safe resources list.
          <div className="co-m-pane__filter-bar-group">
            <Link to={addHref(name, namespace)} className="co-m-primary-action">
              <button className="btn btn-primary">Add Rule</button>
            </Link>
          </div>
          */}
          <div className="co-m-pane__filter-bar-group co-m-pane__filter-bar-group--filter">
            <TextFilter label="规则通过行动或资源" onChange={this.changeFilter} />
          </div>
        </div>
        <RulesList rules={rules} name={name} namespace={namespace} />
      </div>
    </div>;
  }
}

const BindingHeader = props => <ListHeader>
  <ColHead {...props} className="col-xs-4" sortField="metadata.name">名称</ColHead>
  <ColHead {...props} className="col-xs-2" sortField="subject.kind">主题分类</ColHead>
  <ColHead {...props} className="col-xs-4" sortField="subject.name">主题名称</ColHead>
  <ColHead {...props} className="col-xs-2" sortField="metadata.namespace">命名空间</ColHead>
</ListHeader>;

const BindingRow = ({obj: binding}) => <ResourceRow obj={binding}>
  <div className="col-xs-4">
    <BindingName binding={binding} />
  </div>
  <div className="col-xs-2">
    {binding.subject.kind}
  </div>
  <div className="col-xs-4">
    {binding.subject.name}
  </div>
  <div className="col-xs-2">
    {binding.namespace || 'all'}
  </div>
</ResourceRow>;

const BindingsListComponent = props => <BindingsList {...props} Header={BindingHeader} Row={BindingRow} />;

export const BindingsForRolePage = (props) => {
  const {match: {params: {name, ns}}, obj:{kind}} = props;
  let resources = [{kind: 'RoleBinding', namespaced: true}];
  if (!ns) {
    resources.push({kind: 'ClusterRoleBinding', namespaced: false, optional: true});
  }
  return <MultiListPage
    canCreate={true}
    createButtonText="Create Binding"
    createProps={{to: `/k8s/${ns ? `ns/${ns}` : 'cluster'}/rolebindings/new?rolekind=${kind}&rolename=${name}`}}
    ListComponent={BindingsListComponent}
    staticFilters={[{'role-binding-roleRef': name}]}
    resources={resources}
    textFilter="role-binding"
    filterLabel="按角色或主题进行角色绑定"
    namespace={ns}
    flatten={bindingsFlatten} />;
};

export const RolesDetailsPage = props => <DetailsPage
  {...props}
  pages={[navFactory.details(Details), navFactory.editYaml(), {href: 'bindings', name: '角色绑定', component: BindingsForRolePage}]}
  menuActions={menuActions} />;

export const ClusterRolesDetailsPage = RolesDetailsPage;

const EmptyMsg = () => <MsgBox title="没有发现角色" detail="角色授予对集群中对象类型的访问权。角色通过角色绑定应用于团队或用户。" />;

const RolesList = props => <List {...props} EmptyMsg={EmptyMsg} Header={Header} Row={Row} />;

export const roleType = role => {
  if (!role) {
    return undefined;
  }
  if (isSystemRole(role)) {
    return 'system';
  }
  return role.metadata.namespace ? 'namespace' : 'cluster';
};

export const RolesPage = connectToFlags(FLAGS.PROJECTS_AVAILBLE, FLAGS.PROJECTS_AVAILBLE)(({namespace, showTitle, flags}) => {
  const projectsAvailable = !flagPending(flags.PROJECTS_AVAILBLE) && flags.PROJECTS_AVAILBLE;
  return <MultiListPage
    ListComponent={RolesList}
    canCreate={true}
    showTitle={showTitle}
    namespace={namespace}
    createButtonText="创建角色"
    createProps={{to: `/k8s/ns/${namespace || 'default'}/roles/new`}}
    filterLabel="规则通过名称"
    flatten={resources => _.flatMap(resources, 'data').filter(r => !!r)}
    resources={[
      {kind: 'Role', namespaced: true, optional: !projectsAvailable},
      {kind: 'ClusterRole', namespaced: false, optional: true},
    ]}
    rowFilters={[{
      type: 'role-kind',
      selected: ['cluster', 'namespace'],
      reducer: roleType,
      items: [
        {id: 'cluster', title: 'Cluster-wide Roles'},
        {id: 'namespace', title: 'Namespace Roles'},
        {id: 'system', title: 'System Roles'},
      ],
    }]}
    title="角色"
  />;
});
