# customer_service_handler

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

## To Run server for development:
### run server
```bash
$env:NGROK_AUTHTOKEN = "2nGsUeFbiYyB7fBbON2YgQ6v3KB_cvd1NG1dvuHgb5ykAJry"; bun run index.ts  
```
### start program
```bash
bun twilo_handler.ts
```
## Method 2 to run server with development
this method uses a ngrook static domain
### run server
```bash
ngrok http --url=profound-bull-notable.ngrok-free.app 80
```
### start program
```bash
bun ./index.ts
```


then copy the acces code and paste it on codesanbox box


This project was created using `bun init` in bun v1.1.30. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
