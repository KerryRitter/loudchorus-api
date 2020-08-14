import { Injectable, HttpService, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, CookieOptions } from 'express';
import { CryptoService } from './crypto.service';
import { Tokens } from '../models';

const ID_TOKEN = '6DH5OIIabL';
const ACCESS_TOKEN = 'whzMdWKtW6';
const REFRESH_TOKEN = 'XV90cw8WUR';

interface UserInfo {
  sub: string;
  email: string;
  email_verified: 'true' | 'false';
}

@Injectable()
export class TokenService {
  logger = new Logger(TokenService.name);

  constructor(
    private readonly cryptoService: CryptoService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async storeTokens(tokens: Tokens, response: Response) {
    response.cookie(ID_TOKEN, tokens.id_token, this.cookieOptions);
    response.cookie(ACCESS_TOKEN, tokens.access_token, this.cookieOptions);
    response.cookie(
      REFRESH_TOKEN,
      await this.cryptoService.encrypt(tokens.refresh_token),
      this.cookieOptions,
    );
  }

  async expireTokens(response: Response) {
    response.cookie(ID_TOKEN, '', this.deleteCookieOptions);
    response.cookie(ACCESS_TOKEN, '', this.deleteCookieOptions);
    response.cookie(REFRESH_TOKEN, '', this.deleteCookieOptions);
  }

  extractIdToken(request: Request) {
    return request?.cookies?.[ID_TOKEN];
  }

  extractAccessToken(request: Request) {
    return request?.cookies?.[ACCESS_TOKEN];
  }

  async refreshTokens(request: Request, response: Response) {
    this.logger.log(`Refreshing tokens`);
    try {
      const url = new URL(
        `${this.configService.get('IDP_BASEPATH')}/oauth2/token`,
      );
      url.search += [
        `grant_type=refresh_token`,
        `client_id=${await this.configService.get('CLIENT_ID')}`,
        `refresh_token=${await this.cryptoService.decrypt(
          request.cookies[REFRESH_TOKEN],
        )}`,
      ].join('&');

      const tokens = await this.httpService
        .post<Record<'id_token' | 'access_token', string>>(url.toString())
        .toPromise();
      response.cookie(ID_TOKEN, tokens.data.id_token, this.cookieOptions);
      response.cookie(
        ACCESS_TOKEN,
        tokens.data.access_token,
        this.cookieOptions,
      );
      this.logger.log(`Successfully refreshed tokens`);
    } catch (err) {
      this.logger.error(`Error refreshing tokens ${err}`);
      throw err;
    }
  }

  async getUserInfo(request: Request) {
    const accessToken = this.extractAccessToken(request);
    const url = `${this.configService.get('IDP_BASEPATH')}/oauth2/userInfo`;

    const userInfo = await this.httpService
      .get<UserInfo>(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .toPromise();

    return userInfo;
  }

  private get cookieOptions(): CookieOptions {
    return {
      sameSite: 'strict',
      secure: this.configService.get('UI_DOMAIN_NAME') !== 'localhost',
      httpOnly: true,
      maxAge: 365 * 24 * 60 * 60 * 1000,
    };
  }

  private get deleteCookieOptions(): CookieOptions {
    return {
      sameSite: 'strict',
      secure: this.configService.get('UI_DOMAIN_NAME') !== 'localhost',
      httpOnly: true,
      maxAge: 0,
      expires: new Date(0),
    };
  }
}
