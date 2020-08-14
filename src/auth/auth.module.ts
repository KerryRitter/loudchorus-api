import { Module, HttpModule } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { KMS, SharedIniFileCredentials } from 'aws-sdk';
import { AuthController } from './auth.controller';
import { CryptoService } from './crypto.service';
import { JwtStrategy } from './jwt.strategy';
import { TokenService } from './token.service';
import { AwsSdkModule } from 'nest-aws-sdk';

@Module({
  imports: [AwsSdkModule.forFeatures([KMS]), HttpModule, PassportModule],
  providers: [CryptoService, JwtStrategy, TokenService],
  exports: [JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
