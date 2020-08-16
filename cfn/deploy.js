const { exec } = require("child_process");
const { readFileSync } = require("fs");

class DeployUtils {
  /**
   * @param {string} file The file path
   * @returns {{params: { [key: string]: string }, paramsString: string}}
   */
  getParameters(file) {
    const params = JSON.parse(readFileSync(file));
    const paramsString = Object.keys(params).map(key => `${key}=${JSON.stringify(params[key])}`).join(' ');
    return {
      params,
      paramsString,
    }
  }

  /**
   * @param {string} command
   * @returns {Promise<void>}
   */
  runCommand(command) {
    if (Array.isArray(command)) {
      command = command.join(' ');
    }
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
          if (error) {
              return reject(error);
          }
          if (stderr) {
              return reject(stderr);
          }
          return resolve(stdout);
      });
    });
  } 
}

class ApiDeployer {
  utils = new DeployUtils();

  /**
   * @param { { stackName: string, profile: string, stagingBucket: string, parametersFilePath: string }} options 
   */
  constructor(options) {
    this.options = options;
  }

  async deploy() {
    // await this.zip();
    await this.package();
    await this.cfn();
  }

  async zip() {
    console.log(await this.utils.runCommand(`7z a ./cfn/artifacts.zip ./dist/*`));
    console.log(await this.utils.runCommand(`7z a ./cfn/artifacts.zip ./node_modules/ -r`));
  }

  async package() {
    console.log(await this.utils.runCommand([
      `aws cloudformation package`,
      `--template-file ./cfn/cloudformation.yaml`,
      `--s3-bucket ${this.options.stagingBucket}`,
      `--output-template-file ./cfn/cloudformation-packaged.yaml`,
      `--profile ${this.options.profile}`,
    ]));
  }

  /**
   * @private
   * @returns {Promise<void>}
   */
  async cfn() {
    const { paramsString } = this.utils.getParameters(this.options.parametersFilePath);

    try {
      console.log(await this.utils.runCommand([
        `aws cloudformation deploy`,
        `--template-file ./cfn/cloudformation-packaged.yaml`,
        `--stack-name ${this.options.stackName}`,
        `--parameter-overrides ${paramsString}`,
        `--profile ${this.options.profile}`,
        `--capabilities CAPABILITY_IAM CAPABILITY_AUTO_EXPAND`,
      ]));
    } catch (ex) {
      if (!ex.message.includes('No changes')) {
        throw ex;
      }
    }
  }
}

new ApiDeployer({
  stackName: 'loudchorus-api-prod',
  profile: 'default',
  stagingBucket: 'appfabricator-cloudformation',
  parametersFilePath: './cfn/parameters-prod.json',
})
  .deploy()
  .then(() => console.log('Done!'))
  .catch(err => console.error(err));