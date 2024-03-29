import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Podcast } from '../podcast';

@ObjectType()
export class Tag {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => [Podcast], { nullable: true })
  podcasts?: Podcast[];
}
