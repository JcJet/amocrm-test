import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, InsertResult, Repository } from 'typeorm';
import { Token } from './token.entity';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    private readonly httpService: HttpService,
  ) {}

  async saveTokens(
    userId: number,
    refreshToken: string,
    accessToken: string,
    expiresIn: number,
  ): Promise<Token | InsertResult> {
    const tokenData = await this.tokenRepository.findOneBy({ userId });
    if (tokenData) {
      tokenData.refreshToken = refreshToken;
      tokenData.accessToken = accessToken;
      return this.tokenRepository.save(tokenData);
    }
    return await this.tokenRepository.insert({
      userId,
      refreshToken,
      accessToken,
      expiresIn,
    });
  }

  async removeToken(refreshToken: string): Promise<DeleteResult> {
    return await this.tokenRepository.delete({ refreshToken });
  }

  async findToken(userId): Promise<Token> {
    const token = await this.tokenRepository.findOneBy({ userId });
    if (this.isTokenExpired(token)) {
      return await this.refreshAccessToken(token.refreshToken);
    }
    return token;
  }

  isTokenExpired(token: Token): boolean {
    const secondsSinceLastRefresh =
      Math.round(new Date().getTime() - token.updatedAt.getTime()) / 1000;
    // 100 секунд поправка на всевозможные запаздывания, т.к. сравнивается со временем изменения токена на этом сервере, а не AmoCRM.
    return secondsSinceLastRefresh > token.expiresIn - 100;
  }

  async refreshAccessToken(refreshToken: string): Promise<any> {
    const url = `https://${process.env.AMOCRM_SUBDOMAIN}.amocrm.ru/oauth2/access_token`;
    const data = {
      client_id: process.env.AMOCRM_INTEGRATION_ID,
      client_secret: process.env.AMOCRM_SECRET_KEY,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      redirect_uri: process.env.AMOCRM_REDIRECT_URI,
    };
    const response = await lastValueFrom(this.httpService.post(url, data));
    const token = {
      userId: 1,
      refreshToken: response.data.refresh_token,
      accessToken: response.data.access_token,
      expiresIn: response.data.expires_in,
    };
    await this.saveTokens(
      token.userId,
      token.refreshToken,
      token.accessToken,
      token.expiresIn,
    );
    return token;
  }
}
