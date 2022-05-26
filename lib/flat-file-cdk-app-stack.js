const cdk = require('aws-cdk-lib');
const ec2 = require('aws-cdk-lib/aws-ec2');
const ecs = require('aws-cdk-lib/aws-ecs');
const iam = require('aws-cdk-lib/aws-iam');
const logs = require('aws-cdk-lib/aws-logs');
const ecr = require('aws-cdk-lib/aws-ecr');
const servicediscovery = require('aws-cdk-lib/aws-servicediscovery');
// const apiGw = require('aws-cdk-lib/aws-apigatewayv2');
const apiAlpha = require('@aws-cdk/aws-apigatewayv2-alpha');
const apiGwInt1 = require('@aws-cdk/aws-apigatewayv2-integrations-alpha');

class FlatFileAppStack extends cdk.Stack {
  /**
   *
   * @param {Construct} scope
   * @param {string} id
   * @param {StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    const {
      cGateVpcId,
      cGateWebWorkerEcsClusterName,
      flatFileApiEcrRepoArn,
      ecsDesiredTaskCount = 2,
      containerMemHardLimitMib,
      containerMemSoftLimitMib,
      containerCpu,
      containerLogStreamPrefix,
      containerPort,
      discoveryNsServiceName,
      vpcLinkId,
      cGateHttpApiId,
      cGateApiCognitoAuthorizerId,
      imageVersion,
      jobServicesDdbTableArn,
      logRetentionDuration,
      environmentId
    } = props;



    const cGateVpc = ec2.Vpc.fromLookup(this, 'CGateVpc', {
      vpcId: cGateVpcId
    });
    const cGateWebWorkerCluster = ecs.Cluster.fromClusterAttributes(this, 'CGateWebWorkerCluster', {
      clusterName: cGateWebWorkerEcsClusterName,
      vpc: cGateVpc,
    });

    const flatFileApiRepo = ecr.Repository.fromRepositoryArn(this, 'FlatFileApiRepo', flatFileApiEcrRepoArn);

    const flatFileDynamoDbAccessPolicy = new iam.ManagedPolicy(this, 'FlatFileDynamoDbAccessPolicy', {
      managedPolicyName: "flatFileDynamoDbAccessPolicy",
      document: new iam.PolicyDocument({
        statements: [new iam.PolicyStatement({
          actions: [
            "dynamodb:BatchGetItem",
            "dynamodb:GetItem",
            "dynamodb:Query",
            "dynamodb:Scan",
            "dynamodb:BatchWriteItem",
            "dynamodb:PutItem",
            "dynamodb:UpdateItem",
            "dynamodb:DeleteItem"
          ],
          resources: [jobServicesDdbTableArn]
        })]
      })
    });
    
    const flatFileTaskExecutionRole = new iam.Role(this, 'flatFileTaskExecutionRole', {
      roleName: 'flatFileTaskExecutionRole',
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      assumeRoleAction: "sts:AssumeRole",
      path: "/",
      managedPolicies: [flatFileDynamoDbAccessPolicy]
    })
    const flatFileApiTaskDefinition = new ecs.Ec2TaskDefinition(this, 'FlatFileApiTaskDefinition', {
      networkMode: ecs.NetworkMode.BRIDGE,
      taskRole: flatFileTaskExecutionRole
    });

    const flatFileApiAppLogGroup = new logs.LogGroup(this, 'FlatFileApiAppLogGroup', {
      logGroupName: `FlatFileApiAppLogGroup-${environmentId}`,
      retention: logRetentionDuration
    });

    const flatFileApiContainer = flatFileApiTaskDefinition.addContainer("FlatFileApiContainer", {
      image: ecs.ContainerImage.fromEcrRepository(flatFileApiRepo, imageVersion),
      memoryLimitMiB: containerMemSoftLimitMib,
      memoryReservationMiB: containerMemHardLimitMib,
      cpu: containerCpu,
      logging: ecs.LogDrivers.awsLogs({
        logGroup: flatFileApiAppLogGroup,
        streamPrefix: containerLogStreamPrefix,
      })
    });

    flatFileApiContainer.addPortMappings({
      containerPort
    });
    const flatFileApiNamespace = new servicediscovery.PrivateDnsNamespace(this, 'FlatFileApiNamespace', {
      name: discoveryNsServiceName,
      vpc: cGateVpc,
    });
    const flatFileApiService = new ecs.Ec2Service(this, 'FlatFileApiService', {
      cluster: cGateWebWorkerCluster,
      taskDefinition: flatFileApiTaskDefinition,
      assignPublicIp: false,
      cloudMapOptions: {
        cloudMapNamespace: flatFileApiNamespace,
        dnsRecordType: servicediscovery.DnsRecordType.SRV,
        dnsTtl: cdk.Duration.days(30),
      },
      desiredCount: ecsDesiredTaskCount,
    });
  
    const cGateVpcLink = apiAlpha.VpcLink.fromVpcLinkAttributes(this, 'cGateVpcLink', {
      vpc: cGateVpc,
      vpcLinkId
    });

    const cGateApi = apiAlpha.HttpApi.fromHttpApiAttributes(this, 'CGateApi', {
      httpApiId: cGateHttpApiId,
    });
    const cgateHttpAuthorizerAttributes = apiAlpha.HttpAuthorizer.fromHttpAuthorizerAttributes(this, 'cognitoHttpAuthorizer', {
      authorizerId: cGateApiCognitoAuthorizerId,
      authorizerType: apiAlpha.HttpAuthorizerType.JWT
    });

      
      const flatFileApiBackendIntegration = new apiGwInt1.HttpServiceDiscoveryIntegration('flatFileApiBackendIntegration',flatFileApiService.cloudMapService, {
      vpcLink: cGateVpcLink,
    });

    const beFlatFileRoute = new apiAlpha.HttpRoute(this, 'BeFlatFileRoute', {
      httpApi: cGateApi,
      routeKey: apiAlpha.HttpRouteKey.with('/beFlatFile', apiAlpha.HttpMethod.POST),
      integration: flatFileApiBackendIntegration,
      authorizer: cgateHttpAuthorizerAttributes
    });
    const sbFlatFileRoute = new apiAlpha.HttpRoute(this, 'SbFlatFileRoute', {
      httpApi: cGateApi,
      routeKey: apiAlpha.HttpRouteKey.with('/sbFlatFile', apiAlpha.HttpMethod.POST),
      integration: flatFileApiBackendIntegration,
      authorizer: cgateHttpAuthorizerAttributes
    });
    new cdk.CfnOutput(this, 'BeFlatFileRouteId', {
      value: beFlatFileRoute.routeId,
      description: 'The Route Id',
      exportName: 'BeFlatFileRouteId',
    });
    new cdk.CfnOutput(this, 'SbFlatFileRouteId', {
      value: sbFlatFileRoute.routeId,
      description: 'The Route Id',
      exportName: 'SbFlatFileRouteId',
    });
  }

}

module.exports = { FlatFileAppStack }
