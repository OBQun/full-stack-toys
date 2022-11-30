import { Field, InputType, Int } from '@nestjs/graphql';
import { IsString, ValidateIf } from 'class-validator';
import { SortOrder } from '../common';

@InputType({ description: '播客列表查询条件' })
export class PodcastWhereInput {
  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @Field({ nullable: true })
  keyword?: string;

  @Field(() => [Int], { nullable: true })
  tags: number[];

  @Field(() => [Int], { nullable: true })
  authors: number[];

  @Field(() => [Date], { nullable: 'itemsAndList' })
  publishedDate: [Date?, Date?];

  @Field({ nullable: true, defaultValue: true })
  published: boolean;
}

@InputType()
export class PodcastOrderByInput {
  @Field(() => SortOrder, { nullable: true })
  publishedAt: SortOrder;
}
