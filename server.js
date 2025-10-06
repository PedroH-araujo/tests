const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080; 

const searchRoutes = require('./routes/router');

app.use(express.json());

app.use('/', searchRoutes); 

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 Servidor rodando na porta ${PORT}`);
    });
}

module.exports = app;