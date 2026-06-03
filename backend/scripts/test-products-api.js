require('dotenv').config();
const { getProducts } = require('../src/controllers/productController');

getProducts(
  { query: {} },
  {
    json: (data) => {
      console.log('SUCCESS', Array.isArray(data) ? data.length : data);
      process.exit(0);
    },
    status: (code) => ({
      json: (err) => {
        console.log('STATUS', code, err);
        process.exit(1);
      },
    }),
  },
  () => {}
).catch((e) => {
  console.error('THROW', e);
  process.exit(1);
});
