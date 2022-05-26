const cdk = require('aws-cdk-lib');

class SampleResourcesStack extends cdk.Stack {
    /**
     *
     * @param {cdk.Construct} scope
     * @param {string} id
     * @param {cdk.StackProps=} props
     */
    constructor(scope, id, props) {
      super(scope, id, props);
  
      const {
        environmentId,
      } = props;    
    }
  }
  
  module.exports = { SampleResourcesStack }