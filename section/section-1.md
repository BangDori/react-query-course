## Table of Contents

1. [Introduction to React Query - Review](#introduction-to-react-query---review)
2. [First Project! Blog-em Ipsum - Review](#first-project-blog-em-ipsum---review)
3. [Creating Queries with useQuery - Review](#creating-queries-with-usequery---review)
4. [Handling Loading and Error States - Review](#handling-loading-and-error-states---review)
5. [React Query DevTools - Review](#react-query-devtools---review)
6. [staleTime vs gcTime - Review](#staletime-vs-gctime---review)
7. [스스로하는 Q&A](#스스로하는-qa)

## Introduction to React Query - Review

- Issue: [#1](https://github.com/BangDori/react-query-course/issues/1)

클라이언트 상태와 서버 상태의 차이는 **어디에 저장하는지**에 있다고 생각할 수 있다.

- 클라이언트 상태: 브라우저의 세션, 로컬스토리지, 쿠키에 저장되는 정보
  - 사용자가 선택한 언어 혹은 테마가 해당될 수 있다.
- 서버 상태: 서버의 데이터베이스에 저장되는 정보
  - 사용자가 업로드한 게시물 등이 해당될 수 있는데, 모든 사용자들에게 동일한 데이터가 지속되어져야 한다.

React Query는 어떤 문제를 해결할 수 있을까?

- 단순하게 생각하면, React Query는 클라이언트에 **서버 상태를 캐싱**해두어 유지하는 역할을 한다.
- 추후에 staleTime에 대해 배우겠지만, 캐시에 서버 상태가 저장되어 있다면 서버에 데이터를 요청하는 것이 아닌 캐시에서 데이터를 가져와 사용자에게 보여줄 수 있기 때문에 UX를 향상시킬 수 있다.
  - 성능 개선

## First Project! Blog-em Ipsum - Review

- Issue: [#2](https://github.com/BangDori/react-query-course/issues/2)

`QueryClient`는 캐시와 상호작용하기 위해 사용되어질 수 있다.

- defaultOptions: 이 queryClient를 사용하는 모든 쿼리들과 뮤테이션들을 위한 default 속성을 정의한다.
- queryCache: 클라이언트가 연결된 쿼리 캐시를 나타내는 옵션이다.
- mutationCache: 클라이언트가 연결된 뮤테이션 캐시를 나타내는 옵션이다.

애플리케이션 내부에서 `QueryClient`를 연결하고 제공하기 위해서는 최상위에 `QueryClientProvider` 컴포넌트를 사용해야 한다. 이후, `useQuery`를 호출하여 서버 데이터를 받아올 수 있다.

클라이언트에서는 쿼리들과 캐시를 관리한다.

## Creating Queries with useQuery - Review

- Issue: [#4](https://github.com/BangDori/react-query-course/issues/4)

- query key는 쿼리 캐시에 저장되어 있는 데이터를 정의하는 것.
  - 쿼리 키는 항상 배열로 구성된다. (React Query Version 4 ↑)
- 쿼리 함수는 데이터를 fetching 하기 위해 실행되어지는 함수이다.
  - 쿼리 함수를 이용해 데이터를 받아올 때, 처음에 undefined가 출력되게 되는데, 이는 fetching 함수가 비동기적 함수이기 때문이다.
  - 그렇기 때문에, isLoading을 통해 fetching 되기 전까지는 로딩 indicator를 표시해주는 것이 에러를 방지할 수 있다.

## Handling Loading and Error States - Review

- Issue: [#5](https://github.com/BangDori/react-query-course/issues/5)

- isFetching
  - 비동기 함수가 해결되었는지에 대한 Boolean 값을 반환한다.
  - 만약 아직 비동기 함수가 완료되지 않았다면 True, 완료되었다면 False
- isLoading
  - isFetching에 cached data가 없는 경우 isLoading 상태이다.

Blog-em Ipsum 프로젝트에서는 isFetching과 isLoading간에 차이가 다소 크게 느껴지지 않을 수 있다. 하지만, 페이지네이션에서 cached 데이터가 존재하는 경우와 존재하지 않을 경우에 대한 구별을 명확하게 할 수 있어, isFetching과 isLoading의 차이를 명확하게 느낄 수 있다.

페이지네이션에서 다음 페이지에 대한 prefetching이 되어 있다면 다음 페이지로 이동할 때 캐시 내부에 데이터가 존재하기 때문에 isLoading은 False이고 isFetching은 True 상태가 됨!

하지만, 다음 페이지에 대한 prefetching이 되어 있지 않다면 다음 페이지로 이동할 때 캐시 내부에 해당 페이지의 데이터가 존재하지 않아 isLoading과 isFetching 모두 True 상태가 된다.

## React Query DevTools - Review

- Issue: [#6](https://github.com/BangDori/react-query-course/issues/6)

React Query DevTools는 쿼리들을 키로 보여주고, 쿼리의 상태, 마지막으로 업데이트 된 시간을 보여준다.

devtool은 production 모드에서는 포함되지 않고, development에서만 포함된다. 그렇기 때문에, 실제 프로젝트에서 devtools를 적용하더라도, build를 하게 되면 보여지지 않게 된다.

그리고 중요한 점이 devtools는 `@tanstack/react-query`에 포함된 모듈이 아닌, 다른 패키지로 부터 import 해오기 때문에 `@tanstack/react-query-devtools`를 다운받아야한다.

React Query Devtools를 사용할 때에는, Provider 자식의 최상단에 위치시켜야 다른 쿼리들을 잘 감지하여 동작한다!

## staleTime vs gcTime - Review

- Issue: [#7](https://github.com/BangDori/react-query-course/issues/7)

stale data란 탁한 데이터로, 업데이트가 필요한 데이터라는 것을 의미. stale data는 캐시에서 존재하기 때문에 사용자가 화면에 렌더링하면 캐시에 남아있는 data를 먼저 렌더링한 이후에 refetch를 진행함

stale time은 데이터가 언제 다시 받아올 필요가 있는지를 지정하는 시간이고, gc time은 캐시내부에 있는 데이터가 만료되는 시간. 즉 캐시에서 데이터가 삭제되는 시간

## 스스로하는 Q&A

#### 1. 만약, 현재 쿼리 데이터가 계속해서 화면에 표시되고 있는 중이라면, 시간이 지났을 때 gcTime이 동작하고 쿼리 데이터를 날리나요?

앞서 얘기했듯이, React Query에서 `gcTime` 설정은 캐시에서 **비활성 상태**의 쿼리 데이터를 얼마나 오래 보관할지를 결정하는 것입니다. 그렇기 때문에, 해당 쿼리의 데이터를 사용하는 컴포넌트가 언마운트되고, 쿼리에 대한 참조가 더 이상 없을 때 부터 gcTime을 계산한다.

#### 2. 그렇다면, gcTime은 inactive의 누적 시간으로 측정되나요?

React Query에서 `gcTime`은 누적 시간을 기준으로 하는 것이 아닌, 쿼리가 비활성 상태가 된 순간부터 측정하게 됩니다.
