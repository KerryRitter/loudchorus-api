import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KMS } from 'aws-sdk';
import { InjectAwsService } from 'nest-aws-sdk';

@Injectable()
export class CryptoService {
  constructor(
    @InjectAwsService(KMS) private readonly kms: KMS,
    private readonly configService: ConfigService,
  ) {}

  async encrypt(data: any) {
    const { CiphertextBlob } = await this.kms
      .encrypt({
        KeyId: this.configService.get('KMS_KEY'),
        Plaintext: JSON.stringify(data),
      })
      .promise();
    return CiphertextBlob.toString('base64');
  }

  async decrypt(encrypted: string) {
    const { Plaintext } = await this.kms
      .decrypt({
        KeyId: this.configService.get('KMS_KEY'),
        CiphertextBlob: Buffer.from(encrypted, 'base64'),
      })
      .promise();
    return JSON.parse(Plaintext.toString());
  }
}
