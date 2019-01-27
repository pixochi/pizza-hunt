import puppeteer from 'puppeteer';
// import fs from 'fs';
import Pizzeria from 'src/entities/pizzeria';

import { getPizzeriaUrlsForCity, getPizzeriaInfo } from './helpers';
import { initDbConnection } from 'src/db-connection';
import Pizza from 'src/entities/pizza';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const allPizzeriasInCityUrls = await getPizzeriaUrlsForCity('zilina', page);

  const promises = allPizzeriasInCityUrls.map(async (url) => {
    const info = await getPizzeriaInfo(url, browser);
    return info;
  });

  const allPizzeriasInCity = await Promise.all(promises);
  browser.close();
  const dbConnection = await initDbConnection();

  // fs.writeFile('./results.json', JSON.stringify({pizzerias: allPizzeriasInCity}, null, 4), async () => {
        const allPizzeriaRecords: Pizzeria[] = [];

        allPizzeriasInCity.map(pizzeriaInfo => {
          let pizzeria = new Pizzeria();
          pizzeria.name = pizzeriaInfo.name;
          pizzeria.minDeliveryTime = pizzeriaInfo.minDeliveryTime;
          pizzeria.minOrderPrice = pizzeriaInfo.minOrderPrice;
          pizzeria.ratingAverage = pizzeriaInfo.ratingAverage;
          pizzeria.reviewsTotal = pizzeriaInfo.reviewsTotal;
          pizzeria.pizzas = pizzeriaInfo.pizzas.map(pizza => {
            const pizzaRecord = new Pizza();
            pizzaRecord.name = pizza.name;
            pizzaRecord.price = pizza.price;
            pizzaRecord.weight = pizza.weight;
            return pizzaRecord;
          });
          allPizzeriaRecords.push(pizzeria);
        });

        return dbConnection.manager
          .save(allPizzeriaRecords)
          .then(result => {
              console.log('Pizzerias have been saved.', result);
          });

  // });

})();
