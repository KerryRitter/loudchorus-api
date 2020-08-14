import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { passportJwtSecret } from 'jwks-rsa';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenService } from './token.service';
import { IUser } from './user.model';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly tokenService: TokenService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        JwtStrategy.extractJwtFromCookie(tokenService),
      ]),
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        jwksUri: configService.get('JWKS_URI'),
      }),
      // ignore token expiration, we will handle this in the validate function
      ignoreExpiration: true,
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: any): Promise<IUser> {
    if (new Date().getTime() > payload.exp * 1000) {
      try {
        // token is expired, refresh it
        await this.tokenService.refreshTokens(request, request.res);
      } catch {
        // return not authorized if unable to refresh tokens
        throw new UnauthorizedException();
      }
    }
    return {
      userId: payload.sub,
      email: payload.email,
    };
  }

  private static extractJwtFromCookie(tokenService: TokenService) {
    return (request: Request) => tokenService.extractIdToken(request);
  }
}
