const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());
// middleware



// root api
app.get('/', (req, res) => {
    res.send("Learn Ease Running Successfully");
});
// root api

app.listen(port, () => {
    console.log(`Learn Ease Running On Port ${port}`);
})

