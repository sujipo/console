import * as _ from 'lodash-es';
import * as React from 'react';

import * as denyOtherNamespacesImg from '../../imgs/network-policy-samples/1-deny-other-namespaces.svg';
import * as limitCertainAppImg from '../../imgs/network-policy-samples/2-limit-certain-apps.svg';
import * as allowIngressImg from '../../imgs/network-policy-samples/3-allow-ingress.svg';
import * as defaultDenyAllImg from '../../imgs/network-policy-samples/4-default-deny-all.svg';
import * as webAllowExternalImg from '../../imgs/network-policy-samples/5-web-allow-external.svg';
import * as webDbAllowAllNsImg from '../../imgs/network-policy-samples/6-web-db-allow-all-ns.svg';
import * as webAllowProductionImg from '../../imgs/network-policy-samples/7-web-allow-production.svg';
import { NetworkPolicyModel } from '../../models';
import { referenceForModel } from '../../module/k8s';
import { SampleYaml } from './resource-sidebar';

const samples = [
  {
    highlightText: 'Limit',
    header: '访问当前名称空间',
    img: denyOtherNamespacesImg,
    details: '拒绝来自其他名称空间的流量，同时允许来自Pod所在名称空间的所有流量。',
    templateName: 'deny-other-namespaces',
    kind: referenceForModel(NetworkPolicyModel),
  },
  {
    highlightText: 'Limit',
    header: '传输到同一名称空间中的应用程序',
    img: limitCertainAppImg,
    details: '只允许来自特定Pod的入站流量。一个典型的用例是将数据库的连接限制在特定的应用程序上。',
    templateName: 'db-or-api-allow-app',
    kind: referenceForModel(NetworkPolicyModel),
  },
  {
    highlightText: 'Allow',
    header: '同一命名空间内的http和https入口',
    img: allowIngressImg,
    details: '为应用程序的特定端口号定义输入规则。如果没有指定，则该规则适用于所有端口号。',
    templateName: 'api-allow-http-and-https',
    kind: referenceForModel(NetworkPolicyModel),
  },
  {
    highlightText: 'Deny',
    header: '当前命名空间中的所有非白名单流量',
    img: defaultDenyAllImg,
    details: '一个基本策略，通过阻止所有Pod业务预期白名单通过其他网络策略部署。',
    templateName: 'default-deny-all',
    kind: referenceForModel(NetworkPolicyModel),
  },
  {
    highlightText: 'Allow',
    header: '外部客户端流量',
    img: webAllowExternalImg,
    details: '允许来自公共Internet的外部服务直接或通过负载均衡器访问pod。',
    templateName: 'web-allow-external',
    kind: referenceForModel(NetworkPolicyModel),
  },
  {
    highlightText: 'Allow',
    header: '从所有名称空间到应用程序的通信',
    img: webDbAllowAllNsImg,
    details: '一个典型的用例是用于不同名称空间中的部署所使用的公共数据库。',
    templateName: 'web-db-allow-all-ns',
    kind: referenceForModel(NetworkPolicyModel),
  },
  {
    highlightText: 'Allow',
    header: '来自特定名称空间中的所有pod的流量',
    img: webAllowProductionImg,
    details: '典型的用例应该是“仅允许生产名称空间中的部署访问数据库”或“允许监视工具(在另一个名称空间中)从当前名称空间中提取指标”。"',
    templateName: 'web-allow-production',
    kind: referenceForModel(NetworkPolicyModel),
  },
];

export const NetworkPolicySidebar = ({loadSampleYaml, downloadSampleYaml}) => <ol className="co-resource-sidebar-list">
  {_.map(samples, (sample) => <SampleYaml
    key={sample.templateName}
    sample={sample}
    loadSampleYaml={loadSampleYaml}
    downloadSampleYaml={downloadSampleYaml} />)}
</ol>;
