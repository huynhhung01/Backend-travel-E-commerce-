import { PartialType } from '@nestjs/mapped-types';
import { CreateTourPromotionDto } from './create-tour_promotion.dto';

export class UpdateTourPromotionDto extends PartialType(CreateTourPromotionDto) {}
