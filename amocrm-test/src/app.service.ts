import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { TokenService } from './token/token.service';
import { ClientDto } from './dto/client-dto';

@Injectable()
export class AppService {
  constructor(
    private readonly httpService: HttpService,
    private readonly tokenService: TokenService,
  ) {}

  async amocrmRedirect(code) {
    const url = `https://${process.env.AMOCRM_SUBDOMAIN}.amocrm.ru/oauth2/access_token`;
    const data = {
      client_id: process.env.AMOCRM_INTEGRATION_ID,
      client_secret: process.env.AMOCRM_SECRET_KEY,
      grant_type: 'authorization_code',
      code: code.code,
      redirect_uri: process.env.AMOCRM_REDIRECT_URI,
    };
    try {
      const response = await lastValueFrom(this.httpService.post(url, data));
      await this.tokenService.saveTokens(
        1,
        response.data.refresh_token,
        response.data.access_token,
        response.data.expires_in,
      );
    } catch (e) {
      console.log(e);
    }
  }

  async findContact(criteria: string) {
    const tokens = await this.tokenService.findToken(1);
    const config = {
      headers: { Authorization: `Bearer ${tokens.accessToken}` },
    };
    const url = `https://${process.env.AMOCRM_SUBDOMAIN}.amocrm.ru/api/v4/contacts?query=${criteria}`;
    try {
      const response = await lastValueFrom(this.httpService.get(url, config));
      return response.data?._embedded?.contacts;
    } catch (e) {
      console.log(e);
    }
  }

  async createContact(dto: ClientDto) {
    const tokens = await this.tokenService.findToken(1);
    const config = {
      headers: { Authorization: `Bearer ${tokens.accessToken}` },
    };
    const data = {
      name: dto.name,
      custom_fields_values: [
        {
          field_code: 'PHONE',
          values: [
            {
              value: dto.phone,
            },
          ],
        },
        {
          field_code: 'EMAIL',
          values: [
            {
              value: dto.email,
            },
          ],
        },
      ],
    };

    const url = `https://${process.env.AMOCRM_SUBDOMAIN}.amocrm.ru/api/v4/contacts`;
    try {
      const response = await lastValueFrom(
        this.httpService.post(url, [data], config),
      );
      return response.data._embedded.contacts;
    } catch (e) {
      console.log(e);
    }
  }

  async updateContact(contactId: number, dto: ClientDto) {
    const tokens = await this.tokenService.findToken(1);
    const config = {
      headers: { Authorization: `Bearer ${tokens.accessToken}` },
    };
    const url = `https://${process.env.AMOCRM_SUBDOMAIN}.amocrm.ru/api/v4/contacts/${contactId}`;

    const data = {
      name: dto.name,
      custom_fields_values: [
        {
          field_code: 'PHONE',
          values: [
            {
              value: dto.phone,
            },
          ],
        },
        {
          field_code: 'EMAIL',
          values: [
            {
              value: dto.email,
            },
          ],
        },
      ],
    };

    try {
      const response = await lastValueFrom(
        this.httpService.patch(url, data, config),
      );
      return response.data?._embedded?.contacts;
    } catch (e) {
      console.log(e);
    }
  }

  async createLead(dto: ClientDto) {
    let foundContact = await this.findContact(dto.name);
    let contactId;
    if (!foundContact) {
      foundContact = await this.findContact(dto.email);
    }
    if (foundContact) {
      await this.updateContact(foundContact[0].id, dto);
      contactId = foundContact[0].id;
    } else {
      const createdContact = await this.createContact(dto);
      contactId = createdContact[0].id;
    }
    this.createLeadForContact(contactId);
  }

  async createLeadForContact(contactId: number) {
    const tokens = await this.tokenService.findToken(1);
    const config = {
      headers: { Authorization: `Bearer ${tokens.accessToken}` },
    };
    const url = `https://${process.env.AMOCRM_SUBDOMAIN}.amocrm.ru/api/v4/leads`;
    const data = [
      {
        name: 'Сделка для примера',
        created_by: 0,
        _embedded: {
          contacts: [
            {
              id: contactId,
            },
          ],
        },
      },
    ];
    try {
      await lastValueFrom(this.httpService.post(url, data, config));
    } catch (e) {
      console.log(e);
    }
  }
}
