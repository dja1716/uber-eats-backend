import { VerifyEmailOutput } from './dtos/verify-email.dto';
import { UserProfileOutput } from './dtos/user-profile.dto';
import { Verification } from './entities/verification.entity';
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile.dto';
import { JwtService } from './../jwt/jwt.service';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { CreateAccountInput, CreateAccountOutput } from './dtos/create-account.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Verification) private readonly verifications: Repository<Verification>,
    private readonly jwtService: JwtService,
  ) {
    //console.log(this.config.get('SECRET_KEY'))
  }

  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<CreateAccountOutput> {
    try {
      const exists = await this.users.findOne({ email });
      if (exists) {
        //make error
        return { ok: false, error: 'There is a user with that email already' };
      }
      const user = await this.users.save(this.users.create({ email, password, role }));
      await this.verifications.save(this.verifications.create({user}))
      return { ok: true };
    } catch (e) {
      // make error
      return { ok: false, error: "Couldn't create account" };
    }
  }

  async login({
    email,
    password,
  }: LoginInput): Promise<LoginOutput> {
    // find the user with the email
    //check if the password is correct
    // make a JWS and give it to the user

    try {
      const user = await this.users.findOne({ email }, {select: ['id', 'password']});
      if (!user) {
        return {
          ok: false,
          error: 'User not found',
        };
      }
      const passwordCorrect = await user.checkPassword(password);
      if (!passwordCorrect) {
        return {
          ok: false,
          error: 'Wrong password',
        };
      }
      const token = this.jwtService.sign(user.id);
      return {
        ok: true,
        token
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  async findById(id:number):Promise<UserProfileOutput> {
    try {
      const user = await this.users.findOne({id});
      if(user) {
        return {
          ok: true,
          user: user,
        };
      }
    } catch(error) {
      return {ok: false, error: 'User Not Found'};
    }
  }


  async editProfile(userId: number, {email, password} : EditProfileInput) : Promise<EditProfileOutput> {
    try {
      const user = await this.users.findOne(userId);
      if(email) {
        user.email = email;
        user.verified = false;
        await this.verifications.save(this.verifications.create({user}));
      }
      if(password) {
        user.password = password;
      }
      await this.users.save(user);
      return {
        ok: true,
      };
    } catch(error) {
      return {ok: false, error: 'Could not update profile.'};
    }
  }


  async verifyEmail(code:string): Promise<VerifyEmailOutput> {
    try {
      const verification = await this.verifications.findOne({code}, {relations: ['user']});
      if(verification) {
        verification.user.verified = true;
        await this.users.save(verification.user);
        await this.verifications.delete(verification.id);
        return {ok: true};
      }
      return {ok: false, error: 'Verification not found'};
    } catch(error) {
      return {ok: false, error};
    }
  }
}
