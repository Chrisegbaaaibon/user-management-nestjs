import { Global, Module } from '@nestjs/common';
import { configService } from './config.service';

@Global()
@Module({
  providers: [
    {
      provide: configService,
      useValue: new configService(),
    },
  ],
  exports: [configService],
})
export class configModule {}
 