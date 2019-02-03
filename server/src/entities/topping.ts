import {Field, ObjectType} from 'type-graphql';
import {Entity, ManyToMany, PrimaryColumn} from 'typeorm';

import Pizza from 'src/entities/pizza';

@Entity()
@ObjectType()
export default class Topping {

  @Field()
  @PrimaryColumn({length: 64})
  name: string;

  @Field(() => Pizza)
  @ManyToMany(() => Pizza, pizza => pizza.toppings)
  pizzas: Pizza[];
}