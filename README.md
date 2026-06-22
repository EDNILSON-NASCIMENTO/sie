# sie
Sistema de Identificação de Emergência (SIE) via QR Code

## Estrutura

- `frontend/`: aplicação Angular para exibição dos dados e acionamento SOS.
- `backend/`: API Java Spring Boot para processar `/sos/disparar`.

## Rodando o backend (Java)

Pré-requisitos:
- Java 17+
- Maven 3.9+

Comandos:

```bash
cd backend
mvn spring-boot:run
```

API:
- `POST http://localhost:3000/sos/disparar`
- Body JSON:

```json
{
  "userId": "ednilson_123",
  "latitude": -23.5505,
  "longitude": -46.6333
}
```
