import { NextRequest } from 'next/server'
import { verifyToken, extractTokenFromHeader, type JWTPayload } from './auth'

export interface AuthenticatedRequest extends NextRequest {
  user: JWTPayload
}

export function withAuth(handler: (req: AuthenticatedRequest) => Promise<Response>) {
  return async (req: NextRequest): Promise<Response> => {
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

    return handler(authenticatedReq)
  }
}

export function withRole(allowedRoles: string[]) {
  return function(handler: (req: AuthenticatedRequest) => Promise<Response>) {
    return withAuth(async (req: AuthenticatedRequest) => {
      if (!allowedRoles.includes(req.user.userType)) {
        return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      return handler(req)
    })
  }
}

export const withHCPAuth = withRole(['HCP'])
export const withPharmaAuth = withRole(['PHARMA'])
export const withAnyAuth = withRole(['HCP', 'PHARMA'])
