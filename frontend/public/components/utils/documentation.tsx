import * as React from 'react';
import * as _ from 'lodash-es';

import { productName } from '../../branding';

// Prefer the documentation base URL passed as a flag, but fall back to the latest docs if none was specified.
export const openshiftHelpBase = (window as any).SERVER_FLAGS.documentationBaseURL || 'https://docs.okd.io/latest/';

/* global
  HELP_TOPICS: false,
  GET_STARTED_CLI: false,
  NETWORK_POLICY_GUIDE: false,
 */
export enum HELP_TOPICS {
  GET_STARTED_CLI = 'cli_reference/get_started_cli.html',
  NETWORK_POLICY_GUIDE = 'admin_guide/managing_networking.html#admin-guide-networking-networkpolicy',
}

export const helpLink = (topic: HELP_TOPICS) => `${openshiftHelpBase}${topic}`;

/* eslint-disable react/jsx-no-target-blank */
export const DocumentationLinks = () => <dl className="co-documentation-links">
  <dt className="co-documentation-links__title"><a href={openshiftHelpBase} target="_blank" rel="noopener">Full Documentation</a></dt>
  <dd className="co-documentation-links__description">
    从创建第一个应用程序开始，到尝试更高级的构建和部署技术，这些资源提供了作为集群管理员或应用程序开发人员设置和管理环境所需的内容。
  </dd>
  <dt className="co-documentation-links__title"><a href={helpLink(HELP_TOPICS.GET_STARTED_CLI)} target="_blank" rel="noopener">开始使用CLI</a></dt>
  <dd className="co-documentation-links__description">
    通过{productName}的命令行接口 (CLI), 您可以从终端创建应用程序并管理项目。学习如何安装和使用oc客户端工具。
  </dd>
</dl>;

const supportLinks = [{
  title: 'Interactive Learning Portal',
  href: 'https://learn.openshift.com',
}, {
  title: 'Local Development',
  href: 'https://www.openshift.org/minishift',
}, {
  title: 'YouTube',
  href: 'https://www.youtube.com/user/rhopenshift',
}, {
  title: 'Blog',
  href: 'https://blog.openshift.com',
}];

export const AdditionalSupportLinks = () => <ul className="co-additional-support-links">
  {_.map(supportLinks, (link, i) => <li key={i}>
    <a href={link.href} target="_blank" rel="noopener" className="co-additional-support-links__link">{link.title}</a>
  </li>)}
</ul>;
/* eslint-enable react/jsx-no-target-blank */

export const DocumentationSidebar = props => <div className="co-p-has-sidebar__sidebar co-p-has-sidebar__sidebar--bordered">
  <div className="co-m-pane__body">
    <h1 className="co-p-has-sidebar__sidebar-heading co-p-has-sidebar__sidebar-heading--first">文档</h1>
    <DocumentationLinks />
    <h1 className="co-p-has-sidebar__sidebar-heading">更多支持</h1>
    <AdditionalSupportLinks />
  </div>
  {props.children}
</div>;
