import { Controller, Body, Post, Res, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { Tokens } from '../models';
import { TokenService } from './token.service';
import { User } from './user.decorator';
import { IUser } from './user.model';

@Controller('auth')
export class AuthController {
  constructor(private readonly tokenService: TokenService) {}

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getMe(@User() user: IUser) {
    return user;
  }

  @Post('logout')
  async logout(@Res() response: Response) {
    await this.tokenService.expireTokens(response);
    return response.send();
  }

  @Post('login')
  async login(@Body() tokens: Tokens, @Res() response: Response) {
    await this.tokenService.storeTokens(tokens, response);
    return response.send();
  }
}
