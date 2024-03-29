import {Field, ID, ObjectType} from 'type-graphql';
import {Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, ManyToOne} from 'typeorm';

import Topping from 'src/entities/topping';
import Allergen from 'src/entities/allergen';
import Pizzeria from 'src/entities/pizzeria';

@Entity()
@ObjectType()
export default class Pizza {

  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: string;

  @Field()
  @Column({length: 64})
  name: string;

  @Field()
  @Column('int2', {nullable: true})
  weight: number;

  @Field()
  @Column('numeric', {precision: 7, scale: 2})
  price: number;

  @Field(() => Pizzeria)
  @ManyToOne(type => Pizzeria, pizzeria => pizzeria.pizzas)
  pizzeria: Pizzeria;

  @Field(() => Topping)
  @ManyToMany(type => Topping, topping => topping.pizzas, {cascade: ['insert']})
  @JoinTable({name: 'pizza_topping'})
  toppings: Topping[];

  @Field(() => Allergen)
  @ManyToMany(type => Allergen, allergen => allergen.pizzas, {cascade: ['insert'], nullable: true})
  @JoinTable({name: 'pizza_allergen'})
  allergens: Allergen[];
}