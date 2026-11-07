import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger.json' with { type: 'json' };
import router from './src/router.js';

const app = express();

app.use(express.json());
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

app.use((error, req, res, next) => {
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Invalid JSON request body' });
  }

  return next(error);
});

export default app;
