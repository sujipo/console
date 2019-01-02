import * as React from 'react';
import { Link } from 'react-router-dom';

import { getJobTypeAndCompletions } from '../module/k8s';
import { ColHead, DetailsPage, List, ListHeader, ListPage, ResourceRow } from './factory';
import { configureJobParallelismModal } from './modals';
import { Cog, SectionHeading, LabelList, ResourceCog, ResourceLink, ResourceSummary, Timestamp, navFactory } from './utils';
import { ResourceEventStream } from './events';

const ModifyJobParallelism = (kind, obj) => ({
  label: '编辑排比',
  callback: () => configureJobParallelismModal({
    resourceKind: kind,
    resource: obj,
  }),
});
const menuActions = [ModifyJobParallelism, ...Cog.factory.common];

const JobHeader = props => <ListHeader>
  <ColHead {...props} className="col-lg-2 col-md-3 col-sm-4 col-xs-6" sortField="metadata.name">名称</ColHead>
  <ColHead {...props} className="col-lg-2 col-md-3 col-sm-4 col-xs-6" sortField="metadata.namespace">命名空间</ColHead>
  <ColHead {...props} className="col-lg-4 col-md-4 col-sm-4 hidden-xs" sortField="metadata.labels">标签</ColHead>
  <ColHead {...props} className="col-lg-2 col-md-2 hidden-sm hidden-xs" sortFunc="jobCompletions">完成</ColHead>
  <ColHead {...props} className="col-lg-2 hidden-md hidden-sm hidden-xs" sortFunc="jobType">类别</ColHead>
</ListHeader>;

const JobRow = ({obj: job}) => {
  const {type, completions} = getJobTypeAndCompletions(job);
  return (
    <ResourceRow obj={job}>
      <div className="col-lg-2 col-md-3 col-sm-4 col-xs-6 co-resource-link-wrapper">
        <ResourceCog actions={menuActions} kind="Job" resource={job} />
        <ResourceLink kind="Job" name={job.metadata.name} namespace={job.metadata.namespace} title={job.metadata.uid} />
      </div>
      <div className="col-lg-2 col-md-3 col-sm-4 col-xs-6 co-break-word">
        <ResourceLink kind="Namespace" name={job.metadata.namespace} title={job.metadata.namespace} />
      </div>
      <div className="col-lg-4 col-md-4 col-sm-4 hidden-xs">
        <LabelList kind="Job" labels={job.metadata.labels} />
      </div>
      <div className="col-lg-2 col-md-2 hidden-sm hidden-xs">
        <Link to={`/k8s/ns/${job.metadata.namespace}/jobs/${job.metadata.name}/pods`} title="pods">
          {job.status.succeeded || 0} of {completions}
        </Link>
      </div>
      <div className="col-lg-2 hidden-md hidden-sm hidden-xs">
        {type}
      </div>
    </ResourceRow>
  );
};

const Details = ({obj: job}) => <div className="co-m-pane__body">
  <div className="row">
    <div className="col-md-6">
      <SectionHeading text="Job Overview" />
      <ResourceSummary resource={job} showNodeSelector={false}>
        <dt>期望完成</dt>
        <dd>{job.spec.completions || '-'}</dd>
        <dt>排比</dt>
        <dd>{job.spec.parallelism || '-'}</dd>
        <dt>死亡期限</dt>
        <dd>{job.spec.activeDeadlineSeconds ? `${job.spec.activeDeadlineSeconds} seconds` : '-'}</dd>
      </ResourceSummary>
    </div>
    <div className="col-md-6">
      <SectionHeading text="Job Status" />
      <dl className="co-m-pane__details">
        <dt>状态</dt>
        <dd>{job.status.conditions ? job.status.conditions[0].type : 'In Progress'}</dd>
        <dt>启动时间</dt>
        <dd><Timestamp timestamp={job.status.startTime} /></dd>
        <dt>完成时间</dt>
        <dd><Timestamp timestamp={job.status.completionTime} /></dd>
        <dt>成功Pod数</dt>
        <dd>{job.status.succeeded || 0}</dd>
        <dt>活动Pod数</dt>
        <dd>{job.status.active || 0}</dd>
        <dt>失败Pod数</dt>
        <dd>{job.status.failed || 0}</dd>
      </dl>
    </div>
  </div>
</div>;

const {details, pods, editYaml, events} = navFactory;
const JobsDetailsPage = props => <DetailsPage
  {...props}
  menuActions={menuActions}
  pages={[details(Details), editYaml(), pods(), events(ResourceEventStream)]}
/>;
const JobsList = props => <List {...props} Header={JobHeader} Row={JobRow} />;
const JobsPage = props => <ListPage ListComponent={JobsList} canCreate={true} {...props} />;
export {JobsList, JobsPage, JobsDetailsPage};
