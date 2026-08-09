// middleware.ts — Place in your Next.js project root
// Protects touriststudios.com.au with HTTP Basic Auth during content build phase
// Remove or rename this file to disable password protection at launch

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check if auth is enabled
  const authEnabled = process.env.AUTH_ENABLED === 'true'
  
  if (!authEnabled) {
    return NextResponse.next()
  }

  const authHeader = request.headers.get('authorization')
  
  // Allow public API routes (e.g., for Sanity webhooks)
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Check for valid credentials
  if (authHeader) {
    const [scheme, credentials] = authHeader.split(' ')
    
    if (scheme === 'Basic') {
      try {
        const decoded = Buffer.from(credentials, 'base64').toString('utf-8')
        const [username, password] = decoded.split(':')
        
        // Match against environment variables
        if (
          username === process.env.AUTH_USERNAME &&
          password === process.env.AUTH_PASSWORD
        ) {
          return NextResponse.next()
        }
      } catch (error) {
        // Invalid auth header format — fall through to 401
      }
    }
  }

  // No valid auth — return 401 with WWW-Authenticate header
  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Tourist Studios - Password Protected"',
      'Content-Type': 'text/plain'
    }
  })
}

// Apply middleware to all routes except static assets
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)'
  ]
}
