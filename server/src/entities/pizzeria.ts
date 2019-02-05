import {Field, ID, ObjectType} from 'type-graphql';
import {Entity, PrimaryGeneratedColumn, Column, OneToMany} from 'typeorm';

import Pizza from 'src/entities/pizza';

@Entity()
@ObjectType()
export default class Pizzeria {

  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: string;

  @Field()
  @Column({length: 64})
  name: string;

  @Field()
  @Column('numeric', {precision: 4, scale: 2, nullable: true})
  ratingAverage: number;

  @Field()
  @Column('int4', {nullable: true})
  reviewsTotal: number;

  @Field()
  @Column('numeric', {precision: 5, scale: 2, nullable: true, default: 0})
  minOrderPrice: number;

  @Field()
  @Column('int2', {nullable: true})
  minDeliveryTime: number;

  @Field()
  @Column({length: 128, nullable: true})
  street: string;

  @Field()
  @Column({nullable: true})
  zipCode: string;

  @Field()
  @Column({length: 128, nullable: true})
  city: string;

  @Field(() => Pizza)
  @OneToMany(type => Pizza, pizza => pizza.pizzeria, {cascade: true})
  pizzas: Pizza[];
}