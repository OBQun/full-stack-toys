import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { catchError, from, map, pipe } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';

/**
 * 对用户信息进行脱敏的 rxjs 管道
 */
const desensitize = () => pipe(map(({ hash: _, ...user }: User) => user));
@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  /**
   * 创建用户
   * @param user 用户基础信息
   * @returns 脱敏用户信息
   */
  createUser(user: Pick<User, 'email' | 'name'> & { hash?: User['hash'] }) {
    return from(
      this.prisma.user.create({
        data: {
          ...user,
        },
      })
    ).pipe(
      catchError((err) => {
        if (err instanceof PrismaClientKnownRequestError) {
          // P2002 为 prisma 的 unique 规则报错
          if (err.code === 'P2002')
            throw new UnprocessableEntityException('邮箱已注册');
        }
        throw err;
      }),
      desensitize()
    );
  }

  /**
   * 根据用户 id 获取用户
   * @param id
   * @returns 脱敏用户信息
   */
  getUserById(id: User['id']) {
    return from(
      this.prisma.user.findUnique({
        where: {
          id,
        },
      })
    ).pipe(desensitize());
  }

  /**
   * 根据邮箱获取指定用户信息 (用于账号密码登陆校验)
   * @param email
   * @returns 用户 id 和 hash
   */
  getUserByEmail(email: User['email']) {
    return from(
      this.prisma.user.findUnique({
        where: {
          email,
        },
        select: {
          hash: true,
          id: true,
        },
      })
    );
  }
}
