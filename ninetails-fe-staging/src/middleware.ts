import { AUTH_ROUTE, ROUTER_PATH } from '@/constants';
import { RequestCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { USER_ROLE } from './constants/settings';
import { ISearchParams } from './interfaces';

const getUserInfo = async (accessToken: RequestCookie, params: ISearchParams) => {
  if (accessToken) {
    const responses = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/user-master/detail`, {
      method: 'GET',
      headers:
        params.opId && params.schema
          ? {
              Authorization: `Bearer ${accessToken?.value}`,
              opId: params.opId,
              schema: params.schema,
            }
          : {
              Authorization: `Bearer ${accessToken?.value}`,
            },
    });
    const { data } = await responses.json();
    return data;
  }
};

export async function middleware(request: NextRequest) {
  const {
    nextUrl: { search },
  } = request;
  const urlSearchParams = new URLSearchParams(search);
  const params = Object.fromEntries(urlSearchParams.entries());
  const currentToken = request.cookies.get('access_token');
  if (
    !currentToken &&
    (request.nextUrl.pathname.startsWith('/super-admin') ||
      request.nextUrl.pathname.startsWith('/admin'))
  ) {
    const response = NextResponse.redirect(new URL(ROUTER_PATH.HOMEPAGE, request.url));
    response.cookies.delete('access_token');
    return response;
  }

  if (request.nextUrl.pathname.startsWith('/admin') && currentToken) {
    const currentUser = await getUserInfo(currentToken, params);

    const routeNamePath = {
      '/admin/dashboard': 'dashboard',
      '/admin/schedule': 'work_shift',
      '/admin/control-status': 'realtime_activity',
      '/admin/operation-analysis': 'operation_analysis',
      '/admin/illegal': 'illegal_disposal',
      '/admin/driving-diary': 'driving_diary',
      '/admin/notification': 'notification',
      '/admin/settings/users': 'user_management',
      '/admin/settings/agency': 'company_management',
      '/admin/settings/workers': 'staff_management',
      '/admin/settings/vehicle': 'vehicle_management',
      '/admin/settings/edge-server': 'updater_application_management',
      '/admin/settings/routes': 'route_management',
      '/admin/settings/absence': 'absence_management',
    };
    const find = (currentPath: string): string | undefined => {
      return routeNamePath[currentPath as keyof typeof routeNamePath];
    };
    const currentPath = find(request.nextUrl.pathname);

    if (params.opId && params.schema) {
      return NextResponse.next();
    } else {
      const hasPermission = currentUser?.permission?.[currentPath as string]?.includes('read');

      if (!hasPermission) {
        return NextResponse.redirect(new URL(ROUTER_PATH.HOMEPAGE, request.url));
      }
    }
  }

  if (request.nextUrl.pathname.startsWith('/super-admin') && currentToken) {
    const role = await getUserInfo(currentToken, params);
    if (role?.role !== USER_ROLE.ADMIN)
      return NextResponse.redirect(new URL(ROUTER_PATH.HOMEPAGE, request.url));
  }

  if (request.nextUrl.pathname == ROUTER_PATH.USER_INFO && currentToken) {
    const role = await getUserInfo(currentToken, params);
    if (role?.role === USER_ROLE.ADMIN)
      return NextResponse.redirect(new URL(ROUTER_PATH.HOMEPAGE, request.url));
  }

  if (AUTH_ROUTE.includes(request.nextUrl.pathname) && !!currentToken) {
    return NextResponse.redirect(new URL(ROUTER_PATH.HOMEPAGE, request.url));
  }
}

export const config = {
  matcher: ['/admin/:path*', '/super-admin/:path*', '/auth/:path*'],
};
