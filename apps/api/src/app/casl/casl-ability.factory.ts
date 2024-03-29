import { AbilityBuilder, PureAbility } from '@casl/ability';
import { createPrismaAbility, PrismaQuery, Subjects } from '@casl/prisma';
import { Injectable } from '@nestjs/common';
import { Podcast, Post, Role, Tag, User } from '@prisma/client';

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

export type AppAbility = PureAbility<
  [
    Action,
    Subjects<{ User: User; Podcast: Podcast; Post: Post; Tag: Tag }> | 'all'
  ],
  PrismaQuery
>;
@Injectable()
export class CaslAbilityFactory {
  createAbility(user?: Pick<User, 'id' | 'role'>) {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(
      createPrismaAbility
    );

    can(Action.Read, 'Podcast', { published: true });
    can(Action.Read, 'Post', { published: true });
    can(Action.Read, 'User', ['id', 'name', 'profile', 'status', 'role']);

    if (user) {
      can(Action.Read, 'User', ['username'], { id: user.id });

      can(Action.Update, 'User', ['profile', 'status', 'name'], {
        id: user.id,
      });

      can([Action.Read, Action.Update], 'Podcast', {
        authors: { some: { authorId: { equals: user.id } } },
      });

      if (user.role === Role.Admin) {
        can([Action.Update, Action.Read], 'User', [
          'role',
          'username',
          'inviteCode',
        ]);
        can(Action.Manage, 'all', ['all']);
      }
    }

    return build();
  }
}
