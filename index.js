import express from 'express';
import ejs from 'ejs'
import { createHash } from 'crypto';

const app = express();
app.use(express.json());

app.post('/render', (req, res) => {
    try {
        const parsed = render(req.body);
        if (!parsed) res.status(400).send();
        else res.json({ parsed  });
    } catch (exception) { res.status(500).send(); }

});

const render = (body) => {
    // Check if the required values are provided
    const { accessToken, template, data, layout } = body;
    if (!accessToken || !template || !data) return null;

    // Check if the api is matching. Basically get the first 32 accessToken, that is a random string
    // example:
    //      random: AL8ePBtk9z9PxqARdeAXC4TsnsV9xyry
    //      api_key: mh5nDHvSf8cUbDWgThbGFx2pn2GhyJh7,
    //      hash: 107c8ee4749bd45d9176be57e8ebbdd3420ef6eb63c3ed07e95ec480e07e11da
    //      accessToken: AL8ePBtk9z9PxqARdeAXC4TsnsV9xyry107c8ee4749bd45d9176be57e8ebbdd3420ef6eb63c3ed07e95ec480e07e11da
    const source = accessToken.substring(0, 32) + process.env.API_KEY;
    const hash = createHash('sha256').update(source).digest('hex');
    if(hash !== accessToken.substring(32)) return null;

    // Now render the template using ejs.
    let rendered = ejs.render(template, data);
    if(layout) rendered = ejs.render(layout, { content: rendered});
    return rendered;
}

app.listen(3000, () => { console.log('Listening on port 3000!');});
