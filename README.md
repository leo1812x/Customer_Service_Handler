# CUSTOMER SERVICE HANDLER

## FOR DEVELOPMENT

### start ngrook for twilio
```bash
ngrok http --url https://creative-probable-tomcat.ngrok-free.app 80
```
### start serveo for instagram API
```bash
ssh -R 80:localhost:8080 serveo.net
```
- for every iteration, it is required to add the new http link created by serveo to the Instagram webhook configuration

then you can finally:
### Start local server
```bash
bun index.ts
```


This project was created using `bun init` in bun v1.1.30. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.