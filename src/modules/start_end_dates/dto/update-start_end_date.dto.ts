import { PartialType } from '@nestjs/mapped-types';
import { CreateStartEndDateDto } from './create-start_end_date.dto';

export class UpdateStartEndDateDto extends PartialType(CreateStartEndDateDto) {}
