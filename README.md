# handwriter

Create a `.env` file from `.env.example` and add your key:

```bash
cp .env.example .env
```

Then run the app with:

```bash
npm start
```

Then open [http://localhost:3000](http://localhost:3000).

`Draw` mode still uses the browser stroke recognizer. `Upload Image` now sends the image to the local server, which uses the OpenAI Responses API with image input to read handwriting from photos.
