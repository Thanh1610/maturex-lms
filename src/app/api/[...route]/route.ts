import { Readable } from "node:stream";
import { type NextRequest, NextResponse } from "next/server";
import { getAppInstance } from "@/../server/next-backend";

export const dynamic = "force-dynamic";

const readRequestBody = async (req: NextRequest): Promise<Buffer | null> => {
  const method = req.method;
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    return null;
  }
  try {
    const arrayBuffer = await req.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch {
    return null;
  }
};

const extractHeaders = (req: NextRequest): Record<string, string> => {
  const headers: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    headers[key.toLowerCase()] = value;
  });

  const expectedOrigin = process.env.APP_ORIGIN || "http://localhost:3000";
  const expectedHost = new URL(expectedOrigin).host;
  headers.host = expectedHost;
  if (headers.origin) {
    headers.origin = expectedOrigin;
  }
  return headers;
};

const handleRequest = async (req: NextRequest) => {
  const { server } = getAppInstance();
  const url = new URL(req.url);
  const path = url.pathname + url.search;
  const method = req.method;
  const bodyBuffer = await readRequestBody(req);
  const headers = extractHeaders(req);

  return new Promise<Response>((resolvePromise) => {
    const mockReq = new Readable({
      read() {
        if (bodyBuffer && bodyBuffer.length > 0) {
          this.push(bodyBuffer);
        }
        this.push(null);
      },
    }) as any;

    mockReq.url = path;
    mockReq.method = method;
    mockReq.headers = headers;
    mockReq.socket = { remoteAddress: "127.0.0.1" };

    const responseHeaders = new Headers();
    const responseChunks: Buffer[] = [];
    const responseState = { status: 200 };

    const mockRes: any = {
      setHeader(name: string, value: any) {
        if (name.toLowerCase() === "set-cookie") {
          const cookies = Array.isArray(value) ? value : [String(value)];
          for (const cookie of cookies) {
            responseHeaders.append("set-cookie", cookie);
          }
        } else {
          responseHeaders.set(name, String(value));
        }
      },
      getHeader(name: string) {
        return responseHeaders.get(name);
      },
      writeHead(status: number, headersObj?: Record<string, any>) {
        responseState.status = status;
        if (headersObj) {
          for (const [key, val] of Object.entries(headersObj)) {
            mockRes.setHeader(key, val);
          }
        }
      },
      write(chunk: any) {
        if (chunk) {
          responseChunks.push(
            Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk),
          );
        }
      },
      end(chunk?: any) {
        if (chunk) {
          responseChunks.push(
            Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk),
          );
        }
        const body = Buffer.concat(responseChunks);
        resolvePromise(
          new NextResponse(body, {
            status: responseState.status,
            headers: responseHeaders,
          }),
        );
      },
      headersSent: false,
    };

    (server as any).emit("request", mockReq, mockRes);
  });
};

export {
  handleRequest as GET,
  handleRequest as POST,
  handleRequest as PUT,
  handleRequest as DELETE,
  handleRequest as PATCH,
  handleRequest as HEAD,
  handleRequest as OPTIONS,
};
