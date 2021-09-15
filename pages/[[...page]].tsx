import type { GetStaticPropsContext, InferGetStaticPropsType } from 'next'
import { useRouter } from 'next/router'
import { BuilderComponent, Builder, builder } from '@builder.io/react'
import DefaultErrorPage from 'next/error'
import Head from 'next/head'

const BUILDER_API_KEY = '08837cee608a405c806a3bed69acfe2d'
builder.init(BUILDER_API_KEY)
Builder.isStatic = true

export async function getStaticProps({
  params,
}: GetStaticPropsContext<{ path: string[] }>) {
  const page = await builder.get('page', {
    userAttributes: {
      urlPath: '/' + (params?.path?.join('/') || ''),
    }
  })
  .toPromise() || null
  console.log(page)

  return {
    props: {
      page,
    },
    // Next.js will attempt to re-generate the page:
    // - When a request comes in
    // - At most once every 5 seconds
    revalidate: 5,
  }
}

export async function getStaticPaths() {
  const pages = await builder.getAll('page', {
    options: { noTargeting: true },
    apiKey: BUILDER_API_KEY,
  })

  return {
    paths: pages.map((page) => `${page.data?.url}`),
    fallback: true,
  }
}

export default function Path({
  page,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const router = useRouter()
  if (router.isFallback) {
    return <h1>Loading...</h1>
  }
  const isLive = !Builder.isEditing && !Builder.isPreviewing
  if (!page && isLive) {
    return (
      <>
        <Head>
          <meta name="robots" content="noindex" />
          <meta name="title"></meta>
        </Head>
        <DefaultErrorPage statusCode={404} />
      </>
    )
  }

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <BuilderComponent model="page" content={page} />
    </>
  )
}