import puppeteer from 'puppeteer';

import { initDbConnection } from 'src/db-connection';
import Pizzeria from 'src/entities/pizzeria';
import Pizza from 'src/entities/pizza';
import Allergen from 'src/entities/allergen';
import Topping from 'src/entities/topping';

import { getPizzeriaUrlsForCity, getPizzeriaInfo, getAllergens } from './helpers';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const dbConnection = await initDbConnection();

  const allPizzeriasInCityUrls = await getPizzeriaUrlsForCity('zilina', page);
  const aPage = await browser.newPage();
  const pizzaAllergens = await getAllergens(allPizzeriasInCityUrls[0], aPage);

  const allergenRecords = Object.keys(pizzaAllergens).map(allergenId => {
    const allergenRecord = new Allergen();
    allergenRecord.id = allergenId;
    allergenRecord.title = pizzaAllergens[allergenId];
    return allergenRecord;
  });

  await dbConnection.manager.save(allergenRecords);
  console.log('Allergens have been saved.');

  const promises = allPizzeriasInCityUrls.slice(0, 10).map(async (url) => {
    return await getPizzeriaInfo(url, browser);
  });
  const allPizzeriasInCity = await Promise.all(promises);
  browser.close();

  const allPizzeriaRecords: Pizzeria[] = [];

  allPizzeriasInCity.map(pizzeriaInfo => {
    const pizzeriaRecord = new Pizzeria();
    pizzeriaRecord.name = pizzeriaInfo.name;
    pizzeriaRecord.minDeliveryTime = pizzeriaInfo.minDeliveryTime;
    pizzeriaRecord.minOrderPrice = pizzeriaInfo.minOrderPrice;
    pizzeriaRecord.ratingAverage = pizzeriaInfo.ratingAverage;
    pizzeriaRecord.reviewsTotal = pizzeriaInfo.reviewsTotal;

    pizzeriaRecord.pizzas = pizzeriaInfo.pizzas.map(pizza => {
      const pizzaRecord = new Pizza();
      pizzaRecord.name = pizza.name;
      pizzaRecord.price = pizza.price;
      pizzaRecord.weight = pizza.weight;

      pizzaRecord.allergens = pizza.allergens.map(allergenId => {
        const allergenRecord = new Allergen();
        allergenRecord.id = allergenId;
        allergenRecord.title = pizzaAllergens[allergenId];
        return allergenRecord;
      });

      pizzaRecord.toppings = [...new Set(pizza.toppings)] // get only unique toppings
        .filter(topping => topping && topping.length <= 64)
        .map(topping => {
          const toppingRecord = new Topping();
          toppingRecord.name = topping;
          return toppingRecord;
        });

        return pizzaRecord;
      });

      allPizzeriaRecords.push(pizzeriaRecord);
  });

  return dbConnection.manager
    .save(allPizzeriaRecords)
    .then(() => {
        console.log('Pizzerias have been saved.');
    });

})();
