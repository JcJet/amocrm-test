import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from './token.entity';
import { HttpModule } from '@nestjs/axios';

@Module({
  providers: [TokenService],
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.${process.env.NODE_ENV}.env`,
    }),
    TypeOrmModule.forFeature([Token]),
    HttpModule,
  ],
  exports: [TokenService],
})
export class TokenModule {}
