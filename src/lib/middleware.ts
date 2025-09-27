import { NextRequest } from 'next/server'
import { verifyToken, extractTokenFromHeader, type JWTPayload } from './auth'

export interface AuthenticatedRequest extends NextRequest {
  user: JWTPayload
}

// Preserve and forward additional handler arguments (e.g., Next.js route context)
export function withAuth<T extends (req: AuthenticatedRequest, ...args: any[]) => Promise<Response>>(handler: T) {
  return async (
    req: NextRequest,
    ...args: Parameters<T> extends [any, ...infer R] ? R : never
  ): Promise<Response> => {
    const authHeader = req.headers.get('authorization')
    const token = extractTokenFromHeader(authHeader)

    if (!token) {
      return new Response(JSON.stringify({ error: 'No token provided' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const user = verifyToken(token)
    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const authenticatedReq = req as AuthenticatedRequest
    authenticatedReq.user = user

    return handler(authenticatedReq, ...(args as any))
  }
}

export function withRole(allowedRoles: string[]) {
  return function <T extends (req: AuthenticatedRequest, ...args: any[]) => Promise<Response>>(handler: T) {
    return withAuth(async (
      req: AuthenticatedRequest,
      ...args: Parameters<T> extends [any, ...infer R] ? R : never
    ): Promise<Response> => {
      if (!allowedRoles.includes(req.user.userType)) {
        return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      return handler(req, ...(args as any))
    })
  }
}

export const withHCPAuth = withRole(['HCP'])
export const withPharmaAuth = withRole(['PHARMA'])
export const withAnyAuth = withRole(['HCP', 'PHARMA'])
