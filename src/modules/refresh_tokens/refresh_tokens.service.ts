import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { CreateRefreshTokenDto } from './dto/create-refresh_token.dto';
import { UpdateRefreshTokenDto } from './dto/update-refresh_token.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshTokenEntity } from './entities/refresh_token.entity';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class RefreshTokensService {
  constructor(
    @InjectRepository(RefreshTokenEntity)
    private refreshTokensRepository: Repository<RefreshTokenEntity>,
    private readonly userService: UserService,
  ) {
  }

  async create(createRefreshTokenDto: CreateRefreshTokenDto) {
    // const refreshToken = this.refreshTokensRepository.create(createRefreshTokenDto);
    const user = await this.userService.getUserById(createRefreshTokenDto.userId);
    if (!user) {
      throw new BadRequestException(`User with id ${createRefreshTokenDto.userId} not found`);
    }
    return this.refreshTokensRepository.save({
      refreshToken: createRefreshTokenDto.refreshToken,
      expiresAt: createRefreshTokenDto.expiresAt,
      user: user,
    });

  }

  async createRefreshToken(refreshToken: string, userId: number, expiresAt: Date) {
    // const refreshToken = this.refreshTokensRepository.create(createRefreshTokenDto);
    const user = await this.userService.getUserById(userId);
    if (!user) {
      throw new BadRequestException(`User with id ${userId} not found`);
    }
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    return this.refreshTokensRepository.save({
      refreshToken: hashedRefreshToken,
      expiresAt: expiresAt,
      userId: userId,
    });

  }
  async verryRefreshToken(refreshToken: string, userId: number) {
    const user = await this.userService.getUserById(userId);
    // console.log("user " + user);
    if (user) {
      const tokens = await this.refreshTokensRepository.find({ where: { userId: userId } });
      // console.log("tokens " + tokens);
      if (!tokens) {
        // throw new ForbiddenException(`No refresh token found with this user id ${userId}`);
        return false;
      }

      // kiểm tra từng token
      for (const t of tokens) {
        const isMatch = await bcrypt.compare(refreshToken, t.refreshToken);
        const isExpired = t.expiresAt < new Date();
        console.log(t, isMatch, isExpired);
        if (isMatch && !isExpired) {
          // return true; // hợp lệ
          // console.log("token hợp lệ");
          return user;
        }
      }

    }
    return false;
  }

  findAll() {
    return `This action returns all refreshTokens`;
  }

  findOne(id: number) {
    return `This action returns a #${id} refreshToken`;
  }

  update(id: number, updateRefreshTokenDto: UpdateRefreshTokenDto) {
    return `This action updates a #${id} refreshToken`;
  }

  remove(id: number) {
    return `This action removes a #${id} refreshToken`;
  }
}
