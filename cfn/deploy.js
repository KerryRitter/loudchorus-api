const { runDeployment, runDeploymentStep } = require('@aws-serverless-tools/cli');

runDeployment(async ({ fileSystem, npm, cfn }) => {
  // await runDeploymentStep({
  //   stepName: 'Clearing artifacts',
  //   action: () => fileSystem.delete('cfn/artifacts.zip'),
  // });

  // await runDeploymentStep({
  //   stepName: 'Running clean NPM install',
  //   action: () => npm.cleanInstall(),
  // });

  // await runDeploymentStep({
  //   stepName: 'Running lint',
  //   action: () => npm.runScript('lint'),
  // });

  // await runDeploymentStep({
  //   stepName: 'Running build',
  //   action: () => npm.runScript('build'),
  // });

  // await runDeploymentStep({
  //   stepName: 'Running prune',
  //   action: () => npm.prune(true),
  // });

  // await runDeploymentStep({
  //   stepName: 'Zipping artifacts',
  //   action: () => fileSystem.zipFolder([
  //     fileSystem.getCwdPath('node_modules'),
  //     fileSystem.getCwdPath('dist')
  //   ],
  //     fileSystem.getCwdPath('cfn/artifacts.zip')
  //   ),
  // });

  // await runDeploymentStep({
  //   stepName: 'Packaging',
  //   action: () => cfn.package({
  //     templateFilePath: fileSystem.getCwdPath('cfn/cloudformation.yaml'),
  //     outputFilePath: fileSystem.getCwdPath('cfn/cloudformation-transformed.yaml'),
  //     packageBucket: 'kerryritter-deploy-bucket',
  //     profile: 'personal',
  //   }),
  // });

  await runDeploymentStep({
    stepName: 'Deploying',
    action: () => cfn.deploy({
      stackname: 'loud-chorus-api',
      parameters: [fileSystem.getCwdPath('cfn/parameters-dev.json')],
      tags: [fileSystem.getCwdPath('cfn/tags.json')],
      profile: 'personal',
      region: 'us-east-1',
      template: fileSystem.getCwdPath('cfn/cloudformation-transformed.yaml'),
      capabilities: 'CAPABILITY_NAMED_IAM',
    }).promise,
  });
});
