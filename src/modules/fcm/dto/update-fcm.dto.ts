import { PartialType } from '@nestjs/swagger';
import { CreateFcmDto } from './create-fcm.dto';

export class UpdateFcmDto extends PartialType(CreateFcmDto) {}
