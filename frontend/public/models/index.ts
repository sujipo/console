// eslint-disable-next-line no-unused-vars
import { K8sKind } from '../module/k8s';

export const CatalogSourceModel: K8sKind = {
  kind: 'CatalogSource',
  label: '应用商店',
  labelPlural: '应用商店',
  apiGroup: 'operators.coreos.com',
  apiVersion: 'v1alpha1',
  path: 'catalogsources',
  abbr: 'CS',
  namespaced: true,
  crd: true,
  plural: 'catalogsources',
};

export const ClusterServiceVersionModel: K8sKind = {
  kind: 'ClusterServiceVersion',
  label: '集群服务版本',
  labelPlural: '集群服务版本',
  apiGroup: 'operators.coreos.com',
  apiVersion: 'v1alpha1',
  path: 'clusterserviceversions',
  abbr: 'CSV',
  namespaced: true,
  crd: true,
  plural: 'clusterserviceversions',
  propagationPolicy : 'Foreground',
};

export const InstallPlanModel: K8sKind = {
  kind: 'InstallPlan',
  label: '安装计划',
  labelPlural: '安装计划',
  apiGroup: 'operators.coreos.com',
  apiVersion: 'v1alpha1',
  path: 'installplans',
  abbr: 'IP',
  namespaced: true,
  crd: true,
  plural: 'installplans',
};

export const SubscriptionModel: K8sKind = {
  kind: 'Subscription',
  label: '订阅',
  labelPlural: '订阅',
  apiGroup: 'operators.coreos.com',
  apiVersion: 'v1alpha1',
  path: 'subscriptions',
  abbr: 'SUB',
  namespaced: true,
  crd: true,
  plural: 'subscriptions',
};

export const EtcdClusterModel: K8sKind = {
  kind: 'EtcdCluster',
  label: 'Etcd 集群',
  labelPlural: 'Etcd 集群',
  apiGroup: 'etcd.database.coreos.com',
  apiVersion: 'v1beta2',
  path: 'etcdclusters',
  abbr: 'EC',
  namespaced: true,
  crd: true,
  plural: 'etcdclusters',
  propagationPolicy : 'Foreground',
};

export const PrometheusModel: K8sKind = {
  kind: 'Prometheus',
  label: 'Prometheus',
  labelPlural: 'Prometheuses',
  apiGroup: 'monitoring.coreos.com',
  apiVersion: 'v1',
  path: 'prometheuses',
  abbr: 'PI',
  namespaced: true,
  crd: true,
  plural: 'prometheuses',
  propagationPolicy : 'Foreground',
};

export const ServiceMonitorModel: K8sKind = {
  kind: 'ServiceMonitor',
  label: '服务监控',
  labelPlural: '服务监控',
  apiGroup: 'monitoring.coreos.com',
  apiVersion: 'v1',
  path: 'servicemonitors',
  abbr: 'SM',
  namespaced: true,
  crd: true,
  plural: 'servicemonitors',
  propagationPolicy : 'Foreground',
};

export const AlertmanagerModel: K8sKind = {
  kind: 'Alertmanager',
  label: 'Alertmanager',
  labelPlural: 'Alertmanagers',
  apiGroup: 'monitoring.coreos.com',
  apiVersion: 'v1',
  path: 'alertmanagers',
  abbr: 'AM',
  namespaced: true,
  crd: true,
  plural: 'alertmanagers',
  propagationPolicy : 'Foreground',
};

export const ClusterModel: K8sKind = {
  kind: 'Cluster',
  label: '集群',
  labelPlural: '集群',
  apiGroup: 'multicluster.coreos.com',
  path: 'clusters',
  apiVersion: 'v1',
  crd: true,
  plural: 'clusters',
  abbr: 'C',
  namespaced: false,
};

export const ChargebackReportModel: K8sKind = {
  kind: 'Report',
  label: '报告',
  labelPlural: '报告',
  apiGroup: 'chargeback.coreos.com',
  path: 'reports',
  apiVersion: 'v1alpha1',
  crd: true,
  plural: 'reports',
  abbr: 'R',
  namespaced: true,
};

export const ServiceModel: K8sKind = {
  apiVersion: 'v1',
  label: '服务',
  path: 'services',
  plural: 'services',
  abbr: 'S',
  namespaced: true,
  kind: 'Service',
  id: 'service',
  labelPlural: '服务'
};

export const PodModel: K8sKind = {
  apiVersion: 'v1',
  label: 'Pod',
  path: 'pods',
  plural: 'pods',
  abbr: 'P',
  namespaced: true,
  kind: 'Pod',
  id: 'pod',
  labelPlural: 'Pods'
};

export const ContainerModel: K8sKind = {
  apiVersion: 'v1',
  label: '容器',
  path: 'containers',
  plural: 'containers',
  abbr: 'C',
  kind: 'Container',
  id: 'container',
  labelPlural: '容器'
};

export const DaemonSetModel: K8sKind = {
  label: '守护进程集',
  path: 'daemonsets',
  apiGroup: 'apps',
  plural: 'daemonsets',
  apiVersion: 'v1',
  abbr: 'DS',
  namespaced: true,
  propagationPolicy: 'Foreground',
  kind: 'DaemonSet',
  id: 'daemonset',
  labelPlural: '守护进程集'
};

export const ReplicationControllerModel: K8sKind = {
  apiVersion: 'v1',
  label: '副本控制器',
  path: 'replicationcontrollers',
  plural: 'replicationcontrollers',
  abbr: 'RC',
  namespaced: true,
  propagationPolicy: 'Foreground',
  kind: 'ReplicationController',
  id: 'replicationcontroller',
  labelPlural: '副本控制器'
};

export const HorizontalPodAutoscalerModel: K8sKind = {
  label: 'Horizontal Pod Autoscaler',
  path: 'horizontalpodautoscalers',
  plural: 'horizontalpodautoscalers',
  apiVersion: 'v2beta1',
  apiGroup: 'autoscaling',
  abbr: 'HPA',
  namespaced: true,
  kind: 'HorizontalPodAutoscaler',
  id: 'horizontalpodautoscaler',
  labelPlural: 'Horizontal Pod Autoscalers'
};

export const ServiceAccountModel: K8sKind = {
  apiVersion: 'v1',
  label: '服务账号',
  path: 'serviceaccounts',
  plural: 'serviceaccounts',
  abbr: 'SA',
  namespaced: true,
  kind: 'ServiceAccount',
  id: 'serviceaccount',
  labelPlural: '服务账号'
};

export const ReplicaSetModel: K8sKind = {
  label: '副本集',
  apiVersion: 'v1',
  path: 'replicasets',
  apiGroup: 'apps',
  plural: 'replicasets',
  abbr: 'RS',
  namespaced: true,
  propagationPolicy: 'Foreground',
  kind: 'ReplicaSet',
  id: 'replicaset',
  labelPlural: '副本集'
};

export const DeploymentModel: K8sKind = {
  label: '部署',
  apiVersion: 'v1',
  path: 'deployments',
  apiGroup: 'apps',
  plural: 'deployments',
  abbr: 'D',
  namespaced: true,
  propagationPolicy: 'Foreground',
  kind: 'Deployment',
  id: 'deployment',
  labelPlural: '部署'
};

export const DeploymentConfigModel: K8sKind = {
  label: '部署配置',
  apiVersion: 'v1',
  path: 'deploymentconfigs',
  apiGroup: 'apps.openshift.io',
  plural: 'deploymentconfigs',
  abbr: 'DC',
  namespaced: true,
  propagationPolicy: 'Foreground',
  kind: 'DeploymentConfig',
  id: 'deploymentconfig',
  labelPlural: '部署配置'
};

export const BuildConfigModel: K8sKind = {
  label: '构建配置',
  apiVersion: 'v1',
  path: 'buildconfigs',
  apiGroup: 'build.openshift.io',
  plural: 'buildconfigs',
  abbr: 'BC',
  namespaced: true,
  propagationPolicy: 'Foreground',
  kind: 'BuildConfig',
  id: 'buildconfig',
  labelPlural: '构建配置'
};

export const BuildModel: K8sKind = {
  label: '构建',
  apiVersion: 'v1',
  path: 'builds',
  apiGroup: 'build.openshift.io',
  plural: 'builds',
  abbr: 'B',
  namespaced: true,
  propagationPolicy: 'Foreground',
  kind: 'Build',
  id: 'build',
  labelPlural: '构建'
};

export const ImageStreamModel: K8sKind = {
  label: '镜像流',
  apiVersion: 'v1',
  path: 'imagestreams',
  apiGroup: 'image.openshift.io',
  plural: 'imagestreams',
  abbr: 'IS',
  namespaced: true,
  propagationPolicy: 'Foreground',
  kind: 'ImageStream',
  id: 'imagestream',
  labelPlural: '镜像流'
};

export const ImageStreamTagModel: K8sKind = {
  label: '镜像流标签',
  apiVersion: 'v1',
  path: 'imagestreamtags',
  apiGroup: 'image.openshift.io',
  plural: 'imagestreamtags',
  abbr: 'IST',
  namespaced: true,
  propagationPolicy: 'Foreground',
  kind: 'ImageStreamTag',
  id: 'imagestreamtag',
  labelPlural: '镜像流标签'
};

export const JobModel: K8sKind = {
  label: '任务',
  apiVersion: 'v1',
  path: 'jobs',
  apiGroup: 'batch',
  plural: 'jobs',
  abbr: 'J',
  namespaced: true,
  propagationPolicy: 'Foreground',
  kind: 'Job',
  id: 'job',
  labelPlural: '任务'
};

export const NodeModel: K8sKind = {
  apiVersion: 'v1',
  label: '节点',
  path: 'nodes',
  plural: 'nodes',
  abbr: 'N',
  kind: 'Node',
  id: 'node',
  labelPlural: '节点'
};

export const EventModel: K8sKind = {
  apiVersion: 'v1',
  label: '事件',
  path: 'events',
  plural: 'events',
  abbr: 'E',
  namespaced: true,
  kind: 'Event',
  id: 'event',
  labelPlural: '事件'
};

export const ComponentStatusModel: K8sKind = {
  apiVersion: 'v1',
  label: '组件状态',
  labelPlural: '组件状态',
  path: 'componentstatuses',
  plural: 'componentstatuses',
  abbr: 'CS',
  kind: 'ComponentStatus',
  id: 'componentstatus'
};

export const NamespaceModel: K8sKind = {
  apiVersion: 'v1',
  label: '命名空间',
  path: 'namespaces',
  plural: 'namespaces',
  abbr: 'NS',
  kind: 'Namespace',
  id: 'namespace',
  labelPlural: '命名空间'
};

export const ProjectModel: K8sKind = {
  apiVersion: 'v1',
  apiGroup: 'project.openshift.io',
  label: '项目',
  path: 'projects',
  plural: 'projects',
  abbr: 'PR',
  kind: 'Project',
  id: 'project',
  labelPlural: '项目'
};

export const ProjectRequestModel: K8sKind = {
  apiVersion: 'v1',
  apiGroup: 'project.openshift.io',
  label: '项目要求',
  path: 'projectrequests',
  plural: 'projectrequests',
  abbr: '',
  kind: 'ProjectRequest',
  id: 'projectrequest',
  labelPlural: '项目要求'
};

export const IngressModel: K8sKind = {
  label: '入口',
  labelPlural: '入口',
  apiGroup: 'extensions',
  apiVersion: 'v1beta1',
  path: 'ingresses',
  plural: 'ingresses',
  abbr: 'I',
  namespaced: true,
  kind: 'Ingress',
  id: 'ingress'
};

export const RouteModel: K8sKind = {
  label: '路由',
  labelPlural: '路由',
  apiGroup: 'route.openshift.io',
  apiVersion: 'v1',
  path: 'routes',
  plural: 'routes',
  abbr: 'RT',
  namespaced: true,
  kind: 'Route',
  id: 'route'
};

export const ConfigMapModel: K8sKind = {
  apiVersion: 'v1',
  label: '配置映射',
  path: 'configmaps',
  plural: 'configmaps',
  abbr: 'CM',
  namespaced: true,
  kind: 'ConfigMap',
  id: 'configmap',
  labelPlural: '配置映射'
};

export const SecretModel: K8sKind = {
  apiVersion: 'v1',
  label: '私密',
  path: 'secrets',
  plural: 'secrets',
  abbr: 'S',
  namespaced: true,
  kind: 'Secret',
  id: 'secret',
  labelPlural: '私密'
};

export const ClusterRoleBindingModel: K8sKind = {
  label: '集群角色绑定',
  apiGroup: 'rbac.authorization.k8s.io',
  apiVersion: 'v1',
  path: 'clusterrolebindings',
  plural: 'clusterrolebindings',
  abbr: 'CRB',
  kind: 'ClusterRoleBinding',
  id: 'clusterrolebinding',
  labelPlural: '集群角色绑定'
};

export const ClusterRoleModel: K8sKind = {
  label: '集群角色',
  apiGroup: 'rbac.authorization.k8s.io',
  apiVersion: 'v1',
  path: 'clusterroles',
  plural: 'clusterroles',
  abbr: 'CR',
  kind: 'ClusterRole',
  id: 'clusterrole',
  labelPlural: '集群角色'
};

export const RoleBindingModel: K8sKind = {
  label: '角色绑定',
  apiGroup: 'rbac.authorization.k8s.io',
  apiVersion: 'v1',
  path: 'rolebindings',
  plural: 'rolebindings',
  abbr: 'RB',
  namespaced: true,
  kind: 'RoleBinding',
  id: 'rolebinding',
  labelPlural: '角色绑定'
};

export const RoleModel: K8sKind = {
  label: '角色',
  apiGroup: 'rbac.authorization.k8s.io',
  apiVersion: 'v1',
  path: 'roles',
  plural: 'roles',
  abbr: 'R',
  namespaced: true,
  kind: 'Role',
  id: 'role',
  labelPlural: '角色'
};

export const SelfSubjectAccessReviewModel: K8sKind = {
  label: 'SelfSubjectAccessReview',
  apiGroup: 'authorization.k8s.io',
  apiVersion: 'v1',
  path: 'selfsubjectaccessreviews',
  plural: 'selfsubjectaccessreviews',
  abbr: 'SSAR',
  namespaced: true,
  kind: 'SelfSubjectAccessReview',
  id: 'selfsubjectaccessreview',
  labelPlural: 'Self Subject Access Reviews'
};

export const TectonicVersionModel: K8sKind = {
  label: '构造版本',
  apiGroup: 'tco.coreos.com',
  apiVersion: 'v1',
  path: 'tectonicversions',
  plural: 'tectonicversions',
  abbr: 'TV',
  namespaced: true,
  kind: 'TectonicVersion',
  id: 'tectonicversion',
  labelPlural: '构造版本'
};

export const ChannelOperatorConfigModel: K8sKind = {
  label: 'Channel Operator Config',
  apiGroup: 'tco.coreos.com',
  apiVersion: 'v1',
  path: 'channeloperatorconfigs',
  plural: 'channeloperatorconfigs',
  abbr: 'COC',
  namespaced: true,
  kind: 'ChannelOperatorConfig',
  id: 'channeloperatorconfig',
  labelPlural: 'Channel Operator Configs'
};

export const AppVersionModel: K8sKind = {
  label: 'AppVersion',
  apiGroup: 'tco.coreos.com',
  apiVersion: 'v1',
  path: 'appversions',
  plural: 'appversions',
  abbr: 'AV',
  namespaced: true,
  kind: 'AppVersion',
  id: 'appversion',
  labelPlural: 'AppVersions'
};

export const PersistentVolumeModel: K8sKind = {
  label: '持久卷',
  apiVersion: 'v1',
  path: 'persistentvolumes',
  plural: 'persistentvolumes',
  abbr: 'PV',
  kind: 'PersistentVolume',
  id: 'persistentvolume',
  labelPlural: '持久卷'
};

export const PersistentVolumeClaimModel: K8sKind = {
  label: '持久卷声明',
  apiVersion: 'v1',
  path: 'persistentvolumeclaims',
  plural: 'persistentvolumeclaims',
  abbr: 'PVC',
  namespaced: true,
  kind: 'PersistentVolumeClaim',
  id: 'persistentvolumeclaim',
  labelPlural: '持久卷声明'
};

export const PetsetModel: K8sKind = {
  apiVersion: 'v1',
  label: 'Petset',
  plural: 'petsets',
  abbr: 'PS',
  path: 'petsets',
  propagationPolicy: 'Foreground',
  kind: 'Petset',
  id: 'petset',
  labelPlural: 'Petsets'
};

export const StatefulSetModel: K8sKind = {
  label: '状态集',
  apiGroup: 'apps',
  apiVersion: 'v1',
  path: 'statefulsets',
  plural: 'statefulsets',
  abbr: 'SS',
  namespaced: true,
  propagationPolicy: 'Foreground',
  kind: 'StatefulSet',
  id: 'statefulset',
  labelPlural: '状态集'
};

export const ResourceQuotaModel: K8sKind = {
  label: '资源配额',
  apiVersion: 'v1',
  path: 'resourcequotas',
  plural: 'resourcequotas',
  abbr: 'RQ',
  namespaced: true,
  kind: 'ResourceQuota',
  id: 'resourcequota',
  labelPlural: '资源配额'
};

export const NetworkPolicyModel: K8sKind = {
  label: '网络策略',
  labelPlural: '网络策略',
  apiVersion: 'v1',
  apiGroup: 'networking.k8s.io',
  path: 'networkpolicies',
  plural: 'networkpolicies',
  abbr: 'NP',
  namespaced: true,
  kind: 'NetworkPolicy',
  id: 'networkpolicy'
};

export const CustomResourceDefinitionModel: K8sKind = {
  label: '资源自定义',
  apiGroup: 'apiextensions.k8s.io',
  apiVersion: 'v1beta1',
  path: 'customresourcedefinitions',
  abbr: 'CRD',
  namespaced: false,
  plural: 'customresourcedefinitions',
  kind: 'CustomResourceDefinition',
  id: 'customresourcedefinition',
  labelPlural: '资源自定义'
};

export const CronJobModel: K8sKind = {
  label: '计划任务',
  apiVersion: 'v1beta1',
  path: 'cronjobs',
  apiGroup: 'batch',
  plural: 'cronjobs',
  abbr: 'CJ',
  namespaced: true,
  kind: 'CronJob',
  id: 'cronjob',
  labelPlural: '计划任务',
  propagationPolicy : 'Foreground',
};

export const StorageClassModel: K8sKind = {
  label: '存储类别',
  labelPlural: '存储类别',
  apiVersion: 'v1',
  path: 'storageclasses',
  apiGroup: 'storage.k8s.io',
  plural: 'storageclasses',
  abbr: 'SC',
  namespaced: false,
  kind: 'StorageClass',
  id: 'storageclass'
};

export const ClusterServiceBrokerModel: K8sKind = {
  label: '集群服务代理',
  labelPlural: '集群服务代理',
  apiVersion: 'v1beta1',
  path: 'clusterservicebrokers',
  apiGroup: 'servicecatalog.k8s.io',
  plural: 'clusterservicebrokers',
  abbr: 'CSB',
  namespaced: false,
  kind: 'ClusterServiceBroker',
  id: 'clusterservicebroker'
};

export const ClusterServiceClassModel: K8sKind = {
  label: '集群服务类别',
  labelPlural: '集群服务类别',
  apiVersion: 'v1beta1',
  path: 'clusterserviceclasses',
  apiGroup: 'servicecatalog.k8s.io',
  plural: 'clusterserviceclasses',
  abbr: 'CSC',
  namespaced: false,
  kind: 'ClusterServiceClass',
  id: 'clusterserviceclass'
};

export const ClusterServicePlanModel: K8sKind = {
  label: '集群服务计划',
  labelPlural: '集群服务计划',
  apiVersion: 'v1beta1',
  path: 'clusterserviceplans',
  apiGroup: 'servicecatalog.k8s.io',
  plural: 'clusterserviceplans',
  abbr: 'CSP',
  namespaced: false,
  kind: 'ClusterServicePlan',
  id: 'clusterserviceplan'
};

export const ServiceInstanceModel: K8sKind = {
  label: '服务实例',
  labelPlural: '服务实例',
  apiVersion: 'v1beta1',
  path: 'serviceinstances',
  apiGroup: 'servicecatalog.k8s.io',
  plural: 'serviceinstances',
  abbr: 'SI',
  namespaced: true,
  kind: 'ServiceInstance',
  id: 'serviceinstance'
};

export const ServiceBindingModel: K8sKind = {
  label: '服务绑定',
  labelPlural: '服务绑定',
  apiVersion: 'v1beta1',
  path: 'servicebindings',
  apiGroup: 'servicecatalog.k8s.io',
  plural: 'servicebindings',
  abbr: 'SB',
  namespaced: true,
  kind: 'ServiceBinding',
  id: 'servicebinding'
};
