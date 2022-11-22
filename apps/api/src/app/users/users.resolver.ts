import { User } from '@full-stack-toys/dto';
import { UseGuards } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';
import { JwtAuthGuard } from '../auth/guard';
import { CurrentUserId } from './get-user.decorator';
import { UsersService } from './users.service';

@Resolver(() => User)
export class UsersResolver {
  constructor(private userService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Query(() => User)
  me(@CurrentUserId() userId: User['id']) {
    return this.userService.findOne(userId);
  }
}
