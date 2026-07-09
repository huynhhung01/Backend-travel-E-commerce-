import { PartialType } from '@nestjs/swagger';
import { CreateTourHashtagDto } from './create-tour_hashtag.dto';

export class UpdateTourHashtagDto extends PartialType(CreateTourHashtagDto) {}
