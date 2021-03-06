import { queryOnce } from "gatsby-source-shopify/lib"

import { get, getOr, last } from "lodash/fp"


const timeout = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const queryAll = async (
    client,
    path,
    query,
    delay = 500,
    first = 250,
    after = null,
    aggregatedResponse = null
  ) => {
    const data = await queryOnce(client, query, first, after)
    const edges = getOr([], [...path, `edges`], data)
    const nodes = edges.map(edge => edge.node)
  
    aggregatedResponse = aggregatedResponse
      ? aggregatedResponse.concat(nodes)
      : nodes
  
    if (get([...path, `pageInfo`, `hasNextPage`], data)) {
      await timeout(delay)
      return await queryAll(
        client,
        path,
        query,
        delay,
        first,
        last(edges).cursor,
        aggregatedResponse
      )
    }
  
    return aggregatedResponse
  }