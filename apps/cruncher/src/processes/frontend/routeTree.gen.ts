/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

import { Route as rootRouteImport } from './routes/__root'
import { Route as SettingsRouteRouteImport } from './routes/settings/route'
import { Route as IndexRouteImport } from './routes/index'
import { Route as SettingsIndexRouteImport } from './routes/settings/index'
import { Route as SettingsInitializedDatasetsRouteImport } from './routes/settings/initialized-datasets'
import { Route as SettingsGeneralRouteImport } from './routes/settings/general'

const SettingsRouteRoute = SettingsRouteRouteImport.update({
  id: '/settings',
  path: '/settings',
  getParentRoute: () => rootRouteImport,
} as any)
const IndexRoute = IndexRouteImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRouteImport,
} as any)
const SettingsIndexRoute = SettingsIndexRouteImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => SettingsRouteRoute,
} as any)
const SettingsInitializedDatasetsRoute =
  SettingsInitializedDatasetsRouteImport.update({
    id: '/initialized-datasets',
    path: '/initialized-datasets',
    getParentRoute: () => SettingsRouteRoute,
  } as any)
const SettingsGeneralRoute = SettingsGeneralRouteImport.update({
  id: '/general',
  path: '/general',
  getParentRoute: () => SettingsRouteRoute,
} as any)

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/settings': typeof SettingsRouteRouteWithChildren
  '/settings/general': typeof SettingsGeneralRoute
  '/settings/initialized-datasets': typeof SettingsInitializedDatasetsRoute
  '/settings/': typeof SettingsIndexRoute
}
export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/settings/general': typeof SettingsGeneralRoute
  '/settings/initialized-datasets': typeof SettingsInitializedDatasetsRoute
  '/settings': typeof SettingsIndexRoute
}
export interface FileRoutesById {
  __root__: typeof rootRouteImport
  '/': typeof IndexRoute
  '/settings': typeof SettingsRouteRouteWithChildren
  '/settings/general': typeof SettingsGeneralRoute
  '/settings/initialized-datasets': typeof SettingsInitializedDatasetsRoute
  '/settings/': typeof SettingsIndexRoute
}
export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/'
    | '/settings'
    | '/settings/general'
    | '/settings/initialized-datasets'
    | '/settings/'
  fileRoutesByTo: FileRoutesByTo
  to: '/' | '/settings/general' | '/settings/initialized-datasets' | '/settings'
  id:
    | '__root__'
    | '/'
    | '/settings'
    | '/settings/general'
    | '/settings/initialized-datasets'
    | '/settings/'
  fileRoutesById: FileRoutesById
}
export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  SettingsRouteRoute: typeof SettingsRouteRouteWithChildren
}

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/settings': {
      id: '/settings'
      path: '/settings'
      fullPath: '/settings'
      preLoaderRoute: typeof SettingsRouteRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/settings/': {
      id: '/settings/'
      path: '/'
      fullPath: '/settings/'
      preLoaderRoute: typeof SettingsIndexRouteImport
      parentRoute: typeof SettingsRouteRoute
    }
    '/settings/initialized-datasets': {
      id: '/settings/initialized-datasets'
      path: '/initialized-datasets'
      fullPath: '/settings/initialized-datasets'
      preLoaderRoute: typeof SettingsInitializedDatasetsRouteImport
      parentRoute: typeof SettingsRouteRoute
    }
    '/settings/general': {
      id: '/settings/general'
      path: '/general'
      fullPath: '/settings/general'
      preLoaderRoute: typeof SettingsGeneralRouteImport
      parentRoute: typeof SettingsRouteRoute
    }
  }
}

interface SettingsRouteRouteChildren {
  SettingsGeneralRoute: typeof SettingsGeneralRoute
  SettingsInitializedDatasetsRoute: typeof SettingsInitializedDatasetsRoute
  SettingsIndexRoute: typeof SettingsIndexRoute
}

const SettingsRouteRouteChildren: SettingsRouteRouteChildren = {
  SettingsGeneralRoute: SettingsGeneralRoute,
  SettingsInitializedDatasetsRoute: SettingsInitializedDatasetsRoute,
  SettingsIndexRoute: SettingsIndexRoute,
}

const SettingsRouteRouteWithChildren = SettingsRouteRoute._addFileChildren(
  SettingsRouteRouteChildren,
)

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  SettingsRouteRoute: SettingsRouteRouteWithChildren,
}
export const routeTree = rootRouteImport
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()
