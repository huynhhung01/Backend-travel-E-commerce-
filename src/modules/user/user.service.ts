import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto, RegisterUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity, UserRole } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { SupabaseService } from '../supabase/supabase.service';
import { StringNormalizerService } from './dto/lowercase';

@Injectable()
export class UserService {

  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    private supabaseService: SupabaseService,
  ) {

  }

  async create(createUserDto: CreateUserDto, file: Express.Multer.File): Promise<UserEntity> {

    try {
      const hashedPassword = await bcrypt.hash(createUserDto.passWord, 10);
      const existingEmail = await this.findUserByEmail(createUserDto.email);
      if (existingEmail) {
        throw new Error('Email already exists');
      }
      const normalizer = new StringNormalizerService();
      createUserDto.userName = normalizer.normalize(createUserDto.fullName);
      let existingUserName = await this.findUserByUsername(createUserDto.userName);
      let i = 0;
      while (existingUserName) {
        createUserDto.userName += i;
        i++;
        existingUserName = await this.findUserByUsername(createUserDto.userName);
      }
      if (!file) {
        return await this.usersRepository.save({
          fullName: createUserDto.fullName,
          userName: createUserDto.userName,
          email: createUserDto.email,
          passWord: hashedPassword,
          phoneNumber: createUserDto.phoneNumber,
          address: createUserDto.address,
          isActive: createUserDto.isActive ?? 'n',

          // avatar: urlimage,
          birthDay: createUserDto.birthDay,
          latitude: createUserDto.latitude,
          longitude: createUserDto.longitude,
          role: createUserDto.role ?? UserRole.USER,
        });
      }
      const bucket = 'image_pbl6';
      const path = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}_${file.originalname}`;
      const urlimage = await this.supabaseService.uploadImage(file, bucket, path);

      // user.passWord = hashedPassword;
      // console.log(urlimage);
      return await this.usersRepository.save({
        fullName: createUserDto.fullName,
        userName: createUserDto.userName,
        email: createUserDto.email,
        passWord: hashedPassword,
        phoneNumber: createUserDto.phoneNumber,
        address: createUserDto.address,
        isActive: createUserDto.isActive ?? 'n',
        avatar: urlimage,
        birthDay: createUserDto.birthDay,
        latitude: createUserDto.latitude,
        longitude: createUserDto.longitude,
        role: createUserDto.role ?? UserRole.USER,
      });

    } catch (error) {
      // console.error('Supabase upload error:', error);
      // throw new Error('Error uploading images to Supabase');
      throw error;
    }

    // const user = this.usersRepository.create(createUserDto);

  }

  async createUser(registerUserDto: RegisterUserDto): Promise<UserEntity> {
    const user = this.usersRepository.create(registerUserDto);

    const hashedPassword = await bcrypt.hash(registerUserDto.passWord, 10);
    user.passWord = hashedPassword;

    const newuser = await this.usersRepository.save(user);
    return newuser;
  }

  // async Register(registerUserDto: RegisterUserDto): Promise<UserEntity> {
  //   // const user = this.usersRepository.create(createUserDto);
  //   return await this.usersRepository.save({
  //     fullName: registerUserDto.fullName,
  //     userName: registerUserDto.userName,
  //     email: registerUserDto.email,
  //     password: registerUserDto.passWord,
  //     phoneNumber: registerUserDto.phoneNumber,
  //     address: registerUserDto.address,
  //     // avatar: registerUserDto.avatar,
  //     birthday: registerUserDto.birthDay,
  //     role: UserRole.USER,
  //   });
  // }


  async findAll(): Promise<UserEntity[]> {
    return await this.usersRepository.find();
  }

  async findAllPagination(page: number, limit: number): Promise<[UserEntity[], number]> {
    const query = this.usersRepository.createQueryBuilder('user');
    query.skip((page - 1) * limit).take(limit);
    const [data, total] = await query.getManyAndCount();
    return [data, total];
  }

  async FilterPagination(page: number, limit: number, fullName: string, userName: string, email: string, phoneNumber: string, role: string, isActive: string): Promise<[UserEntity[], number]> {
    const query = this.usersRepository.createQueryBuilder('user');
    // let slug_search = this.toSlug(search);
    // console.log({ slug_search });
    // Nếu có search
    if (fullName && fullName.trim() !== '') {
      query.andWhere(`LOWER(user.fullName) LIKE :fullName`, { fullName: `%${fullName.toLowerCase()}%` });
    }
    if (userName && userName.trim() !== '') {
      // let slug_username = this.toSlug(userName);
      const normalizer = new StringNormalizerService();
      let slug_username = normalizer.normalize(userName);
      query.andWhere(`LOWER(user.userName) LIKE :userName`, { userName: `%${slug_username}%` });
    }
    if (email && email.trim() !== '') {
      query.andWhere(`LOWER(user.email) LIKE :email`, { email: `%${email.toLowerCase()}%` });
    }
    if (phoneNumber && phoneNumber.trim() !== '') {
      query.andWhere(`LOWER(user.phoneNumber) LIKE :phoneNumber`, { phoneNumber: `%${phoneNumber.toLowerCase()}%` });
    }
    if (role && role.trim() !== '') {
      query.andWhere(`LOWER(user.role) LIKE :role`, { role: `%${role.toLowerCase()}%` });
    }
    if (isActive && isActive.trim() !== '') {
      query.andWhere(`LOWER(user.isActive) LIKE :isActive`, { isActive: `%${isActive.toLowerCase()}%` });
    }
    // else {
    //   query.andWhere(`LOWER(user.isActive) LIKE :isActive`, { isActive: `%y%` });
    // }


    query.orderBy('user.userId', 'DESC');
    query.skip((page - 1) * limit).take(limit);

    const [dataUsers, total] = await query.getManyAndCount();
    return [dataUsers, total];
  }
  async findOne(id: number): Promise<UserEntity | null> {
    const user = await this.usersRepository.findOne({
      where: { userId: id },
    });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }
  async findOneUser(id: number): Promise<UserEntity | null> {
    return await this.usersRepository.findOne({
      where: { userId: id },
    });

  }

  findUserByEmail(email: string) {
    return this.usersRepository.findOne({ where: { email } });
  }
  findUserByUsername(userName: string) {
    return this.usersRepository.findOne({ where: { userName } });
  }
  async updatePassword(email: string, newPassword: string): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.passWord = hashedPassword;
    await this.usersRepository.update(user.userId, {
      passWord: hashedPassword,
    });
  }

  async updateActive(email: string): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    // user.isActive = true;
    await this.usersRepository.update(user.userId, {
      isActive: 'y',
    });
  }
  async validateUser(email: string, password: string) {
    const user = await this.findUserByEmail(email);
    if (user && (await bcrypt.compare(password, user.passWord)) && user.isActive === 'y') {
      return user;
    }
    return null;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<UserEntity | null> {

    const user = await this.usersRepository.findOne({
      where: { userId: id },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    await this.usersRepository.update(id, {
      fullName: updateUserDto.fullName,
      userName: updateUserDto.userName,
      email: updateUserDto.email,
      phoneNumber: updateUserDto.phoneNumber,
      address: updateUserDto.address,
      avatar: updateUserDto.avatar,
      birthDay: updateUserDto.birthDay,
      latitude: updateUserDto.latitude,
      longitude: updateUserDto.longitude,
      isActive: updateUserDto.isActive,
      role: updateUserDto.role,
    });
    return await this.usersRepository.findOne({ where: { userId: id } });
  }

  async getUserById(id: number | undefined): Promise<UserEntity | null> {
    const user = await this.usersRepository.findOne({
      where: { userId: id },
    });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async remove(id: number): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: { userId: id },
    });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    await this.usersRepository.delete(id);
  }
}
