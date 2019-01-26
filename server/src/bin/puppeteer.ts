import puppeteer, { Page, Browser } from 'puppeteer';
import fs from 'fs';

interface Pizza {
  name: string;
  weight: number; // in grams
  price: number; // in euros
  toppings: string[];
  allergens: string[];
}

interface Address {
  city: string;
  street: string;
  zipCode: string;
}

interface Rating {
  reviewsTotal: number;
  average: number;
}

interface PizzeriaInfo {
  name: string;
  address: Address;
  rating: Rating;
  minOrderPrice: number;
  minDeliveryTime: number; // in minutes
  pizzas: Pizza[];
  // deliveryStartTime: string; // HH:mm ?
  // openingHours?: any; // Todo: save also opening hours
}

const getPizzeriaUrlsForCity = async (city: string, page: Page): Promise<string[]> => {
  await page.goto(`https://www.bistro.sk/donaska-pizza/${city}/`, {waitUntil: 'load', timeout: 0});

  const pizzeriaUrls = await page.evaluate(async () => {
    return Array.from(
      document.querySelectorAll('a.long-name')
    ).map(element => element.getAttribute('href'));
  });

  await page.close();

  return pizzeriaUrls;
};

const getPizzeriaInfo = async (pizzeriaUrl: string, browser: Browser): Promise<PizzeriaInfo> => {
  const page = await browser.newPage();
  await page.goto(pizzeriaUrl, {timeout: 0});

  const pizzeria = await page.evaluate((): PizzeriaInfo => {
    const infoSection = document.querySelector('div.info');
    const name = infoSection.querySelector('h1').textContent;
    const addressRegex = new RegExp(/(.+),\s(.+)\s(.+)/); // captures street, zipCode and city from `Opletalova 84, 84107 Bratislava`

    const addressMatch = infoSection.querySelector('.address').textContent.match(addressRegex);
    let street, zipCode, city;
    if (addressMatch) {
      [, street, zipCode, city] = addressMatch;
    }

    const reviewSection = document.querySelector('#rating');
    const averageRating = parseFloat(reviewSection.querySelector('.grade > strong').textContent);
    const reviewsTotal = parseInt(reviewSection.querySelector('.text > a').textContent);

    const deliverySection = infoSection.querySelector('.delivery');
    const minOrderPrice = parseFloat(
      deliverySection.querySelector('#minimal_price > strong').textContent.replace(',', '.')
    );

    // parses number from ` od 75 min.`);
    const deliveryTimeElement = deliverySection.querySelector('#delivery_time > strong');
    const deliveryTimeMatch = deliveryTimeElement && deliveryTimeElement.textContent.match(/.*\s(\d.)/);
    const minDeliveryTime = deliveryTimeMatch && parseInt(deliveryTimeMatch[1]);

    const pizzas = Array.from(document.querySelectorAll('.productAddLink'))
      .map(productRow => {
        const nameSection = productRow.querySelector('.name');
        const rawName = nameSection.querySelector('strong').textContent;
        const nameMatch = rawName.match(/\d*(\.\s)*(.*Pizza.+)/); // select pizza name without its number at the beginning
        // product is not pizza
        if (!nameMatch) {
          return null;
        }
        const parsedPizzaName = nameMatch[nameMatch.length - 1];
        // array of allergen ids from `(1,3,7)`
        const allergensElement = nameSection.querySelector('.allergens');
        const allergens = allergensElement ? allergensElement.textContent.slice(1, -1).split(',') : [];
        const [weight, ...toppings] = nameSection.querySelector('.desc').textContent.split(', ');
        const price = parseFloat(productRow.querySelector('.price').textContent.replace(',', '.'));
        return {
          name: parsedPizzaName,
          weight: parseInt(weight),
          price,
          toppings,
          allergens,
        };
      })
      // remove non-pizza products and duplicates
      .filter((pizza, i, allPizzas) => {
        const allPizzasCopy = [...allPizzas];
        allPizzasCopy.splice(i, 1);
        return pizza && !allPizzasCopy.find(p => p && p.name === pizza.name);
      });

    return {
      name,
      address: {
        street,
        zipCode,
        city,
      },
      rating: {
        average: averageRating,
        reviewsTotal,
      },
      minOrderPrice,
      minDeliveryTime,
      pizzas,
    };
  });

  await page.close();

  return pizzeria;
};

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const allPizzeriasInCityUrls = await getPizzeriaUrlsForCity('zilina', page);

  const promises = allPizzeriasInCityUrls.map(async (url) => {
    const info = await getPizzeriaInfo(url, browser);
    return info;
  });

  const allPizzeriasInCity = await Promise.all(promises);

  fs.writeFile('./results.json', JSON.stringify({pizzerias: allPizzeriasInCity}, null, 4), async () => {
    await browser.close();
  });

})();
