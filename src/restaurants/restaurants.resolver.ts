import { Resolver, Query, Args } from '@nestjs/graphql';
import { Restaurant } from './entities/restaurant.entity';

@Resolver((of) => Restaurant)
export class RestaurantResolver {
  @Query((returns) => [Restaurant])
  restuarants(@Args('veganOnly') veganOnly: boolean): Restaurant[] {
    return [];
  }
}
