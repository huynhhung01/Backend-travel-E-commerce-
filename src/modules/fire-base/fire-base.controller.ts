import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FireBaseService } from './fire-base.service';
import { CreateFireBaseDto } from './dto/create-fire-base.dto';
import { UpdateFireBaseDto } from './dto/update-fire-base.dto';
import { ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';

@Controller('notifications')
export class FireBaseController {
  constructor(private readonly fireBaseService: FireBaseService) { }

  @Post('broadcast')
  async sendBroadcast(@Body('title') title: string, @Body('body') body: string) {
    return this.fireBaseService.sendToAllDevices(title, body);
  }

  @Post('send-to-token')
  // @ApiBearerAuth('bearerAuth')
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'gởi thông báo đến thiết bị' })
  @ApiConsumes('application/json')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        token: { type: 'string', example: 'fcm_device_token_here', description: 'FCM device token' },
        title: { type: 'string', example: 'Thông báo mới', description: 'Tiêu đề thông báo' },
        body: { type: 'string', example: 'Bạn có một thông báo mới.', description: 'Nội dung thông báo' },
      },
      required: ['token', 'title', 'body']
    }
  })
  async sendToToken(@Body('token') token: string, @Body('title') title: string, @Body('body') body: string) {
    return this.fireBaseService.sendToSpecificToken(token, title, body);
  }


  // @Post()
  // create(@Body() createFireBaseDto: CreateFireBaseDto) {
  //   return this.fireBaseService.create(createFireBaseDto);
  // }

  // @Get()
  // findAll() {
  //   return this.fireBaseService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.fireBaseService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateFireBaseDto: UpdateFireBaseDto) {
  //   return this.fireBaseService.update(+id, updateFireBaseDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.fireBaseService.remove(+id);
  // }
}
