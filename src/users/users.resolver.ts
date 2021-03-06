import { VerifyEmailInput, VerifyEmailOutput } from './dtos/verify-email.dto';
import { EditProfileOutput, EditProfileInput } from './dtos/edit-profile.dto';
import { AuthGuard } from './../auth/auth.guard';
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { LoginOutput, LoginInput } from './dtos/login.dto';
import { UseGuards } from '@nestjs/common';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { UserProfileInput, UserProfileOutput } from './dtos/user-profile.dto';

@Resolver((of) => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query((returns) => Boolean)
  hi() {
    return true;
  }

  @Mutation((returns) => CreateAccountOutput)
  async createAccount(
    @Args('input') createAccountInput: CreateAccountInput,
  ): Promise<CreateAccountOutput> {
    return this.usersService.createAccount(createAccountInput);
  }

  @Mutation((returns) => LoginOutput)
  async login(@Args('input') loginInput: LoginInput): Promise<LoginOutput> {
    return this.usersService.login(loginInput);
  }

  @Query(returns => User)
  @UseGuards(AuthGuard)
  me(@AuthUser() user: User
  ) {
    return user;
  }

  @UseGuards(AuthGuard)
  @Query(returns => UserProfileOutput)
  async userProfile(@Args() userProfileInput: UserProfileInput): Promise<UserProfileOutput> {
    return this.usersService.findById(userProfileInput.userId);
  }


  @UseGuards(AuthGuard)
  @Mutation(returns => EditProfileOutput)
  async editProfile(@AuthUser() authUser: User, @Args('input') editProfileInput : EditProfileInput): Promise<EditProfileOutput> {
    return this.usersService.editProfile(authUser.id, editProfileInput);
  }


  @Mutation(returns => VerifyEmailOutput)
  verifyEmail(@Args('input') {code}: VerifyEmailInput) : Promise<VerifyEmailOutput> {
    return this.usersService.verifyEmail(code);
  }
}
