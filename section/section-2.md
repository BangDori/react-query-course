## Table of Contents

1. [Query Keys - Review](#query-keys---review)
2. [Pagination - Review](#pagination---review)
3. [Pre-fetching Data - Review](#pre-fetching-data---review)
4. [isFetching vs isLoading - Review](#isfetching-vs-isloading---review)
5. [Intro to Mutations - Review](#intro-to-mutations---review)

## Query Keys - Review

- Issue: [#8](https://github.com/BangDori/react-query-course/issues/8)

Post에 해당하는 Comments를 받아오지 못하는 문제가 발생!
=> React Query에서 comments를 받아올 때 모든 Query key가 동일한 것이 문제
=> 게시물에 해당하는 comments를 받기 위해서, 각각의 Query key를 설정
=> comments를 받아올 때, Post의 ID와 함께 Query key를 설정
=> `queryKey: ["comments", post.id]`

모든 쿼리 키를 동일한 키로 사용하게 되면 컴포넌트가 remount 되거나 window refocus, refetch 함수를 실행하는 등의 상황에 대해서만 refresh가 발생하게 됨. 그렇기 때문에 현재 base-blog-em에서 처럼 블로그 포스트를 클릭하더라도 동일한 comment를 받아오게 됨.

이를 해결하기 위해 comments를 받아올 때 쿼리 키를 comments로 고정하는 것이 아닌, comments + post.id를 통해 포스트 별로 각기 다른 코멘트를 받아오도록 하여 refresh 할 수 있음. `queryKey: ["comments", post.id]`

## Pagination - Review

- Issue: [#9](https://github.com/BangDori/react-query-course/issues/9)

pagination의 경우 useQuery를 이용해서 구현할 수 있는데, currentPage를 상태로 두고 queryFunction을 호출할 때 currentPage를 인자로 넘겨 데이터를 받아올 수 있음.

이전 이슈 #8 에서 언급했듯이, 동일한 쿼리 키를 사용하게 되면 ex) queryKey: ["posts"] 모든 페이지에서 모든 포스트들이 표시되기 때문에, 페이지를 함께 쿼리 키에 추가하여 페이지네이션을 구현할 수 있음. ex) queryKey: ["posts", currentPage]

## Pre-fetching Data - Review

- Issue: [#10](https://github.com/BangDori/react-query-course/issues/10)

prefetch는 데이터를 미리 받아와서 캐시에 데이터를 추가하는 기능.

prefetch는 pagination 뿐만 아니라 infinity scroll에서도 사용될 수 있는데, 사용자들은 통계적으로 다음 페이지로 이동할 확률이 높다. 그렇기 때문에 다음 페이지 혹은 다음 데이터들을 받아오는 동안 로딩창을 보여주기 보다는 prefetching을 통해 데이터를 미리 받아와서, 다음 데이터를 보여줄 때 미리 보여줄 수 있다면 사용자 경험이 향상될 수 있다.

## isFetching vs isLoading - Review

- Issue: [#11](https://github.com/BangDori/react-query-course/issues/11)

`isFetching`은 비동기 쿼리 함수가 아직 해결되지 않았을 경우에 True를 반환한다.
`isLoading`은 `isFetching`이 True이면서, Query상에 cached data가 존재하지 않을 경우에 True를 반환한다.

`isLoading`이 true라면, isFetching 또한 true이다. isLoading은 실제로 데이터를 fetching해오는 상황에 cached data가 없는 경우 isFetching의 부분집합이다.

## Intro to Mutations - Review

- Issue: [#12](https://github.com/BangDori/react-query-course/issues/12)

Mutation이란 서버에 데이터를 변화시키기 위해 네트워크 요청을 만들어내는 것을 의미한다. 예를 들어, 새로운 블로그 포스트를 추가하거나, 삭제하거나, 업데이트 하는 행위

useMutation hook은 useQuery와 유사하지만 queryKey, cache 등이 없기 때문에 useQuery보다 더욱 간편함.
