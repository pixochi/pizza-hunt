import {Field, ID, ObjectType} from 'type-graphql';
import {Entity, PrimaryGeneratedColumn, Column, ManyToMany} from 'typeorm';

import Pizza from 'src/entities/pizza';

@Entity()
@ObjectType()
export default class Topping {

  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: string;

  @Field()
  @Column({length: 64})
  name: string;

  @Field(() => Pizza)
  @ManyToMany(type => Pizza, pizza => pizza.toppings)
  pizzas: Pizza[];
}