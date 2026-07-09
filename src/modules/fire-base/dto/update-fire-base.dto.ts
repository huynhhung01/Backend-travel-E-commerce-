import { PartialType } from '@nestjs/swagger';
import { CreateFireBaseDto } from './create-fire-base.dto';

export class UpdateFireBaseDto extends PartialType(CreateFireBaseDto) {}
