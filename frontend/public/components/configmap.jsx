import * as _ from 'lodash-es';
import * as React from 'react';

import { ColHead, DetailsPage, List, ListHeader, ListPage, ResourceRow } from './factory';
import { ConfigMapData } from './configmap-and-secret-data';
import { Cog, SectionHeading, navFactory, ResourceCog, ResourceLink, ResourceSummary } from './utils';
import { fromNow } from './utils/datetime';

const menuActions = Cog.factory.common;

const ConfigMapHeader = props => <ListHeader>
  <ColHead {...props} className="col-sm-4 col-xs-6" sortField="metadata.name">名称</ColHead>
  <ColHead {...props} className="col-sm-4 col-xs-6" sortField="metadata.namespace">命名空间</ColHead>
  <ColHead {...props} className="col-sm-2 hidden-xs" sortFunc="dataSize">大小</ColHead>
  <ColHead {...props} className="col-sm-2 hidden-xs" sortField="metadata.creationTimestamp">创建时间</ColHead>
</ListHeader>;

const ConfigMapRow = ({obj: configMap}) => <ResourceRow obj={configMap}>
  <div className="col-sm-4 col-xs-6 co-resource-link-wrapper">
    <ResourceCog actions={menuActions} kind="ConfigMap" resource={configMap} />
    <ResourceLink kind="ConfigMap" name={configMap.metadata.name} namespace={configMap.metadata.namespace} title={configMap.metadata.uid} />
  </div>
  <div className="col-sm-4 col-xs-6 co-break-word">
    <ResourceLink kind="Namespace" name={configMap.metadata.namespace} title={configMap.metadata.namespace} />
  </div>
  <div className="col-sm-2 hidden-xs">{_.size(configMap.data)}</div>
  <div className="col-sm-2 hidden-xs">{fromNow(configMap.metadata.creationTimestamp)}</div>
</ResourceRow>;

const ConfigMapDetails = ({obj: configMap}) => {
  return <React.Fragment>
    <div className="co-m-pane__body">
      <SectionHeading text="配置映射概述" />
      <ResourceSummary resource={configMap} showPodSelector={false} showNodeSelector={false} />
    </div>
    <div className="co-m-pane__body">
      <SectionHeading text="数据" />
      <ConfigMapData data={configMap.data} />
    </div>
  </React.Fragment>;
};

const ConfigMaps = props => <List {...props} Header={ConfigMapHeader} Row={ConfigMapRow} />;
const ConfigMapsPage = props => <ListPage ListComponent={ConfigMaps} canCreate={true} {...props} />;
const ConfigMapsDetailsPage = props => <DetailsPage
  {...props}
  menuActions={menuActions}
  pages={[navFactory.details(ConfigMapDetails), navFactory.editYaml()]}
/>;

export {ConfigMaps, ConfigMapsPage, ConfigMapsDetailsPage};
