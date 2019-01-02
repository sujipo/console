import * as _ from 'lodash-es';
import * as React from 'react';

import { BuildConfigModel } from '../../models';
import { referenceForModel } from '../../module/k8s';
import { SampleYaml } from './resource-sidebar';

const samples = [
  {
    header: '通过Dockerfile构建',
    details: 'Dockerfile构建使用源存储库中的Dockerfile或构建配置中指定的Dockerfile执行镜像构建。',
    templateName: 'docker-build',
    kind: referenceForModel(BuildConfigModel),
  },
  {
    header: 'Source-to-Image(S2I)构建',
    details: 'S2I是构建可复制容器镜像的工具。它通过将应用程序源注入容器镜像并组装新镜像来生成准备运行的镜像。',
    templateName: 's2i-build',
    kind: referenceForModel(BuildConfigModel),
  },
  {
    header: '流水线构建',
    details: '流水线构建策略允许开发人员定义Jenkins流水线，以便由Jenkins流水线插件执行。 这种构建方式可以与任何其他构建类型相同的方式启动、监视和管理。',
    templateName: 'pipeline-build',
    kind: referenceForModel(BuildConfigModel),
  }
];

export const BuildConfigSidebar = ({loadSampleYaml, downloadSampleYaml}) => {
  return <ol className="co-resource-sidebar-list">
    {_.map(samples, (sample) => <SampleYaml
      key={sample.templateName}
      sample={sample}
      loadSampleYaml={loadSampleYaml}
      downloadSampleYaml={downloadSampleYaml} />)}
  </ol>;
};
