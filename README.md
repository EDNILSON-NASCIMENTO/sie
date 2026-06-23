# sie / AhLembrei

Sistema de Identificacao de Emergencia (SIE) via QR Code para [ahlembrei.com.br](https://ahlembrei.com.br/).

## Estrutura

- `frontend/`: Angular (landing + pagina de emergencia + etiqueta QR)
- `backend/`: API Java Spring Boot (`/api`)

## URLs do sistema

| Ambiente | Front | API |
|----------|-------|-----|
| Local | http://localhost:4200 | http://localhost:3000/api |
| Producao | https://ahlembrei.com.br | https://ahlembrei.com.br/api |

### Rotas do front

- `/` — landing AhLembrei
- `/e/:userId` — pagina de emergencia (QR Code)
- `/etiqueta/:userId` — impressao de etiqueta temporaria

Exemplo demo: `https://ahlembrei.com.br/e/ednilson_123`

## Rodando localmente

### Backend

```powershell
$env:JAVA_HOME = "C:\Users\T14\.p2\pool\plugins\org.eclipse.justj.openjdk.hotspot.jre.full.win32.x86_64_17.0.8.v20230831-1047\jre"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"

cd backend
mvn spring-boot:run
```

### Frontend

```powershell
cd frontend
npm install
npm start
```

## SMS de teste (Twilio)

Copie o arquivo de exemplo e preencha suas credenciais:

```powershell
cd backend
copy .env.example .env
```

Edite `backend/.env`:

```properties
twilio.account-sid=seu_account_sid
twilio.auth-token=seu_auth_token
twilio.from-number=+1xxxxxxxxxx
```

O backend carrega esse arquivo automaticamente ao iniciar (`mvn spring-boot:run`).

Contato de teste cadastrado: `+5511960652530`

Sem credenciais Twilio, o backend funciona em modo simulacao (log no console).

**Importante:** nunca commite o arquivo `.env` (ele ja esta no `.gitignore`).

## API

### GET `/api/usuarios/{userId}`

Retorna perfil publico de emergencia.

### POST `/api/sos/disparar`

```json
{
  "userId": "ednilson_123",
  "latitude": -23.5505,
  "longitude": -46.6333
}
```

## Deploy em ahlembrei.com.br

1. Build do front: `cd frontend && npm run build`
2. Publicar conteudo de `frontend/dist/frontend/browser/` na raiz do dominio
3. Subir backend Java na porta interna 3000
4. Configurar reverse proxy (Nginx/Apache):
   - `/` → arquivos estaticos do Angular
   - `/api/` → `http://localhost:3000/api/`
5. Configurar variaveis Twilio no servidor
