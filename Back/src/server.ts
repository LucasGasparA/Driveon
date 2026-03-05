import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from '../src/routes/index.ts';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(routes);

app.get('/', (_, res) => res.send('API DriveOn funcionando'));

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`🚀 Servidor rodando em http://localhost:${port}`));
