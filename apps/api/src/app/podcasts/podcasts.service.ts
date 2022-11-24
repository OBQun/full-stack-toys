import { CursorBasedPaginationInput } from '@full-stack-toys/dto';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { forkJoin, from, map } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';

const PODCAST_INCLUDE_AUTHORS_ARG: Prisma.PodcastAuthorFindManyArgs = {
  include: {
    author: {
      select: {
        id: true,
        name: true,
        profile: true,
        status: true,
      },
    },
  },
};

@Injectable()
export class PodcastsService {
  constructor(private prisma: PrismaService) {}

  getPaginatedPodcasts(
    { cursor, limit = 5 }: CursorBasedPaginationInput,
    relations: string[],
    where?: Prisma.PodcastWhereInput,
    orderBy: Prisma.PodcastOrderByWithAggregationInput = { id: 'desc' }
  ) {
    return forkJoin([
      from(
        this.prisma.podcast.findMany({
          skip: cursor ? 1 : 0,
          take: limit + 1,
          where,
          orderBy,
          include: {
            authors:
              relations.includes('authors') && PODCAST_INCLUDE_AUTHORS_ARG,
            tags: relations.includes('tags') && {
              include: {
                tag: true,
              },
            },
          },
        })
      ),
      from(this.prisma.podcast.count({ where })),
    ]).pipe(
      map(([nodes, totalCount]) => ({
        nodes: nodes.slice(0, limit),
        hasNextPage: !!nodes[limit + 1],
        totalCount,
      }))
    );
  }
}
