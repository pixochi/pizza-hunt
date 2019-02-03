import {Field, ObjectType, ID} from 'type-graphql';
import {Entity, ManyToMany, PrimaryColumn, Column} from 'typeorm';

import Pizza from 'src/entities/pizza';

@Entity()
@ObjectType()
export default class Allergen {

  @Field(() => ID)
  @PrimaryColumn()
  id: string;

  @Field()
  @Column()
  title: string;

  @Field(() => Pizza)
  @ManyToMany(() => Pizza, pizza => pizza.allergens)
  pizzas: Pizza[];
}