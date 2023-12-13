import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientDto } from './dto/client-dto';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({
    summary: 'Редирект-ссылка для первого подключения к интеграции',
  })
  @Get('redirect/')
  amocrmRedirect(@Query() code: string) {
    return this.appService.amocrmRedirect(code);
  }

  @ApiOperation({
    summary:
      'Найти контакт в AmoCRM с данной почтой и/или телефоном. Если такого нет, создать новый, заполнив имя, телефон и почту. Если найден, обновить его входящими данными. После, создать сделку по данному контакту в первом статусе воронки.',
  })
  @ApiQuery({
    name: 'name',
    example: 'Vladimir',
    required: true,
  })
  @ApiQuery({
    name: 'email',
    example: 'jet888@mail.ru',
    required: true,
  })
  @ApiQuery({
    name: 'phone',
    example: '+78885552222',
    required: true,
  })
  @Get('create_lead/')
  createDeal(@Query() clientDto: ClientDto) {
    return this.appService.createLead(clientDto);
  }
}
