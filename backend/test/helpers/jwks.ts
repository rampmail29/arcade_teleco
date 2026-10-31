/**
 * Servidor JWKS falso para pruebas: genera un par de llaves EC real,
 * lo sirve por HTTP como lo haría Supabase en
 * /auth/v1/.well-known/jwks.json, y firma tokens de prueba con la
 * llave privada. Así requireAuth se prueba con su código real
 * (createRemoteJWKSet haciendo un fetch de verdad), sin pegarle a la
 * red ni depender de Supabase en los tests.
 */
import { createServer, type Server } from 'node:http';
import { generateKeyPair, exportJWK, SignJWT, type JWK } from 'jose';

const KID = 'test-key';
const ALG = 'ES256';

export interface TestJwksServer {
  url: string;
  signToken(email: string): Promise<string>;
  close(): Promise<void>;
}

export async function startTestJwksServer(): Promise<TestJwksServer> {
  const { publicKey, privateKey } = await generateKeyPair(ALG);
  const jwk: JWK = { ...(await exportJWK(publicKey)), kid: KID, alg: ALG, use: 'sig' };

  const server: Server = createServer((_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ keys: [jwk] }));
  });

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 0;

  return {
    url: `http://127.0.0.1:${port}`,
    async signToken(email: string): Promise<string> {
      return new SignJWT({ email })
        .setProtectedHeader({ alg: ALG, kid: KID })
        .setIssuedAt()
        .setExpirationTime('1h')
        .sign(privateKey);
    },
    close(): Promise<void> {
      return new Promise((resolve) => server.close(() => resolve()));
    },
  };
}
