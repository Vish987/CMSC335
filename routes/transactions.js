const express = require('express');
const router = express.Router();

module.exports = (collection) => {
    router.get('/', async (req, res) => {
        try {
            const transactions = await collection.find().toArray();
            let table = "";
            let balance = 0;

            if (transactions.length > 0) {
                table += `
                <table>
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>Original Amount</th>
                            <th>Converted Amount (USD)</th>
                            <th>Type</th>
                            <th>Date, Time</th>
                        </tr>
                    </thead>
                    <tbody>`;

                for (const t of transactions) {
                    table += `
                    <tr>
                        <td>${t.description}</td>
                        <td>${t.originalAmount.toFixed(2)} ${t.originalCurrency}</td>
                        <td>${t.convertedAmount.toFixed(2)} USD</td>
                        <td>${t.type}</td>
                        <td>${new Date(t.date).toLocaleString()}</td>
                    </tr>`;

                    if (t.type === "Income") {
                        balance += t.convertedAmount;
                    } else if (t.type === "Expense") {
                        balance -= t.convertedAmount;
                    }
                }

                table += `</tbody></table>`;
            } else {
                table = "<p>No transactions available!</p>";
            }

            res.render('index', { balance: balance.toFixed(2), table });
        } catch (e) {
            console.error(e);
        }
    });

    router.get('/add', (req, res) => {
        res.render('add');
    });

    router.post('/add', async (req, res) => {
        try {
            const BASE_CURRENCY = 'USD';
            const { description, amount, type, currency } = req.body;
            const exchangeResult = await fetch(`https://api.currencyfreaks.com/latest?apikey=${process.env.API_KEY}`);
            const exchangeData = await exchangeResult.json();
            const rate = 1 / parseFloat(exchangeData.rates[currency]);
            const convertedAmount = parseFloat(amount) * rate;

            const transaction = {
                description,
                originalAmount: parseFloat(amount),
                convertedAmount,
                originalCurrency: currency,
                convertedCurrency: BASE_CURRENCY,
                type,
                date: new Date()
            };

            await collection.insertOne(transaction);
            res.redirect('/');
        } catch (e) {
            console.error(e);
        }
    });

    router.post('/reset', async (req, res) => {
        try {
            await collection.deleteMany({});
            res.redirect('/');
        } catch (e) {
            console.error(e);
        }
    });

    return router;
}