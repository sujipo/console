import * as React from 'react';
import * as _ from 'lodash-es';

// eslint-disable-next-line no-unused-vars
import { K8sResourceKind, K8sResourceKindReference } from '../module/k8s';
import { DetailsPage } from './factory';
import { Cog, SectionHeading, navFactory, Overflow, ResourceSummary } from './utils';
import { humanizeMem } from './utils/units';

const ImageStreamTagsReference: K8sResourceKindReference = 'ImageStreamTag';

const { common } = Cog.factory;

const menuActions = [
  ...common,
];

// Splits a name/value pair separated by an `=`
const splitEnv = (nameValue: string) => {
  // Use this method instead of `String.split()` so we only split on the first `=`.
  const i = nameValue.indexOf('=');
  if (i === -1) {
    return {
      name: nameValue,
      value: '',
    };
  }

  return {
    name: nameValue.substring(0, i),
    value: nameValue.substring(i + 1),
  };
};

export const ImageStreamTagsDetails: React.SFC<ImageStreamTagsDetailsProps> = ({obj: imageStreamTag}) => {
  const config = _.get(imageStreamTag, 'image.dockerImageMetadata.Config', {});
  const labels = config.Labels || {};
  // Convert to an array of objects with name and value properties, then sort the array for display.
  const labelsArray = _.map(labels, (value, name) => ({ name, value }));
  const sortedLabels = _.sortBy(labelsArray, 'name');
  const entrypoint = (config.Entrypoint || []).join(' ');
  const cmd = (config.Cmd || []).join(' ');
  const exposedPorts = _.keys(config.ExposedPorts).join(', ');
  const size = _.get(imageStreamTag, 'image.dockerImageMetadata.Size');
  const humanizedSize = _.isFinite(size) && humanizeMem(size);
  const architecture = _.get(imageStreamTag, 'image.dockerImageMetadata.Architecture');

  return <div className="co-m-pane__body">
    <div className="co-m-pane__body-group">
      <div className="row">
        <div className="col-md-6 col-sm-12">
          <SectionHeading text="镜像概述" />
          <ResourceSummary resource={imageStreamTag} showPodSelector={false} showNodeSelector={false}>
            {labels.name && <dt>镜像名称</dt>}
            {labels.name && <dd>{labels.name}</dd>}
            {labels.summary && <dt>摘要</dt>}
            {labels.summary && <dd>{labels.summary}</dd>}
            {humanizedSize && <dt>大小</dt>}
            {humanizedSize && <dd>{humanizedSize}</dd>}
          </ResourceSummary>
        </div>
        <div className="col-md-6 col-sm-12">
          <SectionHeading text="配置" />
          <dl className="co-m-pane__details">
            {entrypoint && <dt>入口</dt>}
            {entrypoint && <dd><Overflow value={entrypoint} /></dd>}
            {cmd && <dt>命令</dt>}
            {cmd && <dd><Overflow value={cmd} /></dd>}
            {config.WorkingDir && <dt>工作目录</dt>}
            {config.WorkingDir && <dd><Overflow value={config.WorkingDir} /></dd>}
            {exposedPorts && <dt>外露接口</dt>}
            {exposedPorts && <dd><Overflow value={exposedPorts} /></dd>}
            {config.User && <dt>用户</dt>}
            {config.User && <dd>{config.User}</dd>}
            {architecture && <dt>架构</dt>}
            {architecture && <dd>{architecture}</dd>}
          </dl>
        </div>
      </div>
    </div>
    <div className="co-m-pane__body-group">
      <SectionHeading text="镜像标签" />
      {_.isEmpty(sortedLabels)
        ? <span className="text-muted">没有标签</span>
        : <div className="co-table-container">
          <table className="table">
            <thead>
              <tr>
                <th>名称</th>
                <th>值</th>
              </tr>
            </thead>
            <tbody>
              {_.map(sortedLabels, ({name, value}) => <tr key={name}>
                <td>{name}</td>
                <td>{value}</td>
              </tr>)}
            </tbody>
          </table>
        </div>}
    </div>
    <div className="co-m-pane__body-group">
      <SectionHeading text="环境变量" />
      {_.isEmpty(config.Env)
        ? <span className="text-muted">没有环境变量</span>
        : <div className="co-table-container">
          <table className="table">
            <thead>
              <tr>
                <th>名称</th>
                <th>值</th>
              </tr>
            </thead>
            <tbody>
              {_.map(config.Env, (nameValueStr, i) => {
                const pair = splitEnv(nameValueStr);
                return <tr key={i}>
                  <td>{pair.name}</td>
                  <td>{pair.value}</td>
                </tr>;
              })}
            </tbody>
          </table>
        </div>}
    </div>
  </div>;
};

export const getImageStreamNameForTag = (imageStreamTag: K8sResourceKind): string => {
  const name = _.get(imageStreamTag, 'metadata.name', '');
  return name.split(':')[0];
};

const pages = [navFactory.details(ImageStreamTagsDetails), navFactory.editYaml()];
export const ImageStreamTagsDetailsPage: React.SFC<ImageStreamTagsDetailsPageProps> = props =>
  <DetailsPage
    {...props}
    breadcrumbsFor={obj => {
      const imageStreamName = getImageStreamNameForTag(obj);
      return [{
        name: imageStreamName,
        path: `/k8s/ns/${obj.metadata.namespace}/imagestreams/${imageStreamName}`,
      }, {
        name: 'ImageStreamTag Details',
        path: props.match.url,
      }];
    }}
    kind={ImageStreamTagsReference}
    menuActions={menuActions}
    pages={pages} />;
ImageStreamTagsDetailsPage.displayName = 'ImageStreamTagsDetailsPage';

/* eslint-disable no-undef */
export type ImageStreamTagsDetailsProps = {
  obj: any,
};

export type ImageStreamTagsDetailsPageProps = {
  match: any,
};
/* eslint-enable no-undef */
