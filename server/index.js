import app from './app.js';
import { info } from './utils/logger.js';
import { PORT } from './utils/config.js';

app.listen(PORT, () => {
  info(`Server is running on port ${PORT}`);
});
