import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { SignupDto, UserRole } from './dto/Signup.dto';
import { User } from './entities/users.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

    async CreateUser(userData: SignupDto): Promise<any> {
        const payload = userData;

      
    // 1. Prevent public users from registering as ADMIN.
    if (payload.role === UserRole.ADMIN) {
      throw new ForbiddenException(
        'Admin accounts must be created by an authorized administrator.',
      );
    }

    // 2. Check whether the email already exists.
    const existingUser = await this.userRepository.findOne({
      where: { email: payload.email },
    });
    if (existingUser) {
      throw new ForbiddenException('Email already exists.');
    }

    const hashedPassword = await bcrypt.hash(payload.password, 10); 

    const newUser = this.userRepository.create({
      GUID: randomUUID(), // Generate a unique GUID for the user  
      name: payload.name,
      email: payload.email,
      password: hashedPassword, // Store the hashed password
      role: payload.role,
      Vehicle_number: payload.Vehicle_number ||'',
      drivingLicenseNumber: payload.drivingLicenseNumber || null,

      stationName: payload.stationName || null,
      phone: payload.phone || null,
    });

   try {
      await this.userRepository.save(newUser);
    } catch (error: unknown) {
      // Handle a duplicate email if concurrent requests race.
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'EREQUEST'
      ) {
        // SQL Server errors can vary; see the note below.
      }

      throw error;
    }

    // 6. Return a success message, not the password or entity.
    return `User ${payload.name} with email ${payload.email} has been successfully registered.`;
    }
}
