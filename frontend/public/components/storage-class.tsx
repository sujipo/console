import * as React from 'react';
import * as _ from 'lodash-es';

import { ColHead, DetailsPage, List, ListHeader, ListPage } from './factory';
import { Cog, detailsPage, navFactory, ResourceCog, SectionHeading, ResourceLink, ResourceSummary } from './utils';
// eslint-disable-next-line no-unused-vars
import { K8sResourceKind, K8sResourceKindReference } from '../module/k8s';

export const StorageClassReference: K8sResourceKindReference = 'StorageClass';

const menuActions = [Cog.factory.ModifyLabels, Cog.factory.ModifyAnnotations, Cog.factory.Edit, Cog.factory.Delete];

const defaultClassAnnotation = 'storageclass.beta.kubernetes.io/is-default-class';
const isDefaultClass = (storageClass: K8sResourceKind) => _.get(storageClass, ['metadata', 'annotations', defaultClassAnnotation], 'false');

const StorageClassHeader = props => <ListHeader>
  <ColHead {...props} className="col-sm-4 col-xs-6" sortField="metadata.name">名称</ColHead>
  <ColHead {...props} className="col-sm-4 col-xs-6" sortField="provisioner">供应者</ColHead>
  <ColHead {...props} className="col-sm-2 hidden-xs" sortField="reclaimPolicy">回收策略</ColHead>
  <ColHead {...props} className="col-sm-2 hidden-xs" sortField={`metadata.annotations['${defaultClassAnnotation}']`}>默认类别</ColHead>
</ListHeader>;

const StorageClassRow: React.SFC<StorageClassRowProps> = ({obj}) => {
  return <div className="row co-resource-list__item">
    <div className="col-sm-4 col-xs-6 co-break-word co-resource-link-wrapper">
      <ResourceCog actions={menuActions} kind={StorageClassReference} resource={obj} />
      <ResourceLink kind={StorageClassReference} name={obj.metadata.name} namespace={undefined} title={obj.metadata.name} />
    </div>
    <div className="col-sm-4 col-xs-6 co-break-word">
      {obj.provisioner}
    </div>
    <div className="col-sm-2 hidden-xs">
      {obj.reclaimPolicy || '-'}
    </div>
    <div className="col-sm-2 hidden-xs">
      {isDefaultClass(obj)}
    </div>
  </div>;
};

const StorageClassDetails: React.SFC<StorageClassDetailsProps> = ({obj}) => <React.Fragment>
  <div className="co-m-pane__body">
    <SectionHeading text="储存类别概述" />
    <ResourceSummary resource={obj} showNodeSelector={false} showPodSelector={false}>
      <dt>供应者</dt>
      <dd>{obj.provisioner || '-'}</dd>
      <dt>回收策略</dt>
      <dd>{obj.reclaimPolicy || '-'}</dd>
      <dt>默认类别</dt>
      <dd>{isDefaultClass(obj)}</dd>
    </ResourceSummary>
  </div>
</React.Fragment>;

export const StorageClassList: React.SFC = props => <List {...props} Header={StorageClassHeader} Row={StorageClassRow} />;
StorageClassList.displayName = 'StorageClassList';

export const StorageClassPage: React.SFC<StorageClassPageProps> = props =>
  <ListPage {...props} title="存储类别" kind={StorageClassReference} ListComponent={StorageClassList} canCreate={true} filterLabel={props.filterLabel} />;
StorageClassPage.displayName = 'StorageClassListPage';


const pages = [navFactory.details(detailsPage(StorageClassDetails)), navFactory.editYaml()];

export const StorageClassDetailsPage: React.SFC<StorageClassDetailsPageProps> = props => {
  return <DetailsPage {...props} kind={StorageClassReference} menuActions={menuActions} pages={pages} />;
};
StorageClassDetailsPage.displayName = 'StorageClassDetailsPage';

/* eslint-disable no-undef */
export type StorageClassRowProps = {
  obj: any,
};

export type StorageClassDetailsProps = {
  obj: any,
};

export type StorageClassPageProps = {
  filterLabel: string,
};

export type StorageClassDetailsPageProps = {
  match: any,
};
/* eslint-enable no-undef */
