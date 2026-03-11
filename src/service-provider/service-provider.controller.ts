import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import type { Response } from 'express';
import { ProviderRegisterDto } from './dtos/provider-register.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage, MulterError } from 'multer';
import { ServiceProviderService } from './providers/service-provider.service';
import { JwtAuthGuard } from './common/jwt-auth.guard';
import { UpdateProviderCategoryDto } from './dtos/update-provider-category.dto';
import { ProviderLoginDto } from './dtos/provider-login.dto';

@Controller('service-provider')
export class ServiceProviderController {
  constructor(
    private readonly serviceProviderService: ServiceProviderService,
  ) {}
  @Post('signup')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: (req, file, cb) => {
        if (file.originalname.match(/^.*\.(jpg|webp|png|jpeg)$/)) {
          cb(null, true);
        } else {
          cb(new MulterError('LIMIT_UNEXPECTED_FILE', 'image'), false);
        }
      },
      limits: { fileSize: 5 * 1000 * 1000 },
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          cb(null, Date.now() + file.originalname);
        },
      }),
    }),
  )
  signUp(
    @UploadedFile() file: Express.Multer.File,
    @Body() providerRegisterDto: ProviderRegisterDto,
  ) {
    console.log('controller reached');
    const fullRegisterDto = {
      ...providerRegisterDto,
      profile_image_url: file.path,
    };
    return this.serviceProviderService.signUp(fullRegisterDto);
  }

  @Post('login')
  login(@Body() providerLoginDto: ProviderLoginDto) {
    return this.serviceProviderService.login(providerLoginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile/')
  profile(@Req() req: any) {
    return this.serviceProviderService.getProfile(req.provider?.email);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update-price')
  updatePrice(@Req() req: any, @Body('price') price: number) {
    return this.serviceProviderService.updatePrice(req.provider.email, price);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('change-category')
  updateCategory(
    @Req() req: any,
    @Body() updateProviderCategorydto: UpdateProviderCategoryDto,
  ) {
    return this.serviceProviderService.updateCategory(
      req.provider.email,
      updateProviderCategorydto,
    );
  }

  @Post('forget-password')
  forgetPassword(@Body('email') email: string) {
    return this.serviceProviderService.forgetPassword(email);
  }

  @Patch('reset-password/:id')
  resetPassword(
    @Param('id') id: string,
    @Body('newPassword') newPassword: string,
  ) {
    return this.serviceProviderService.resetPassword(id, newPassword);
  }
}
