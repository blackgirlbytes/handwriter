# handwriter

Run the app with:

```bash
OPENAI_API_KEY=your_key_here npm start
```

Then open [http://localhost:3000](http://localhost:3000).

`Draw` mode still uses the browser stroke recognizer. `Upload Image` now sends the image to the local server, which uses the OpenAI Responses API with image input to read handwriting from photos.
