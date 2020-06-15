import Router from '@koa/router'
import { createConnection } from 'typeorm'
import { Document } from '../entities/document.entity'
import { DocumentHandler } from '../controllers/document.controller'
import * as config from '../controllers/config.controller'
import crypto from 'crypto'

const router = new Router({
  prefix: config.routePrefix
})

// This needs to be a function for async/await
const main = async (): Promise<void> => {
  // Setup document handler
  const connection = await createConnection(config.dbOptions)
  const documents = connection.getRepository(Document)
  const handler = new DocumentHandler(config, documents)

  // Routes

  router.post('/document', async (ctx) => {
    try {
      const { id, content } = await handler.newDocument(ctx.request.body.content)

      ctx.body = {
        id,
        contentHash: crypto.createHash('sha256').update(content).digest('hex')
      }
      ctx.status = 201
    } catch (err) {
      ctx.status = 500
      ctx.body = { err }
    }
  })

  router.post('/verify', async (ctx) => {
    try {
      const doc = await handler.getDocument(ctx.request.body.id)

      if (doc) {
        ctx.status = 200
      } else {
        ctx.status = 404
      }
    } catch (err) {
      ctx.status = 500
      ctx.body = { err }
    }
  })

  router.get('/document/:id', async (ctx) => {
    try {
      const doc = await handler.getDocument(ctx.params.id)

      if (doc) {
        ctx.status = 200
        ctx.body = doc
      } else {
        ctx.status = 404
      }
    } catch (err) {
      ctx.status = 500
      ctx.body = { err }
    }
  })

  router.get('/document/:id/raw', async (ctx) => {
    try {
      const doc = await handler.getRawDocument(ctx.params.id)

      if (doc) {
        ctx.status = 200
        ctx.body = doc
      } else {
        ctx.status = 404
      }
    } catch (err) {
      ctx.status = 500
      ctx.body = { err }
    }
  })
}

main()

export { router }
