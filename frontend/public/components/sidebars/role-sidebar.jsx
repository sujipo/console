import * as _ from 'lodash-es';
import * as React from 'react';

import { RoleModel, ClusterRoleModel } from '../../models';
import { referenceForModel } from '../../module/k8s';
import { SampleYaml } from './resource-sidebar';

const samples = [
  {
    header: '允许在API组中读取资源',
    details: '允许此“角色”读取核心API组中的资源“Pods”。',
    templateName: 'read-pods-within-ns',
    kind: referenceForModel(RoleModel),
  },
  {
    header: '允许在API组中读写资源',
    details: '这个“角色”可以读写“扩展”和“应用”API组中的“部署”。',
    templateName: 'read-write-deployment-in-ext-and-apps-apis',
    kind: referenceForModel(RoleModel),
  },
  {
    header: '允许对不同类型的资源和API组具有不同的访问权限',
    details: '这个“角色”可以读取API组中的“pod”和“Jobs”资源。',
    templateName: 'read-pods-and-read-write-jobs',
    kind: referenceForModel(RoleModel),
  },
  {
    header: '允许在特定名称空间中读取配置映射',
    subheader: '(针对角色绑定)',
    details: '这个“角色”被允许读取一个名为“my-config”的“配置映射”(必须与“角色绑定”绑定，以限制在一个名称空间中只有一个“配置映射”)。',
    templateName: 'read-configmap-within-ns',
    kind: referenceForModel(RoleModel),
  },
  {
    header: '允许读取核心API组中的节点',
    subheader: '(针对集群角色绑定)',
    details: '允许这个“集群角色”读取核心组中的资源“节点”(因为节点的作用域是集群的，所以必须使用“集群角色绑定”绑定才能有效)。',
    templateName: 'read-nodes',
    kind: referenceForModel(ClusterRoleModel),
  },
  {
    header: '“GET/POST”请求非资源端点和所有子路径',
    subheader: '(针对集群角色绑定)',
    details: '这个“集群角色”允许“获取”和“POST”请求到非资源端点“/healthz”和所有子路径(必须在“集群角色”中绑定一个“集群角色绑定”才能有效)。',
    templateName: 'get-and-post-to-non-resource-endpoints',
    kind: referenceForModel(ClusterRoleModel),
  },
];

export const RoleSidebar = ({kindObj, loadSampleYaml, downloadSampleYaml, isCreateMode}) => {
  const filteredSamples = isCreateMode ? samples : _.filter(samples, {'kind' : referenceForModel(kindObj)});
  return <ol className="co-resource-sidebar-list">
    {_.map(filteredSamples, (sample) => <SampleYaml
      key={sample.templateName}
      sample={sample}
      loadSampleYaml={loadSampleYaml}
      downloadSampleYaml={downloadSampleYaml} />)}
  </ol>;
};
