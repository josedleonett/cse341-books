import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger.json' with { type: 'json' };
import router from './src/router.js';

const app = express();

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

/**
 * @openapi
 * /:
 *   get:
 *     summary: Check whether the Books API is running
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: API health message returned successfully
 */
app.get('/', (req, res) => {
  return res.status(200).json({ message: 'Books API is running.' });
});

app.use('/', router);

export default app;
