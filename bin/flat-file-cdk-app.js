#!/usr/bin/env node

const cdk = require('aws-cdk-lib');
const logs = require('aws-cdk-lib/aws-logs');
const { FlatFileAppStack } = require('../lib/flat-file-cdk-app-stack');
const {EnvironmentType,TagName } = require('@shashi/cdk-commons');
const unifoDev  = { account: '########################', region: 'ap-south-1' };
const unifoProd  = { account: '################', region: 'ap-south-1' };
const unifoQe  = { account: '################', region: 'ap-south-1' };


//App
const app = new cdk.App();
// ImagVer
const imageVersion = app.node.tryGetContext('imgVer');
//-------------------------------------------DEVELOPMENT------------------------------------------------------ 

const devProps= {
  env: unifoDev,
  environmentType: EnvironmentType.DEVELOPMENT,
  environmentId: 'dfdfdfdf',
  cGateVpcId: 'fd-dfdffdfdfdfd',
  cGateWebWorkerEcsClusterName: 'CGateWebInfraDevStack-CGateWebWorkerCluster9FEF587B-IUm9HWCkUh8U',
  flatFileApiEcrRepoArn: 'arn:aws:ecr:ap-south-1:########################:repository/unifo/flat-file-api',
  ecsDesiredTaskCount: 1,
  containerMemHardLimitMib: 256,
  containerMemSoftLimitMib: 256,
  containerCpu: 512,
  containerLogStreamPrefix: 'FlatFile',
  containerPort: 8080,
  discoveryNsServiceName: 'flatfile-api.cgate.app',
  vpcLinkId: 'dfdf',
  cGateHttpApiId: 'dfdsfdfd',
  cGateApiCognitoAuthorizerId: 'dfdfdsfdfd',
  imageVersion,
  jobServicesDdbTableArn:'arn:aws:dynamodb:ap-south-1:########################:table/JobServicesPrimaryTable',
  logRetentionDuration: logs.RetentionDays.ONE_WEEK
}
//-------------------------------------------PRODUCTION------------------------------------------------------ 


const prodProps = { 
  env: unifoProd,
  environmentType: 'Production',
  environmentId: 'PRfdfdfdOD01',
  cGateVpcId: 'vpc-dfdfdfdfdfd',
  cGateWebWorkerEcsClusterName: 'CGateWebInfraStackProd-CGateWebWorkerCluster9FEF587B-ntUfskr9sWUT',
  flatFileApiEcrRepoArn:'arn:aws:ecr:ap-south-1:################:repository/unifo/flat-file-api',
  ecsDesiredTaskCount: 4,
  containerMemHardLimitMib: 256,
  containerMemSoftLimitMib: 256,
  containerCpu: 512,
  containerLogStreamPrefix: 'FlatFile',
  containerPort: 8080,
  discoveryNsServiceName: 'flatfile-api.cgate.app',
  vpcLinkId: 'dfdf',
  cGateHttpApiId: 'ttyfytvy',
  cGateApiCognitoAuthorizerId: 'dfdfefefe',
  imageVersion,
  jobServicesDdbTableArn:'arn:aws:dynamodb:ap-south-1:################:table/JobServicesPrimaryTable',
  logRetentionDuration: logs.RetentionDays.ONE_MONTH,
};
//-------------------------------------------UAT------------------------------------------------------ 
const qeProps = { 
  env: unifoQe,
  environmentType: EnvironmentType.QE,
  environmentId: '6567y6y',
  cGateVpcId: '5rr6tyftt',
  cGateWebWorkerEcsClusterName: 'CGateWebInfraQeStack-CGateWebWorkerCluster9FEF587B-nuDOac9SmCMb',
  flatFileApiEcrRepoArn: 'arn:aws:ecr:ap-south-1:################:repository/unifo/flat-file-api',
  ecsDesiredTaskCount: 2,
  containerMemHardLimitMib: 256,
  containerMemSoftLimitMib: 256,
  containerCpu: 512,
  containerLogStreamPrefix: 'FlatFile',
  containerPort: 8080,
  discoveryNsServiceName: 'flatfile-api.cgate.app',
  vpcLinkId: '565d6yfy',
  cGateHttpApiId: 'dfd',
  cGateApiCognitoAuthorizerId: '4343445',
  imageVersion,
  jobServicesDdbTableArn:'arn:aws:dynamodb:ap-south-1:################:table/JobServicesPrimaryTable',
  logRetentionDuration: logs.RetentionDays.ONE_WEEK
};
//-------------------------------------------DEVELOPMENT------------------------------------------------------ 

const flatFileAppDevStack = new FlatFileAppStack(app, 'FlatFileAppDevStack', devProps,imageVersion)
cdk.Tags.of(flatFileAppDevStack).add(TagName.APP_NAME, 'FlatFileApp');
cdk.Tags.of(flatFileAppDevStack).add(TagName.APP_OWNER, 'shashi94goswami@gmail.com');
cdk.Tags.of(flatFileAppDevStack).add(TagName.ENVIRONMENT_TYPE, devProps.environmentType);
cdk.Tags.of(flatFileAppDevStack).add(TagName.ENVIRONMENT_ID, devProps.environmentId);

//-------------------------------------------PRODUCTION------------------------------------------------------ 

// const flatFileAppProdStack=new FlatFileAppStack(app, 'FlatFileAppProdStack',prodProps, imageVersion);
// cdk.Tags.of(flatFileAppProdStack).add(TagName.APP_NAME, 'FlatFileApp');
// cdk.Tags.of(flatFileAppProdStack).add(TagName.APP_OWNER, 'shashi94goswami@gmail.com');
// cdk.Tags.of(flatFileAppProdStack).add(TagName.ENVIRONMENT_TYPE, prodProps.environmentType);
// cdk.Tags.of(flatFileAppProdStack).add(TagName.ENVIRONMENT_ID, prodProps.environmentId);
//-------------------------------------------UAT------------------------------------------------------ 
// const flatFileAppQeStack=new FlatFileAppStack(app, 'FlatFileAppQeStack',qeProps, imageVersion);
// cdk.Tags.of(flatFileAppQeStack).add(TagName.APP_NAME, 'FlatFileApp');
// cdk.Tags.of(flatFileAppQeStack).add(TagName.APP_OWNER, 'shashi94goswami@gmail.com');
// cdk.Tags.of(flatFileAppQeStack).add(TagName.ENVIRONMENT_TYPE, qeProps.environmentType);
// cdk.Tags.of(flatFileAppQeStack).add(TagName.ENVIRONMENT_ID, qeProps.environmentId);