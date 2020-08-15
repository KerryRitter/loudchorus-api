import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller()
export class AppController {
  constructor(private readonly configService: ConfigService) {}

  @Get('healthcheck')
  healthcheck() {
    return { success: true };
  }

  @Get('config')
  config() {
    return {
      idpBasePath: this.configService.get('IDP_BASEPATH'),
      clientId: this.configService.get('CLIENT_ID'),
      uiDomainName: this.configService.get('UI_DOMAIN_NAME'),
      artistPortalDomainName: this.configService.get(
        'ARTIST_PORTAL_DOMAIN_NAME',
      ),
      apiBaseUrl: this.configService.get('API_DOMAIN_NAME'),
    };
  }
}
