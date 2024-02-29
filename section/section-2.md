# Table of Contents

1. [Query Keys](#query-keys)
2. [Pagination](#pagination)
3. [Pre-fetching Data](#pre-fetching-data)
4. [isFetching vs isLoading](#isfetching-vs-isloading)
5. [Intro to Mutations](#intro-to-mutations)
6. [Summary: React Query Basics](#summary-react-query-basics)

# Query Keys

## Why don't comments refresh?

- Every query uses the same key `(["comments"])`
- Data for queries with known keys only refetched upon trigger
- Example triggers:
  - component remount (`refetchOnMount`)
  - window refocus (`refetchOnWindowFocus`)
  - running refresh function
  - automated refetched (`refetchInterval`)
  - query invalidation after a mutation (`queryClient.invalidateQueries`)

## Solution?

- Options: remove programmatically for every new title
  - it's not easy
  - We could trigger a refetch every time somebody clicked on a new blog post title. by say, invalidating the data.
- No reason to remove data from the cache
  - we're not even performing the same query!
- Query includes postID
  - Cache on a per-query basis
  - don't share cache for any `comments` query regardless of postID
- What we really want: label the query for each post seperately

## Query Key as Dependency Array

- `["comments", post.id]`
  - Here we can update the query key to have a second element in the array.
- When key changes, create a new query
- Query function values should be part of the key

## Review

Post에 해당하는 Comments를 받아오지 못하는 문제가 발생!
=> React Query에서 comments를 받아올 때 모든 Query key가 동일한 것이 문제
=> 게시물에 해당하는 comments를 받기 위해서, 각각의 Query key를 설정
=> comments를 받아올 때, Post의 ID와 함께 Query key를 설정
=> `queryKey: ["comments", post.id]`

모든 쿼리 키를 동일한 키로 사용하게 되면 컴포넌트가 remount 되거나 window refocus, refetch 함수를 실행하는 등의 상황에 대해서만 refresh가 발생하게 됨. 그렇기 때문에 현재 base-blog-em에서 처럼 블로그 포스트를 클릭하더라도 동일한 comment를 받아오게 됨.

이를 해결하기 위해 comments를 받아올 때 쿼리 키를 comments로 고정하는 것이 아닌, comments + post.id를 통해 포스트 별로 각기 다른 코멘트를 받아오도록 하여 refresh 할 수 있음. `queryKey: ["comments", post.id]`

# Pagination

## Pagination

- Track current page in component state (`currentPage`)
- Use query keys that include the page number ["posts", currentPage]
- User clicks "next page" or "previous page" button
  - update `currentPage` state
  - fire off new query

```tsx
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { fetchPosts } from "./api";
import PostDetail from "./PostDetail";

const maxPostPage = 10;

export interface Post {
  body: string;
  id: number;
  title: string;
  userId: number;
}

export function Posts() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPost, setSelectedPost] = useState(null);

  const { data, isLoading, error, isError } = useQuery({
    queryKey: ["posts", currentPage],
    queryFn: () => fetchPosts(currentPage),
    staleTime: 2000, // 2 seconds
  });

  if (isLoading) return <h3>Loading...</h3>;
  if (isError)
    return (
      <h3>
        Oops, something went wrong.
        <p>{error.toString()}</p>
      </h3>
    );

  return (
    <>
      <ul>
        {data.map((post: Post) => (
          <li
            key={post.id}
            className="post-title"
            onClick={() => setSelectedPost(post)}
          >
            {post.title}
          </li>
        ))}
      </ul>
      <div className="pages">
        <button
          disabled={currentPage <= 1}
          onClick={() => setCurrentPage((previousValue) => previousValue - 1)}
        >
          Previous page
        </button>
        <span>Page {currentPage}</span>
        <button
          disabled={currentPage >= maxPostPage}
          onClick={() => setCurrentPage((previousValue) => previousValue + 1)}
        >
          Next page
        </button>
      </div>
      <hr />
      {selectedPost && <PostDetail post={selectedPost} />}
    </>
  );
}
```

## Review

pagination의 경우 useQuery를 이용해서 구현할 수 있는데, currentPage를 상태로 두고 queryFunction을 호출할 때 currentPage를 인자로 넘겨 데이터를 받아올 수 있음.

이전 이슈 #8 에서 언급했듯이, 동일한 쿼리 키를 사용하게 되면 ex) queryKey: ["posts"] 모든 페이지에서 모든 포스트들이 표시되기 때문에, 페이지를 함께 쿼리 키에 추가하여 페이지네이션을 구현할 수 있음. ex) queryKey: ["posts", currentPage]

# Pre-fetching Data

## Prefetching

- Prefetch
  - adds data to cache
  - automatically stale (configurable) - by default the data is stale right away.
  - shows while re-fetching
    - as long as cache hasn't expired!
- Prefetching can be used for any anticipated data needs
  - not just pagination!
- Reference: https://tanstack.com/query/latest/docs/react/reference/QueryClient#queryclientprefetchquery

```tsx
const queryClient = useQueryClient();

useEffect(() => {
  if (currentPage < maxPostPage) {
    const nextPage = currentPage + 1;
    queryClient.prefetchQuery({
      queryKey: ["posts", nextPage],
      queryFn: () => fetchPosts(nextPage),
    });
  }
}, [currentPage, queryClient]);
```

## Review

prefetch는 데이터를 미리 받아와서 캐시에 데이터를 추가하는 기능.

prefetch는 pagination 뿐만 아니라 infinity scroll에서도 사용될 수 있는데, 사용자들은 통계적으로 다음 페이지로 이동할 확률이 높다. 그렇기 때문에 다음 페이지 혹은 다음 데이터들을 받아오는 동안 로딩창을 보여주기 보다는 prefetching을 통해 데이터를 미리 받아와서, 다음 데이터를 보여줄 때 미리 보여줄 수 있다면 사용자 경험이 향상될 수 있다.

# isFetching vs isLoading

## isFetching vs isLoading

- isFetching
  - That is true when the async query function hasn't yet resolved.
  - we're still fetching the data
- isLoading
  - isLoading is the condition where is fetching is true, plus have no cached data for the query.
  - no cached data + isFetching
  - so anythime you are isLoading. Anytime isLoading is true, isFetching is also true.isLoading is a subset of isFetching where you actually don't have any cached data and you are fetching the data.

## Review

`isFetching`은 비동기 쿼리 함수가 아직 해결되지 않았을 경우에 True를 반환한다.
`isLoading`은 `isFetching`이 True이면서, Query상에 cached data가 존재하지 않을 경우에 True를 반환한다.

`isLoading`이 true라면, isFetching 또한 true이다. isLoading은 실제로 데이터를 fetching해오는 상황에 cached data가 없는 경우 isFetching의 부분집합이다.

# Intro to Mutations

## Mutations

- Mutation: **making a network call that changes data on the server**
  - example: adds a new blog post or deletes a blog post or changes
  - jsonplaceholder API doesn't change server
  - go through the mechanics of making the change
- Day Spa app will demonstrate showing changes to user:
  - Optimistic updates (assume change will happen)
  - Update React Query cache with data returned from the server
  - Trigger re-fetch of relevant data (invalidation)

## useMutation

- Similar to useQuery, but:
  - returns mutate function
  - doesn't need query key
  - isLoading but no isFetching
  - by default, no retires (configurable!)
- Reference: https://react-query.tanstack.com/guides/mutations

## Review

Mutation이란 서버에 데이터를 변화시키기 위해 네트워크 요청을 만들어내는 것을 의미한다. 예를 들어, 새로운 블로그 포스트를 추가하거나, 삭제하거나, 업데이트 하는 행위

useMutation hook은 useQuery와 유사하지만 queryKey, cache 등이 없기 때문에 useQuery보다 더욱 간편함.

# Summary: React Query Basics

## Blog-em Ipsum Summary

- Install package, create QueryClient and add QueryClientProvider
- useQuery for data
  - return object also includes `isLoading` / `isFetching` and error
  - `staleTime` for whether or not to-refetch (on trigger)
  - `gcTime` for how long to hold on to data after inactivity
  - query keys as dependency arrays
  - pagination and pre-fetching
  - useMutation for server side-effects
