# customer_service_handler

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

To Run server for development:

```bash
$env:NGROK_AUTHTOKEN = "2nGsUeFbiYyB7fBbON2YgQ6v3KB_cvd1NG1dvuHgb5ykAJry"; bun run index.ts  
```

to test server:

```bash
Invoke-RestMethod -Uri "https://2e50-2600-8807-4840-de30-b47b-6f31-2fe1-1c46.ngrok-free.app/webhook" -Method Post -Body "bla bla"
```

This project was created using `bun init` in bun v1.1.30. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
